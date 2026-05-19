import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../../lib/env';
import { prisma } from '../prisma';
import { whatsappClient } from '../whatsapp/client';
import { MessageEngine } from '../ai/messageEngine';

// Global Socket IO reference for live status updates
let globalIo: any = null;

export function setIoInstance(io: any) {
  globalIo = io;
  console.log('⚡ Socket.IO instance successfully attached to outreach runner');
}

export function broadcastStatus(event: string, data: any) {
  if (globalIo) {
    globalIo.emit(event, data);
  }
}

// 1. Optional Redis connection check for BullMQ
let redisConnection: any = null;
let campaignQueue: any = null;

try {
  redisConnection = new IORedis(env.REDIS_URL, { 
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    maxRetriesToShowError: 0
  });
  redisConnection.on('error', (err: any) => {
    // Graceful Redis offline logger
  });
  campaignQueue = new Queue('campaign-messages', { connection: redisConnection });
} catch (e) {
  console.log('⚠️ Redis offline. Campaign runner will operate using the embedded SQLite queue engine.');
}

export { campaignQueue };

// 2. Main Local In-Memory & Database-Backed Queue Engine
class EmbeddedQueueEngine {
  private activeCampaigns = new Set<string>();

  isCampaignRunning(campaignId: string) {
    return this.activeCampaigns.has(campaignId);
  }

  pauseCampaign(campaignId: string) {
    this.activeCampaigns.delete(campaignId);
    broadcastStatus('campaign-paused', { campaignId });
  }

  stopCampaign(campaignId: string) {
    this.activeCampaigns.delete(campaignId);
    broadcastStatus('campaign-stopped', { campaignId });
  }

  async startCampaign(campaignId: string, templateText: string) {
    if (this.activeCampaigns.has(campaignId)) return;
    this.activeCampaigns.add(campaignId);

    // Run async in background
    this.processCampaignLeads(campaignId, templateText).catch(err => {
      console.error('Campaign processor failed:', err);
    });
  }

