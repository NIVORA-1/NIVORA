import { NormalizedEventOrClub, EventProvider, ClubProvider } from './types';
import { getOrSetCache } from './cache';
import { DevfolioProvider } from './providers/devfolioProvider';
import { UnstopProvider } from './providers/unstopProvider';
import { MeetupProvider } from './providers/meetupProvider';
import { RealClubProvider } from './providers/clubProvider';

class EventService {
  private eventProviders: EventProvider[];
  private clubProviders: ClubProvider[];

  constructor() {
    this.eventProviders = [
      new DevfolioProvider(),
      new UnstopProvider(),
      new MeetupProvider(),
    ];
    this.clubProviders = [
      new RealClubProvider(),
    ];
  }

  /**
   * Fetches real, unexpired events from all registered external providers with caching.
   */
  async getLiveEvents(): Promise<NormalizedEventOrClub[]> {
    return getOrSetCache('live-events', async () => {
      const results = await Promise.allSettled(
        this.eventProviders.map((p) => p.fetchEvents())
      );

      const allEvents: NormalizedEventOrClub[] = [];
      const now = new Date();

      for (const res of results) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          allEvents.push(...res.value);
        }
      }

      // Deduplicate events by ID and normalized title
      const seen = new Set<string>();
      const deduped: NormalizedEventOrClub[] = [];

      for (const ev of allEvents) {
        const key = ev.title.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        // Double check not expired
        const startDate = ev.start_date ? new Date(ev.start_date) : null;
        const endDate = ev.end_date ? new Date(ev.end_date) : null;
        const effectiveEnd = endDate || startDate;

        if (effectiveEnd && effectiveEnd < now) continue;

        deduped.push(ev);
      }

      // Sort by nearest upcoming date
      deduped.sort((a, b) => {
        const timeA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
        const timeB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
        return timeA - timeB;
      });

      return deduped;
    }, 10 * 60 * 1000); // 10 minutes cache
  }

  /**
   * Fetches real, verified clubs from all registered club providers with caching.
   */
  async getFeaturedClubs(): Promise<NormalizedEventOrClub[]> {
    return getOrSetCache('featured-clubs', async () => {
      const results = await Promise.allSettled(
        this.clubProviders.map((p) => p.fetchClubs())
      );

      const allClubs: NormalizedEventOrClub[] = [];
      for (const res of results) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          allClubs.push(...res.value);
        }
      }

      return allClubs;
    }, 30 * 60 * 1000); // 30 minutes cache for clubs
  }
}

export const eventService = new EventService();
