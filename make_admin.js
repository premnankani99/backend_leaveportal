const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function makeAdmin() {
    try {
        const result = await prisma.users.updateMany({
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