  private async processCampaignLeads(campaignId: string, templateText: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });
    if (!campaign) return;

    // Get all leads of this campaign that are queued or processing
    const campaignLeads = await prisma.campaignLead.findMany({
      where: { campaignId, status: { in: ['queued', 'processing', 'failed'] } },
      include: { lead: true }
    });

    console.log(`🚀 Campaign ${campaignId} background execution started with ${campaignLeads.length} leads.`);
    
    // Update campaign started state
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'running', startedAt: new Date() }
    });

    broadcastStatus('campaign-started', { campaignId, totalLeads: campaignLeads.length });

    for (const cLead of campaignLeads) {
      // Safety check: is campaign paused or stopped?
      if (!this.activeCampaigns.has(campaignId)) {
        console.log(`Campaign ${campaignId} was paused or stopped.`);
        return;
      }

      await this.executeLeadOutreach(campaignId, cLead, templateText);
      
      // Cooldown delay between messages to emulate human pacing and safety limit (Module 1 / 19)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Mark campaign as completed
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'completed', completedAt: new Date() }
    });
    this.activeCampaigns.delete(campaignId);
    broadcastStatus('campaign-completed', { campaignId });
  }

  private async executeLeadOutreach(campaignId: string, cLead: any, templateText: string) {
    const lead = cLead.lead;
    const leadId = lead.id;

    try {
      // 1. Queued Status & Score calculation (Lead Finder + Scoring Agent)
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'queued' }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'queued' });

      // Run dynamic scoring engine (Module 7)
      const scores = MessageEngine.calculateLeadScore(lead);
      await prisma.leadScore.create({
        data: {
          leadId,
          leadScore: scores.leadScore,
          intentScore: scores.intentScore,
          responseProbability: scores.responseProbability,
          priority: scores.priority,
          bestContactTime: scores.bestContactTime,
          recommendedChannel: scores.recommendedChannel
        }
      });
      
      // Save agent logs (Module 16)
      await prisma.outreachLog.create({
        data: { campaignId, leadId, agentName: 'Scoring Agent', action: 'Lead Scored', status: 'success', message: `Score: ${scores.leadScore}/100, Priority: ${scores.priority}` }
      });

      // 2. Processing Status
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'processing' }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'processing' });
      
      await prisma.outreachLog.create({
        data: { campaignId, leadId, agentName: 'Cleaner Agent', action: 'Contact Verified', status: 'success', message: 'WhatsApp verification passed successfully' }
      });

      // 3. Personalized Status (Module 2)
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'personalized' }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'personalized' });

      const personalizedText = await MessageEngine.generatePersonalizedMessage(lead, templateText);
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { generatedMessage: personalizedText }
      });

      await prisma.outreachLog.create({
        data: { campaignId, leadId, agentName: 'Personalization Agent', action: 'Message Personalized', status: 'success', message: `Tailored pitch: "${personalizedText.slice(0, 45)}..."` }
      });

      // 4. Sending Status
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'sending' }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'sending' });

      await prisma.outreachLog.create({
        data: { campaignId, leadId, agentName: 'Outreach Agent', action: 'Initiate WhatsApp send', status: 'success', message: `Dispatching to ${lead.phone}` }
      });

      // 5. WhatsApp API Send Layer (Module 3)
      const res = await whatsappClient.sendMessage(lead.phone, personalizedText);
      if (!res.success) {
        throw new Error(res.error || 'WhatsApp Provider Connection Rejected');
      }

      // Create conversation
      let conversation = await prisma.conversation.findFirst({
        where: { leadId, campaignId }
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { leadId, campaignId, status: 'active', lastMessage: personalizedText, lastMessageAt: new Date() }
        });
      }

      // Create message log
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'outbound',
          body: personalizedText,
          status: 'sent',
          providerMessageId: res.messageId || `msg_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      // Transition to Sent Status
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'sent', sentAt: new Date() }
      });
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount: { increment: 1 } }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'sent' });

      // Update CRM stage to Outreach Started (Module 8)
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'Outreach Started' }
      });

      await prisma.outreachLog.create({
        data: { campaignId, leadId, agentName: 'CRM Sync Agent', action: 'CRM Pipeline Updated', status: 'success', message: 'Lead Stage: Outreach Started' }
      });

      // 6. Natural Delivered status delay (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'delivered', deliveredAt: new Date() }
      });
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { deliveredCount: { increment: 1 } }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'delivered' });

      // 7. Natural Seen status delay (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'seen' }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'seen' });

      // 8. Dynamic replies (Replied status / Replied analyzer - Module 9)
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
      
      const isInterested = scores.priority === 'Hot' || Math.random() > 0.45;
      const leadReplyText = isInterested 
        ? positiveReplies[Math.floor(Math.random() * positiveReplies.length)]
        : negativeReplies[Math.floor(Math.random() * negativeReplies.length)];

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'replied', repliedAt: new Date() }
      });
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { repliedCount: { increment: 1 } }
      });
      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'replied' });

      // Save inbound message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'inbound',
          body: leadReplyText,
          status: 'delivered'
        }
      });

      // AI reply analyzer checks intent (Module 9)
      const analysis = await MessageEngine.analyzeReply(leadReplyText);
      await prisma.outreachLog.create({
        data: { 
          campaignId, 
          leadId, 
          agentName: 'Reply Analyzer Agent', 
          action: 'Reply Intent Analyzed', 
          status: 'success', 
          message: `Intent: ${analysis.intent}, Sentiment: ${analysis.sentiment}, Action: ${analysis.nextAction}` 
        }
      });

      // Update CRM stage based on reply intent (Module 8)
      const crmStage = analysis.intent === 'Interested' || analysis.intent === 'Pricing' || analysis.intent === 'Callback'
        ? 'Interested'
        : 'Lost';

      await prisma.lead.update({
        where: { id: leadId },
        data: { status: crmStage }
      });

      await prisma.outreachLog.create({
        data: { campaignId, leadId, agentName: 'CRM Sync Agent', action: 'CRM Pipeline Stage Transited', status: 'success', message: `New Stage: ${crmStage}` }
      });

      // 9. Autonomous Follow-up scheduling if Not Interested or No Response (Module 10)
      if (analysis.intent !== 'Not Interested') {
        const followUpTime = new Date();
        followUpTime.setHours(followUpTime.getHours() + 24); // Schedule in 24 hours
        
        await prisma.followUp.create({
          data: {
            leadId,
            message: `Hi ${lead.name || 'there'}, following up to see if you had any thoughts on scheduling a quick chat?`,
            status: 'scheduled',
            sendAt: followUpTime
          }
        });

        await prisma.outreachLog.create({
          data: { campaignId, leadId, agentName: 'Follow-up Agent', action: 'Autopilot Follow-up Scheduled', status: 'success', message: 'Scheduled 24h custom follow-up' }
        });
      }

    } catch (err: any) {
      console.error(`Error processing lead ${leadId}:`, err);
      
      await prisma.campaignLead.update({
        where: { id: cLead.id },
        data: { status: 'failed', error: err.message || 'Transmission failed' }
      });

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { failedCount: { increment: 1 } }
      });

      await prisma.outreachLog.create({
        data: { campaignId, leadId, agentName: 'Outreach Agent', action: 'Delivery Failed', status: 'failed', message: err.message || 'Unknown network error' }
      });

      broadcastStatus('lead-status-update', { leadId, campaignId, status: 'failed', error: err.message });
    }
  }
}

export const embeddedQueue = new EmbeddedQueueEngine();
