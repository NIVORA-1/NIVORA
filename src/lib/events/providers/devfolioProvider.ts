import { EventProvider, NormalizedEventOrClub } from '../types';

export class DevfolioProvider implements EventProvider {
  name = 'Devfolio';

  async fetchEvents(): Promise<NormalizedEventOrClub[]> {
    try {
      const response = await fetch('https://api.devfolio.co/api/hackathons?page=1', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.warn(`[DevfolioProvider] HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      const rawHackathons = json.result || [];
      const now = new Date();

      const events: NormalizedEventOrClub[] = [];

      for (const item of rawHackathons) {
        // Exclude unverified or hidden hackathons
        if (item.private || item.status !== 'publish') continue;

        const startDate = item.starts_at ? new Date(item.starts_at) : null;
        const endDate = item.ends_at ? new Date(item.ends_at) : null;

        // Strictly exclude expired events
        const effectiveEnd = endDate || startDate;
        if (!effectiveEnd || effectiveEnd < now) continue;

        const isOnline = Boolean(item.is_online);
        const city = item.city || '';
        const state = item.state || '';
        const rawLoc = item.location || '';

        let resolvedLocation = 'Online';
        if (!isOnline) {
          if (city && state) {
            resolvedLocation = `${city}, ${state}`;
          } else if (city) {
            resolvedLocation = city;
          } else if (rawLoc) {
            resolvedLocation = rawLoc.split(',').slice(-2).join(',').trim();
          } else {
            resolvedLocation = 'In-person';
          }
        }

        const slug = item.slug || '';
        const registrationUrl = slug ? `https://${slug}.devfolio.co` : 'https://devfolio.co/hackathons';
        const sourceUrl = slug ? `https://devfolio.co/hackathons/${slug}` : 'https://devfolio.co';

        // Extract clean text from description / tagline
        const description = (item.tagline || item.desc || 'Join developers, designers, and students to build innovative tech projects.')
          .replace(/[#*`_~]/g, '')
          .slice(0, 200)
          .trim();

        // Extract organizer name if available
        const organizer =
          item.hackathon_setting?.subdomain?.toUpperCase() ||
          item.themes?.[0]?.name ||
          'Student Developer Community';

        events.push({
          id: `devfolio-${item.uuid || item.slug}`,
          title: item.name,
          description: description.endsWith('.') ? description : `${description}...`,
          type: 'event',
          category: 'Hackathons',
          organizer,
          image_url: item.cover_img || item.hackathon_setting?.logo || undefined,
          start_date: item.starts_at || undefined,
          end_date: item.ends_at || undefined,
          location: resolvedLocation,
          is_online: isOnline,
          source_name: 'Devfolio',
          source_url: sourceUrl,
          registration_url: registrationUrl,
          tags: (item.themes || []).map((t: any) => t.name).slice(0, 3),
        });
      }

      return events;
    } catch (error) {
      console.warn('[DevfolioProvider] Failed to fetch events:', error);
      return [];
    }
  }
}
