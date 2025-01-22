import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // CORS Headers
  // res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  } 
  if (req.method === 'GET') {
    const { weredaId, notificationId } = req.query;

    if (weredaId && !notificationId) {
      try {
        const job = await prisma.notification.findMany({
          where: { weredaId: Number(weredaId) },
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
            wereda: {
              select:{
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            report: {
              select:{
                id: true,
                name: true,
                description: true,
                createdAt: true
              }
            }
          },
          orderBy:{
            createdAt:'desc'
          }
        });

        if (!job) {
          return res.status(404).json({ error: 'wereda not found' });
        }

        return res.status(200).json(job);
      } catch (error) {
        console.error('Error retrieving wereda:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    if(weredaId && notificationId){
      try {
        const job = await prisma.notification.findUnique({
          where: { 
            id: Number(notificationId)
           },
          include:{
            schedule:{
              select:{
                id: true,
                status: true,
                startTime: true,
                endTime: true,
                title: true,
                description: true,
                createdByRole: true
              }
            },
            wereda: {
              select:{
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            report: {
              select:{
                id: true,
                name: true,
                description: true,
                createdAt: true
              }
            }
          }
        });

        if (!job) {
          return res.status(404).json({ error: 'Hiwas not found' });
        }
        console.log(job)

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
