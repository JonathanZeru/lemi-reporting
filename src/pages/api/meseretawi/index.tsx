import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

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
        const job = await prisma.meseretawiDirijet.findUnique({
          where: { id: Number(id) },
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
        // Fetch all jobs
        const jobs = await prisma.meseretawiDirijet.findMany({
          orderBy: {
            createdAt: 'desc',
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
