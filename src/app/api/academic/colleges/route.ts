import { NextResponse } from 'next/server';
import { searchColleges } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const colleges = await searchColleges(query, limit);

    return NextResponse.json({
      success: true,
      count: colleges.length,
      colleges,
    });
  } catch (error) {
    console.error('Academic colleges API error:', error);
    return NextResponse.json({ error: 'Failed to search colleges' }, { status: 500 });
  }
}
