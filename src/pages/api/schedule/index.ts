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
    const { id, scheduleId } = req.query;
    if(scheduleId){
      try {
        // Fetch a specific job by ID
        const job = await prisma.schedule.findUnique({
          where: { id: Number(scheduleId) },
          include:{
            reports: true,
            createdByHiwas: true,
            createdByMD: true,
            createdByWana: true,
            createdByWereda: true,
          },
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
    if (id) {
      try {
        // Fetch a specific job by ID
        const job = await prisma.schedule.findUnique({
          where: { id: Number(id) },
          include:{
            reports: true,
            createdByHiwas: true,
            createdByMD: true,
            createdByWana: true,
            createdByWereda: true,
          },
        });

        if (!job) {
          return res.status(404).json({ error: 'hiwas not found' });
        }

        return res.status(200).json(job);
      } catch (error) {
        console.error('Error retrieving hiwas:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      try {
      
        const jobs = await prisma.schedule.findMany({
          orderBy: {
            createdAt: 'desc',
          },
          include:{
            reports: true,
            createdByHiwas: true,
            createdByMD: true,
            createdByWana: true,
            createdByWereda: true
          },
        });
        return res.status(200).json(jobs);
      } catch (error) {
        console.error('hiwas retrieving jobs:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
