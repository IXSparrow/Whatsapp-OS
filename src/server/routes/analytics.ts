import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/overview', async (req, res) => {
  try {
    const activeAgents = await prisma.aIAgent.count({ where: { isActive: true } }).catch(() => 0);
    const runningCampaigns = await prisma.campaign.count({ where: { status: 'running' } }).catch(() => 0);
    const activeConversations = await prisma.conversation.count({ where: { status: 'active' } }).catch(() => 0);
    
    // Calculate messages sent today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const messagesSentToday = await prisma.message.count({
      where: {
        direction: 'outbound',
        createdAt: { gte: startOfDay }
      }
    }).catch(() => 0);

    res.json({
      activeAgents,
      runningCampaigns,
      activeConversations,
      messagesSentToday,
      responseRate: '34%', // Mocked for now
      deliverySuccess: '99.8%' // Mocked for now
    });
  } catch (err: any) {
    console.warn("Prisma stats overview fetch error:", err);
    res.json({
      activeAgents: 0,
      runningCampaigns: 0,
      activeConversations: 0,
      messagesSentToday: 0,
      responseRate: '0%',
      deliverySuccess: '100.0%'
    });
  }
});

export default router;
