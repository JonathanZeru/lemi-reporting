import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  } 
  if (req.method === 'GET') {
    const { meseretawiDirijetId,notificationId } = req.query;

    if (meseretawiDirijetId && !notificationId) {
      try {
        const job = await prisma.notification.findMany({
          where: { meseretawiDirijetId: Number(meseretawiDirijetId) },
          include:{
            schedule:{
              select:{
                id: true,
                status: true,
                startTime: true,
                endTime: true,
                title: true,
                description: true
              }
            },
            hiwas: {
              select:{
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true
              }
            },
            report: {
              select:{
                name: true,
                reportedByHiwasId: true,
                description: true,
                createdAt: true
              }
            }
          },
          orderBy:{
            createdAt: 'desc'
          }
        });

        if (!job) {
          return res.status(404).json({ error: 'Meseretawi not found' });
        }

        return res.status(200).json(job);
      } catch (error) {
        console.error('Error retrieving hiwas:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    if (notificationId) {
      try {
        const job = await prisma.notification.findUnique({
          where: { id: Number(notificationId) },
          include:{
            schedule:{
              select:{
                id: true,
                status: true,
                startTime: true,
                endTime: true,
                title: true,
                description: true
              }
            },
            hiwas: {
              select:{
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true
              }
            },
            report: {
              select:{
                name: true,
                reportedByHiwasId: true,
                description: true,
                createdAt: true
              }
            }
          }
        });

        if (!job) {
          return res.status(404).json({ error: 'Meseretawi not found' });
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
