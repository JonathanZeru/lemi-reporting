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
      console.log("eer")
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const firstName = Array.isArray(fields.firstName) ? fields.firstName[0] : fields.firstName;
      const lastName = Array.isArray(fields.lastName) ? fields.lastName[0] : fields.lastName;
      const hiwasId = Array.isArray(fields.hiwasId) ? fields.hiwasId[0] : fields.hiwasId;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const meseretawiDirijetId = Array.isArray(fields.meseretawiDirijetId) ? fields.meseretawiDirijetId[0] : fields.meseretawiDirijetId;
      const scheduleId = Array.isArray(fields.scheduleId) ? fields.scheduleId[0] : fields.scheduleId;
      console.log(fields)
      console.log(files)

      if (!name || !description || !meseretawiDirijetId || !scheduleId || !hiwasId) {
        return res.status(400).json({ error: 'Name, description, meseretawiDirijetId, hiwasId and scheduleId are required' });
      }
      console.log("her")

      console.log("1")
      try {
        // Check if a report already exists for the schedule
        const existingReport = await prisma.report.findFirst({
          where: { scheduleId: Number(scheduleId) },
        });
        console.log(existingReport)

        if (existingReport) {
          console.log('A report for this schedule already exists' )
          return res.status(201).json({ error: 'A report for this schedule already exists' });
        }

        // Prepare the upload directory
        const uploadDir = path.join(process.cwd(), '/public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log(uploadDir)

        // Helper function to move files
        const moveFile = (file: FormidableFile, dir: string) => {
          const newFilePath = path.join(dir, file.newFilename || 'default.png');
          fs.renameSync(file.filepath, newFilePath);
          return `/uploads/${file.newFilename || 'default.png'}`;
        };

        // Process files
        const videoFile = files.video as FormidableFile | FormidableFile[] | undefined;
        const audioFile = files.audio as FormidableFile | FormidableFile[] | undefined;

        const video = Array.isArray(videoFile) ? videoFile[0] : videoFile;
        const audio = Array.isArray(audioFile) ? audioFile[0] : audioFile;

        const videoPath = video ? moveFile(video, uploadDir) : '';
        const audioPath = audio ? moveFile(audio, uploadDir) : '';

        // Prepare report data
        let notificationData: any = {};
       
        notificationData = {
          message: 'A new report has been submitted by Hiwas.',
          recipientType: 'Hiwas'
        };

        const newReport = await prisma.report.create({
          data:  {
            name,
          description,
          scheduleId: Number(scheduleId),
          audio: audioPath,
          reportVideo: videoPath,
          reportedBy: "Hiwas",
          reportedByHiwasId: Number(hiwasId),
        }
        });

        await prisma.schedule.update({
          where: { id: Number(scheduleId) },
          data: { status: 'Under Meseretawi Review' },
        });
        const scheduledMetting = await prisma.schedule.findUnique({
            where: { id: Number(scheduleId) }
          });
        // Process PDFs
        const reportPdfs = files.reportPdfs
          ? (Array.isArray(files.reportPdfs) ? files.reportPdfs : [files.reportPdfs])
          : [];
        const pdfPaths = reportPdfs.map((pdf) => moveFile(pdf, uploadDir));
        if (pdfPaths.length > 0) {
          const pdfData = pdfPaths.map((pdfPath) => ({
            title: path.basename(pdfPath),
            url: pdfPath,
            reportId: newReport.id,
          }));
          await prisma.reportPdf.createMany({ data: pdfData });
        }

        // Process Images
        const reportImages = files.reportImages
          ? (Array.isArray(files.reportImages) ? files.reportImages : [files.reportImages])
          : [];
        const imagePaths = reportImages.map((img) => moveFile(img, uploadDir));
        if (imagePaths.length > 0) {
          const imageData = imagePaths.map((imagePath) => ({
            type: 'Meeting',
            url: imagePath,
            reportId: newReport.id,
          }));
          await prisma.reportImage.createMany({ data: imageData });
        }

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
            const meseretawiDirijet = await prisma.wana.findUnique(
              {
                  where: {
                      id: Number(meseretawiDirijetId)
                  }
              }
            );
            await transporter.sendMail(
              {
                  from: "jonathanzeru21@gmail.com",
                  to: meseretawiDirijet.email,
                  subject: 'Prosperity Party!',
                  html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #897848; padding: 20px; text-align: center; color: white;">
            <img src="${logo}" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
            <h1>Dear ${meseretawiDirijet.firstName} ${meseretawiDirijet.lastName}!</h1>
            <p>Hiwas ${firstName} ${lastName} has reported for the meeting held between 
            ${scheduledMetting.startTime} ${scheduledMetting.endTime}!</p>
          </div>
          <img src="${logo}" alt="Banner Image" style="width: 100%; height: auto;">
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px;">Please check out there report on the following website,</p>
            <p style="font-size: 16px;">After logging in.</p>
          </div>
          <div style="background-color: #897848; color: white; text-align: center; padding: 10px;">
            <p style="margin: 0;">&copy; 2025 Prosperity Party. All rights reserved.</p>
          </div>
        </div>
      `
                }
          )
        allWana.map(async (wana)=>{
            await transporter.sendMail(
                {
                    from: "jonathanzeru21@gmail.com",
                    to: wana.email,
                    subject: 'Welcome to Our Community!',
                    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #897848; padding: 20px; text-align: center; color: white;">
              <img src="${logo}" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
              <h1>Dear ${wana.firstName} ${wana.lastName}!</h1>
              <p>Hiwas ${firstName} ${lastName} as reported for the meeting held between 
              ${scheduledMetting.startTime} ${scheduledMetting.endTime}!</p>
            </div>
            <img src="${logo}" alt="Banner Image" style="width: 100%; height: auto;">
            <div style="padding: 20px; color: #333;">
              <p style="font-size: 16px;">Please check out there report on the following website,</p>
              <p style="font-size: 16px;">After logging in.</p>
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
        await prisma.notification.create({
          data: {
            message: `Hiwas ${firstName} ${lastName} as reported for the meeting held between 
            ${scheduledMetting.startTime} ${scheduledMetting.endTime}!`,
            recipientType: "Hiwas",
            hiwasId: Number(hiwasId),
            isRead: false,
            meseretawiDirijetId: Number(meseretawiDirijetId),
            recipientId: Number(hiwasId),
            scheduleId: Number(scheduleId),
            reportId: Number(newReport.id)
          }
        });

        res.status(201).json({
          message: 'Report created successfully with PDFs, Images, and notification sent to Meseretawi Direjt and Wana',
          data: newReport
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
