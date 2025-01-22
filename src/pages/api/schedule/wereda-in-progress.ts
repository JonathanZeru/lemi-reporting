import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import path from 'path';
import { apiURL } from '../../../utils/constants/constants';
import nodemailer from 'nodemailer'
import logo from '../../../assets/logo.png';
import jwt from 'jsonwebtoken';

// Initialize Prisma Client
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'Dj2T1oa2nzx0ndBQ6LRfRiGjAyL4vfipve2PCGBwZl8=';

const authenticateToken = (token: string) => {
  try {
    console.log("4 = ",token)
    return jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // CORS Headers
  // res.setHeader('Access-Control-Allow-Origin', apiURL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  }  if (req.method === 'POST') {
    console.log("e 2")
  
    const form = new IncomingForm({ keepExtensions: true, multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Failed to process form data' });
      }
      console.log(req.headers.authorization)
      const token = req.headers.authorization?.split(' ')[1];
      console.log("1 = ",token)
      if (!token) {
        console.log("2 = ",token)
        return res.status(401).json({ error: 'Unauthorized' });
      }
      console.log("3 = ",token)

      const userPayload = authenticateToken(token);
      console.log(userPayload.user)
      console.log("5 = ",token)
      if (!userPayload.user || !userPayload.user.id) {
        console.log("6 = ",token)
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const userId = userPayload.id;
      const firstName = Array.isArray(fields.firstName) ? fields.firstName[0] : fields.firstName;
      const lastName = Array.isArray(fields.lastName) ? fields.lastName[0] : fields.lastName;
      const weredaId = Array.isArray(fields.hiwasId) ? fields.hiwasId[0] : fields.hiwasId;
      const scheduleId = Array.isArray(fields.scheduleId) ? fields.scheduleId[0] : fields.scheduleId;
      console.log(fields)
      console.log(files)
      console.log(
        {
            firstName,
            lastName,
            weredaId,
            scheduleId,
          }
      )
      console.log("1")
      try {

        const scheduledMetting = await prisma.schedule.findUnique({
          where: { id: Number(scheduleId) }
        });
        console.log(scheduledMetting)
        if(scheduledMetting.status=='Completed'){
          return res.status(201).json({ error: 'Report has already been approved!' });
        }
        await prisma.schedule.update({
            where: { id: Number(scheduleId) },
            data: { status: 'In Progress' }
          });
       
        console.log(scheduledMetting)
        const transporter = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                port: 587,
                secure: false, 
                user: "jonathanzeru21@gmail.com", 
                pass: "isek dnxp xkms iiha"
            },
          })
          console.log(transporter, "transporter")
          try {
            const allWana = await prisma.wana.findMany();
        allWana.map(async (wana)=>{
            await transporter.sendMail(
                {
                    from: "jonathanzeru21@gmail.com",
                    to: wana.email,
                    subject: 'Prosperity Party!',
                    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #897848; padding: 20px; text-align: center; color: white;">
              <img src="${logo}" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
              <h1>Dear ${wana.firstName} ${wana.lastName}!</h1>
              <p>Wereda ${firstName} ${lastName} started the meeting
              ${scheduledMetting.title} starting from
              ${scheduledMetting.startTime} and ends at ${scheduledMetting.endTime}!</p>
            </div>
            <img src="${logo}" alt="Banner Image" style="width: 100%; height: auto;">
            <div style="padding: 20px; color: #333;">
              <p style="font-size: 16px;">Please check out there report on the following website,</p>
              <p style="font-size: 16px;">After logging in ofcourse.</p>
            </div>
            <div style="background-color: #897848; color: white; text-align: center; padding: 10px;">
              <p style="margin: 0;">&copy; 2025 Prosperity Party. All rights reserved.</p>
            </div>
          </div>
        `
                  }
            )
            res.status(200).json({ message: 'Email sent successfully' })
          })
        
          } catch (error) {
            console.error('Error sending email:', error)
            res.status(500).json({ message: 'Failed to send email' })
          }
        console.log("here")
          await prisma.notification.create({
            data: {
              message: `Wereda ${firstName} ${lastName} started the meeting
               ${scheduledMetting.title} starting from
              ${scheduledMetting.startTime} and ends at ${scheduledMetting.endTime}!`,
              recipientType: `Wereda`,
              weredaId: Number(weredaId),
              isRead: false,
              recipientId: Number(weredaId),
              scheduleId: Number(scheduleId),
            }
          });

        res.status(201).json({
          message: 'Report was completed after review.'
        });
      } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
