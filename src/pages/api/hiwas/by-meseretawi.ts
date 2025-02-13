import { NextApiRequest, NextApiResponse } from 'next';
import { applyCors } from '../cors';
import { prisma } from '../prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    applyCors(res); // Apply CORS headers

    if (req.method === 'OPTIONS') {
        return res.status(204).end(); // Handle preflight request
    }

    if (req.method === 'GET') {
        const { meseretawiDirijetId } = req.query;

        if (!meseretawiDirijetId) {
            return res.status(400).json({ error: 'meseretawiDirijetId is required' });
        }

        try {
            const job = await prisma.hiwas.findMany({
                where: { mdId: Number(meseretawiDirijetId) }
            });

            if (!job.length) {
                return res.status(404).json({ error: 'Hiwas not found' });
            }

            return res.status(200).json(job);
        } catch (error) {
            console.error('Error retrieving hiwas:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } finally {
          await prisma.$disconnect(); // Ensure the connection closes after execution
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
