import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';
import { applyCors } from '../cors';
import { prisma } from '../prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  applyCors(res); // Apply CORS headers

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  } 
  if (req.method === 'GET') {
    const { id } = req.query;

    if (id) {
      try {
        // Fetch a specific job by ID
        const job = await prisma.report.findUnique({
          where: { id: Number(id) },
        });

        if (!job) {
          return res.status(404).json({ error: 'Job not found' });
        }

        return res.status(200).json(job);
      } catch (error) {
        console.error('Error retrieving job:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      try {
        // Fetch all jobs
        const jobs = await prisma.report.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        });
        return res.status(200).json(jobs);
      } catch (error) {
        console.error('Error retrieving jobs:', error);
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
