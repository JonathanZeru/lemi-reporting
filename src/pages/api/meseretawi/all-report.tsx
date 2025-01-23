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
    const { hiwasId, meseratawiId } = req.query;

    if (hiwasId) {
      try {
        const reports = await prisma.report.findMany({
          where: { reportedByHiwasId: Number(hiwasId) },
          include: {
            reportByHiwas: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!reports || reports.length === 0) {
          return res.status(404).json({ error: 'No reports found' });
        }

        return res.status(200).json(reports);
      } catch (error) {
        console.error('Error retrieving reports:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else if (meseratawiId) {
      try {
        // Fetch all Hiwas associated with the given MeseretawiDirijet ID
        const hiwasList = await prisma.hiwas.findMany({
          where: { mdId: Number(meseratawiId) },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!hiwasList || hiwasList.length === 0) {
          return res.status(404).json({ error: 'No Hiwas found for the given MeseretawiDirijet' });
        }

        // Fetch all reports for the Hiwas IDs
        const hiwasIds = hiwasList.map((hiwas) => hiwas.id);
        const reports = await prisma.report.findMany({
          where: {
            reportedByHiwasId: { in: hiwasIds },
          },
          include: {
            reportByHiwas: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return res.status(200).json({ reports });
      } catch (error) {
        console.error('Error retrieving reports for MeseretawiDirijet:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
