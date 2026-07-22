const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAndList() {
    try {
        const users = await prisma.profiles.findMany({
            select: { id: true, email: true, role: true, full_name: true }
        });

        const newPassword = 'password123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        console.log("=== USER CREDENTIALS ===");
        console.log("Password for ALL users has been reset to: password123\n");
        console.table(users.map(u => ({
            Name: u.full_name,
            Email: u.email,
            Role: u.role,
            Password: newPassword
        })));

        // Update all passwords
        await prisma.profiles.updateMany({
            data: { password: hashedPassword }
        });
        console.log("\nSuccessfully reset passwords for all users.");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

resetAndList();
