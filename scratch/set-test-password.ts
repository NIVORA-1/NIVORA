import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function updateTestPassword() {
  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.findFirst({
    where: { email: 'rishabh@nivora.edu' },
  });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash },
    });
    console.log('Password for rishabh@nivora.edu set to password123');
  } else {
    console.log('User rishabh@nivora.edu not found, finding any user...');
    const first = await prisma.user.findFirst();
    if (first) {
      await prisma.user.update({
        where: { id: first.id },
        data: { passwordHash: hash },
      });
      console.log(`Password for ${first.email} set to password123`);
    }
  }
  await prisma.$disconnect();
}
updateTestPassword();
