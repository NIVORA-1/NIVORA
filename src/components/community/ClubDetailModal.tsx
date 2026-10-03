'use client';

import React, { useState, useEffect } from 'react';
import { EventDetailItem } from './EventDetailModal';

export interface ClubItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo?: string | null;
  bannerImage?: string | null;
  leaderId?: string | null;
  leader?: { id: string; name: string; email: string } | null;
  memberCount: number;
  eventsCount?: number;
  announcementsCount?: number;
  isMember: boolean;
  membershipRole?: string | null;
  isOrganizer?: boolean;
}

interface ClubAnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: { id: string; name: string } | null;
}

interface ClubDetailModalProps {
  clubId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinToggle: (clubId: string, currentStatus: boolean) => Promise<void>;
  onSelectEvent?: (event: EventDetailItem) => void;
  onCreateEventForClub?: (club: ClubItem) => void;
}

export default function ClubDetailModal({
  clubId,
  isOpen,
  onClose,
  onJoinToggle,
  onSelectEvent,
  onCreateEventForClub,
}: ClubDetailModalProps) {
  const [club, setClub] = useState<ClubItem | null>(null);
  const [announcements, setAnnouncements] = useState<ClubAnnouncementItem[]>([]);
  const [events, setEvents] = useState<EventDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  // New announcement form for leaders
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !clubId) return;

    setLoading(true);
    fetch(`/api/clubs/${clubId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setClub(data);
          setAnnouncements(data.announcements || []);
          setEvents(data.events || []);
        }
      })
      .catch((err) => console.error('Failed to load club details:', err))
      .finally(() => setLoading(false));
  }, [clubId, isOpen]);

  if (!isOpen || !clubId) return null;

  const handleJoinLeave = async () => {
    if (!club) return;
    if (club.isMember && !showConfirmLeave) {
      setShowConfirmLeave(true);
      return;
    }

    try {
      setActionLoading(true);
      await onJoinToggle(club.id, club.isMember);
      setShowConfirmLeave(false);
      // Update local state
      setClub((prev) =>
        prev
          ? {
              ...prev,
              isMember: !prev.isMember,
              memberCount: prev.isMember ? Math.max(0, prev.memberCount - 1) : prev.memberCount + 1,
            }
          : null
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !club) return;

    try {
      setPostLoading(true);
      const res = await fetch(`/api/clubs/${club.id}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (res.ok) {
        const created = await res.json();
        setAnnouncements((prev) => [created, ...prev]);
        setNewTitle('');
        setNewContent('');
        setShowNewAnnouncement(false);
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setPostLoading(false);
    }
  };

  if (!isOpen || !clubId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          setShowConfirmLeave(false);
          onClose();
        }}
      />
      <div className="relative w-full max-w-3xl bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Banner header */}
        <div className="relative h-36 bg-gradient-to-r from-primary/30 to-secondary/30 overflow-hidden flex-shrink-0">
          {club?.bannerImage && (
            <img
              src={club.bannerImage}
              alt={club?.name || 'Club'}
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-surface-container/80 backdrop-blur-sm text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Club Meta Summary */}
        <div className="px-6 -mt-10 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-surface-container border-2 border-outline-variant/30 overflow-hidden shadow-lg flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
              {club?.logo ? (
                <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span>{club?.name?.slice(0, 2).toUpperCase() || 'CL'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-semibold border border-primary/20">
                  {club?.category}
                </span>
                {club?.isMember && (
                  <span className="font-label-mono-wide text-label-tag px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    Member
                  </span>
                )}
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                {club?.name}
              </h2>
              <p className="font-label-mono-wide text-label-tag text-on-surface-variant">
                {club?.memberCount ?? 0} members • Led by {club?.leader?.name || 'Club Leadership'}
              </p>
            </div>
          </div>

          {/* Join/Leave Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showConfirmLeave ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmLeave(false)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg text-body-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinLeave}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg text-body-xs font-semibold bg-error text-white hover:bg-error/90 transition-colors"
                >
                  {actionLoading ? 'Leaving...' : 'Confirm Leave'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoinLeave}
                disabled={actionLoading || loading}
                className={`px-5 py-2 rounded-xl font-button-text text-button-text font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                  club?.isMember
                    ? 'bg-secondary-container text-on-secondary-container hover:bg-error-container hover:text-error'
                    : 'bg-primary text-on-primary hover:bg-primary-fixed'
                }`}
              >
                {actionLoading ? (
                  <span>Updating...</span>
                ) : club?.isMember ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Member ✓ (Click to Leave)</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">group_add</span>
                    <span>Join Club</span>
                  </>
                )}
              </button>
            )}

            {club?.isOrganizer && onCreateEventForClub && (
              <button
                onClick={() => onCreateEventForClub(club)}
                className="px-3 py-2 rounded-xl font-button-text text-button-text font-semibold bg-surface-container hover:bg-surface-container-high text-primary border border-primary/20 transition-colors flex items-center gap-1"
                title="Create event as organizer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Host Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* About Club */}
          <div className="space-y-1.5">
            <h4 className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider">
              About This Society
            </h4>
            <p className="text-body-md text-on-surface leading-relaxed">
              {club?.description}
            </p>
          </div>

          {/* Announcements Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">campaign</span>
                <span>Club Announcements ({announcements.length})</span>
              </h4>

              {club?.isOrganizer && (
                <button
                  onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}
                  className="text-body-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {showNewAnnouncement ? 'close' : 'add'}
                  </span>
                  <span>{showNewAnnouncement ? 'Cancel' : 'Post Announcement'}</span>
                </button>
              )}
            </div>

            {/* New Announcement Form (Organizer only) */}
            {showNewAnnouncement && (
              <form
                onSubmit={handlePostAnnouncement}
                className="p-4 rounded-xl bg-surface-container border border-primary/30 space-y-3 animate-in fade-in duration-150"
              >
                <p className="font-label-tag text-label-tag text-primary font-semibold">
                  Publish Announcement to Club Members
                </p>
                <input
                  type="text"
                  placeholder="Announcement Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 text-body-sm focus:outline-none focus:border-primary"
                  required
                />
                <textarea
                  placeholder="Write message to all registered club members..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 text-body-sm focus:outline-none focus:border-primary"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAnnouncement(false)}
                    className="px-3 py-1.5 rounded-lg text-body-xs font-semibold bg-surface-container-high hover:bg-surface-container text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postLoading}
                    className="px-4 py-1.5 rounded-lg text-body-xs font-semibold bg-primary text-on-primary hover:bg-primary-fixed"
                  >
                    {postLoading ? 'Publishing...' : 'Broadcast'}
                  </button>
                </div>
              </form>
            )}

            {announcements.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-container text-center text-body-sm text-on-surface-variant">
                No announcements published yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/15 space-y-1"
                  >
                    <div className="flex items-center justify-between text-body-xs">
                      <span className="font-headline-sm font-semibold text-on-surface">{a.title}</span>
                      <span className="font-label-mono-wide text-[10px] text-on-surface-variant">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Club Events Section */}
          <div className="space-y-3 pt-2 border-t border-outline-variant/20">
            <h4 className="font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">event</span>
              <span>Events & Hackathons ({events.length})</span>
            </h4>

            {events.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-container text-center text-body-sm text-on-surface-variant">
                No events currently scheduled for this club.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent && onSelectEvent(ev)}
                    className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-primary">
                        <span>{ev.category}</span>
                        <span className="text-on-surface-variant">{ev.date}</span>
                      </div>
                      <h5 className="font-headline-sm text-body-md font-semibold text-on-surface pt-1 line-clamp-1">
                        {ev.title}
                      </h5>
                      <p className="text-body-xs text-on-surface-variant line-clamp-2 mt-0.5">
                        {ev.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15 text-[11px]">
                      <span className="text-on-surface-variant">{ev.venue}</span>
                      <span className="text-primary font-semibold hover:underline">
                        Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
