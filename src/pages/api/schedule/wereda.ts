import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiURL } from '../../../utils/constants/constants';
import { IncomingForm, File as FormidableFile } from 'formidable';
// import nodemailer from 'nodemailer'
import logo from '../../../assets/logo.png';


// Initialize Prisma Client
const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  } 
   if (req.method === 'GET') {
    const { weredaId } = req.query;

    if (weredaId) {
      try {
        const job = await prisma.schedule.findMany({
          where: { createdByWeredaId: Number(weredaId) },
          include:{
            createdByWereda: true,
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
  }
  if (req.method === 'POST') {
    const form = new IncomingForm({ keepExtensions: true, multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Failed to process form data' });
      }
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const startTime = Array.isArray(fields.startTime) ? fields.startTime[0] : fields.startTime;
      const firstName = Array.isArray(fields.firstName) ? fields.firstName[0] : fields.firstName;
      const lastName = Array.isArray(fields.lastName) ? fields.lastName[0] : fields.lastName;
      const endTime = Array.isArray(fields.endTime) ? fields.endTime[0] : fields.endTime;
      const weredaId = Array.isArray(fields.creatorId) ? fields.creatorId[0] : fields.weredaId;
    try {
      // Create the schedule  
      console.log(fields)    
      const newSchedule = await prisma.schedule.create({
        data: {
          title: String(title),
          description,
          startTime: new Date(String(startTime)),
          endTime: new Date(String(endTime)),
          createdByRole: 'Wereda',
          createdByWeredaId: Number(weredaId),
          createdById: Number(weredaId),
          status: "To Do"
        },
      });
      // const transporter = nodemailer.createTransport({
      //     service: 'Gmail', 
      //     auth: {
      //         port: 587,
      //         secure: false, 
      //         user: "jonathanzeru21@gmail.com", 
      //         pass: "isek dnxp xkms iiha"
      //     },
      //   })
    //   console.log(newSchedule)
    //   const allWana = await prisma.wana.findMany();
    //   allWana.map(async (wana)=>{
    //     await transporter.sendMail(
    //         {
    //             from: "jonathanzeru21@gmail.com",
    //             to: wana.email,
    //             subject: 'Welcome to Our Community!',
    //             html: `
    //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    //     <div style="background-color: #897848; padding: 20px; text-align: center; color: white;">
    //       <img src="${logo}" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
    //       <h1>Dear ${wana.firstName} ${wana.lastName}!</h1>
    //       <p>Wereda ${firstName} ${lastName} has created a meeting based on ${title} to be held between 
    //     ${startTime} ${endTime}!</p>
    //     </div>
    //     <img src="${logo}" alt="Banner Image" style="width: 100%; height: auto;">
    //     <div style="padding: 20px; color: #333;">
    //       <p style="font-size: 16px;">Please check out there report on the following website,</p>
    //       <p style="font-size: 16px;">After logging in.</p>
    //     </div>
    //     <div style="background-color: #897848; color: white; text-align: center; padding: 10px;">
    //       <p style="margin: 0;">&copy; 2025 Prosperity Party. All rights reserved.</p>
    //     </div>
    //   </div>
    // `
    //           }
    //     )
    //     res.status(200).json({ message: 'Email sent successfully' })
    //   })
       const hiwass = await prisma.notification.create({
          data: {
            message: `Wereda ${firstName} ${lastName} has created a meeting based on ${title} to be held between 
        ${startTime} ${endTime}!`,
            recipientType: 'Wereda',
            scheduleId: Number(newSchedule.id),
            weredaId: Number(weredaId)
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
  });
  }else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
