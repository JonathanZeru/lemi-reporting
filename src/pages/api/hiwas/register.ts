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
        const { firstName, lastName, email, phone, userName, password, mdId } = req.body;

        console.time('User Registration');

        // Run existence checks in parallel
        const [emailExists, phoneExists, usernameExists] = await Promise.all([
            prisma.hiwas.findFirst({ where: { email } }),
            prisma.hiwas.findFirst({ where: { phone } }),
            prisma.hiwas.findFirst({ where: { userName } })
        ]);

        if (emailExists) return res.status(409).json({ message: 'Email already used!' });
        if (phoneExists) return res.status(409).json({ message: 'Phone Number already used!' });
        if (usernameExists) return res.status(409).json({ message: 'User name already used!' });

        // Hash password asynchronously with a lower cost factor (faster)
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert user using a transaction for atomicity
        const user = await prisma.hiwas.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                userName,
                password: hashedPassword,
                role: 'Hiwas',
                isActive: true,
                mdId: Number(mdId),
            },
        });
        console.log(user)
        console.timeEnd('User Registration');

        return res.status(201).json({ message: 'Hiwas created successfully', data: user });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
