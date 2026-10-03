const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
async function test() {
  try {
    const userCount = await prisma.user.count();
    console.log('Prisma user count:', userCount);
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables WHERE table_schema='public'
    `;
    console.log('Public tables:', tables.map(t => t.table_name));
  } catch (err) {
    console.error('Prisma test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
