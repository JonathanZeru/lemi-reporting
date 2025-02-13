import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { applyCors } from '../cors';
import { prisma } from '../prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("eer")
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.status(204).end();
    }

    if (req.method === 'PUT') {

        const { id, firstName, lastName, userName, role, isActive } = req.body;

        try {
            // Check if the user exists
            const existingUser = await prisma.meseretawiDirijet.findUnique({
                where: { id }
            });

            if (!existingUser) {
                return res.status(404).json({ message: 'User not found' });
            }
console.log(existingUser);
            // Update user without modifying password, phone, or email
            const updatedUser = await prisma.meseretawiDirijet.update({
                where: { id },
                data: {
                    firstName,
                    lastName,
                    userName,
                    role: role || existingUser.role,  // Update role if provided
                    isActive: isActive !== undefined ? isActive : existingUser.isActive
                }
            });

            return res.status(200).json({ message: 'User updated successfully', data: updatedUser });  

        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
