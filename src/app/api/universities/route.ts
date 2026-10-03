import { NextResponse } from 'next/server';
import { searchUniversities, isValidUniversity, findUniversity } from '@/lib/universities';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const validate = searchParams.get('validate');

    if (validate) {
      const valid = isValidUniversity(validate);
      const match = findUniversity(validate);
      return NextResponse.json({
        valid,
        university: match,
      });
    }

    const results = searchUniversities(query, Math.min(100, Math.max(1, limit)));
    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Universities search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
