import prisma from './prismaClient';
import bcrypt from 'bcrypt';

async function updatePasswords() {
    try {
        const adminHash = await bcrypt.hash('Alvion@2026', 10);
        const empHash = await bcrypt.hash('password123', 10);
        
        // Update Admin and HR accounts
        const adminRes = await prisma.profiles.updateMany({
            where: { 
                role: { in: ['admin', 'hr'] } 
            },
            data: {
                password: adminHash
            }
        });
        console.log(`Updated ${adminRes.count} Admin/HR accounts to use password: Alvion@2026`);

        // Update Employee accounts
        const empRes = await prisma.profiles.updateMany({
            where: { 
                role: 'employee'
            },
            data: {
                password: empHash
            }
        });
        console.log(`Updated ${empRes.count} Employee accounts to use password: password123`);

    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

updatePasswords();
