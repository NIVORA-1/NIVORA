'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';
import {
  NormalizedEventOrClub,
  EVENT_CATEGORIES,
  LOCATION_FILTERS,
  EventCategory,
  EventLocationFilter,
} from '@/lib/events/types';

type ActiveTab = 'events' | 'clubs' | 'my-events' | 'my-clubs';

export default function ClubsAndEventsPage() {
  const { currentStream } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('events');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('All');
  const [selectedLocation, setSelectedLocation] = useState<EventLocationFilter>('All Locations');

  // Live external data state
  const [events, setEvents] = useState<NormalizedEventOrClub[]>([]);
  const [clubs, setClubs] = useState<NormalizedEventOrClub[]>([]);

  // Saved / bookmarked items state
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [savedClubIds, setSavedClubIds] = useState<string[]>([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize saved items from localStorage
  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem('nivora_saved_events');
      if (storedEvents) {
        setSavedEventIds(JSON.parse(storedEvents));
      }
      const storedClubs = localStorage.getItem('nivora_saved_clubs');
      if (storedClubs) {
        setSavedClubIds(JSON.parse(storedClubs));
      }
    } catch {
      // localStorage error fallback
    }
  }, []);

  // Fetch real external data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [eventsRes, clubsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/clubs'),
      ]);

      if (!eventsRes.ok && !clubsRes.ok) {
        throw new Error('Live event data is temporarily unavailable.');
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } else {
        setErrorMessage('Unable to load live events right now.');
      }

      if (clubsRes.ok) {
        const clubsData = await clubsRes.json();
        setClubs(Array.isArray(clubsData) ? clubsData : []);
      }
    } catch (err: any) {
      console.error('Failed to load live external community data:', err);
      setErrorMessage('Live event data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle Save Event
  const toggleSaveEvent = (eventId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedEventIds((prev) => {
      const next = prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem('nivora_saved_events', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Toggle Save Club
  const toggleSaveClub = (clubId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedClubIds((prev) => {
      const next = prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId];
      try {
        localStorage.setItem('nivora_saved_clubs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Reset category & location filters when switching tabs
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setSearchQuery('');
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Category match
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }

      // Location match
      if (selectedLocation !== 'All Locations') {
        if (selectedLocation === 'Online') {
          if (!ev.is_online && !ev.location.toLowerCase().includes('online')) {
            return false;
          }
        } else {
          const locLower = selectedLocation.toLowerCase();
          const evLocLower = ev.location.toLowerCase();
          if (!evLocLower.includes(locLower)) {
            return false;
          }
        }
      }

      // Search match (title, organizer, category, location)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(query);
        const matchesOrg = ev.organizer.toLowerCase().includes(query);
        const matchesCat = ev.category.toLowerCase().includes(query);
        const matchesLoc = ev.location.toLowerCase().includes(query);
        const matchesDesc = ev.description.toLowerCase().includes(query);
        const matchesTag = ev.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesOrg && !matchesCat && !matchesLoc && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedCategory, selectedLocation, searchQuery]);

  // Filtered Clubs
  const filteredClubs = useMemo(() => {
    return clubs.filter((cl) => {
      if (selectedCategory !== 'All' && cl.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = cl.title.toLowerCase().includes(query);
        const matchesOrg = cl.organizer.toLowerCase().includes(query);
        const matchesCat = cl.category.toLowerCase().includes(query);
        const matchesDesc = cl.description.toLowerCase().includes(query);
        const matchesLoc = cl.location.toLowerCase().includes(query);
        const matchesTag = cl.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesOrg && !matchesCat && !matchesDesc && !matchesLoc && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [clubs, selectedCategory, searchQuery]);

  // My Saved Events
  const mySavedEvents = useMemo(() => {
    return events.filter((ev) => savedEventIds.includes(ev.id));
  }, [events, savedEventIds]);

  // My Saved Clubs
  const mySavedClubs = useMemo(() => {
    return clubs.filter((cl) => savedClubIds.includes(cl.id));
  }, [clubs, savedClubIds]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Upcoming';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16 animate-fadeIn">
      {/* ========================================================= */}
      {/* HEADER SECTION */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold">CAMPUS DISCOVERY &amp; AGGREGATION</span>
            <span>/</span>
            <span>CLUBS &amp; EVENTS</span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
            Clubs &amp; Events
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Live student hackathons, competitions, workshops, and verified collegiate technical chapters for {streamData.name}.
          </p>
        </div>

        {/* Aggregation Transparency Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-mono text-on-surface-variant self-start md:self-auto shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
          <span>External Public Feed</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN TAB NAVIGATION */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-1 overflow-x-auto">
        <button
          onClick={() => handleTabChange('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline-sm text-body-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">event</span>
          <span>Upcoming Events</span>
          <span className="font-label-mono-wide text-xs px-2 py-0.5 rounded-full bg-surface-container/60">
            {events.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('clubs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline-sm text-body-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'clubs'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">groups</span>
          <span>Featured Clubs</span>
          <span className="font-label-mono-wide text-xs px-2 py-0.5 rounded-full bg-surface-container/60">
            {clubs.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('my-events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline-sm text-body-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'my-events'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">bookmark</span>
          <span>My Events</span>
          <span className="font-label-mono-wide text-xs px-2 py-0.5 rounded-full bg-surface-container/60">
            {savedEventIds.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('my-clubs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline-sm text-body-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'my-clubs'
              ? 'bg-secondary-container text-on-secondary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">loyalty</span>
          <span>My Clubs</span>
          <span className="font-label-mono-wide text-xs px-2 py-0.5 rounded-full bg-surface-container/60">
            {savedClubIds.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SEARCH & FILTERS BAR */}
      {/* ========================================================= */}
      {(activeTab === 'events' || activeTab === 'clubs') && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder={
                activeTab === 'events'
                  ? 'Search events by title, organizer, or location...'
                  : 'Search clubs by name, domain, or location...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Location Filter Dropdown (Events only) */}
            {activeTab === 'events' && (
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value as EventLocationFilter)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary shadow-sm cursor-pointer"
                >
                  {LOCATION_FILTERS.map((loc) => (
                    <option key={loc} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-x-auto shadow-sm">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-body-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ERROR STATE */}
      {/* ========================================================= */}
      {errorMessage && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[24px]">cloud_off</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            {errorMessage}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
            Live external events could not be loaded at this moment. Nivora does not display mock data.
          </p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-body-sm font-semibold transition-colors cursor-pointer"
          >
            Retry Live Feed
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: UPCOMING EVENTS VIEW */}
      {/* ========================================================= */}
      {activeTab === 'events' && !errorMessage && (
        <>
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md animate-pulse h-64"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="w-20 h-4 bg-surface-container rounded" />
                      <div className="w-16 h-4 bg-surface-container rounded" />
                    </div>
                    <div className="w-3/4 h-6 bg-surface-container rounded" />
                    <div className="w-full h-12 bg-surface-container rounded" />
                  </div>
                  <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
                    <div className="w-24 h-4 bg-surface-container rounded" />
                    <div className="w-24 h-8 bg-surface-container rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            /* Empty State */
            <div className="p-16 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-3 max-w-lg mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">event_busy</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                No upcoming events found.
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {searchQuery || selectedCategory !== 'All' || selectedLocation !== 'All Locations'
                  ? 'No live events match your filter criteria. Try resetting filters or search query.'
                  : 'Check back soon for new hackathons and campus technical events.'}
              </p>
              {(searchQuery || selectedCategory !== 'All' || selectedLocation !== 'All Locations') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedLocation('All Locations');
                  }}
                  className="px-4 py-2 rounded-xl text-body-sm font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            /* Event Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {filteredEvents.map((ev) => {
                const isSaved = savedEventIds.includes(ev.id);

                return (
                  <div
                    key={ev.id}
                    className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors group relative"
                  >
                    <div className="space-y-space-xs">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                            {ev.category}
                          </span>
                          <span className="font-label-mono-wide text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">
                            via {ev.source_name}
                          </span>
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={(e) => toggleSaveEvent(ev.id, e)}
                          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title={isSaved ? 'Remove from My Events' : 'Save to My Events'}
                          aria-label={isSaved ? 'Remove from My Events' : 'Save to My Events'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isSaved ? 'bookmark_added' : 'bookmark_border'}
                          </span>
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1 group-hover:text-primary transition-colors line-clamp-2">
                        {ev.title}
                      </h3>

                      {/* Description */}
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">
                        {ev.description}
                      </p>

                      {/* Prize pool badge if available */}
                      {ev.prize_pool && (
                        <div className="p-space-xs rounded bg-surface-container border border-outline-variant/10 text-tertiary font-label-mono-wide text-label-tag font-semibold">
                          🏆 {ev.prize_pool}
                        </div>
                      )}
                    </div>

                    {/* Footer Details & View Event Button */}
                    <div className="pt-space-sm border-t border-outline-variant/20 space-y-space-xs">
                      <div className="font-label-mono-wide text-label-tag text-on-surface-variant flex items-center justify-between">
                        <span className="flex items-center gap-1 truncate max-w-[65%]">
                          {ev.is_online ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
                              <span className="truncate">{ev.location}</span>
                            </>
                          )}
                        </span>
                        <span className="text-on-surface font-mono">{formatDate(ev.start_date)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-label-tag text-label-tag text-on-surface-variant/80 truncate max-w-[50%]">
                          {ev.organizer}
                        </span>

                        <a
                          href={ev.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-space-md py-1.5 rounded-lg font-button-text text-button-text font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <span>View Event</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FEATURED CLUBS VIEW */}
      {/* ========================================================= */}
      {activeTab === 'clubs' && !errorMessage && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md animate-pulse h-60"
                />
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="p-16 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-3 max-w-lg mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">groups</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                No clubs found.
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Try clearing your search query or choosing another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {filteredClubs.map((club) => {
                const isSaved = savedClubIds.includes(club.id);

                return (
                  <div
                    key={club.id}
                    className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors group"
                  >
                    <div className="space-y-space-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center font-bold text-primary text-base flex-shrink-0 overflow-hidden">
                            {club.image_url ? (
                              <img src={club.image_url} alt={club.title} className="w-full h-full object-contain p-1.5" />
                            ) : (
                              <span>{club.title.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                              {club.category}
                            </span>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1 group-hover:text-primary transition-colors">
                              {club.title}
                            </h3>
                          </div>
                        </div>

                        {/* Save Club Button */}
                        <button
                          onClick={(e) => toggleSaveClub(club.id, e)}
                          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0"
                          title={isSaved ? 'Remove from My Clubs' : 'Save to My Clubs'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isSaved ? 'loyalty' : 'favorite_border'}
                          </span>
                        </button>
                      </div>

                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 pt-1">
                        {club.description}
                      </p>
                    </div>

                    <div className="pt-space-sm border-t border-outline-variant/20 space-y-space-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                        <span>📍 {club.location}</span>
                        <span>{club.member_count}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-label-tag text-label-tag text-on-surface-variant/80">
                          via {club.source_name}
                        </span>

                        <a
                          href={club.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-space-md py-1.5 rounded-lg font-button-text text-button-text font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Community</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MY EVENTS (SAVED EVENTS) */}
      {/* ========================================================= */}
      {activeTab === 'my-events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bookmark</span>
              <span>Saved Events ({mySavedEvents.length})</span>
            </h3>
          </div>

          {mySavedEvents.length === 0 ? (
            <div className="p-12 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">bookmark_border</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                No saved events yet.
              </h4>
              <p className="text-body-sm text-on-surface-variant">
                Bookmark hackathons and competitions from the Upcoming Events tab to track them here.
              </p>
              <button
                onClick={() => handleTabChange('events')}
                className="mt-2 px-4 py-2 rounded-xl text-body-sm font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors cursor-pointer"
              >
                Browse Upcoming Events →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {mySavedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                        {ev.category}
                      </span>
                      <button
                        onClick={() => toggleSaveEvent(ev.id)}
                        className="text-body-xs font-semibold text-error hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Remove</span>
                      </button>
                    </div>

                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                      {ev.title}
                    </h4>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {ev.description}
                    </p>
                  </div>

                  <div className="pt-space-sm border-t border-outline-variant/20 space-y-space-xs">
                    <div className="font-label-mono-wide text-label-tag text-on-surface-variant flex items-center justify-between">
                      <span>{ev.location}</span>
                      <span>{formatDate(ev.start_date)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-mono text-on-surface-variant/70">
                        via {ev.source_name}
                      </span>

                      <a
                        href={ev.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-space-md py-1 rounded-lg text-body-xs font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Event</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: MY CLUBS (SAVED CLUBS) */}
      {/* ========================================================= */}
      {activeTab === 'my-clubs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">loyalty</span>
              <span>Saved Clubs ({mySavedClubs.length})</span>
            </h3>
          </div>

          {mySavedClubs.length === 0 ? (
            <div className="p-12 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">groups</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                No saved clubs yet.
              </h4>
              <p className="text-body-sm text-on-surface-variant">
                Save collegiate chapters and communities from the Featured Clubs tab to keep them at your fingertips.
              </p>
              <button
                onClick={() => handleTabChange('clubs')}
                className="mt-2 px-5 py-2.5 rounded-xl text-body-sm font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors cursor-pointer"
              >
                Explore Featured Clubs →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {mySavedClubs.map((club) => (
                <div
                  key={club.id}
                  className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                        {club.category}
                      </span>
                      <button
                        onClick={() => toggleSaveClub(club.id)}
                        className="text-body-xs font-semibold text-error hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Remove</span>
                      </button>
                    </div>

                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                      {club.title}
                    </h4>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {club.description}
                    </p>
                  </div>

                  <div className="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-on-surface-variant/70">
                      via {club.source_name}
                    </span>

                    <a
                      href={club.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-space-md py-1 rounded-lg text-body-xs font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Community</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transparency Disclaimer Footer */}
      <div className="pt-6 border-t border-outline-variant/20 text-center text-xs font-sans text-on-surface-variant/60">
        Nivora aggregates verified public hackathons, competitions, and technical chapters. Event registration and community memberships are hosted independently by their respective platforms.
      </div>
    </div>
  );
}
