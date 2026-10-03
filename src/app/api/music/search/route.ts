import { NextRequest, NextResponse } from 'next/server';
import { searchYouTube } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const pageToken = searchParams.get('pageToken') || undefined;

    if (!q) {
      return NextResponse.json({
        items: [],
        nextPageToken: undefined,
        totalResults: 0,
      });
    }

    const results = await searchYouTube(q, pageToken, 20);

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    const errorMsg = error?.message || '';

    if (errorMsg === 'Music service is not configured.') {
      return NextResponse.json(
        {
          error: 'Music service is not configured.',
          items: [],
        },
        { status: 503 }
      );
    }

    console.error('[API /api/music/search error]:', error);
    return NextResponse.json(
      {
        error: 'Unable to load music right now.',
        items: [],
      },
      { status: 500 }
    );
  }
}
