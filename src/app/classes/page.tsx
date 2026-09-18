'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ClassItem {
  id: string;
  code: string;
  name: string;
  time: string;
  room: string;
  instructor: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  meetingUrl?: string;
  attendance: string;
  syllabus: number;
}

export default function ClassesPage() {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Tue');
  const [showRoomModal, setShowRoomModal] = useState<string | null>(null);

  const classes: Record<string, ClassItem[]> = {
    Tue: [
      {
        id: 'c-1',
        code: 'CS-301',
        name: 'Database Management Systems (DBMS)',
        time: '10:00 AM – 11:30 AM',
        room: 'Hall B-204, Academic Block C',
        instructor: 'Dr. K. Sharma',
        type: 'Lecture',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        attendance: '84.6% (Safe)',
        syllabus: 68,
      },
      {
        id: 'c-2',
        code: 'CS-302',
        name: 'Data Structures & Algorithms (DSA)',
        time: '02:00 PM – 03:30 PM',
        room: 'Turing Lecture Hall 1',
        instructor: 'Prof. A. Bannerjee',
        type: 'Lecture',
        meetingUrl: 'https://meet.google.com/xyz-uvw-rst',
        attendance: '89.2% (Safe)',
        syllabus: 73,
      },
    ],
    Wed: [
      {
        id: 'c-3',
        code: 'CS-303',
        name: 'Operating Systems Systems Lab',
        time: '09:00 AM – 11:00 AM',
        room: 'Systems Lab 3, Turing Complex',
        instructor: 'Dr. V. Raman',
        type: 'Lab',
        meetingUrl: 'https://zoom.us/j/123456789',
        attendance: '82.2% (Safe)',
        syllabus: 58,
      },
    ],
    Thu: [
      {
        id: 'c-4',
        code: 'CS-304',
        name: 'Computer Networks & Protocols',
        time: '11:30 AM – 01:00 PM',
        room: 'Hall B-102, Academic Block C',
        instructor: 'Prof. S. Sengupta',
        type: 'Lecture',
        meetingUrl: 'https://meet.google.com/net-work-lab',
        attendance: '91.5% (Safe)',
        syllabus: 50,
      },
    ],
    Mon: [
      {
        id: 'c-5',
        code: 'CS-303',
        name: 'Operating Systems & Concurrency Theory',
        time: '08:30 AM – 10:00 AM',
        room: 'Systems Lab 3',
        instructor: 'Dr. V. Raman',
        type: 'Lecture',
        attendance: '82.2% (Safe)',
        syllabus: 58,
      },
    ],
    Fri: [
      {
        id: 'c-6',
        code: 'CS-301',
        name: 'DBMS Practical SQL Lab & Tuning',
        time: '02:00 PM – 04:00 PM',
        room: 'Database Lab 2',
        instructor: 'Dr. K. Sharma',
        type: 'Lab',
        attendance: '84.6% (Safe)',
        syllabus: 68,
      },
    ],
  };

  const dayClasses = classes[selectedDay] || [];

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-xl pb-space-4xl animate-in fade-in duration-200">
      {/* Top Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase">
            <span>Academic Core</span>
            <span>/</span>
            <span className="text-primary font-semibold">Classes &amp; Timetable</span>
            <span>•</span>
            <span className="text-secondary">Term V</span>
          </div>
          <h1 className="font-display-quote text-display-hero text-on-surface tracking-tight font-normal italic">
            My Classes
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Synchronized institutional lecture roster, classroom access directions, live virtual relays, and attendance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/planner"
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-button-text transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Full Planner View</span>
          </Link>
        </div>
      </section>

      {/* Days Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
        {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-space-lg py-2 rounded-lg font-label-mono-wide text-xs uppercase tracking-wider transition-colors font-semibold ${
              selectedDay === day
                ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {day}day ({classes[day]?.length || 0})
          </button>
        ))}
      </div>

      {/* Class Schedule Cards */}
      <div className="space-y-space-md">
        {dayClasses.map((cls) => (
          <div
            key={cls.id}
            className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md"
          >
            <div className="space-y-space-xs min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-surface-container font-label-mono-wide text-xs text-primary font-semibold">
                  {cls.code}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-tag text-[9px] uppercase">
                  {cls.type}
                </span>
                <span className="font-label-mono-wide text-xs text-on-surface font-semibold">
                  {cls.time}
                </span>
              </div>

              <h3 className="font-headline-md text-headline-sm text-on-surface font-semibold">
                {cls.name}
              </h3>

              <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    person
                  </span>
                  {cls.instructor}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    location_on
                  </span>
                  {cls.room}
                </span>
                <span className="text-secondary font-label-mono-wide text-xs">
                  Attendance: {cls.attendance}
                </span>
              </div>

              <div className="space-y-1 pt-1 max-w-md">
                <div className="flex justify-between text-xs font-label-tag text-on-surface-variant">
                  <span>Syllabus Covered</span>
                  <span className="font-label-mono-wide text-primary">{cls.syllabus}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${cls.syllabus}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowRoomModal(cls.room)}
                className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-button-text transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                <span>Room Guide</span>
              </button>

              {cls.meetingUrl ? (
                <a
                  href={cls.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-xs font-button-text font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  <span>Join Live</span>
                </a>
              ) : (
                <Link
                  href={`/subjects/${cls.code}`}
                  className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface font-button-text font-semibold transition-colors"
                >
                  Course Page →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRoomModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-space-lg shadow-2xl space-y-space-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
                <h3 className="font-headline-sm text-on-surface font-semibold">
                  Room Guide
                </h3>
              </div>
              <button
                onClick={() => setShowRoomModal(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-space-xs text-body-sm text-on-surface-variant">
              <p><strong>Room Designation</strong>: {showRoomModal}</p>
              <p><strong>Campus Wing</strong>: Central Academic Quad, Level 2.</p>
              <p><strong>Facilities</strong>: Smart Projector, High-Bandwidth Eduroam WiFi, Lecture Recording Cameras.</p>
            </div>
            <button
              onClick={() => setShowRoomModal(null)}
              className="w-full py-2 rounded-lg bg-primary text-on-primary font-button-text font-semibold text-body-sm"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
