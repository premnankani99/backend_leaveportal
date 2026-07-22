import prisma from './prismaClient';

async function makeAdmin() {
    try {
        const result = await prisma.profiles.updateMany({
            where: {
                email: {
                    contains: 'premnankani99'
                }
            },
            data: {
                role: 'admin'
            }
        });
        console.log("Updated users:", result);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
