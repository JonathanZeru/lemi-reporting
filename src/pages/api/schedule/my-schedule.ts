import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';
import { applyCors } from '../cors';
import { prisma } from '../prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applyCors(res); // Apply CORS headers
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method === 'GET') {
    const { hiwasId, role } = req.query;

    if (hiwasId) {
      try {
        const job = await prisma.schedule.findMany({
          where: { createdByHiwasId: Number(hiwasId) },
          include:{
            createdByHiwas: true,
            createdByMD: true,
            createdByWana: true,
            createdByWereda: true,
          }
        });

        if (!job) {
          return res.status(404).json({ error: 'hiwas not found' });
        }

        return res.status(200).json(job);
      } catch (error) {
        console.error('Error retrieving hiwas:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }finally {
        console.log('Disconnecting Prisma...');
        await prisma.$disconnect(); // Just disconnect, don't make more queries after this
      }
    } 
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
