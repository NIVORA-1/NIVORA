'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface StudyGroupItem {
  id: string;
  name: string;
  course: string;
  members: number;
  activity: string;
  nextMeeting: string;
  status: 'active' | 'open';
  topics: string[];
}

const INITIAL_GROUPS: StudyGroupItem[] = [
  {
    id: 'grp-1',
    name: 'Distributed Systems & Raft Consensus Squad',
    course: 'CS-305',
    members: 5,
    activity: 'Working on Jepsen Chaos Test Suite',
    nextMeeting: 'Today at 16:00 (Zoom)',
    status: 'active',
    topics: ['Go 1.22', 'Raft Protocol', 'Network Partitions', 'Jepsen'],
  },
  {
    id: 'grp-2',
    name: 'DBMS & Relational Query Optimization Circle',
    course: 'CS-301',
    members: 8,
    activity: 'Analyzing Bernstein 3NF synthesis proofs',
    nextMeeting: 'Tomorrow at 14:00 (Hall B)',
    status: 'open',
    topics: ['3NF Decomposition', 'B+ Trees', 'Lock Escalation'],
  },
  {
    id: 'grp-3',
    name: 'Algorithmic Practicum & LeetCode Hard Sprint',
    course: 'ALGO-201',
    members: 14,
    activity: 'Weekly contest problem set discussion',
    nextMeeting: 'Sunday at 18:00 (Discord/Meet)',
    status: 'open',
    topics: ['Dynamic Programming', 'Binary Lifting', 'Segment Trees'],
  },
];

export default function GroupsPage() {
  const { currentStream } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [groups, setGroups] = useState<StudyGroupItem[]>(INITIAL_GROUPS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCourse, setNewGroupCourse] = useState(streamData.defaultSubjects[0]?.code || 'CS-301');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: StudyGroupItem = {
      id: `grp-${Date.now()}`,
      name: newGroupName,
      course: newGroupCourse,
      members: 1,
      activity: 'Study group created just now',
      nextMeeting: 'TBD',
      status: 'open',
      topics: ['Peer Revision', 'Exam Prep'],
    };

    setGroups([newGroup, ...groups]);
    setNewGroupName('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-primary font-semibold">PEER COLLABORATIVES</span>
            <span>/</span>
            <span>STUDY SQUADS</span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
            Study Groups
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Coordinate with peer cohorts, schedule shared problem set drills, and sync project repositories.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-all font-button-text text-button-text font-semibold shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">group_add</span>
          <span>+ Create Study Group</span>
        </button>
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {groups.map((grp) => (
          <div
            key={grp.id}
            className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors"
          >
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                  {grp.course}
                </span>
                <span className="font-label-tag text-label-tag text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span>
                  {grp.members} Members
                </span>
              </div>

              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1">
                {grp.name}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {grp.activity}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {grp.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-tag text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between">
              <div className="font-label-mono-wide text-label-tag text-tertiary">
                {grp.nextMeeting}
              </div>

              <button
                onClick={() => alert(`Joined ${grp.name}!`)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-button-text text-button-text transition-colors"
              >
                Join Squad
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGroup}
            className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-space-lg space-y-space-md"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Create New Study Squad
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-xs">
              <label className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                Squad Name
              </label>
              <input
                type="text"
                required
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. OS Concurrency & Semaphores Circle"
                className="w-full px-space-md py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-space-xs">
              <label className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                Associated Course
              </label>
              <select
                value={newGroupCourse}
                onChange={(e) => setNewGroupCourse(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {streamData.defaultSubjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-space-xs pt-space-xs">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-button-text text-button-text font-semibold shadow-sm"
              >
                Create Squad
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
