import prisma from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inDollarQuote = false;
  let dollarQuoteTag = '';

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inDollarQuote && (trimmed.startsWith('--') || trimmed.length === 0)) {
      continue;
    }

    // Check for $$ or $tag$
    const dollarMatches = line.match(/\$[a-zA-Z0-9_]*\$/g);
    if (dollarMatches) {
      for (const m of dollarMatches) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarQuoteTag = m;
        } else if (dollarQuoteTag === m) {
          inDollarQuote = false;
          dollarQuoteTag = '';
        }
      }
    }

    current += line + '\n';

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function applyMigration() {
  const sqlPath = path.join(__dirname, '../supabase/migrations/20261002_automatic_subject_selection.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const statements = splitSqlStatements(sql);
  console.log(`Parsed ${statements.length} SQL statements. Executing sequentially...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.split('\n')[0].substring(0, 60);
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`[${i + 1}/${statements.length}] OK: ${preview}...`);
    } catch (err: any) {
      console.error(`[${i + 1}/${statements.length}] Failed on: ${preview}...`);
      console.error(err.message || err);
      throw err;
    }
  }

  console.log('All migration statements applied successfully!');

  // Verify created tables
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('universities', 'colleges', 'branches', 'college_branches', 'syllabus_versions', 'subjects')
    ORDER BY table_name;
  `);
  console.log('Academic tables found in DB:', tables);
}

applyMigration()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
