'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import StudentProfileModal, { PublicStudentProfile } from './StudentProfileModal';

export type ConnectSubTab = 'discover' | 'suggested' | 'connections' | 'requests';

interface ConnectionRequestItem {
  id: string;
  note: string | null;
  createdAt: string;
  sender?: PublicStudentProfile;
  receiver?: PublicStudentProfile;
}

interface AcceptedConnectionItem {
  id: string;
  connectedSince: string;
  partner: PublicStudentProfile;
}

const STREAM_FILTERS = [
  { label: 'All Streams', value: 'ALL' },
  { label: 'Computer Science (CSE)', value: 'CSE' },
  { label: 'Data Science (DS)', value: 'DS' },
  { label: 'Mechanical Eng (MECH)', value: 'MECH' },
  { label: 'Electronics (ECE)', value: 'ECE' },
  { label: 'Business Admin (BBA)', value: 'BBA' },
];

const SEMESTER_FILTERS = [
  { label: 'All Semesters', value: 'ALL' },
  { label: 'Sem 1', value: '1' },
  { label: 'Sem 2', value: '2' },
  { label: 'Sem 3', value: '3' },
  { label: 'Sem 4', value: '4' },
  { label: 'Sem 5', value: '5' },
  { label: 'Sem 6', value: '6' },
  { label: 'Sem 7', value: '7' },
  { label: 'Sem 8', value: '8' },
];

