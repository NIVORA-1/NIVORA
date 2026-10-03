'use client';

import React, { useState, useEffect } from 'react';
import { EventDetailItem } from './EventDetailModal';

interface Attendee {
  registrationId: string;
  registeredAt: string;
  studentName: string;
  studentEmail: string;
  avatar?: string | null;
  college?: string;
  stream?: string;
  year?: number;
}

interface EventAttendeesModalProps {
  event: EventDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventAttendeesModal({
  event,
  isOpen,
  onClose,
}: EventAttendeesModalProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen || !event?.id) return;

    setLoading(true);
    fetch(`/api/events/${event.id}/registrations`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.attendees) {
          setAttendees(data.attendees);
        }
      })
      .catch((err) => console.error('Failed to load attendees:', err))
      .finally(() => setLoading(false));
  }, [event?.id, isOpen]);

  if (!isOpen || !event) return null;

  const filtered = attendees.filter(
    (a) =>
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      (a.stream && a.stream.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                Organizer Roster
              </span>
              <span className="font-label-mono-wide text-label-tag text-on-surface-variant">
                {attendees.length} / {event.capacity || '∞'} Confirmed
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
              Registered Attendees: {event.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or stream..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="p-8 text-center text-body-sm text-on-surface-variant">
              Loading attendee roster...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center space-y-1">
              <p className="text-body-sm text-on-surface font-medium">No registrations found</p>
              <p className="text-body-xs text-on-surface-variant">
                {search ? 'Try adjusting your search criteria.' : 'No students have registered yet.'}
              </p>
            </div>
          ) : (
            filtered.map((att, idx) => (
              <div
                key={att.registrationId}
                className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-label-mono-wide text-xs text-on-surface-variant/70 w-5">
                    {idx + 1}.
                  </span>
                  <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-bold text-xs text-primary">
                    {att.studentName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-headline-sm text-body-sm font-semibold text-on-surface">
                      {att.studentName}
                    </p>
                    <p className="font-label-mono-wide text-[11px] text-on-surface-variant">
                      {att.studentEmail} • {att.stream || 'Student'} (Yr {att.year || 1})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-label-tag text-[10px] text-secondary bg-secondary-container px-2 py-0.5 rounded-full font-semibold">
                    Confirmed
                  </span>
                  <p className="font-label-mono-wide text-[10px] text-on-surface-variant/70 mt-1">
                    {new Date(att.registeredAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
