import { EventProvider, NormalizedEventOrClub } from '../types';

export class MeetupProvider implements EventProvider {
  name = 'Meetup';

  async fetchEvents(): Promise<NormalizedEventOrClub[]> {
    const apiKey = process.env.MEETUP_API_KEY;

    // Meetup requires an authenticated API key or OAuth token for student group queries.
    // If not configured, gracefully return an empty array without error.
    if (!apiKey) {
      return [];
    }

    try {
      const response = await fetch('https://api.meetup.com/find/upcoming_events?topic_category=tech', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
        next: { revalidate: 600 },
      });

      if (!response.ok) {
        console.warn(`[MeetupProvider] HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      const rawEvents = json.events || [];
      const now = new Date();

      return rawEvents
        .filter((ev: any) => ev.time && new Date(ev.time) >= now)
        .map((ev: any) => ({
          id: `meetup-${ev.id}`,
          title: ev.name,
          description: (ev.description || 'Community tech meetup and student gathering.').slice(0, 180),
          type: 'event' as const,
          category: 'Meetups' as const,
          organizer: ev.group?.name || 'Tech Community',
          start_date: new Date(ev.time).toISOString(),
          location: ev.venue ? `${ev.venue.city || ''}, ${ev.venue.country || ''}` : 'Online',
          is_online: !ev.venue,
          source_name: 'Meetup',
          source_url: ev.link || 'https://meetup.com',
          registration_url: ev.link || 'https://meetup.com',
          tags: ['Meetup', 'Tech', 'Networking'],
        }));
    } catch (error) {
      console.error('[MeetupProvider] Failed to fetch events:', error);
      return [];
    }
  }
}