export default function ConnectSection({
  initialSubTab = 'discover',
}: {
  initialSubTab?: ConnectSubTab;
}) {
  const [subTab, setSubTab] = useState<ConnectSubTab>(initialSubTab);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  // Data state
  const [students, setStudents] = useState<PublicStudentProfile[]>([]);
  const [suggestedStudents, setSuggestedStudents] = useState<PublicStudentProfile[]>([]);
  const [connections, setConnections] = useState<AcceptedConnectionItem[]>([]);
  const [requests, setRequests] = useState<{
    received: ConnectionRequestItem[];
    sent: ConnectionRequestItem[];
  }>({ received: [], sent: [] });

  // Status & Feedback states
  const [loading, setLoading] = useState(true);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Profile Modal state
  const [selectedProfile, setSelectedProfile] = useState<PublicStudentProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Send Note Modal state
  const [noteModalTarget, setNoteModalTarget] = useState<PublicStudentProfile | null>(null);
  const [connectionNote, setConnectionNote] = useState('');

  // Toast auto-clear
  useEffect(() => {
    if (feedbackToast) {
      const t = setTimeout(() => setFeedbackToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedbackToast]);

  // Fetch all connect data
  const fetchConnectData = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedStream !== 'ALL') params.set('stream', selectedStream);
      if (selectedSemester !== 'ALL') params.set('semester', selectedSemester);

      const [studentsRes, suggestedRes, connectionsRes, requestsRes] = await Promise.all([
        fetch(`/api/connect/students?${params.toString()}`),
        fetch(`/api/connect/students?filter=suggested`),
        fetch('/api/connect/connections'),
        fetch('/api/connect/requests'),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || []);
      }

      if (suggestedRes.ok) {
        const data = await suggestedRes.json();
        setSuggestedStudents(data.students || []);
      }

      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data.connections || []);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests({
          received: data.received || [],
          sent: data.sent || [],
        });
      }
    } catch (err) {
      console.error('Failed to load connect data:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStream, selectedSemester]);

  useEffect(() => {
    fetchConnectData();
  }, [fetchConnectData]);

  // 1. Send Connection Request Action
  const handleSendRequest = async (receiverId: string, note?: string) => {
    try {
      setActionProcessingId(receiverId);
      const res = await fetch('/api/connect/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, note }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackToast({ message: data.error || 'Failed to send request.', type: 'error' });
        return;
      }

      setFeedbackToast({ message: data.message || 'Connection request sent!', type: 'success' });
      setNoteModalTarget(null);
      setConnectionNote('');

      // Refresh data
      await fetchConnectData();

      // If modal is open for this student, update its connectionStatus
      if (selectedProfile && selectedProfile.id === receiverId) {
        setSelectedProfile((prev) =>
          prev
            ? {
                ...prev,
                connectionStatus: data.status === 'ACCEPTED' ? 'CONNECTED' : 'PENDING_SENT',
                connectionId: data.connectionId,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Connect request error:', err);
      setFeedbackToast({ message: 'Network error sending request.', type: 'error' });
    } finally {
      setActionProcessingId(null);
    }
  };

  // 2. Respond to Connection Request (Accept / Reject)
  const handleRespondRequest = async (connectionId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      setActionProcessingId(connectionId);
      const res = await fetch('/api/connect/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackToast({ message: data.error || 'Failed to respond.', type: 'error' });
        return;
      }

      setFeedbackToast({
        message: data.message || (action === 'ACCEPT' ? 'Connection accepted!' : 'Request declined.'),
        type: 'success',
      });

      await fetchConnectData();

      if (selectedProfile && selectedProfile.connectionId === connectionId) {
        setSelectedProfile((prev) =>
          prev
            ? {
                ...prev,
                connectionStatus: action === 'ACCEPT' ? 'CONNECTED' : 'NONE',
              }
            : null
        );
      }
    } catch (err) {
      console.error('Respond request error:', err);
      setFeedbackToast({ message: 'Error processing response.', type: 'error' });
    } finally {
      setActionProcessingId(null);
    }
  };

  // 3. Remove Connection or Cancel Request
  const handleRemoveConnection = async (connectionId?: string, studentId?: string) => {
    try {
      const targetId = connectionId || studentId;
      if (!targetId) return;

      setActionProcessingId(targetId);
      const query = connectionId
        ? `connectionId=${encodeURIComponent(connectionId)}`
        : `studentId=${encodeURIComponent(studentId!)}`;

      const res = await fetch(`/api/connect/remove?${query}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackToast({ message: data.error || 'Failed to remove connection.', type: 'error' });
        return;
      }

      setFeedbackToast({ message: data.message || 'Connection removed.', type: 'success' });
      await fetchConnectData();

      if (selectedProfile) {
        setSelectedProfile((prev) => (prev ? { ...prev, connectionStatus: 'NONE', connectionId: undefined } : null));
      }
    } catch (err) {
      console.error('Remove connection error:', err);
      setFeedbackToast({ message: 'Error removing connection.', type: 'error' });
    } finally {
      setActionProcessingId(null);
    }
  };

  const openProfileModal = (student: PublicStudentProfile) => {
    setSelectedProfile(student);
    setIsProfileModalOpen(true);
  };

  const incomingCount = requests.received.length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 font-sans text-xs font-semibold animate-slideUp ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/90 border-red-500/40 text-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {feedbackToast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Connect Sub-Header / Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSubTab('discover')}
            className={`px-3.5 py-2 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              subTab === 'discover'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-border/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">explore</span>
            <span>Discover Students</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                subTab === 'discover' ? 'bg-black/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('suggested')}
            className={`px-3.5 py-2 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              subTab === 'suggested'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-border/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>Suggested Connections</span>
            {suggestedStudents.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  subTab === 'suggested' ? 'bg-black/20 text-white' : 'bg-coral/20 text-coral'
                }`}
              >
                {suggestedStudents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('connections')}
            className={`px-3.5 py-2 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              subTab === 'connections'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-border/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>My Connections</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                subTab === 'connections' ? 'bg-black/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {connections.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('requests')}
            className={`px-3.5 py-2 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              subTab === 'requests'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-border/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">notifications</span>
            <span>Connection Requests</span>
            {incomingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-coral text-white font-bold animate-pulse">
                {incomingCount}
              </span>
            )}
          </button>
        </div>

        {/* Sync / Refresh Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchConnectData}
            disabled={loading}
            className="p-2 rounded-xl bg-surface-container/80 hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-border transition-colors cursor-pointer"
            title="Refresh network directory"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: DISCOVER STUDENTS */}
      {subTab === 'discover' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-border space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search students by name, course, branch, semester, or skills (e.g. Raft, Python, CAD)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-border text-on-surface placeholder:text-on-surface-variant/60 font-sans text-xs focus:outline-none focus:border-primary transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Stream Filter */}
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-surface-container border border-border text-on-surface font-sans text-xs focus:outline-none focus:border-primary cursor-pointer shrink-0"
              >
                {STREAM_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {/* Semester Filter */}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-surface-container border border-border text-on-surface font-sans text-xs focus:outline-none focus:border-primary cursor-pointer shrink-0"
              >
                {SEMESTER_FILTERS.map((sem) => (
                  <option key={sem.value} value={sem.value}>
                    {sem.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Directory Grid */}
          {loading && students.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>
              <p className="text-xs font-sans text-on-surface-variant">
                Querying student directory from database...
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-border space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
                person_search
              </span>
              <h3 className="font-display font-bold text-base text-on-surface">No students matched</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-md mx-auto">
                No students found matching your search criteria. Try searching for a different branch, skill, or semester.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStream('ALL');
                  setSelectedSemester('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-surface-container border border-border text-primary font-sans text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onViewProfile={() => openProfileModal(student)}
                  onConnectClick={() => setNoteModalTarget(student)}
                  onRespond={handleRespondRequest}
                  onRemove={handleRemoveConnection}
                  isProcessing={actionProcessingId === student.id || actionProcessingId === student.connectionId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: SUGGESTED CONNECTIONS */}
      {subTab === 'suggested' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary font-sans uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Context-Aware Matching
              </div>
              <p className="text-xs text-on-surface-variant font-sans">
                Students recommended based on overlapping academic streams, coursework, shared verified skills, and technical interests.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-sans font-bold shrink-0 self-start sm:self-auto">
              {suggestedStudents.length} Matches Found
            </span>
          </div>

          {loading && suggestedStudents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>
              <p className="text-xs font-sans text-on-surface-variant">Computing peer compatibility...</p>
            </div>
          ) : suggestedStudents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-border space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
                group_add
              </span>
              <h3 className="font-display font-bold text-base text-on-surface">No new suggestions</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-md mx-auto">
                You are already connected with or have pending requests to your top matches! Check the Discover tab to connect with peers across other branches.
              </p>
              <button
                onClick={() => setSubTab('discover')}
                className="px-4 py-2 rounded-xl bg-primary text-white font-sans text-xs font-bold hover:bg-coral transition-colors"
              >
                Browse All Students
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  showMatchScore
                  onViewProfile={() => openProfileModal(student)}
                  onConnectClick={() => setNoteModalTarget(student)}
                  onRespond={handleRespondRequest}
                  onRemove={handleRemoveConnection}
                  isProcessing={actionProcessingId === student.id || actionProcessingId === student.connectionId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: MY CONNECTIONS */}
      {subTab === 'connections' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-on-surface font-sans">
                Active Connections ({connections.length})
              </h3>
            </div>
            <button
              onClick={() => setSubTab('discover')}
              className="text-xs font-sans text-primary hover:text-coral transition-colors font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              Find More Students
            </button>
          </div>

          {connections.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-border space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
                sentiment_dissatisfied
              </span>
              <h3 className="font-display font-bold text-base text-on-surface">No connections yet</h3>
              <p className="font-sans text-xs text-on-surface-variant max-w-md mx-auto">
                Start expanding your academic network. Send connection requests to peers in your course, branch, or project teams.
              </p>
              <button
                onClick={() => setSubTab('discover')}
                className="px-4 py-2 rounded-xl bg-primary text-white font-sans text-xs font-bold hover:bg-coral transition-colors"
              >
                Discover Peers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((conn) => {
                const partnerWithStatus: PublicStudentProfile = {
                  ...conn.partner,
                  connectionStatus: 'CONNECTED',
                  connectionId: conn.id,
                };
                return (
                  <StudentCard
                    key={conn.id}
                    student={partnerWithStatus}
                    connectedSince={conn.connectedSince}
                    onViewProfile={() => openProfileModal(partnerWithStatus)}
                    onConnectClick={() => {}}
                    onRespond={handleRespondRequest}
                    onRemove={handleRemoveConnection}
                    isProcessing={actionProcessingId === conn.id}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 4: CONNECTION REQUESTS */}
      {subTab === 'requests' && (
        <div className="space-y-8">
          {/* Section 1: Incoming Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse" />
                <h3 className="text-sm font-bold text-on-surface font-sans uppercase tracking-wider">
                  Received Requests ({requests.received.length})
                </h3>
              </div>
            </div>

            {requests.received.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-border space-y-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">
                  inbox
                </span>
                <p className="text-xs font-sans text-on-surface-variant">
                  No pending incoming connection requests.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.received.map((req) => {
                  if (!req.sender) return null;
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-surface-container-low border border-border space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-surface-container border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {req.sender.avatar ? (
                              <img
                                src={req.sender.avatar}
                                alt={req.sender.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-display font-bold text-primary">
                                {req.sender.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4
                              onClick={() => req.sender && openProfileModal(req.sender)}
                              className="text-xs sm:text-sm font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                            >
                              {req.sender.name}
                            </h4>
                            <p className="text-[11px] font-sans text-on-surface-variant truncate">
                              {req.sender.degree} in {req.sender.stream} • Sem {req.sender.semester}
                            </p>
                            <p className="text-[10px] font-sans text-on-surface-variant/80 truncate">
                              {req.sender.college}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-sans text-on-surface-variant shrink-0">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {req.note && (
                        <div className="p-2.5 rounded-lg bg-surface-container border border-border/60 text-xs text-on-surface italic">
                          &ldquo;{req.note}&rdquo;
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 gap-2">
                        <button
                          onClick={() => req.sender && openProfileModal(req.sender)}
                          className="text-xs font-sans text-on-surface-variant hover:text-on-surface font-semibold"
                        >
                          View Profile
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionProcessingId === req.id}
                            onClick={() => handleRespondRequest(req.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-border text-on-surface-variant font-sans text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            disabled={actionProcessingId === req.id}
                            onClick={() => handleRespondRequest(req.id, 'ACCEPT')}
                            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-coral text-white font-sans text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">check</span>
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Outgoing Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-on-surface font-sans uppercase tracking-wider">
                  Sent Requests ({requests.sent.length})
                </h3>
              </div>
            </div>

            {requests.sent.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-border space-y-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">
                  outgoing_mail
                </span>
                <p className="text-xs font-sans text-on-surface-variant">
                  No active outgoing requests pending response.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.sent.map((req) => {
                  if (!req.receiver) return null;
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-surface-container-low border border-border space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-surface-container border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {req.receiver.avatar ? (
                              <img
                                src={req.receiver.avatar}
                                alt={req.receiver.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-display font-bold text-primary">
                                {req.receiver.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4
                              onClick={() => req.receiver && openProfileModal(req.receiver)}
                              className="text-xs sm:text-sm font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                            >
                              {req.receiver.name}
                            </h4>
                            <p className="text-[11px] font-sans text-on-surface-variant truncate">
                              {req.receiver.degree} in {req.receiver.stream} • Sem {req.receiver.semester}
                            </p>
                            <p className="text-[10px] font-sans text-on-surface-variant/80 truncate">
                              {req.receiver.college}
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Pending
                        </span>
                      </div>

                      {req.note && (
                        <div className="p-2.5 rounded-lg bg-surface-container border border-border/60 text-xs text-on-surface-variant italic">
                          &ldquo;{req.note}&rdquo;
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => req.receiver && openProfileModal(req.receiver)}
                          className="text-xs font-sans text-on-surface-variant hover:text-on-surface font-semibold"
                        >
                          View Profile
                        </button>
                        <button
                          disabled={actionProcessingId === req.id}
                          onClick={() => handleRemoveConnection(req.id)}
                          className="px-3 py-1 rounded-lg bg-surface-container hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 border border-border text-on-surface-variant font-sans text-xs transition-colors cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Full Student Public Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={selectedProfile}
        onConnect={handleSendRequest}
        onRespond={handleRespondRequest}
        onRemove={handleRemoveConnection}
        isProcessing={Boolean(actionProcessingId)}
      />

      {/* Modal 2: Send Request Note Prompt */}
      {noteModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-low border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Connect with {noteModalTarget.name}
                </h3>
              </div>
              <button
                onClick={() => setNoteModalTarget(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs font-sans text-on-surface-variant">
              Add an optional short note introducing yourself or mentioning shared coursework, projects, or interests.
            </p>

            <textarea
              rows={3}
              value={connectionNote}
              onChange={(e) => setConnectionNote(e.target.value)}
              placeholder="e.g. Hi! Saw your work on Raft consensus, would love to collaborate on the upcoming project."
              className="w-full p-3 rounded-xl bg-surface-container border border-border text-xs text-on-surface placeholder:text-on-surface-variant/60 font-sans focus:outline-none focus:border-primary resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNoteModalTarget(null)}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-border hover:bg-surface-container-high text-xs font-sans font-semibold text-on-surface-variant transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionProcessingId === noteModalTarget.id}
                onClick={() => handleSendRequest(noteModalTarget.id, connectionNote)}
                className="px-4 py-1.5 rounded-xl bg-primary hover:bg-coral text-white text-xs font-sans font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionProcessingId === noteModalTarget.id ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Student Card Component
function StudentCard({
  student,
  showMatchScore = false,
  connectedSince,
  onViewProfile,
  onConnectClick,
  onRespond,
  onRemove,
  isProcessing = false,
}: {
  student: PublicStudentProfile;
  showMatchScore?: boolean;
  connectedSince?: string;
  onViewProfile: () => void;
  onConnectClick: () => void;
  onRespond: (connectionId: string, action: 'ACCEPT' | 'REJECT') => void;
  onRemove: (connectionId?: string, studentId?: string) => void;
  isProcessing?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low border border-border/80 p-4 sm:p-5 flex flex-col justify-between hover:border-border transition-all group shadow-sm hover:shadow-md">
      <div className="space-y-3.5">
        {/* Top Header: Avatar & Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={onViewProfile}
              className="w-12 h-12 rounded-xl bg-surface-container border border-border overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group-hover:border-primary/40 transition-colors"
            >
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display font-bold text-lg text-primary">
                  {student.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h4
                onClick={onViewProfile}
                className="text-xs sm:text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors cursor-pointer"
              >
                {student.name}
              </h4>
              <p className="text-[11px] font-sans text-on-surface-variant truncate">
                {student.streamCode} • Sem {student.semester}
              </p>
              <p className="text-[10px] font-sans text-on-surface-variant/80 truncate">
                {student.college}
              </p>
            </div>
          </div>

          {/* Badge: Stream or Connected status */}
          {student.connectionStatus === 'CONNECTED' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check</span>
              Connected
            </span>
          ) : showMatchScore && student.matchScore ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-primary/10 border border-primary/30 text-primary shrink-0">
              {Math.min(99, student.matchScore)}% Match
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-surface-container border border-border text-on-surface-variant shrink-0 uppercase">
              {student.streamCode}
            </span>
          )}
        </div>

        {/* Bio or Career Goal */}
        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
          {student.bio || `Aspiring ${student.careerGoal}. Interested in collaborative coursework and research.`}
        </p>

        {/* Match reasons pills if suggested */}
        {showMatchScore && student.matchReasons && student.matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {student.matchReasons.slice(0, 2).map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-sans border border-primary/20"
              >
                ✓ {r}
              </span>
            ))}
          </div>
        )}

        {/* Skills Preview Tags */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap gap-1">
            {student.skills.slice(0, 3).map((sk) => (
              <span
                key={sk.id}
                className="px-2 py-0.5 rounded bg-surface-container border border-border/60 text-[10px] font-sans text-on-surface-variant"
              >
                {sk.name}
              </span>
            ))}
            {student.skills.length > 3 && (
              <span className="text-[10px] font-sans text-on-surface-variant/70 self-center">
                +{student.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Connected since tag if applicable */}
        {connectedSince && (
          <p className="text-[10px] font-sans text-on-surface-variant/70 pt-1">
            Connected since {new Date(connectedSince).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/60 gap-2">
        <button
          onClick={onViewProfile}
          className="text-xs font-sans text-on-surface-variant hover:text-on-surface font-semibold transition-colors cursor-pointer"
        >
          View Profile
        </button>

        {/* Action Button: Connect / Pending / Connected */}
        <div>
          {student.connectionStatus === 'NONE' && (
            <button
              disabled={isProcessing}
              onClick={onConnectClick}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-coral text-white font-sans text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              Connect
            </button>
          )}

          {student.connectionStatus === 'PENDING_SENT' && (
            <button
              disabled={isProcessing}
              onClick={() => onRemove(student.connectionId, student.id)}
              className="px-3 py-1.5 rounded-xl bg-surface-container border border-border text-on-surface-variant hover:text-coral hover:border-coral/40 font-sans text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Click to cancel pending request"
            >
              <span className="material-symbols-outlined text-[14px] text-amber-500 animate-spin">
                progress_activity
              </span>
              Pending
            </button>
          )}

          {student.connectionStatus === 'PENDING_RECEIVED' && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={isProcessing}
                onClick={() => student.connectionId && onRespond(student.connectionId, 'ACCEPT')}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-coral text-white font-sans text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Accept
              </button>
              <button
                disabled={isProcessing}
                onClick={() => student.connectionId && onRespond(student.connectionId, 'REJECT')}
                className="px-2.5 py-1.5 rounded-xl bg-surface-container border border-border hover:bg-surface-container-high text-on-surface-variant font-sans text-xs font-semibold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {student.connectionStatus === 'CONNECTED' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => alert(`Starting direct academic sync with ${student.name}.`)}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border text-primary font-sans text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">chat</span>
                Message
              </button>
              <button
                disabled={isProcessing}
                onClick={() => {
                  if (confirm(`Remove ${student.name} from your connections?`)) {
                    onRemove(student.connectionId, student.id);
                  }
                }}
                className="p-1.5 rounded-xl bg-surface-container hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 border border-border text-on-surface-variant transition-colors cursor-pointer"
                title="Remove connection"
              >
                <span className="material-symbols-outlined text-[15px]">person_remove</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
