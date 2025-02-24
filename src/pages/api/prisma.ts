import { PrismaClient } from '@prisma/client'

declare global {
	var prisma: PrismaClient | undefined
}

// Use a global instance of Prisma to prevent too many connections
export const prisma = global.prisma || new PrismaClient({
	log: ['error', 'warn'], // Reduce logs in production
	errorFormat: 'minimal', // Minimize error messages
});

if (!global.prisma) {
	global.prisma = prisma;
}

const connectDatabase = async () => {
	try {
		await prisma.$connect();
		console.log('🚀 ~ Database connected.');
	} catch (error: any) {
		console.error('❌ ~ Database connection error:', error);
		process.exit(1); // Exit if the database fails to connect
	}
};

export default connectDatabase;
