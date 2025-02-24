import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { applyCors } from '../cors';
import { prisma } from '../prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    applyCors(res);

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.status(204).end();
    }

    if (req.method === 'POST') {
        console.log("Processing registration...");

        const { firstName, lastName, email, phone, password, role } = req.body;
        
        try {
            // Check for existing user
            const existingUser = await prisma.meseretawiDirijet.findFirst({
                where: {
                    OR: [{ email }, { phone }]
                },
                select: { email: true, phone: true, userName: true }
            });

            if (existingUser) {
                return res.status(401).json({
                    message: existingUser.email === email
                        ? 'Email already used!'
                        : existingUser.phone === phone
                        ? 'Phone Number already used!'
                        : 'User name already used!'
                });
            }

            // Hash password asynchronously
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.$transaction([
                prisma.meseretawiDirijet.create({
                    data: {
                        firstName,
                        lastName,
                        email,
                        phone,
                        userName: email,
                        password: hashedPassword,
                        role: role,
                        isActive: true
                    }
                })
            ]);
            console.log(user)
            return res.status(201).json({ message: 'User created successfully', data: user[0] });

        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
