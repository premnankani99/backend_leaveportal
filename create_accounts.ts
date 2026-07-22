import prisma from './prismaClient';
import bcrypt from 'bcrypt';

async function createAccounts() {
    try {
        const passwordHash = await bcrypt.hash('password123', 10);
        
        // 1. Employee Account
        const emp = await prisma.profiles.upsert({
            where: { email: 'piyushvaswani13@gmail.com' },
            update: {
                full_name: 'Piyush Vaswani',
                password: passwordHash,
                role: 'employee',
                is_active: true,
                email_verified: true,
                verification_status: 'approved'
            },
            create: {
                full_name: 'Piyush Vaswani',
                email: 'piyushvaswani13@gmail.com',
                password: passwordHash,
                role: 'employee',
                is_active: true,
                email_verified: true,
                verification_status: 'approved'
            }
        });
        console.log("Created Employee:", emp.email);

        // 2. HR Account
        const hr = await prisma.profiles.upsert({
            where: { email: 'hr@alviontechnologies.com' },
            update: {
                full_name: 'Prerna',
                password: passwordHash,
                role: 'hr',
                is_active: true,
                email_verified: true,
                verification_status: 'approved'
            },
            create: {
                full_name: 'Prerna',
                email: 'hr@alviontechnologies.com',
                password: passwordHash,
                role: 'hr',
                is_active: true,
                email_verified: true,
                verification_status: 'approved'
            }
        });
        console.log("Created HR:", hr.email);

    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createAccounts();
