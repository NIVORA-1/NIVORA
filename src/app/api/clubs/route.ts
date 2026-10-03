import { NextResponse } from 'next/server';
import { eventService } from '@/lib/events/eventService';
import { NormalizedEventOrClub } from '@/lib/events/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const category = searchParams.get('category')?.trim() || 'All';

    const clubs = await eventService.getFeaturedClubs();

    const filtered = clubs.filter((cl: NormalizedEventOrClub) => {
      // Category filter
      if (category !== 'All' && cl.category !== category) {
        return false;
      }

      // Search filter
      if (search) {
        const titleMatch = cl.title.toLowerCase().includes(search);
        const orgMatch = cl.organizer.toLowerCase().includes(search);
        const catMatch = cl.category.toLowerCase().includes(search);
        const descMatch = cl.description.toLowerCase().includes(search);
        const tagMatch = cl.tags?.some((t) => t.toLowerCase().includes(search));

        if (!titleMatch && !orgMatch && !catMatch && !descMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });

    return NextResponse.json(filtered, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[API Clubs GET Error]:', error);
    return NextResponse.json(
      { error: 'Live club data is temporarily unavailable.' },
      { status: 502 }
    );
  }
}
