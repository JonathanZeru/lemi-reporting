import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
      }
    } 
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
