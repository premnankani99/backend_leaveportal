import prisma from './prismaClient';

async function fixDB() {
    try {
        const res = await prisma.compOffGrant.updateMany({ 
            where: { grantedBy: { not: null }, status: 'pending' }, 
            data: { status: 'approved' } 
        });
        console.log('Updated:', res);
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixDB();
