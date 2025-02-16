import { NextApiRequest, NextApiResponse } from 'next';
import { applyCors } from '../cors';
import { prisma } from '../prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;

    if (id) {
      const job = await prisma.wereda.findUnique({
        where: { id: Number(id) }
      });

      if (!job) {
        return res.status(404).json({ error: 'wereda not found' });
      }

      return res.status(200).json(job);
    } else {
      const jobs = await prisma.wereda.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(jobs);
    }
  } catch (error) {
    console.error('Error retrieving wereda:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    console.log('Disconnecting Prisma...');
    await prisma.$disconnect(); // Just disconnect, don't make more queries after this
  }
}
