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
    try {
      // Fetch all reports where reportedByMDId is not null
      const reports = await prisma.report.findMany({
        where: {
          reportedByMDId: { not: null }, // Filter only reports by MeseretawiDirijet
        },
        include: {
          reportedByMD: true, // Include MeseretawiDirijet data in the response
        },
        orderBy: {
          createdAt: 'desc', // Order by creation date (newest first)
        },
      });

      if (!reports.length) {
        return res.status(404).json({ error: 'No reports found for MeseretawiDirijet' });
      }

      return res.status(200).json(reports);
    } catch (error) {
      console.error('Error retrieving reports:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }finally {
      console.log('Disconnecting Prisma...');
      await prisma.$disconnect(); // Just disconnect, don't make more queries after this
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
