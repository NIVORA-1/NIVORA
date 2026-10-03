'use client';

import React, { useState } from 'react';
import { ClubItem } from './ClubDetailModal';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  initialClub?: ClubItem | null;
  clubs?: ClubItem[];
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
  initialClub,
  clubs = [],
}: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Hackathon' | 'Technical Keynote' | 'Workshop' | 'Cultural'>('Hackathon');
  const [date, setDate] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [venue, setVenue] = useState('');
  const [organizerName, setOrganizerName] = useState(initialClub?.name || '');
  const [clubId, setClubId] = useState(initialClub?.id || '');
  const [capacity, setCapacity] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !date.trim() || !venue.trim()) {
      setError('Please fill in all required fields (Title, Description, Date, Venue).');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          date,
          eventDate: eventDate || new Date().toISOString(),
          startTime,
          endTime,
          venue,
          organizerName,
          clubId: clubId || undefined,
          capacity: capacity ? parseInt(capacity, 10) : null,
          registrationDeadline: registrationDeadline || undefined,
          prizePool: prizePool || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      onEventCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                Organizer Portal
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
              Create New Campus Event
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-error-container text-error text-body-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-label-tag text-label-tag text-on-surface-variant">
              Event Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Infrastructure 36h Hackathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-tag text-label-tag text-on-surface-variant">
              Description *
            </label>
            <textarea
              placeholder="Detailed schedule, requirements, hardware clusters, or keynote topics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                Category *
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Technical Keynote">Technical Keynote</option>
                <option value="Workshop">Workshop</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                Associated Club (Optional)
              </label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">No Club (Independent Event)</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                Display Date * (e.g. Oct 12 - 14, 2026)
              </label>
              <input
                type="text"
                placeholder="Oct 12 - 14, 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                Target Date (for sorting/cadence)
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                Start Time
              </label>
              <input
                type="text"
                placeholder="09:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                End Time
              </label>
              <input
                type="text"
                placeholder="05:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-tag text-label-tag text-on-surface-variant">
              Location / Venue *
            </label>
            <input
              type="text"
              placeholder="e.g. Computing Centre East / Auditorium Hall 1"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                Max Capacity (Empty for unlimited)
              </label>
              <input
                type="number"
                placeholder="100"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-tag text-label-tag text-on-surface-variant">
                Registration Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-tag text-label-tag text-on-surface-variant">
              Prize Pool & Perks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ₹2,50,000 + Google Fast-Track Interviews"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-body-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-body-sm font-semibold bg-primary text-on-primary hover:bg-primary-fixed disabled:opacity-50"
            >
              {loading ? 'Publishing Event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
