import prisma from '../src/lib/prisma';

async function run() {
  try {
    const authUsers: any = await prisma.$queryRawUnsafe(`SELECT id, email FROM auth.users LIMIT 5`);
    console.log('auth.users:', authUsers);
    const publicUsers: any = await prisma.$queryRawUnsafe(`SELECT id, email FROM public."User" LIMIT 5`);
    console.log('public.User:', publicUsers);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
