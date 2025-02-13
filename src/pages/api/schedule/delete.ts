import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';
import { applyCors } from '../cors';
import { prisma } from '../prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const allowedOrigin = 'http://localhost:5173'; // Replace with your frontend origin

 applyCors(res); // Apply CORS headers
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      await prisma.schedule.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting Schedule:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }finally {
      console.log('Disconnecting Prisma...');
      await prisma.$disconnect(); // Just disconnect, don't make more queries after this
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
