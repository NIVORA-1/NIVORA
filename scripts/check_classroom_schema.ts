import prisma from '../src/lib/prisma';

async function main() {
  const cols: any = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'google_classroom_connections';
  `;
  console.log('Columns in google_classroom_connections:', cols);

  const rls: any = await prisma.$queryRaw`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'google_classroom_connections';
  `;
  console.log('RLS in google_classroom_connections:', rls);

  const policies: any = await prisma.$queryRaw`
    SELECT polname, polcmd, polroles 
    FROM pg_policy 
    WHERE polrelid = 'google_classroom_connections'::regclass;
  `;
  console.log('Policies:', policies);

  const asgCols: any = await prisma.$queryRaw`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Assignment';
  `;
  console.log('Assignment columns:', asgCols.map((c: any) => c.column_name));

  const asgIndexes: any = await prisma.$queryRaw`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'Assignment';
  `;
  console.log('Assignment indexes:', asgIndexes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
