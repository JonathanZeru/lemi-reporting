import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';
import { applyCors } from '../cors';
import { prisma } from '../prisma';


// Initialize Prisma Client

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // console.log("eer")
  applyCors(res); // Apply CORS headers

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  } 
  if (req.method === 'GET') {
   const { hiwasId } = req.query;

   if (hiwasId) {
     try {
       const job = await prisma.schedule.findMany({
         where: { createdByHiwasId: Number(hiwasId) },
         include:{
           createdByHiwas: true,
           createdByMD: true,
           createdByWana: true,
           createdByWereda: true,
         }
       });

       if (!job) {
         return res.status(404).json({ error: 'hiwas not found' });
       }

       return res.status(200).json(job);
     } catch (error) {
       console.error('Error retrieving hiwas:', error);
       return res.status(500).json({ error: 'Internal Server Error' });
     }
   } 
 }

  if (req.method === 'POST') {
    const { title, description, startTime, endTime, creatorId } = req.body;

    try {
      // Step 1: Create the schedule
      const newSchedule = await prisma.schedule.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          createdByRole: 'MeseretawiDirijet',
          createdByMDId: creatorId,
          createdById: creatorId,
          status: "To Do"
        },
      });

      // Step 2: Retrieve all Hiwas under the MeseretawiDirijet
      const hiwasList = await prisma.hiwas.findMany({
        where: {
          mdId: creatorId,
        },
      });

      // Step 3: Create notifications for all Hiwas
      const notifications = hiwasList.map((hiwas) => ({
        message: `A new schedule has been created: ${title}`,
        recipientId: hiwas.id,
        recipientType: 'MeseretawiDirijet',
        hiwasId: hiwas.id,
        isRead: false,
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      return res.status(201).json({
        message: 'Schedule created successfully, notifications sent to all Hiwas',
        data: newSchedule,
      });
    } catch (error) {
      console.error('Error creating schedule or notifications:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }finally {
      console.log('Disconnecting Prisma...');
      await prisma.$disconnect(); // Just disconnect, don't make more queries after this
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
