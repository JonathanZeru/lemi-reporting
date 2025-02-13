import { PrismaClient } from '@prisma/client'

declare global {
	var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
	log: ['error', 'warn'], // Reduce logs in production
	errorFormat: 'minimal', // Minimize error messages
  })

const connectDatabase = async () => {
	try {
		await prisma.$connect()
		console.log('🚀 ~ database connected.')
	} catch (error: any) {
		console.log(
			'🚀 ~ file: client.ts:14 ~ connectDatabase ~ error:'
		)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
		console.log('🚀 ~ database disconnected.')
	}
}

export default connectDatabase
