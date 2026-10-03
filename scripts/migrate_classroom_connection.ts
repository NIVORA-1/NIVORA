import prisma from '../src/lib/prisma';

async function migrate() {
  console.log('Running migration on google_classroom_connections...');

  // 1. Add googleEmail column
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "google_classroom_connections" 
    ADD COLUMN IF NOT EXISTS "googleEmail" TEXT;
  `);
  console.log('Added googleEmail column.');

  // 2. Add snake_case generated/alias columns if they don't exist
  const snakeColumns = [
    { name: 'google_email', expr: '"googleEmail"' },
    { name: 'user_id', expr: '"userId"' },
    { name: 'refresh_token_encrypted', expr: '"refreshToken"' },
    { name: 'access_token_encrypted', expr: '"accessToken"' },
    { name: 'token_expiry', expr: '"expiresAt"' },
    { name: 'connected_at', expr: '"connectedAt"' },
    { name: 'updated_at', expr: '"updatedAt"' },
  ];

  for (const col of snakeColumns) {
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "google_classroom_connections" 
        ADD COLUMN IF NOT EXISTS "${col.name}" TEXT GENERATED ALWAYS AS (${col.expr}::text) STORED;
      `);
      console.log(`Added generated column ${col.name}`);
    } catch (e: any) {
      console.log(`Column ${col.name} note:`, e.message);
    }
  }

  // 3. Enable RLS
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "google_classroom_connections" ENABLE ROW LEVEL SECURITY;
  `);
  console.log('Enabled RLS on google_classroom_connections.');

  // 4. Create RLS policies
  await prisma.$executeRawUnsafe(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'google_classroom_connections' AND policyname = 'Users can view own classroom connection'
      ) THEN
        CREATE POLICY "Users can view own classroom connection" ON "google_classroom_connections"
          FOR SELECT
          USING (
            auth.uid()::text = "userId" 
            OR current_setting('request.jwt.claim.sub', true) = "userId"
            OR current_user = 'postgres'
            OR current_user = 'service_role'
          );
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'google_classroom_connections' AND policyname = 'Users can manage own classroom connection'
      ) THEN
        CREATE POLICY "Users can manage own classroom connection" ON "google_classroom_connections"
          FOR ALL
          USING (
            auth.uid()::text = "userId" 
            OR current_setting('request.jwt.claim.sub', true) = "userId"
            OR current_user = 'postgres'
            OR current_user = 'service_role'
          );
      END IF;
    END $$;
  `);
  console.log('Configured RLS policies.');

  // 5. Add unique index for (userId, externalCourseId, externalId) on Assignment for duplicate prevention
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_assignment_user_course_work_unique" 
      ON "Assignment"("userId", "externalCourseId", "externalId") 
      WHERE ("externalId" IS NOT NULL AND "externalCourseId" IS NOT NULL);
    `);
    console.log('Created unique index for (userId, externalCourseId, externalId).');
  } catch (e: any) {
    console.log('Assignment unique index note:', e.message);
  }
}

migrate()
  .then(() => console.log('Migration completed successfully!'))
  .catch((err) => console.error('Migration failed:', err))
  .finally(() => prisma.$disconnect());
