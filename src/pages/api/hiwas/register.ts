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
            meseretawiDirijetName,
            mdId,
        } = req.body;
console.log(req.body)
        try {
            
            const existingMeseretawiByEmail = await prisma.hiwas.findFirst(
                {
                    where: {email: email}
                }
            )
            if(existingMeseretawiByEmail){
                
            return res.status(401).
            json({ message: 'Email already used!' });

            }
            const existingMeseretawiByPhone = await prisma.hiwas.findFirst(
                {
                    where: {phone: phone}
                }
            )
            if(existingMeseretawiByPhone){
                
            return res.status(401).
            json({ message: 'Phone Number already used!' });

            }
            const existingMeseretawiByUsername = await prisma.hiwas.findFirst(
                {
                    where: {userName: userName}
                }
            )
            if(existingMeseretawiByUsername){
                
            return res.status(401).
            json({ message: 'User name already used!' });

            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.hiwas.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    userName,
                    password: hashedPassword, // Store hashed password
                    role: `Hiwas`,
                    isActive: true,
                    mdId:Number(mdId),
                },
            });
            return res.status(201).json({ message: 'Hiwas created successfully', data: user });

        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
