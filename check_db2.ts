import prisma from './prismaClient';
prisma.leave_requests.findMany({ select: { leave_type: true }, take: 5 }).then(console.log).finally(() => prisma.$disconnect());
