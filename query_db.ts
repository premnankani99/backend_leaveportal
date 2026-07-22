import prisma from './prismaClient';

async function queryDB() {
    try {
        const res = await prisma.compOffGrant.findMany();
        console.log('Records:', res);
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

queryDB();
