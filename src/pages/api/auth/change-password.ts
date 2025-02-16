import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import { apiURL } from '../../../utils/constants/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', apiURL);
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log("Change password request received");

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight request
        return res.status(204).end();
    }

    if (req.method === 'PUT') {
        const { id, oldPassword, newPassword } = req.body;

        if (!id || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'User ID, old password, and new password are required' });
        }

        try {
            // Fetch the user
            const user = await prisma.meseretawiDirijet.findUnique({ where: { id } });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Validate old password
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password || "");
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Incorrect old password' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the password
            await prisma.meseretawiDirijet.update({ where: { id }, data: { password: hashedPassword } });

            return res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Error changing password:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } finally {
            await prisma.$disconnect();
        }
    }

    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
