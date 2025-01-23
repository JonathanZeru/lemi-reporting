import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { apiURL } from '../../../utils/constants/constants';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', apiURL);
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    console.log("eer")
  
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
      return res.status(204).end();
    } 

    if (req.method === 'POST') {
        const {
            firstName,
            lastName,
            email,
            phone,
            userName,
            password,
            role,
            isActive,
            type,
            mdId,
        } = req.body;
console.log(req.body)
        try {
            // Hash the password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            let user;
            switch (type) {
                case "Wana":
                    user = await prisma.wana.create({
                        data: {
                            firstName,
                            lastName,
                            email,
                            phone,
                            userName,
                            password: hashedPassword, // Store hashed password
                            role: "Wana",
                            isActive,
                        },
                    });
                    return res.status(201).json({ message: 'Wana created successfully', data: user });
                    
                case "Meseretawi":
                    user = await prisma.meseretawiDirijet.create({
                        data: {
                            firstName,
                            lastName,
                            email,
                            phone,
                            userName,
                            password: hashedPassword, // Store hashed password
                            role: "Meseretawi Derejit",
                            isActive,
                        },
                    });
                    return res.status(201).json({ message: 'Meseretawi created successfully', data: user });
                    
                case "Wereda":
                    user = await prisma.wereda.create({
                        data: {
                            firstName,
                            lastName,
                            email,
                            phone,
                            userName,
                            password: hashedPassword, // Store hashed password
                            role: "Wereda",
                            isActive
                        },
                    });
                    return res.status(201).json({ message: 'Wereda created successfully', data: user });

                case "Hiwas":
                    user = await prisma.hiwas.create({
                        data: {
                            firstName,
                            lastName,
                            email,
                            phone,
                            userName,
                            password: hashedPassword, // Store hashed password
                            role: "Hiwas",
                            isActive,
                            mdId:Number(mdId),
                        },
                    });
                    return res.status(201).json({ message: 'Hiwas created successfully', data: user });

                default:
                    return res.status(400).json({ error: 'Invalid user type' });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
