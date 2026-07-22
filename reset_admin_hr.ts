import prisma from './prismaClient';
import bcrypt from 'bcrypt';

async function updateAdminHr() {
    try {
        const newPassword = 'Alvion@2026';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const result = await prisma.profiles.updateMany({
            where: {
                role: {
                    in: ['admin', 'hr']
                }
            },
            data: {
                password: hashedPassword
            }
        });

        console.log(`Successfully updated passwords for ${result.count} Admin/HR accounts.`);
    } catch (e) {
        console.error("Error updating passwords:", e);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdminHr();
