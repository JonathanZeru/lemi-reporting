import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../prisma';
import { applyCors } from '../cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    applyCors(res);
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'PUT') return res.status(405).end(`Method ${req.method} Not Allowed`);

    try {
        const { id, type, isActive } = req.body;
        if (!id || !type) return res.status(400).json({ error: 'User ID and type are required' });
        
        let updatedUser;
       
        // Determine which table to update based on type
        switch (type) {
            case '1':
                updatedUser = await prisma.hiwas.update({ where: { id },
                     data: {
                        isActive: isActive
                     } });
                break;
            case '2':
                updatedUser = await prisma.meseretawiDirijet.update({ where: { id }, 
                    data: {
                       isActive: isActive
                    }  });
                break;
            case '3':
                updatedUser = await prisma.wana.update({ where: { id }, 
                    data: {
                       isActive: isActive
                    }  });
                break;
            case '4':
                updatedUser = await prisma.wereda.update({ where: { id }, 
                    data: {
                       isActive: isActive
                    }  });
                break;
            default:
                return res.status(400).json({ error: 'Invalid user type' });
        }
        console.log("done deal")
        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
