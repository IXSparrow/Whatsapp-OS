import { Router } from 'express';
import { whatsappClient } from '../whatsapp/client';

const router = Router();

router.post('/connect', async (req, res) => {
  try {
    const result = await whatsappClient.connect('default-user');
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/status', async (req, res) => {
  const status = await whatsappClient.getStatus('default-user');
  res.json(status);
});

router.post('/disconnect', async (req, res) => {
  await whatsappClient.disconnect('default-user');
  res.json({ success: true });
});

router.post('/send', async (req, res) => {
  const { phone, text } = req.body;
  const result = await whatsappClient.sendMessage(phone, text);
  res.json(result);
});

export default router;
