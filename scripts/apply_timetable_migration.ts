import prisma from '../src/lib/prisma';

async function main() {
  console.log('Applying timetable and class schedule migration...');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ClassSchedule"
      ADD COLUMN IF NOT EXISTS "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS "academicSubjectId" UUID,
      ADD COLUMN IF NOT EXISTS "dayName" VARCHAR(20) DEFAULT 'Monday',
      ADD COLUMN IF NOT EXISTS "subjectName" VARCHAR(255) DEFAULT 'General Course',
      ADD COLUMN IF NOT EXISTS "subjectCode" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "section" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "notes" TEXT,
      ADD COLUMN IF NOT EXISTS "needsReview" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ClassSchedule" ALTER COLUMN "subjectId" DROP NOT NULL;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ClassSchedule" ALTER COLUMN "room" SET DEFAULT 'TBD';
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ClassSchedule" ALTER COLUMN "instructor" SET DEFAULT 'TBD';
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ClassSchedule" ALTER COLUMN "type" SET DEFAULT 'Lecture';
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "idx_class_schedule_user_day" ON "ClassSchedule"("userId", "dayOfWeek");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TimetableUpload" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "imageUrl" TEXT,
      "fileName" VARCHAR(255),
      "fileSize" INT,
      "entriesCount" INT DEFAULT 0,
      "status" VARCHAR(50) DEFAULT 'processed',
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "idx_timetable_upload_user" ON "TimetableUpload"("userId");
  `);

  console.log('Migration applied successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
