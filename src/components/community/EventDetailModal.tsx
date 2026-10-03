'use client';

import React, { useState } from 'react';
import { generateGoogleCalendarUrl, downloadICSFile } from './CalendarHelper';

export interface EventDetailItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  eventDate: string | Date;
  startTime: string;
  endTime: string;
  venue: string;
  organizerName: string;
  clubId?: string | null;
  club?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  } | null;
  capacity?: number | null;
  remainingSeats?: number | null;
  registrationsCount?: number;
  registrationDeadline?: string | Date | null;
  isDeadlinePassed?: boolean;
  prizePool?: string | null;
  isCancelled?: boolean;
  isPast?: boolean;
  isRegistered: boolean;
  registeredAt?: string | null;
  isOrganizer?: boolean;
}

interface EventDetailModalProps {
  event: EventDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterToggle: (eventId: string, currentStatus: boolean) => Promise<void>;
  onOpenClub?: (clubId: string) => void;
  onViewAttendees?: (event: EventDetailItem) => void;
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onRegisterToggle,
  onOpenClub,
  onViewAttendees,
}: EventDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!isOpen || !event) return null;

  const handleAction = async () => {
    if (event.isRegistered) {
      if (!showConfirmCancel) {
        setShowConfirmCancel(true);
        return;
      }
    }

    try {
      setLoading(true);
      await onRegisterToggle(event.id, event.isRegistered);
      setShowConfirmCancel(false);
    } finally {
      setLoading(false);
    }
  };

  const isFull = event.remainingSeats !== null && event.remainingSeats !== undefined && event.remainingSeats <= 0 && !event.isRegistered;
  const isPast = event.isPast || new Date(event.eventDate).getTime() < Date.now();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          setShowConfirmCancel(false);
          onClose();
        }}
      />
      <div className="relative w-full max-w-2xl bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container/50 flex items-start justify-between">
          <div className="space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-semibold border border-primary/20">
                {event.category}
              </span>
              {event.isCancelled && (
                <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-error-container text-error font-semibold">
                  Cancelled
                </span>
              )}
              {isPast && !event.isCancelled && (
                <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
                  Past Event
                </span>
              )}
              {event.isRegistered && (
                <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Registered
                </span>
              )}
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
              {event.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metadata Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-body-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              </div>
              <div>
                <p className="font-label-tag text-label-tag text-on-surface-variant">Date & Cadence</p>
                <p className="font-medium text-on-surface">{event.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
              <div>
                <p className="font-label-tag text-label-tag text-on-surface-variant">Time</p>
                <p className="font-medium text-on-surface">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div>
                <p className="font-label-tag text-label-tag text-on-surface-variant">Location / Venue</p>
                <p className="font-medium text-on-surface">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">airline_seat_recline_normal</span>
              </div>
              <div>
                <p className="font-label-tag text-label-tag text-on-surface-variant">Seats / Capacity</p>
                <p className="font-medium text-on-surface">
                  {event.capacity !== null && event.capacity !== undefined
                    ? `${event.remainingSeats ?? 0} seats left (${event.capacity} total)`
                    : 'Open Seating (No cap)'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
              About the Event
            </h4>
            <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Prize pool banner if available */}
          {event.prizePool && (
            <div className="p-3.5 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <div>
                <p className="font-label-tag text-label-tag text-tertiary font-semibold uppercase">
                  Prizes & Industry Fast-Track
                </p>
                <p className="text-body-sm text-on-surface font-medium">{event.prizePool}</p>
              </div>
            </div>
          )}

          {/* Organizer & Club Link */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-label-tag text-label-tag text-on-surface-variant">Organized By</p>
              <p className="font-headline-sm text-body-md font-semibold text-on-surface">
                {event.organizerName}
              </p>
              {event.club && (
                <p className="text-body-xs text-primary font-medium mt-0.5">
                  Affiliated with {event.club.name}
                </p>
              )}
            </div>

            {event.club && onOpenClub && (
              <button
                onClick={() => onOpenClub(event.club!.id)}
                className="px-3 py-1.5 rounded-lg text-body-xs font-semibold bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors flex items-center gap-1.5"
              >
                <span>View Club Profile</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Add to Calendar Section */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/20">
            <p className="font-label-mono-wide text-label-tag text-on-surface-variant uppercase">
              Calendar Integration
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={generateGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-body-sm font-medium text-on-surface transition-colors flex items-center gap-1.5 border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                <span>Add to Google Calendar</span>
              </a>

              <button
                onClick={() => downloadICSFile(event)}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-body-sm font-medium text-on-surface transition-colors flex items-center gap-1.5 border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                <span>Download .ICS file</span>
              </button>
            </div>
          </div>

          {/* Organizer Controls */}
          {event.isOrganizer && onViewAttendees && (
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div>
                <p className="font-label-tag text-label-tag text-primary font-semibold">
                  Organizer Access
                </p>
                <p className="text-body-xs text-on-surface-variant">
                  You are an organizer for this event.
                </p>
              </div>
              <button
                onClick={() => onViewAttendees(event)}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-body-xs font-semibold hover:bg-primary-fixed transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>View Attendees</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-body-xs text-on-surface-variant">
            {event.isRegistered ? (
              <span className="text-secondary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check</span>
                You have confirmed your seat for this event.
              </span>
            ) : isFull ? (
              <span className="text-error font-medium">Event is currently at maximum capacity.</span>
            ) : isPast ? (
              <span className="text-on-surface-variant font-medium">This event has concluded.</span>
            ) : event.isCancelled ? (
              <span className="text-error font-medium">Event has been cancelled.</span>
            ) : (
              <span>Registration open for all students.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showConfirmCancel ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg text-body-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  Keep Seat
                </button>
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-body-sm font-semibold bg-error text-white hover:bg-error/90 transition-colors flex items-center gap-1"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAction}
                disabled={loading || (isFull && !event.isRegistered) || isPast || event.isCancelled}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-button-text text-button-text font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  event.isRegistered
                    ? 'bg-secondary-container text-on-secondary-container hover:bg-error-container hover:text-error'
                    : isFull || isPast || event.isCancelled
                    ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'
                    : 'bg-primary text-on-primary hover:bg-primary-fixed'
                }`}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : event.isRegistered ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Registered ✓ (Click to Cancel)</span>
                  </>
                ) : isFull ? (
                  <span>Capacity Reached</span>
                ) : isPast ? (
                  <span>Event Concluded</span>
                ) : event.isCancelled ? (
                  <span>Cancelled</span>
                ) : (
                  <span>Register Now</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
