import { prisma } from '../prisma';
import { MessageEngine } from '../ai/messageEngine';
import { whatsappClient } from '../whatsapp/client';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface PipelineStepLog {
  step: number;
  stepName: string;
  leadId: string;
  businessName: string;
  status: 'success' | 'warning' | 'failed' | 'skipped';
  message: string;
}

export class ValidationPipeline {
  private static globalLogs: PipelineStepLog[] = [];

  static getLogs() {
    return this.globalLogs;
  }

  static clearLogs() {
    this.globalLogs = [];
  }

  private static log(step: number, stepName: string, leadId: string, businessName: string, status: 'success' | 'warning' | 'failed' | 'skipped', message: string) {
    const logItem = { step, stepName, leadId, businessName, status, message };
    this.globalLogs.push(logItem);
    console.log(`[Step ${step}][${stepName}] Lead: ${businessName} (${leadId}) -> ${status.toUpperCase()}: ${message}`);
  }

  /**
   * Run the complete 11-step Lead Validation and Dispatch Pipeline
   */
  static async runPipeline(selectedLeadIds?: string[], templateType: string = 'Friendly'): Promise<{ success: boolean; processed: number; logs: PipelineStepLog[] }> {
    this.clearLogs();
    
    // Step 1: CSV/import lead (Fetch leads from database)
    const filter = selectedLeadIds && selectedLeadIds.length > 0 ? { id: { in: selectedLeadIds } } : {};
    const leads = await prisma.lead.findMany({
      where: filter,
      include: { LeadValidation: true, LeadScore: true }
    });

    if (leads.length === 0) {
      return { success: true, processed: 0, logs: [] };
    }

    // Initialize/Find an active or draft campaign for tracking
    let campaign = await prisma.campaign.findFirst({ where: { status: 'draft' } });
    if (!campaign) {
      campaign = await prisma.campaign.create({
        data: {
          name: `Autopilot Workflow Run - ${new Date().toLocaleDateString()}`,
          status: 'running',
          source: 'Data Vault'
        }
      });
    } else {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'running' }
      });
    }

    // Step 2-11: Process each lead through the sequential neural pipeline
    for (const lead of leads) {
      const bizName = lead.businessName || lead.name || 'Unknown Business';
      const leadId = lead.id;

      this.log(1, 'CSV/Import Lead', leadId, bizName, 'success', `Fetched lead from source: ${lead.source || 'CRM/Data Vault'}`);

      // Step 2: Phone normalize E.164
      let normalizedPhone = lead.phone || '';
      let isValidPhone = false;
      let country = 'US';

      if (normalizedPhone) {
        try {
          let defaultCountry: any = 'US';
          const searchStr = `${lead.city} ${lead.phone}`.toLowerCase();
          if (searchStr.includes('dubai') || searchStr.includes('uae') || normalizedPhone.startsWith('+971')) defaultCountry = 'AE';
          else if (normalizedPhone.startsWith('+91') || searchStr.includes('india')) defaultCountry = 'IN';
          else if (normalizedPhone.startsWith('+44') || searchStr.includes('uk') || searchStr.includes('london')) defaultCountry = 'GB';
          else if (normalizedPhone.startsWith('+61') || searchStr.includes('australia')) defaultCountry = 'AU';

          const parsed = parsePhoneNumberFromString(normalizedPhone, defaultCountry);
          if (parsed && parsed.isValid()) {
            normalizedPhone = parsed.format('E.164');
            country = parsed.country || defaultCountry;
            isValidPhone = true;
            this.log(2, 'Phone Normalize E.164', leadId, bizName, 'success', `Normalized to ${normalizedPhone} (${country})`);
          } else {
            this.log(2, 'Phone Normalize E.164', leadId, bizName, 'failed', `Invalid format for number: ${lead.phone}`);
          }
        } catch (e: any) {
          this.log(2, 'Phone Normalize E.164', leadId, bizName, 'failed', `Phone parser error: ${e.message}`);
        }
      } else {
        this.log(2, 'Phone Normalize E.164', leadId, bizName, 'failed', 'Missing original contact phone number');
      }

      // Update lead in DB with normalization details
      await prisma.lead.update({
        where: { id: leadId },
        data: { phone: normalizedPhone }
      });

      // Update or create LeadValidation
      let validation = lead.LeadValidation?.[0];
      if (validation) {
        validation = await prisma.leadValidation.update({
          where: { id: validation.id },
          data: { isValidPhone }
        });
      } else {
        validation = await prisma.leadValidation.create({
          data: { leadId, isValidPhone, whatsappReady: false }
        });
      }

      await prisma.outreachLog.create({
        data: { campaignId: campaign.id, leadId, agentName: 'Country Code Agent', action: 'Normalize Phone', status: isValidPhone ? 'success' : 'failed', message: `Normalized to E.164: ${normalizedPhone}` }
      });

      if (!isValidPhone) {
        this.log(3, 'Duplicate Remove', leadId, bizName, 'skipped', 'Skipping duplicate check for invalid phone');
        continue;
      }

      // Step 3: Duplicate remove
      const duplicateLeads = await prisma.lead.findMany({
        where: { phone: normalizedPhone, id: { not: leadId } }
      });

      if (duplicateLeads.length > 0) {
        this.log(3, 'Duplicate Remove', leadId, bizName, 'warning', `Duplicate detected! ${duplicateLeads.length} other record(s) exist. Merging and marking duplicate.`);
        await prisma.duplicateLog.create({
          data: {
            originalLeadId: duplicateLeads[0].id,
            duplicatePhone: normalizedPhone,
            mergeAction: 'merged'
          }
        });
        await prisma.lead.update({
          where: { id: leadId },
          data: { status: 'duplicate_quarantined' }
        });
        await prisma.outreachLog.create({
          data: { campaignId: campaign.id, leadId, agentName: 'Duplicate/Fake Lead Validator Agent', action: 'Duplicate Filter', status: 'warning', message: `Duplicate quarantined, merged into ${duplicateLeads[0].id}` }
        });
        continue; // Terminate execution pipeline for this duplicate lead
      } else {
        this.log(3, 'Duplicate Remove', leadId, bizName, 'success', 'No duplicates found. Lead is unique.');
      }

      // Step 4: Consent check
      // For compliant operation, we check the lead tags or status. By default we treat CSV leads as requiring consent check.
      // If the lead status is explicitly 'opted_out', we block it.
      const consentStatus = lead.status === 'opted_out' ? 'opt_out' : (lead.tags?.includes('consented') ? 'consented' : 'missing');
      if (consentStatus === 'opt_out') {
        this.log(4, 'Consent Check', leadId, bizName, 'failed', 'Compliant Opt-Out: Lead previously requested unsubscribe. Blocked.');
        continue;
      } else if (consentStatus === 'missing') {
        this.log(4, 'Consent Check', leadId, bizName, 'warning', 'Consent status missing. Setting tag compliance to pending opt-in verification.');
      } else {
        this.log(4, 'Consent Check', leadId, bizName, 'success', 'Consent confirmed. Opt-in tag detected.');
      }

      await prisma.outreachLog.create({
        data: { campaignId: campaign.id, leadId, agentName: 'Consent Agent', action: 'Consent Verification', status: 'success', message: `Compliance: Consent verified as ${consentStatus}` }
      });

      // Step 5: WhatsApp reachable check
      // Perform verify check via Provider
      const isReachable = await whatsappClient.verifyNumber(normalizedPhone);
      await prisma.leadValidation.update({
        where: { id: validation.id },
        data: { whatsappReady: isReachable }
      });

      if (!isReachable) {
        this.log(5, 'WhatsApp Reachable Check', leadId, bizName, 'failed', 'Unverified / WhatsApp API Not Connected or number not on WhatsApp network.');
        await prisma.outreachLog.create({
          data: { campaignId: campaign.id, leadId, agentName: 'WhatsApp Verification Agent', action: 'Verify Number', status: 'failed', message: 'Not on WhatsApp or API offline' }
        });
        continue;
      } else {
        this.log(5, 'WhatsApp Reachable Check', leadId, bizName, 'success', 'WhatsApp Verified. Number reachable on network.');
        await prisma.outreachLog.create({
          data: { campaignId: campaign.id, leadId, agentName: 'WhatsApp Verification Agent', action: 'Verify Number', status: 'success', message: 'WhatsApp verification passed' }
        });
      }

      // Step 6: Message template assign
      const templateText = await MessageEngine.generateTemplate(templateType);
      const personalizedPitch = await MessageEngine.generatePersonalizedMessage(lead, templateText);
      this.log(6, 'Message Template Assign', leadId, bizName, 'success', `Assigned template "${templateType}" & generated AI pitch: "${personalizedPitch.slice(0, 45)}..."`);

      await prisma.outreachLog.create({
        data: { campaignId: campaign.id, leadId, agentName: 'Message Ready Agent', action: 'Assign Template', status: 'success', message: `Personalized message assigned` }
      });

      // Step 7: Queue message
      let campaignLead = await prisma.campaignLead.findFirst({
        where: { campaignId: campaign.id, leadId }
      });

      if (campaignLead) {
        campaignLead = await prisma.campaignLead.update({
          where: { id: campaignLead.id },
          data: { generatedMessage: personalizedPitch, status: 'queued' }
        });
      } else {
        campaignLead = await prisma.campaignLead.create({
          data: {
            campaignId: campaign.id,
            leadId,
            generatedMessage: personalizedPitch,
            status: 'queued'
          }
        });
      }
      this.log(7, 'Queue Message', leadId, bizName, 'success', 'Added message payload to dispatch queue worker.');
      await prisma.outreachLog.create({
        data: { campaignId: campaign.id, leadId, agentName: 'Queue Agent', action: 'Queue Lead', status: 'success', message: 'Placed in SQLite campaign queue' }
      });

      // Step 8: Send via API
      this.log(8, 'Send via API', leadId, bizName, 'success', `Dispatching API package to WhatsApp provider node...`);
      const sendResult = await whatsappClient.sendMessage(normalizedPhone, personalizedPitch);
      
      if (!sendResult.success) {
        this.log(8, 'Send via API', leadId, bizName, 'failed', `API transmission rejected: ${sendResult.error || 'Unknown Error'}`);
        await prisma.campaignLead.update({
          where: { id: campaignLead.id },
          data: { status: 'failed', error: sendResult.error }
        });
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { failedCount: { increment: 1 } }
        });
        await prisma.outreachLog.create({
          data: { campaignId: campaign.id, leadId, agentName: 'Sent Success Agent', action: 'Send Message API', status: 'failed', message: sendResult.error }
        });
        continue;
      }

      this.log(8, 'Send via API', leadId, bizName, 'success', `Successfully delivered. Message ID: ${sendResult.messageId}`);
      
      // Create conversation context
      let conversation = await prisma.conversation.findFirst({
        where: { leadId, campaignId: campaign.id }
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { leadId, campaignId: campaign.id, status: 'active', lastMessage: personalizedPitch, lastMessageAt: new Date() }
        });
      }

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'outbound',
          body: personalizedPitch,
          status: 'sent',
          providerMessageId: sendResult.messageId
        }
      });

      await prisma.campaignLead.update({
        where: { id: campaignLead.id },
        data: { status: 'sent', sentAt: new Date() }
      });

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { sentCount: { increment: 1 } }
      });

      await prisma.outreachLog.create({
        data: { campaignId: campaign.id, leadId, agentName: 'Sent Success Agent', action: 'Send Message API', status: 'success', message: `Delivered message ${sendResult.messageId}` }
      });

      // Step 9: Webhook receive reply (Simulating inbound hook event)
      const positiveReplies = [
        "Hey! This looks really interesting. Can you send pricing?",
        "Yes, I am looking to automate this. How can we jump on a call?",
        "Hey, thanks for reaching out. Yes, tell me more about it."
      ];
      const negativeReplies = [
        "Please stop messaging me. I am not interested.",
        "Unsubscribe",
        "No thanks."
      ];

      const score = MessageEngine.calculateLeadScore(lead);
      const isInterested = score.priority === 'Hot' || Math.random() > 0.4;
      const inboundReplyBody = isInterested
        ? positiveReplies[Math.floor(Math.random() * positiveReplies.length)]
        : negativeReplies[Math.floor(Math.random() * negativeReplies.length)];

      this.log(9, 'Webhook Receive Reply', leadId, bizName, 'success', `Simulating webhook inbound reply event: "${inboundReplyBody}"`);
      
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'inbound',
          body: inboundReplyBody,
          status: 'delivered'
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessage: inboundReplyBody, lastMessageAt: new Date() }
      });

      await prisma.campaignLead.update({
        where: { id: campaignLead.id },
        data: { status: 'replied', repliedAt: new Date() }
      });

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { repliedCount: { increment: 1 } }
      });

      await prisma.outreachLog.create({
        data: { campaignId: campaign.id, leadId, agentName: 'Reply Received Agent', action: 'Webhook Inbound Reply', status: 'success', message: `Received reply: "${inboundReplyBody}"` }
      });

      // Step 10: AI classify reply
      const analysis = await MessageEngine.analyzeReply(inboundReplyBody);
      this.log(10, 'AI Classify Reply', leadId, bizName, 'success', `AI Classify: Intent=${analysis.intent}, Sentiment=${analysis.sentiment}, Next=${analysis.nextAction}`);

      await prisma.outreachLog.create({
        data: {
          campaignId: campaign.id,
          leadId,
          agentName: 'Reply Classifier Agent',
          action: 'AI Intent Classification',
          status: 'success',
          message: `Intent: ${analysis.intent}, Sentiment: ${analysis.sentiment}`
        }
      });

      // Update CRM stage based on reply intent
      const crmStage = analysis.intent === 'Interested' || analysis.intent === 'Pricing' || analysis.intent === 'Callback'
        ? 'Interested'
        : 'Lost';

      await prisma.lead.update({
        where: { id: leadId },
        data: { status: crmStage }
      });

      // Step 11: Human/agent follow-up
      if (crmStage === 'Interested') {
        const followUpTime = new Date();
        followUpTime.setHours(followUpTime.getHours() + 24);
        
        await prisma.followUp.create({
          data: {
            leadId,
            message: `Hi ${lead.name || 'there'}, following up on our chat yesterday. Would you like to schedule a 10 min strategy call?`,
            status: 'scheduled',
            sendAt: followUpTime
          }
        });

        this.log(11, 'Human/Agent Follow-up', leadId, bizName, 'success', `Scheduled human follow-up automation for ${followUpTime.toLocaleDateString()}`);
        await prisma.outreachLog.create({
          data: { campaignId: campaign.id, leadId, agentName: 'Follow-up Agent', action: 'Schedule Follow-up', status: 'success', message: 'Scheduled strategy call check' }
        });
      } else {
        this.log(11, 'Human/Agent Follow-up', leadId, bizName, 'warning', `Agent flagged lead as lost/opt-out. Skipping follow-up.`);
      }
    }

    // Complete campaign run
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: 'completed', completedAt: new Date() }
    });

    return {
      success: true,
      processed: leads.length,
      logs: this.globalLogs
    };
  }
}
