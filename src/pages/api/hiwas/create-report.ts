import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import { applyCors } from '../cors';
import { prisma } from '../prisma';

const SECRET_KEY = process.env.JWT_SECRET || 'Dj2T1oa2nzx0ndBQ6LRfRiGjAyL4vfipve2PCGBwZl8=';

const authenticateToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
  } catch {
    return null;
  }
};

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end(`Method ${req.method} Not Allowed`);

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userPayload = authenticateToken(token);
  if (!userPayload) return res.status(401).json({ error: 'Invalid or expired token' });

  const form = new IncomingForm({ keepExtensions: true, multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Failed to process form data' });

    const requiredFields = ['name', 'description', 'meseretawiDirijetId', 'scheduleId', 'hiwasId'];
    for (const field of requiredFields) {
      if (!fields[field]) return res.status(400).json({ error: `Missing required field: ${field}` });
    }
    console.log(fields)
    const name = fields.name ? String(fields.name[0] ?? '') : '';
    const description = fields.description ? String(fields.description[0] ?? '') : '';
    const scheduleId = fields.scheduleId ? String(fields.scheduleId[0] ?? '') : '';
    const hiwasId = fields.hiwasId ? String(fields.hiwasId[0] ?? '') : '';
    const meseretawiDirijetId = fields.meseretawiDirijetId ? String(fields.meseretawiDirijetId[0] ?? '') : '';
    const firstName = fields.firstName ? String(fields.firstName[0] ?? '') : '';
    const lastName = fields.lastName ? String(fields.lastName[0] ?? '') : '';

    try {
      // Check if report already exists for this schedule
      console.log("here", scheduleId)
      const existingReport = await prisma.report.findFirst({ where: { scheduleId: Number(scheduleId) } });
      if (existingReport) return res.status(409).json({ error: 'Report for this schedule already exists' });

      console.log(existingReport)
      const uploadDir = path.join(process.cwd(), '/public/uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const moveFile = async (file?: FormidableFile) => {
        if (!file || !file.filepath) {
          console.error("Invalid file data:", file);
          return ''; // Return empty string if file is invalid
        }
        
        const newPath = path.join(uploadDir, file.newFilename || 'default.png');
        await fs.rename(file.filepath, newPath);
        return `/uploads/${file.newFilename || 'default.png'}`;
      };
      
      const [videoPath, audioPath] = await Promise.all([
        files.video && Array.isArray(files.video) ? moveFile(files.video[0] as FormidableFile) : '',
        files.audio && Array.isArray(files.audio) ? moveFile(files.audio[0] as FormidableFile) : '',
      ]);
      

      // Create report
      console.log("here 2")
      const newReport = await prisma.report.create({
        data: {
          name,
          description,
          scheduleId: Number(scheduleId),
          audio: audioPath,
          reportVideo: videoPath,
          reportedBy: "Hiwas",
          reportedByHiwasId: Number(hiwasId),
        }
      });
      console.log(newReport)

      // Update schedule status
      await prisma.schedule.update({ where: { id: Number(scheduleId) }, data: { status: 'Under Meseretawi Review' } });

      // Move and store PDFs & Images concurrently
      const reportPdfs = Array.isArray(files.reportPdfs) ? files.reportPdfs : files.reportPdfs ? [files.reportPdfs] : [];
      const reportImages = Array.isArray(files.reportImages) ? files.reportImages : files.reportImages ? [files.reportImages] : [];

      const [pdfData, imageData] = await Promise.all([
        Promise.all(reportPdfs.map(async pdf => ({
          title: path.basename(pdf.filepath),
          url: await moveFile(pdf as FormidableFile),
          reportId: newReport.id,
        }))),
        Promise.all(reportImages.map(async img => ({
          type: 'Meeting',
          url: await moveFile(img as FormidableFile),
          reportId: newReport.id,
        }))),
      ]);

      // Insert files in batch
      await Promise.all([
        prisma.reportPdf.createMany({ data: pdfData }),
        prisma.reportImage.createMany({ data: imageData }),
      ]);

      // Send notification asynchronously (no need to block response)
      prisma.notification.create({
        data: {
          message: `Hiwas ${firstName} ${lastName} has reported for the meeting held!`,
          recipientType: "Hiwas",
          hiwasId: Number(hiwasId),
          isRead: false,
          meseretawiDirijetId: Number(hiwasId),
          recipientId: Number(hiwasId),
          scheduleId:Number(hiwasId),
          reportId: newReport.id,
        }
      }).catch(console.error);

      res.status(201).json({ message: 'Report created successfully', data: newReport });
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
