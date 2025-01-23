import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import path from 'path';
import { apiURL } from '../../../utils/constants/constants';


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
  console.log("eer")

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
    return res.status(204).end();
  }  if (req.method === 'POST') {
    const form = new IncomingForm({ keepExtensions: true, multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Failed to process form data' });
      }

      console.log("eer")
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const reportedBy = Array.isArray(fields.reportedBy) ? fields.reportedBy[0] : fields.reportedBy;
      const reporterId = Array.isArray(fields.reporterId) ? fields.reporterId[0] : fields.reporterId;
      const scheduleId = Array.isArray(fields.scheduleId) ? fields.scheduleId[0] : fields.scheduleId;
      console.log(fields)
      console.log(files)

      if (!name || !description || !reportedBy || !reporterId || !scheduleId) {
        return res.status(400).json({ error: 'Name, description, reportedBy, reporterId, and scheduleId are required' });
      }

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
        const reportData: any = {
          name,
          description,
          reportedBy,
          scheduleId: Number(scheduleId),
          audio: audioPath,
          reportVideo: videoPath,
        };

        switch (reportedBy) {
          case 'Hiwas':
            reportData.reportedByHiwasId = Number(reporterId);
            notificationData = {
              message: 'A new report has been submitted by Hiwas.',
              recipientType: 'Hiwas',
              hiwasId: Number(reporterId),
            };
            break;
          case 'Meseretawi':
            reportData.reportedByMDId = Number(reporterId);
            notificationData = {
              message: 'A new report has been submitted by Meseretawi Dirijet.',
              recipientType: 'MeseretawiDirijet',
              meseretawiDirijetId: Number(reporterId),
            };
            break;
          case 'Wereda':
            reportData.reportedByWeredaId = Number(reporterId);
            notificationData = {
              message: 'A new report has been submitted by Wereda.',
              recipientType: 'Wereda',
              weredaId: Number(reporterId),
            };
            break;
          default:
            return res.status(400).json({ error: 'Invalid reportedBy value' });
        }

        // Create the report
        const newReport = await prisma.report.create({
          data: reportData,
        });

        // Update schedule status to "Completed"
        await prisma.schedule.update({
          where: { id: Number(scheduleId) },
          data: { status: 'Completed' },
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

        // Create notification
        await prisma.notification.create({
          data: notificationData,
        });

        res.status(201).json({
          message: 'Report created successfully with PDFs, Images, and notification',
          data: newReport,
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
