'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface CampusEvent {
  id: string;
  title: string;
  organizer: string;
  category: 'Hackathon' | 'Technical Keynote' | 'Workshop' | 'Cultural';
  date: string;
  time: string;
  venue: string;
  registered: boolean;
  prizePool?: string;
  desc: string;
}

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'ev-1',
    title: 'HackCampus \'25: Systems & Distributed Infrastructure 36h Hackathon',
    organizer: 'ACM Student Chapter & NIVORA Labs',
    category: 'Hackathon',
    date: 'Oct 12 - 14, 2025',
    time: '09:00 AM kickoff',
    venue: 'Computing Centre East / Main Auditorium',
    registered: true,
    prizePool: '₹2,50,000 + Jane Street / Google Fast-Track Interviews',
    desc: 'Build high-throughput distributed protocols, consensus algorithms, or zero-knowledge proof verifiers. Hardware clusters provided.',
  },
  {
    id: 'ev-2',
    title: 'Modern High-Concurrency Storage Engines: From B+ Trees to LSM Trees',
    organizer: 'Google Cloud Systems Group',
    category: 'Technical Keynote',
    date: 'Sept 26, 2025',
    time: '04:30 PM - 06:30 PM',
    venue: 'Turing Auditorium Hall 1',
    registered: true,
    desc: 'Distinguished lecture by Dr. S. Narayanan on production RocksDB optimizations, memory-mapped I/O, and io_uring kernels.',
  },
  {
    id: 'ev-3',
    title: 'FPGA & RISC-V Pipeline Synthesis Bootcamp',
    organizer: 'Hardware & Robotics Society',
    category: 'Workshop',
    date: 'Oct 02, 2025',
    time: '10:00 AM - 04:00 PM',
    venue: 'VLSI Design Studio B',
    registered: false,
    desc: 'Hands-on Verilog design of a 5-stage pipelined RISC-V core with hazard detection and forwarding units.',
  },
];

export default function ClubsAndEventsPage() {
  const { currentStream } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [filterCat, setFilterCat] = useState<string>('ALL');

  const toggleRegister = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, registered: !e.registered } : e
      )
    );
  };

  const filtered = events.filter(
    (e) => filterCat === 'ALL' || e.category === filterCat
  );

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-primary font-semibold">CAMPUS LIFE & ECOSYSTEM</span>
            <span>/</span>
            <span>CLUBS & HACKATHONS</span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
            Clubs & Events
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Inter-collegiate hackathons, technical conferences, and student club workshops for {streamData.name}.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-x-auto">
          {['ALL', 'Hackathon', 'Technical Keynote', 'Workshop'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-space-md py-1.5 rounded-lg text-body-sm transition-colors ${
                filterCat === cat
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors"
          >
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                  {ev.category}
                </span>
                <span className="font-label-tag text-label-tag text-on-surface-variant">
                  {ev.date}
                </span>
              </div>

              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                {ev.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                {ev.desc}
              </p>

              {ev.prizePool && (
                <div className="p-space-xs rounded bg-surface-container border border-outline-variant/10 text-tertiary font-label-mono-wide text-label-tag font-semibold">
                  🏆 {ev.prizePool}
                </div>
              )}
            </div>

            <div className="pt-space-sm border-t border-outline-variant/20 space-y-space-xs">
              <div className="font-label-mono-wide text-label-tag text-on-surface-variant">
                {ev.venue} • {ev.time}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-label-tag text-label-tag text-on-surface-variant/80">
                  {ev.organizer}
                </span>

                <button
                  onClick={() => toggleRegister(ev.id)}
                  className={`px-space-md py-1.5 rounded-lg font-button-text text-button-text font-semibold transition-colors ${
                    ev.registered
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-primary text-on-primary hover:bg-primary-fixed'
                  }`}
                >
                  {ev.registered ? 'Registered ✓' : 'Register Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
