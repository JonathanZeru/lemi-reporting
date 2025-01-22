import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // CORS Headers
  // res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  } 

  if (req.method === 'GET') {
    const { scheduleId } = req.query;

    if (scheduleId) {
      try {
        const report = await prisma.report.findMany({
          where: { scheduleId: Number(scheduleId) },
          include: {
            reportImages: true,
            reportPdfs: true,
            schedule: true,
            reportedByWereda: {
              select:{
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              }
            },
          },
        });

        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
        
        return res.status(200).json(report);
      } catch (error) {
        console.error('Error retrieving report:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
