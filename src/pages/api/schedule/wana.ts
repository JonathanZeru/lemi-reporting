import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';


// Initialize Prisma Client
const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("eer")
  res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  console.log("eer")

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  } 
  if (req.method === 'POST') {
    const { title, description, startTime, endTime, creatorId } = req.body;

    try {
      // Create the schedule
      const newSchedule = await prisma.schedule.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          createdByRole: 'Wana',
          createdById: creatorId,
          status: "To Do"
        },
      });

      // Send notification to all Wana users
      await prisma.notification.create({
        data: {
          message: `New schedule created: ${title}`,
          recipientType: 'Wana',
        },
      });

      return res.status(201).json({
        message: 'Schedule created successfully, notification sent',
        data: newSchedule,
      });
    } catch (error) {
      console.error('Error creating schedule or notification:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
