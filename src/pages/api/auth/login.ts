import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { applyCors } from '../cors';

const JWT_SECRET = process.env.JWT_SECRET || 'Dj2T1oa2nzx0ndBQ6LRfRiGjAyL4vfipve2PCGBwZl8=';

interface MeseretawiDirijet {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

interface UserData {
  password: any;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  mdId?: number;
  userName: string;
  createdAt: string;
  meseretawiDirijet?: MeseretawiDirijet; // Nullable field
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    applyCors(res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end(`Method ${req.method} Not Allowed`);

    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        console.time('User Login'); // Start performance measurement

        // Fetch all user types in parallel
        const [wana, meseretawi, wereda, hiwas] = await Promise.all([
            prisma.wana.findUnique({ where: { email } }),
            prisma.meseretawiDirijet.findUnique({ where: { email } }),
            prisma.wereda.findUnique({ where: { email } }),
            prisma.hiwas.findUnique({ where: { email } })
        ]);

        // Find the first non-null user
        let user: UserData | null = (wana || meseretawi || wereda || hiwas) as UserData | null;
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Validate password
        if (!(await bcrypt.compare(password, String(user.password)))) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Fetch and attach meseretawiDirijet if user is Hiwas & has mdId
        if (user.role === 'Hiwas' && user.mdId) {
            const meseretawiDirijet = await prisma.meseretawiDirijet.findUnique({
                where: { id: user.mdId },
                select: { firstName: true, lastName: true, email: true, phone: true }
            });

            if (meseretawiDirijet) {
                user = { ...user, meseretawiDirijet }; // Merge meseretawiDirijet data into user
            }
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

        console.timeEnd('User Login'); 
        return res.status(200).json({
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
