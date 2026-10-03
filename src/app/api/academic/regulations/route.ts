import { NextResponse } from 'next/server';
import { getRegulations } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const branchId = searchParams.get('branchId');

    if (!universityId || !branchId) {
      return NextResponse.json(
        { error: 'universityId and branchId query parameters are required' },
        { status: 400 }
      );
    }

    const regulations = await getRegulations(universityId, branchId);

    return NextResponse.json({
      success: true,
      count: regulations.length,
      regulations,
    });
  } catch (error) {
    console.error('Academic regulations API error:', error);
    return NextResponse.json({ error: 'Failed to load regulations' }, { status: 500 });
  }
}
