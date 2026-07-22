const prisma = require('./prismaClient').default || require('./prismaClient');
async function test() {
    const leaves = await prisma.leave_requests.findMany({
        where: { employee: { is_deleted: false } },
        include: { employee: { include: { managers: { select: { id: true } } } } },
        orderBy: { created_at: 'desc' },
        take: 1
    });
    console.log(leaves[0]);
}
test().catch(console.error).finally(() => process.exit(0));
