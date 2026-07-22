const prisma = require('./prismaClient').default || require('./prismaClient');
async function test() {
    const leaves = await prisma.leave_requests.findMany();
    const withdrawn = leaves.filter(l => l.status === 'withdrawn').length;
    const cancelled = leaves.filter(l => l.status === 'cancelled').length;
    console.log(`Total: ${leaves.length}`);
    console.log(`Withdrawn: ${withdrawn}`);
    console.log(`Cancelled: ${cancelled}`);
}
test().catch(console.error).finally(() => process.exit(0));
