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
    const { meseratawiId } = req.query;

    if (meseratawiId) {
      try {
        // Fetch a specific job by ID
        const hiwas = await prisma.hiwas.findMany({
          where: { mdId: Number(meseratawiId) }
        });

        if (!hiwas) {
          return res.status(404).json({ error: 'hiwas not found' });
        }

        return res.status(200).json(hiwas);
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
