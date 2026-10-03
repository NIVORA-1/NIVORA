import prisma from '../src/lib/prisma';

async function main() {
  try {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ClassSchedule';
    `);
    console.log('ClassSchedule columns:', cols);
    const count: any = await prisma.$queryRawUnsafe('SELECT count(*) FROM "ClassSchedule";');
    console.log('Count:', count);
  } catch(e) {
    console.log('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
