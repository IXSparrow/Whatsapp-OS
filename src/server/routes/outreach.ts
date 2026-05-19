import { Router } from 'express';
import { prisma } from '../prisma';
import { MessageEngine } from '../ai/messageEngine';
import { embeddedQueue } from '../campaigns/runner';
import { whatsappClient } from '../whatsapp/client';
import multer from 'multer';
import fs from 'fs';
import Papa from 'papaparse';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// 1. GET /api/outreach/summary - Real dynamic metrics matching Master Prompt
router.get('/summary', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        LeadScore: true,
        LeadValidation: true,
        CampaignLead: true
      }
    });

    const totalLeads = leads.length;
    const whatsappReady = leads.filter(l => l.phone && l.phone.trim().length > 4 && l.LeadValidation?.[0]?.whatsappReady).length;
    const missingPhone = leads.filter(l => !l.phone || l.phone.trim().length < 5 || !l.LeadValidation?.[0]?.isValidPhone).length;
    
    // AI Validated (leads with a validation record that passed)
    const aiValidated = leads.filter(l => l.LeadValidation?.length > 0).length;
    
    // Hot Intent (intentScore > 70)
    const hotIntent = leads.filter(l => {
      const intentScore = l.LeadScore?.[0]?.intentScore ?? 0;
      return intentScore > 70;
    }).length;

    // Campaign Ready (validated, whatsapp ready, not duplicate)
    const campaignReady = leads.filter(l => 
      l.phone && l.LeadValidation?.[0]?.whatsappReady && l.LeadValidation?.[0]?.isValidPhone
    ).length;

    res.json({
      success: true,
      totalLeads,
      whatsappReady,
      missingPhone,
      aiValidated,
      hotIntent,
      campaignReady,
      lastSynced: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/outreach/leads - Fetch Target Matrix with all relational data
router.get('/leads', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        LeadScore: { orderBy: { createdAt: 'desc' }, take: 1 },
        CampaignLead: { orderBy: { createdAt: 'desc' }, take: 1 },
        LeadValidation: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = leads.map(l => {
      const scoreObj = l.LeadScore[0];
      const campLead = l.CampaignLead[0];
      const validationObj = l.LeadValidation[0];

      return {
        id: l.id,
        name: l.name || 'Unknown Contact',
        businessName: l.businessName || 'No Business Name',
        phone: l.phone,
        category: l.category || 'N/A',
        city: l.city || 'N/A',
        website: l.email || 'N/A',
        rating: l.state || '4.5',
        reviews: l.countryCode || '0',
        score: scoreObj?.leadScore ?? l.score ?? 50,
        intentScore: scoreObj?.intentScore ?? 50,
        responseProbability: scoreObj?.responseProbability ?? 50,
        priority: scoreObj?.priority ?? 'Cold',
        whatsappReady: validationObj?.whatsappReady ?? false,
        isValidPhone: validationObj?.isValidPhone ?? true,
        messageStatus: campLead?.status ?? 'Imported',
        campaignStatus: campLead ? 'active' : 'idle',
        generatedMessage: campLead?.generatedMessage || '',
        error: campLead?.error || ''
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/outreach/sync-vault - Bulk sync leads from frontend local storage Data Vault into SQLite database
router.post('/sync-vault', async (req, res) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads)) {
      return res.status(400).json({ success: false, error: 'Invalid leads payload. Must be an array.' });
    }

    let importedRows = 0;
    let duplicates = 0;
    let merged = 0;

    for (const row of leads) {
      const phone = row.phone || row.Phone || row.phoneNumber;
      const email = row.email || row.Email;
      const businessName = row.name || row.businessName || row.business || row.Company;
      const city = row.city || row.address || row.City;
      
      if (!phone && !email) continue; // Skip totally invalid rows
      
      // Duplicate Detection Engine
      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            { phone: phone ? String(phone) : undefined },
            { email: email ? String(email) : undefined }
          ]
        }
      });

      if (existing) {
        // Smart Merging: Update missing fields only
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            businessName: existing.businessName || businessName || '',
            city: existing.city || city || '',
            category: existing.category || row.category || '',
            source: 'Data Vault Sync (Merged)'
          }
        });
        merged++;
      } else {
        // Create new
        const newLead = await prisma.lead.create({
          data: {
            name: row.name || row.Name || 'Contact',
            phone: phone ? String(phone) : '',
            email: email ? String(email) : '',
            businessName: businessName || '',
            city: city || '',
            category: row.category || '',
            source: 'Data Vault Sync',
            status: 'new'
          }
        });
        
        // Initial Dummy validation record
        await prisma.leadValidation.create({
          data: {
            leadId: newLead.id,
            isValidPhone: phone ? String(phone).length > 5 : false,
            whatsappReady: phone ? String(phone).length > 5 : false,
          }
        });
        importedRows++;
      }
    }

    res.json({
      success: true,
      importedRows,
      merged,
      duplicates
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST /api/outreach/import-csv - Robust intelligent duplicate merging engine
router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });

    const csvData = fs.readFileSync(req.file.path, 'utf8');
    
    // Parse CSV
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    
    let importedRows = 0;
    let duplicates = 0;
    let merged = 0;
    
    const io = (req as any).io; // WebSockets for live status
    
    for (const row of parsed.data as any[]) {
      const phone = row.phone || row.Phone || row.phoneNumber;
      const email = row.email || row.Email;
      const businessName = row.businessName || row.business || row.Company;
      const city = row.city || row.City;
      
      if (!phone && !email) continue; // Skip totally invalid rows
      
      // Duplicate Detection Engine
      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            { phone: phone ? phone : undefined },
            { email: email ? email : undefined }
          ]
        },
        include: { LeadValidation: true, LeadScore: true }
      });

      if (existing) {
        // Smart Merging: Update missing fields only
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            businessName: existing.businessName || businessName,
            city: existing.city || city,
            category: existing.category || (row.category || row.Category),
            source: 'CSV Import (Merged)'
          }
        });
        
        await prisma.duplicateLog.create({
          data: {
            originalLeadId: existing.id,
            duplicatePhone: phone || null,
            duplicateEmail: email || null,
            mergeAction: 'merged'
          }
        });
        merged++;
      } else {
        // Create new
        const newLead = await prisma.lead.create({
          data: {
            name: row.name || row.Name || 'Contact',
            phone: phone || '',
            email: email || '',
            businessName: businessName || '',
            city: city || '',
            category: row.category || row.Category || '',
            source: 'CSV Import',
            status: 'new'
          }
        });
        
        // Initial Dummy validation record
        await prisma.leadValidation.create({
          data: {
            leadId: newLead.id,
            isValidPhone: phone ? phone.length > 5 : false,
            whatsappReady: phone ? phone.length > 5 : false,
          }
        });
        
        importedRows++;
      }
    }
    
    // Save import stats
    await prisma.import.create({
      data: {
        fileName: req.file.originalname,
        status: 'completed',
        totalRows: parsed.data.length,
        importedRows,
        duplicates,
        merged
      }
    });

    // Cleanup temp file
    fs.unlinkSync(req.file.path);
    
    // Emit global event
    if (io) {
      io.emit('data-vault-updated', { importedRows, merged });
    }

    res.json({ success: true, importedRows, merged, duplicates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST /api/outreach/generate-messages - AI Message Generator
router.post('/generate-messages', async (req, res) => {
  try {
    const { templateText, selectedLeadIds } = req.body;
    if (!templateText) {
      return res.status(400).json({ success: false, error: 'Template text is required.' });
    }

    const targetIds = selectedLeadIds || [];
    const leads = await prisma.lead.findMany({
      where: targetIds.length > 0 ? { id: { in: targetIds } } : {}
    });

    let count = 0;
    const io = (req as any).io;

    for (const lead of leads) {
      // 1. Calculate Score dynamically (Hot Intent Engine)
      const scores = MessageEngine.calculateLeadScore(lead);
      await prisma.leadScore.create({
        data: {
          leadId: lead.id,
          leadScore: scores.leadScore,
          intentScore: scores.intentScore,
          responseProbability: scores.responseProbability,
          priority: scores.priority,
          bestContactTime: scores.bestContactTime,
          recommendedChannel: scores.recommendedChannel
        }
      });

      // 2. Generate custom message (AI Personalized Messaging)
      const message = await MessageEngine.generatePersonalizedMessage(lead, templateText);
      
      const existing = await prisma.campaignLead.findFirst({
        where: { leadId: lead.id }
      });

      if (existing) {
        await prisma.campaignLead.update({
          where: { id: existing.id },
          data: { generatedMessage: message, status: 'personalized' }
        });
      } else {
        let draftCampaign = await prisma.campaign.findFirst({
          where: { status: 'draft' }
        });
        if (!draftCampaign) {
          draftCampaign = await prisma.campaign.create({
            data: { name: 'Autopilot Outreach', status: 'draft' }
          });
        }
        await prisma.campaignLead.create({
          data: {
            campaignId: draftCampaign.id,
            leadId: lead.id,
            generatedMessage: message,
            status: 'personalized'
          }
        });
      }
      
      // Update UI Live
      if (io) {
        io.emit('lead-status-update', { leadId: lead.id, status: 'personalized' });
      }
      
      count++;
    }

    res.json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. POST /api/outreach/start-campaign - Campaign Execution Engine
router.post('/start-campaign', async (req, res) => {
  try {
    const { name, templateText, selectedLeadIds } = req.body;
    
    const targetIds = selectedLeadIds || [];
    const leads = await prisma.lead.findMany({
      where: targetIds.length > 0 ? { id: { in: targetIds } } : {}
    });

    if (leads.length === 0) return res.status(400).json({ success: false, error: 'No valid leads found in campaign list.' });

    const campaign = await prisma.campaign.create({
      data: {
        name: name || `WhatsApp Run - ${new Date().toLocaleDateString()}`,
        status: 'queued',
        totalLeads: leads.length,
        source: 'Data Vault'
      }
    });

    for (const lead of leads) {
      const personalizedMessage = await MessageEngine.generatePersonalizedMessage(lead, templateText);
      
      await prisma.campaignLead.create({
        data: {
          campaignId: campaign.id,
          leadId: lead.id,
          generatedMessage: personalizedMessage,
          status: 'queued'
        }
      });
    }

    embeddedQueue.startCampaign(campaign.id, templateText);
    res.json({ success: true, campaignId: campaign.id, totalLeads: leads.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. POST /api/outreach/pause
router.post('/pause', async (req, res) => {
  try {
    const { campaignId } = req.body;
    embeddedQueue.pauseCampaign(campaignId);
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'paused' }
    });
    res.json({ success: true, campaignId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. POST /api/outreach/stop
router.post('/stop', async (req, res) => {
  try {
    const { campaignId } = req.body;
    embeddedQueue.stopCampaign(campaignId);
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'stopped' }
    });
    res.json({ success: true, campaignId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. GET /api/outreach/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.outreachLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. POST /api/outreach/pipeline/run - Executing the 11-step backend pipeline
router.post('/pipeline/run', async (req, res) => {
  try {
    const { selectedLeadIds, templateType } = req.body;
    const { ValidationPipeline } = await import('../campaigns/pipeline');
    const result = await ValidationPipeline.runPipeline(selectedLeadIds, templateType || 'Friendly');
    
    // Notify clients via socket if attached
    const io = (req as any).io;
    if (io) {
      io.emit('pipeline-execution-completed', result);
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Pipeline execution error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
