// Prisma Client connection and disconnection functions

/**
 * @description 
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
    // errorFormat: 'pretty',
});

// Handle connection
prisma.$connect()
    .then(() => {
        console.log('Successfully connected to database');
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error);
    });

// Handle cleanup on app termination
process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('Disconnected from database');
});

export default prisma;