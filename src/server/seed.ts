import { prisma } from './prisma';

async function main() {
  console.log("Seeding default AI Agents...");

  const agents = [
    {
      name: 'Website Sales Agent',
      role: 'Sales',
      goal: 'Pitch website development service to local businesses.',
      personality: 'Professional, persuasive, and solution-oriented.',
    },
    {
      name: 'Automation Sales Agent',
      role: 'Sales',
      goal: 'Pitch WhatsApp automation and business automation.',
      personality: 'Tech-savvy, efficient, and highly convincing.',
    },
    {
      name: 'Follow-up Agent',
      role: 'Follow-up',
      goal: 'Follow up politely and book calls.',
      personality: 'Polite, persistent but not annoying, helpful.',
    },
    {
      name: 'Support Agent',
      role: 'Support',
      goal: 'Answer common business queries.',
      personality: 'Patient, clear, and extremely helpful.',
    }
  ];

  for (const agent of agents) {
    const exists = await prisma.aIAgent.findFirst({ where: { name: agent.name } });
    if (!exists) {
      await prisma.aIAgent.create({ data: agent });
      console.log(`Created agent: ${agent.name}`);
    } else {
      console.log(`Agent ${agent.name} already exists.`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
