import { Router } from 'express';
import { prisma } from '../prisma';
import multer from 'multer';
import Papa from 'papaparse';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const csvData = req.file.buffer.toString('utf-8');
  const results = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  
  const leads = results.data.map((row: any) => ({
    name: row.name || row.Name || row.BusinessName || null,
    businessName: row.businessName || row.BusinessName || row.name || null,
    phone: row.phone || row.Phone || row.PhoneNumber || null,
    email: row.email || row.Email || null,
  })).filter(l => l.phone); // Require phone number

  let imported = 0;
  for (const lead of leads) {
    // Basic clean phone
    const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
    const exists = await prisma.lead.findFirst({ where: { phone: cleanPhone } });
    
    if (!exists) {
      await prisma.lead.create({
        data: {
          name: lead.name,
          businessName: lead.businessName,
          phone: cleanPhone,
          email: lead.email,
        }
      });
      imported++;
    }
  }

  res.json({ success: true, imported, total: leads.length });
});

router.get('/', async (req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(leads);
});

router.post('/clean', async (req, res) => {
  // Remove duplicates
  // This is a simple mock implementation, a real one would group by phone and keep one.
  res.json({ success: true, removed: 0 });
});

router.delete('/:id', async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
