import prisma from '../src/lib/prisma';

async function getOrSyncAuthUserId(email: string): Promise<string | null> {
  const cleanEmail = email.toLowerCase().trim();
  // 1. Check if user already exists in auth.users
  const existing: any = await prisma.$queryRawUnsafe(
    `SELECT id FROM auth.users WHERE lower(email) = $1 LIMIT 1`,
    cleanEmail
  );
  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // 2. Insert new auth.users record if missing
  try {
    const created: any = await prisma.$queryRawUnsafe(
      `INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
       VALUES (gen_random_uuid(), $1, '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated')
       RETURNING id`,
      cleanEmail
    );
    if (created && created.length > 0) {
      return created[0].id;
    }
  } catch (e) {
    console.warn('Error inserting auth user:', e);
  }

  return null;
}

async function test() {
  const id = await getOrSyncAuthUserId('rv3475022@gmail.com');
  console.log('Result for rv3475022@gmail.com:', id);
  const newId = await getOrSyncAuthUserId('test_student_flow@nivora.edu');
  console.log('Result for new student:', newId);
  // Cleanup test student
  if (newId) {
    await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id = $1::uuid`, newId);
    console.log('Cleaned up test student');
  }
  await prisma.$disconnect();
}
test();
