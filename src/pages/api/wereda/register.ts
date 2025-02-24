import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { applyCors } from '../cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    applyCors(res); // Apply CORS headers

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { firstName, lastName, email, phone, password } = req.body;
        console.log(req.body)

        console.time('User Registration');

        // Parallel existence checks
        const [emailExists, phoneExists] = await Promise.all([
            prisma.wereda.findFirst({ where: { email } }),
            prisma.wereda.findFirst({ where: { phone } }),
        ]);

        if (emailExists) return res.status(409).json({ message: 'Email already used!' });
        if (phoneExists) return res.status(409).json({ message: 'Phone Number already used!' });

        // Hash password with lower cost factor for speed
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create user
        const user = await prisma.wereda.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                userName: email,
                password: hashedPassword,
                role: 'Wereda',
                isActive: true
            },
        });
        console.log(user)
        console.timeEnd('User Registration'); // Log execution time

        return res.status(201).json({ message: 'Wereda created successfully', data: user });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
