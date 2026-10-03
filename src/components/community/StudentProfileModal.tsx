'use client';

import React from 'react';

export interface PublicStudentProfile {
  id: string;
  name: string;
  avatar: string | null;
  college: string;
  degree: string;
  stream: string;
  streamCode: string;
  specialization: string;
  semester: number;
  year: number;
  cgpa?: number | null;
  bio: string | null;
  careerGoal: string;
  interests: string[];
  skills: {
    id: string;
    name: string;
    category: string;
    level: string;
    progress: number;
    verified: boolean;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    techStack: string;
    repoUrl: string;
    role: string;
  }[];
  connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  connectionId?: string;
  matchScore?: number;
  matchReasons?: string[];
}

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: PublicStudentProfile | null;
  onConnect: (studentId: string, note?: string) => Promise<void>;
  onRespond: (connectionId: string, action: 'ACCEPT' | 'REJECT') => Promise<void>;
  onRemove: (connectionId?: string, studentId?: string) => Promise<void>;
  isProcessing?: boolean;
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  student,
  onConnect,
  onRespond,
  onRemove,
  isProcessing = false,
}: StudentProfileModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-surface-container-low border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative h-28 bg-gradient-to-r from-primary/20 via-coral/15 to-surface-container border-b border-border/40 p-4 flex justify-end items-start">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container/80 hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center border border-border transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Profile Info Row with Floating Avatar */}
        <div className="px-6 pb-4 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-surface-container border-2 border-primary/40 overflow-hidden shadow-xl shrink-0 flex items-center justify-center">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-2xl font-bold text-primary">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-on-surface">
                    {student.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-primary/10 text-primary border border-primary/30 uppercase">
                    Sem {student.semester}
                  </span>
                </div>
                <p className="text-xs font-sans text-on-surface-variant">
                  {student.degree} in {student.stream}
                </p>
                <p className="text-[11px] font-sans text-on-surface-variant/80 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">school</span>
                  {student.college}
                </p>
              </div>
            </div>

            {/* Connection Action CTA */}
            <div className="shrink-0 flex items-center gap-2">
              {student.connectionStatus === 'NONE' && (
                <button
                  disabled={isProcessing}
                  onClick={() => onConnect(student.id)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-coral text-white font-sans text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Connect
                </button>
              )}

              {student.connectionStatus === 'PENDING_SENT' && (
                <button
                  disabled={isProcessing}
                  onClick={() => onRemove(student.connectionId, student.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-border text-on-surface-variant hover:text-coral hover:border-coral/40 font-sans text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Click to cancel request"
                >
                  <span className="material-symbols-outlined text-[15px] text-amber-500 animate-spin">
                    progress_activity
                  </span>
                  Pending (Cancel)
                </button>
              )}

              {student.connectionStatus === 'PENDING_RECEIVED' && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => student.connectionId && onRespond(student.connectionId, 'ACCEPT')}
                    className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-coral text-white font-sans text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Accept
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => student.connectionId && onRespond(student.connectionId, 'REJECT')}
                    className="px-3 py-1.5 rounded-xl bg-surface-container border border-border hover:bg-surface-container-high text-on-surface-variant font-sans text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              )}

              {student.connectionStatus === 'CONNECTED' && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    Connected
                  </span>
                  <button
                    disabled={isProcessing}
                    onClick={() => {
                      if (confirm(`Remove connection with ${student.name}?`)) {
                        onRemove(student.connectionId, student.id);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 border border-border text-on-surface-variant font-sans text-xs transition-colors cursor-pointer"
                    title="Remove connection"
                  >
                    <span className="material-symbols-outlined text-[15px]">person_remove</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Match Pill if suggestion */}
          {student.matchScore && student.matchScore > 0 && student.matchReasons && (
            <div className="mb-4 p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-sans text-[10px] font-bold">
                {Math.min(99, student.matchScore)}% Match
              </span>
              <span className="text-[11px] font-sans text-on-surface-variant">
                {student.matchReasons.join(' • ')}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="px-6 pb-6 overflow-y-auto space-y-6 flex-1">
          {/* Bio & Career Goal */}
          <div className="p-4 rounded-xl bg-surface-container border border-border/70 space-y-2.5">
            {student.bio && (
              <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                &ldquo;{student.bio}&rdquo;
              </p>
            )}
            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="text-on-surface-variant font-semibold">Career Focus:</span>
              <span className="text-primary font-bold">{student.careerGoal}</span>
            </div>
            {student.specialization && (
              <div className="flex items-center gap-2 text-xs font-sans">
                <span className="text-on-surface-variant font-semibold">Specialization:</span>
                <span className="text-on-surface font-medium">{student.specialization}</span>
              </div>
            )}
          </div>

          {/* Verified Skills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                Verified Skills & Competencies
              </h3>
              <span className="text-[10px] font-sans text-on-surface-variant">
                {student.skills.length} skills listed
              </span>
            </div>

            {student.skills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {student.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-2.5 rounded-lg bg-surface-container border border-border flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface truncate">
                        <span>{skill.name}</span>
                        {skill.verified && (
                          <span
                            className="material-symbols-outlined text-[13px] text-primary shrink-0"
                            title="Nivora Verified Skill"
                          >
                            verified
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-sans text-on-surface-variant capitalize">
                        {skill.category} • {skill.level}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-sans text-[11px] font-bold text-primary">
                        {skill.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/70 italic">No skills listed yet.</p>
            )}
          </div>

          {/* Academic & Open Source Projects */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">code</span>
                Featured Technical Projects
              </h3>
              <span className="text-[10px] font-sans text-on-surface-variant">
                {student.projects.length} projects
              </span>
            </div>

            {student.projects.length > 0 ? (
              <div className="space-y-2.5">
                {student.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl bg-surface-container border border-border space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-on-surface">
                        {proj.name}
                      </h4>
                      {proj.role && (
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-sans font-semibold shrink-0">
                          {proj.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {proj.techStack.split(',').map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-surface-container-lowest border border-border/60 text-[10px] font-mono text-on-surface-variant"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                      {proj.repoUrl && (
                        <a
                          href={`https://${proj.repoUrl.replace(/^https?:\/\//, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-sans text-primary hover:text-coral transition-colors font-bold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                          Repo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/70 italic">No public projects added yet.</p>
            )}
          </div>

          {/* Academic & Career Interests */}
          {student.interests && student.interests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-sans uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">interests</span>
                Areas of Interest
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {student.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-surface-container border border-border text-xs text-on-surface font-sans"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Notice Banner */}
          <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-[10px] font-sans text-on-surface-variant/80">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">verified_user</span>
            <span>Nivora Privacy Guard: Private contact info & academic transcripts are protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
