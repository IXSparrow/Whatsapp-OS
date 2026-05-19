import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.post('/', async (req, res) => {
  const agent = await prisma.aIAgent.create({ data: req.body });
  res.json(agent);
});

router.get('/', async (req, res) => {
  const agents = await prisma.aIAgent.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(agents);
});

router.put('/:id', async (req, res) => {
  const agent = await prisma.aIAgent.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(agent);
});

router.delete('/:id', async (req, res) => {
  await prisma.aIAgent.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
