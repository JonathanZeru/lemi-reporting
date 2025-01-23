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
    const { weredaId } = req.query;

    if (weredaId) {
      try {
        // Fetch reports by specific Wereda ID
        const reports = await prisma.report.findMany({
          where: { reportedByWeredaId: Number(weredaId) },
          include: { reportedByWereda: true }, // Include Wereda data
        });

        if (reports.length === 0) {
          return res.status(404).json({ error: 'No reports found for this Wereda' });
        }

        return res.status(200).json(reports);
      } catch (error) {
        console.error('Error retrieving reports:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      try {
        // Fetch all reports not linked to MeseretawiDirijet or Wereda
        const reports = await prisma.report.findMany({
          where: {
            reportedByMDId: null,
            reportedByWeredaId: null,
          },
          orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json(reports);
      } catch (error) {
        console.error('Error retrieving reports:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
