import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';
import { applyCors } from '../cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applyCors(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { hiwasId, notificationId } = req.query;

    if (hiwasId && !notificationId) {
      const job = await prisma.notification.findMany({
        where: { hiwasId: Number(hiwasId) },
        include: {
          schedule: {
            select: {
              id: true,
              status: true,
              startTime: true,
              endTime: true,
              title: true,
              description: true,
            },
          },
          hiwas: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              md: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          report: {
            select: {
              id: true,
              name: true,
              description: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!job) {
        return res.status(404).json({ error: 'Hiwas not found' });
      }

      return res.status(200).json(job);
    }

    if (hiwasId && notificationId) {
      const job = await prisma.notification.findUnique({
        where: { id: Number(notificationId) },
        include: {
          schedule: {
            select: {
              id: true,
              status: true,
              startTime: true,
              endTime: true,
              title: true,
              description: true,
            },
          },
          hiwas: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              md: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          report: {
            select: {
              id: true,
              name: true,
              description: true,
              createdAt: true,
            },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ error: 'Hiwas not found' });
      }

      return res.status(200).json(job);
    }
  } catch (error) {
    console.error('Error retrieving hiwas:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    console.log('Disconnecting Prisma...');
    await prisma.$disconnect(); // Ensure Prisma connection closes after request
  }
}
