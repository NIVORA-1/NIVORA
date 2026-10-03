'use client';

import React, { useState, useMemo } from 'react';
import {
  COMMUNITIES_DATA,
  COMMUNITY_CATEGORIES,
  CommunityCategory,
  Community,
  SUGGEST_COMMUNITY_URL,
} from '@/data/communities';

export default function CommunitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter communities by category and search query
  const filteredCommunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return COMMUNITIES_DATA.filter((community: Community) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' || community.category === selectedCategory;

      if (!matchesCategory) return false;

      // Search query match (name, description, category, tags)
      if (!query) return true;

      const nameMatch = community.name.toLowerCase().includes(query);
      const descMatch = community.description.toLowerCase().includes(query);
      const catMatch = community.category.toLowerCase().includes(query);
      const tagMatch = community.tags.some((tag) => tag.toLowerCase().includes(query));
      const platformMatch = community.platform.toLowerCase().includes(query);

      return nameMatch || descMatch || catMatch || tagMatch || platformMatch;
    });
  }, [selectedCategory, searchQuery]);

  // Count items per category for tab badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: COMMUNITIES_DATA.length,
    };

    COMMUNITIES_DATA.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return counts;
  }, []);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col w-full space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION */}
      {/* ========================================================= */}
      <section className="relative rounded-3xl bg-surface-container-low border border-border p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5 text-left">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-border text-primary font-mono text-[11px] font-bold tracking-wider uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>CURATED DIRECTORY</span>
            <span className="text-on-surface-variant/40">•</span>
            <span className="text-on-surface-variant">PUBLIC STUDENT SPACES</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-display font-bold tracking-tight text-on-surface leading-[1.1]">
              Student Communities
            </h1>
            <p className="text-sm sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed font-sans">
              Discover active communities for learning, technology, projects, career and student discussions.
            </p>
          </div>

          {/* Directory Highlights */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 border-t border-border/60 text-xs font-sans text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              <span>100% Free &amp; Open Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span>Verified Public Communities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-400">open_in_new</span>
              <span>Independent External Hubs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SEARCH & FILTER CONTROLS */}
      {/* ========================================================= */}
      <section className="space-y-4">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search communities by name, topic, or keywords..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-surface-container-low border border-border text-on-surface placeholder:text-on-surface-variant/60 font-sans text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
              aria-label="Search communities"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-xs font-sans text-on-surface-variant flex items-center gap-2 self-end sm:self-center px-1">
            <span>Showing</span>
            <span className="font-mono font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded border border-border">
              {filteredCommunities.length}
            </span>
            <span>of {COMMUNITIES_DATA.length} communities</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {COMMUNITY_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const count = categoryCounts[category] || 0;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-sans text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 font-bold'
                    : 'bg-surface-container-low hover:bg-surface-container border-border text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. COMMUNITY CARDS GRID */}
      {/* ========================================================= */}
      {filteredCommunities.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommunities.map((community: Community) => (
            <div
              key={community.id}
              className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-xl hover:-translate-y-0.5"
            >
              {/* Card Header & Content */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Platform Icon Badge */}
                    <div
                      className="w-11 h-11 rounded-xl bg-surface-container border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0"
                      style={{
                        borderColor: community.accentColor ? `${community.accentColor}33` : undefined,
                      }}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {community.icon}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-on-surface font-sans group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{community.name}</span>
                      </h3>
                      <span className="text-[11px] font-sans text-on-surface-variant/80 font-medium">
                        {community.platform}
                      </span>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-bold bg-surface-container text-on-surface-variant border border-border/80 shrink-0">
                    {community.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-on-surface-variant leading-relaxed font-sans line-clamp-3">
                  {community.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {community.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container/60 text-on-surface-variant/75 border border-border/40"
                    >
                      #{tag}
                    </span>
                  ))}
                  {community.tags.length > 3 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-on-surface-variant/50">
                      +{community.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Open Community Button */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                <span className="text-[10px] font-sans text-on-surface-variant/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Public Community
                </span>

                <a
                  href={community.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-primary text-on-surface hover:text-white font-sans text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group-hover:shadow"
                >
                  <span>Open Community</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
                </a>
              </div>
            </div>
          ))}
        </section>
      ) : (
        /* ========================================================= */
        /* 4. EMPTY STATE */
        /* ========================================================= */
        <div className="p-12 text-center rounded-3xl bg-surface-container-low border border-border space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-container border border-border flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[30px]">search_off</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-display font-bold text-on-surface">No communities found</h3>
            <p className="text-xs text-on-surface-variant font-sans max-w-xs mx-auto">
              We couldn’t find any communities matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another search term or reset your filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-coral text-white font-sans text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUGGEST A COMMUNITY SECTION */}
      {/* ========================================================= */}
      <section className="relative rounded-3xl bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container border border-border p-6 sm:p-8 overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Expand The Directory
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface">
              Want to suggest a community?
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant font-sans leading-relaxed">
              Know of an active, high-quality public community for student developers, engineers, or researchers? Recommend it to be added to the Nivora directory.
            </p>
          </div>

          <a
            href={SUGGEST_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-coral text-white font-sans text-xs font-bold transition-all shadow-md hover:shadow-primary/25 flex items-center gap-2 shrink-0 cursor-pointer"
            id="suggest-community-btn"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span>Suggest Community</span>
          </a>
        </div>
      </section>

      {/* Transparency & Disclaimer Note */}
      <div className="text-center text-[11px] font-sans text-on-surface-variant/60 pb-4">
        All community links open independent third-party platforms in a new tab. Nivora does not host or own these external communities.
      </div>
    </div>
  );
}
