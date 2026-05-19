import { Router } from 'express';
import { prisma } from '../prisma';
import { whatsappClient } from '../whatsapp/client';
import { MessageEngine } from '../ai/messageEngine';

const router = Router();

router.get('/', async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    include: { lead: true, Message: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { lastMessageAt: 'desc' }
  });
  res.json(conversations);
});

router.get('/:id', async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { lead: true, Message: { orderBy: { createdAt: 'asc' } } }
  });
  res.json(conversation);
});

router.post('/:id/reply', async (req, res) => {
  const { text } = req.body;
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { lead: true }
  });

  if (!conversation) return res.status(404).json({ error: "Conversation not found" });

  const result = await whatsappClient.sendMessage(conversation.lead.phone, text);
  
  if (result.success) {
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: 'outbound',
        body: text,
        providerMessageId: result.messageId
      }
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessage: text, lastMessageAt: new Date() }
    });

    res.json(message);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.post('/:id/ai-toggle', async (req, res) => {
  const { enabled } = req.body;
  const conversation = await prisma.conversation.update({
    where: { id: req.params.id },
    data: { aiEnabled: enabled }
  });
  res.json(conversation);
});

// Webhook for receiving messages
router.post('/webhook', async (req, res) => {
  // Mock webhook handler
  const { phone, body, messageId } = req.body;

  let lead = await prisma.lead.findFirst({ where: { phone } });
  if (!lead) {
    lead = await prisma.lead.create({ data: { phone, name: 'Unknown' } });
  }

  let conversation = await prisma.conversation.findFirst({
    where: { leadId: lead.id, status: 'active' }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { leadId: lead.id } });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: 'inbound',
      body,
      providerMessageId: messageId
    }
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessage: body, lastMessageAt: new Date() }
  });

  // Process AI reply if enabled
  if (conversation.aiEnabled) {
    const { score, optOut } = await MessageEngine.detectIntent(body);
    
    await prisma.lead.update({
      where: { id: lead.id },
      data: { 
        score: { increment: score },
        status: optOut ? 'opted_out' : lead.status
      }
    });

    if (optOut) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { aiEnabled: false, status: 'closed' }
      });
      // Optionally send opt-out confirmation here
    } else {
      // Auto-reply logic can go here or be queued via BullMQ
      // Skipping for brevity, would generateReplyMessage and send
    }
  }

  res.json({ success: true });
});

export default router;
