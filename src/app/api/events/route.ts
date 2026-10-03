import { NextResponse } from 'next/server';
import { eventService } from '@/lib/events/eventService';
import { NormalizedEventOrClub } from '@/lib/events/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const category = searchParams.get('category')?.trim() || 'All';
    const location = searchParams.get('location')?.trim() || 'All Locations';

    const events = await eventService.getLiveEvents();

    const filtered = events.filter((ev: NormalizedEventOrClub) => {
      // Category filter
      if (category !== 'All' && ev.category !== category) {
        return false;
      }

      // Location filter
      if (location !== 'All Locations') {
        if (location === 'Online') {
          if (!ev.is_online && !ev.location.toLowerCase().includes('online')) {
            return false;
          }
        } else {
          const locLower = location.toLowerCase();
          const evLocLower = ev.location.toLowerCase();
          if (!evLocLower.includes(locLower)) {
            return false;
          }
        }
      }

      // Search filter
      if (search) {
        const titleMatch = ev.title.toLowerCase().includes(search);
        const orgMatch = ev.organizer.toLowerCase().includes(search);
        const catMatch = ev.category.toLowerCase().includes(search);
        const locMatch = ev.location.toLowerCase().includes(search);
        const descMatch = ev.description.toLowerCase().includes(search);
        const tagMatch = ev.tags?.some((t) => t.toLowerCase().includes(search));

        if (!titleMatch && !orgMatch && !catMatch && !locMatch && !descMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });

    return NextResponse.json(filtered, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('[API Events GET Error]:', error);
    return NextResponse.json(
      { error: 'Live event data is temporarily unavailable.' },
      { status: 502 }
    );
  }
}
