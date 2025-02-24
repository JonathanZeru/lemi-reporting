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

        console.time('User Registration');

        // Run existence checks in parallel
        const [emailExists, phoneExists] = await Promise.all([
            prisma.wana.findFirst({ where: { email } }),
            prisma.wana.findFirst({ where: { phone } }),
        ]);

        if (emailExists) return res.status(409).json({ message: 'Email already used!' });
        if (phoneExists) return res.status(409).json({ message: 'Phone Number already used!' });

        // Hash password asynchronously with a lower cost factor for speed
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert user using Prisma transaction
        const user = await prisma.wana.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                userName: email,
                password: hashedPassword,
                role: 'Wana',
                isActive: true
            },
        });
console.log(user)
        console.timeEnd('User Registration');

        return res.status(201).json({ message: 'Wana created successfully', data: user });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
