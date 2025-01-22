import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  // Import jsonwebtoken
import { apiURL } from '../../../utils/constants/constants';

const prisma = new PrismaClient();

// Secret key for signing the JWT, you should store it securely (e.g., in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'Dj2T1oa2nzx0ndBQ6LRfRiGjAyL4vfipve2PCGBwZl8=';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // res.setHeader('Access-Control-Allow-Origin', apiURL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        try {
            let user = null;
            user = await prisma.wana.findUnique({ where: { email } });
            if (!user) user = await prisma.meseretawiDirijet.findUnique({ where: { email } });
            if (!user) user = await prisma.wereda.findUnique({ where: { email } });
            if (!user) {
                user = await prisma.hiwas.findUnique({ where: { email } })
               
            };

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            if(user.role == "Hiwas"){
                const meseretawiDirijet = await prisma.meseretawiDirijet.findUnique({
                    where:{ 
                        id: user.mdId
                    },
                    select:{
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                })
            user.meseretawiDirijet = meseretawiDirijet
            }
            
            const token = jwt.sign(
                {
                    user: user
                },
                JWT_SECRET,
                { expiresIn: '30d' }
            );
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
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}