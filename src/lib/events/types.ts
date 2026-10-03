export type EventCategory =
  | 'All'
  | 'Hackathons'
  | 'Technical Events'
  | 'Workshops'
  | 'Competitions'
  | 'Meetups'
  | 'Career'
  | 'Other';

export type EventLocationFilter =
  | 'All Locations'
  | 'Delhi NCR'
  | 'Greater Noida'
  | 'Noida'
  | 'Delhi'
  | 'Online';

export const EVENT_CATEGORIES: EventCategory[] = [
  'All',
  'Hackathons',
  'Technical Events',
  'Workshops',
  'Competitions',
  'Meetups',
  'Career',
  'Other',
];

export const LOCATION_FILTERS: EventLocationFilter[] = [
  'All Locations',
  'Delhi NCR',
  'Greater Noida',
  'Noida',
  'Delhi',
  'Online',
];

/**
 * Normalized internal format for events and clubs aggregated from external providers.
 */
export interface NormalizedEventOrClub {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'club';
  category: EventCategory;
  organizer: string;
  image_url?: string;
  start_date?: string; // ISO 8601 string
  end_date?: string;   // ISO 8601 string
  location: string;
  is_online: boolean;
  source_name: string; // e.g. "Devfolio", "Unstop", "Meetup", "GDG"
  source_url: string;
  registration_url: string;
  tags?: string[];
  prize_pool?: string;
  member_count?: string;
}

export interface EventProvider {
  name: string;
  fetchEvents(): Promise<NormalizedEventOrClub[]>;
}

export interface ClubProvider {
  name: string;
  fetchClubs(): Promise<NormalizedEventOrClub[]>;
}
