import { NextRequest, NextResponse } from 'next/server';
import { getRecommendationsForMode } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') || 'focus').toLowerCase();

    const items = await getRecommendationsForMode(mode);

    return NextResponse.json(
      { items },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error: any) {
    console.error('[API /api/music/recommendations error]:', error?.message || error);
    return NextResponse.json(
      {
        error: 'Music service is temporarily unavailable.',
        items: [],
      },
      { status: 503 }
    );
  }
}
