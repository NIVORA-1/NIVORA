'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export interface TopicItem {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  unitName: string;
  unitNumber: number;
  isCompleted: boolean;
}

export interface ResourceItem {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  url: string;
  thumbnailUrl?: string | null;
  channel?: string | null;
  duration?: string | null;
  fileSize?: string | null;
  author: string;
  topicId?: string | null;
  isSaved: boolean;
}

export interface SubjectWorkspaceItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  streamCode: string;
  instructor: string;
  room: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  status: string;
  topics: TopicItem[];
  resources: ResourceItem[];
}

interface SubjectTopicWorkspaceProps {
  subject: SubjectWorkspaceItem;
  initialTopicId?: string;
  onBack: () => void;
  onToggleCompleteTopic: (topicId: string) => Promise<void>;
  onToggleSaveResource: (resourceId: string) => Promise<void>;
  onOpenVideo: (resource: ResourceItem, topicTitle?: string) => void;
  onOpenResource: (resource: ResourceItem, topicTitle?: string) => void;
}

export default function SubjectTopicWorkspace({
  subject,
  initialTopicId,
  onBack,
  onToggleCompleteTopic,
  onToggleSaveResource,
  onOpenVideo,
  onOpenResource,
}: SubjectTopicWorkspaceProps) {
  const { openAiWithContext } = useApp();

  // Selected topic (default to first or initial)
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || (subject.topics[0]?.id || '')
  );

  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('ALL');

  const selectedTopic = subject.topics.find((t) => t.id === selectedTopicId) || subject.topics[0];

  // Filter resources for this topic or subject
  const topicResources = subject.resources.filter((res) => {
    // If resource is linked to a topic, show it when that topic is selected
    const matchesTopic = selectedTopic ? res.topicId === selectedTopic.id || !res.topicId : true;
    if (!matchesTopic) return false;

    if (resourceTypeFilter !== 'ALL') {
      return res.type.toLowerCase() === resourceTypeFilter.toLowerCase();
    }
    return true;
  });

  const handleAskAi = () => {
    openAiWithContext({
      subject: `${subject.code} - ${subject.name}`,
      topic: selectedTopic?.title,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1 text-body-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Subjects</span>
          </button>
          <span className="text-on-surface-variant/40">/</span>
          <span className="font-label-mono-wide text-label-tag text-primary uppercase font-bold">
            {subject.code}
          </span>
          <span className="text-on-surface-variant/40">/</span>
          <span className="text-body-sm font-semibold text-on-surface truncate max-w-[200px] sm:max-w-md">
            {subject.name}
          </span>
        </div>

        {/* Ask Nivora AI Context Button */}
        <button
          onClick={handleAskAi}
          className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-body-xs font-semibold transition-all flex items-center gap-2 shadow-xs group"
          title="Open AI Assist with this topic's context"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:rotate-12 transition-transform">
            smart_toy
          </span>
          <span>Ask Nivora AI about {selectedTopic ? selectedTopic.title.slice(0, 16) + '...' : subject.name}</span>
        </button>
      </div>

      {/* Subject Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-label-mono-wide text-xs px-2.5 py-0.5 rounded-md bg-surface-container text-primary font-bold">
              {subject.code}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              {subject.credits} Credits • Semester {subject.semester}
            </span>
            <span className="text-xs text-on-surface-variant font-mono hidden sm:inline">
              • Room: {subject.room}
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            {subject.name}
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Instructor: {subject.instructor}
          </p>
        </div>

        {/* Real Progress Counter */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 w-full md:w-64 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between text-body-xs font-semibold">
            <span className="text-on-surface-variant">Learning Mastery</span>
            <span className="text-primary font-mono">{subject.status}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${subject.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
            <span>{subject.completedTopics} of {subject.totalTopics} Topics Completed</span>
          </div>
        </div>
      </div>

      {/* Dual Column Layout: Topic List on Left, Resources on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics Syllabus (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline-sm text-body-md font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">format_list_bulleted</span>
              <span>Syllabus Topics ({subject.topics.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {subject.topics.map((t) => {
              const isSelected = selectedTopic?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTopicId(t.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-secondary-container/40 border-primary/50 shadow-sm'
                      : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-label-mono-wide text-[10px] text-primary uppercase font-bold">
                        {t.unitName} • Module {t.order}
                      </span>
                      <h4
                        className={`text-body-sm font-semibold transition-colors ${
                          isSelected ? 'text-primary font-bold' : 'text-on-surface'
                        }`}
                      >
                        {t.title}
                      </h4>
                    </div>

                    {/* Completion Checkmark */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompleteTopic(t.id);
                      }}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                        t.isCompleted
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                      }`}
                      title={t.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {t.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-on-surface-variant line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Topic Learning Resources (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Topic Detail Header Card */}
          {selectedTopic ? (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-mono-wide text-[11px] text-primary uppercase font-semibold">
                      {selectedTopic.unitName}
                    </span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Order #{selectedTopic.order}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-sm sm:text-headline-md text-on-surface font-bold pt-0.5">
                    {selectedTopic.title}
                  </h3>
                </div>

                {/* Mark as Complete Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleCompleteTopic(selectedTopic.id)}
                    className={`px-4 py-2 rounded-xl text-body-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
                      selectedTopic.isCompleted
                        ? 'bg-secondary-container text-on-secondary-container hover:bg-error-container hover:text-error'
                        : 'bg-primary text-on-primary hover:bg-primary-fixed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {selectedTopic.isCompleted ? 'check' : 'done'}
                    </span>
                    <span>{selectedTopic.isCompleted ? 'Completed ✓ (Undo)' : 'Mark as Complete'}</span>
                  </button>

                  <button
                    onClick={handleAskAi}
                    className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant/20 transition-colors"
                    title="Ask AI about this topic"
                  >
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </button>
                </div>
              </div>

              {selectedTopic.description && (
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {selectedTopic.description}
                </p>
              )}
            </div>
          ) : null}

          {/* Resources Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <h4 className="font-headline-sm text-body-md font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">auto_stories</span>
              <span>Curated Learning Resources ({topicResources.length})</span>
            </h4>

            {/* Type Filters */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant/20 overflow-x-auto">
              {['ALL', 'video', 'article', 'pdf', 'documentation'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setResourceTypeFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    resourceTypeFilter.toLowerCase() === filter.toLowerCase()
                      ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          {topicResources.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
                menu_book
              </span>
              <p className="text-body-sm text-on-surface font-medium">
                No learning resources available yet.
              </p>
              <p className="text-body-xs text-on-surface-variant">
                Resources for this specific topic will be published by faculty and student contributors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicResources.map((res) => {
                const isVideo = res.type.toLowerCase() === 'video';

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 transition-colors shadow-sm flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      {/* Video Thumbnail (if video) */}
                      {isVideo && res.thumbnailUrl && (
                        <div
                          onClick={() => onOpenVideo(res, selectedTopic?.title)}
                          className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/40 cursor-pointer group/thumb"
                        >
                          <img
                            src={res.thumbnailUrl}
                            alt={res.title}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-primary/90 text-on-primary flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-[24px]">play_arrow</span>
                            </div>
                          </div>
                          {res.duration && (
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                              {res.duration}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-body-xs">
                        <span className="font-label-mono-wide text-[10px] px-2 py-0.5 rounded bg-surface-container text-primary font-bold uppercase">
                          {res.type}
                        </span>
                        {res.channel && (
                          <span className="text-[11px] text-on-surface-variant font-medium">
                            {res.channel}
                          </span>
                        )}
                        {!res.channel && res.fileSize && (
                          <span className="text-[11px] text-on-surface-variant font-mono">
                            {res.fileSize}
                          </span>
                        )}
                      </div>

                      <h5 className="font-headline-sm text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {res.title}
                      </h5>

                      {res.description && (
                        <p className="text-body-xs text-on-surface-variant line-clamp-2">
                          {res.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2 text-body-xs">
                      <span className="text-[11px] text-on-surface-variant/80 truncate max-w-[120px]">
                        {res.author}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Save Button */}
                        <button
                          type="button"
                          onClick={() => onToggleSaveResource(res.id)}
                          className={`px-2.5 py-1 rounded-lg text-body-xs font-semibold transition-all flex items-center gap-1 ${
                            res.isSaved
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                          }`}
                          title={res.isSaved ? 'Remove from Saved' : 'Save Resource'}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {res.isSaved ? 'bookmark_added' : 'bookmark_add'}
                          </span>
                          <span>{res.isSaved ? 'Saved ✓' : 'Save'}</span>
                        </button>

                        {/* Watch / Open Button */}
                        {isVideo ? (
                          <button
                            type="button"
                            onClick={() => onOpenVideo(res, selectedTopic?.title)}
                            className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-body-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">play_circle</span>
                            <span>Watch</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenResource(res, selectedTopic?.title)}
                            className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-body-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>Open</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
