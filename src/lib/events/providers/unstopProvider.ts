import { EventProvider, NormalizedEventOrClub, EventCategory } from '../types';

export class UnstopProvider implements EventProvider {
  name = 'Unstop';

  async fetchEvents(): Promise<NormalizedEventOrClub[]> {
    try {
      const response = await fetch(
        'https://unstop.com/api/public/opportunity/search-result?opportunity=competitions&per_page=30',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(7000),
        }
      );

      if (!response.ok) {
        console.warn(`[UnstopProvider] HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      const rawItems = json.data?.data || [];
      const now = new Date();

      const events: NormalizedEventOrClub[] = [];

      for (const item of rawItems) {
        if (item.regnRequirements?.reg_status === 'FINISHED') continue;

        const regEnd = item.regnRequirements?.end_regn_dt ? new Date(item.regnRequirements.end_regn_dt) : null;
        const eventEnd = item.end_date ? new Date(item.end_date) : null;
        const effectiveEnd = eventEnd || regEnd;

        if (!effectiveEnd || effectiveEnd < now) continue;

        const isOnline = item.regnRequirements?.work_location_type === 'online' || !item.address_with_country_logo?.city;
        const city = item.address_with_country_logo?.city || '';
        const state = item.address_with_country_logo?.state || '';
        let location = 'Online';
        if (!isOnline && city) {
          location = state ? `${city}, ${state}` : city;
        }

        let category: EventCategory = 'Competitions';
        const filterNames = (item.filters || []).map((f: any) => f.name.toLowerCase());
        if (filterNames.some((f: string) => f.includes('hackathon'))) {
          category = 'Hackathons';
        } else if (filterNames.some((f: string) => f.includes('workshop'))) {
          category = 'Workshops';
        }

        const registrationUrl = item.seo_url
          ? `https://unstop.com/${item.seo_url}`
          : item.short_url || 'https://unstop.com';

        const description = (item.meta_description || item.title || 'Student opportunity and competition on Unstop.')
          .slice(0, 180)
          .trim();

        events.push({
          id: `unstop-${item.id}`,
          title: item.title,
          description: description.endsWith('.') ? description : `${description}...`,
          type: 'event',
          category,
          organizer: item.organisation?.name || 'Academic Institution',
          image_url: item.banner_mobile?.image_url || item.banner_desktop?.image_url || undefined,
          start_date: item.regnRequirements?.start_regn_dt || undefined,
          end_date: item.end_date || item.regnRequirements?.end_regn_dt || undefined,
          location,
          is_online: isOnline,
          source_name: 'Unstop',
          source_url: registrationUrl,
          registration_url: registrationUrl,
          prize_pool: item.prizes?.[0]?.cash ? `₹${item.prizes[0].cash}` : undefined,
          tags: (item.required_skills || []).map((s: any) => s.skill).slice(0, 3),
        });
      }

      return events;
    } catch (error) {
      console.warn('[UnstopProvider] Failed to fetch events:', error);
      return [];
    }
  }
}
