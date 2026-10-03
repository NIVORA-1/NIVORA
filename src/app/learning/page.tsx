'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import SubjectTopicWorkspace, {
  SubjectWorkspaceItem,
  ResourceItem,
} from '@/components/learning/SubjectTopicWorkspace';
import SavedResourcesView, {
  SavedResourceDetail,
} from '@/components/learning/SavedResourcesView';
import VideoPlayerModal from '@/components/learning/VideoPlayerModal';

type LearningMainTab = 'curriculum' | 'saved';

export default function LearningPage() {
  const { user, openAiWithContext } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<LearningMainTab>('curriculum');

  // Semester State (default to user profile semester or 1)
  const defaultSemester = user?.profile?.semester || 1;
  const [selectedSemester, setSelectedSemester] = useState<number>(defaultSemester);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  // Active Subject Drill-Down State
  const [activeSubject, setActiveSubject] = useState<SubjectWorkspaceItem | null>(null);
  const [initialTopicId, setInitialTopicId] = useState<string | undefined>(undefined);

  // Data State
  const [subjects, setSubjects] = useState<SubjectWorkspaceItem[]>([]);
  const [continueLearning, setContinueLearning] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [savedResources, setSavedResources] = useState<SavedResourceDetail[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Search Results
  const [searchResults, setSearchResults] = useState<{
    subjects: any[];
    topics: any[];
    resources: any[];
  } | null>(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Video Modal State
  const [activeVideo, setActiveVideo] = useState<{
    id: string;
    title: string;
    description?: string | null;
    url: string;
    channel?: string | null;
    duration?: string | null;
    subjectName?: string;
    topicTitle?: string | null;
  } | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Update semester when user profile loads
  useEffect(() => {
    if (user?.profile?.semester && selectedSemester === 1) {
      setSelectedSemester(user.profile.semester);
    }
  }, [user?.profile?.semester]);

  // Fetch Main Learning Workspace Data
  const fetchLearningData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        semester: selectedSemester.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (selectedTypeFilter !== 'ALL') {
        params.append('type', selectedTypeFilter);
      }

      const res = await fetch(`/api/learning?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
        setContinueLearning(data.continueLearning || []);
        setRecommendations(data.recommendations || []);
        setSavedCount(data.savedResourcesCount || 0);
        setSearchResults(data.searchResults || null);

        // If a subject is currently active, sync its updated topics/resources
        if (activeSubject) {
          const updatedActive = (data.subjects || []).find(
            (s: SubjectWorkspaceItem) => s.id === activeSubject.id
          );
          if (updatedActive) {
            setActiveSubject(updatedActive);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load learning data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, searchQuery, selectedTypeFilter, activeSubject?.id]);

  // Fetch Saved Resources
  const fetchSavedResources = useCallback(async () => {
    try {
      const res = await fetch('/api/learning/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedResources(data || []);
        setSavedCount(data.length);
      }
    } catch (err) {
      console.error('Failed to load saved resources:', err);
    }
  }, []);

  useEffect(() => {
    fetchLearningData();
  }, [fetchLearningData, refreshKey]);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedResources();
    }
  }, [activeTab, fetchSavedResources]);

  // Log study session activity
  const recordActivity = async (subjectId: string, topicId?: string, resourceId?: string) => {
    try {
      await fetch('/api/learning/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, topicId, resourceId }),
      });
    } catch (err) {
      console.error('Failed to log study session:', err);
    }
  };

  // Toggle Topic Completion
  const handleToggleCompleteTopic = async (topicId: string) => {
    try {
      const res = await fetch(`/api/learning/topics/${topicId}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        // Update subjects locally
        setSubjects((prev) =>
          prev.map((sub) => {
            const hasTopic = sub.topics.some((t) => t.id === topicId);
            if (!hasTopic) return sub;

            const updatedTopics = sub.topics.map((t) =>
              t.id === topicId ? { ...t, isCompleted: data.isCompleted } : t
            );
            return {
              ...sub,
              completedTopics: data.completedTopics,
              progressPercent: data.progressPercent,
              status: data.status,
              topics: updatedTopics,
            };
          })
        );

        if (activeSubject) {
          const hasTopic = activeSubject.topics.some((t) => t.id === topicId);
          if (hasTopic) {
            setActiveSubject((prev) =>
              prev
                ? {
                    ...prev,
                    completedTopics: data.completedTopics,
                    progressPercent: data.progressPercent,
                    status: data.status,
                    topics: prev.topics.map((t) =>
                      t.id === topicId ? { ...t, isCompleted: data.isCompleted } : t
                    ),
                  }
                : null
            );
          }
        }

        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error('Failed to toggle topic completion:', err);
    }
  };

  // Toggle Save Resource
  const handleToggleSaveResource = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/learning/resources/${resourceId}/save`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        // Update state in active subject
        if (activeSubject) {
          setActiveSubject((prev) =>
            prev
              ? {
                  ...prev,
                  resources: prev.resources.map((r) =>
                    r.id === resourceId ? { ...r, isSaved: data.isSaved } : r
                  ),
                }
              : null
          );
        }

        // Update subjects
        setSubjects((prev) =>
          prev.map((s) => ({
            ...s,
            resources: s.resources.map((r) =>
              r.id === resourceId ? { ...r, isSaved: data.isSaved } : r
            ),
          }))
        );

        // Update saved count
        setSavedCount((c) => (data.isSaved ? c + 1 : Math.max(0, c - 1)));

        // If in saved tab, update list
        if (activeTab === 'saved') {
          setSavedResources((prev) => prev.filter((r) => r.id !== resourceId));
        }
      }
    } catch (err) {
      console.error('Failed to toggle save resource:', err);
    }
  };

  // Open Video Player
  const handleOpenVideo = (resource: ResourceItem, topicTitle?: string) => {
    const parentSubject = subjects.find((s) => s.id === (resource as any).subjectId) || activeSubject;
    setActiveVideo({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      channel: resource.channel,
      duration: resource.duration,
      subjectName: parentSubject?.name,
      topicTitle,
    });
    setIsVideoModalOpen(true);
    if (parentSubject) {
      recordActivity(parentSubject.id, resource.topicId || undefined, resource.id);
    }
  };

  // Open External Resource / Documentation / PDF
  const handleOpenResource = (resource: ResourceItem, topicTitle?: string) => {
    const parentSubject = subjects.find((s) => s.id === (resource as any).subjectId) || activeSubject;
    if (parentSubject) {
      recordActivity(parentSubject.id, resource.topicId || undefined, resource.id);
    }
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  // Open Subject Workspace
  const handleOpenSubject = (subject: SubjectWorkspaceItem, topicId?: string) => {
    setActiveSubject(subject);
    setInitialTopicId(topicId);
    recordActivity(subject.id, topicId);
  };

  // Academic Profile Metadata
  const studentDegree = user?.profile?.degree || 'B.Tech';
  const studentStream = user?.profile?.streamCode || 'CSE';
  const totalCompletedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
  const totalSemesterTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-xl pb-space-4xl animate-in fade-in duration-200">
      {/* If drilling down into a Subject Workspace, render the dedicated workspace */}
      {activeSubject ? (
        <SubjectTopicWorkspace
          subject={activeSubject}
          initialTopicId={initialTopicId}
          onBack={() => {
            setActiveSubject(null);
            setInitialTopicId(undefined);
          }}
          onToggleCompleteTopic={handleToggleCompleteTopic}
          onToggleSaveResource={handleToggleSaveResource}
          onOpenVideo={handleOpenVideo}
          onOpenResource={handleOpenResource}
        />
      ) : (
        <>
          {/* Top Header Area */}
          <header className="relative pt-space-xs">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
              <div className="space-y-space-xs max-w-2xl">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-label-mono-wide text-label-mono-wide uppercase font-semibold">
                    {studentDegree} {studentStream} • Semester {selectedSemester}
                  </span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold">
                  Academic Learning Workspace
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant font-normal">
                  Curriculum subjects, syllabus topics, curated video lectures, and real mastery tracking.
                </p>
              </div>

              {/* Real Academic Telemetry Metric Bar */}
              <div className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-low shadow-sm flex-wrap border border-outline-variant/30">
                <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    task_alt
                  </span>
                  <div>
                    <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
                      {totalCompletedTopics} / {totalSemesterTopics}
                    </div>
                    <div className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
                      Topics Mastered
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-outline-variant/30 hidden sm:block" />

                <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    bookmarks
                  </span>
                  <div>
                    <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
                      {savedCount}
                    </div>
                    <div className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
                      Saved Resources
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-outline-variant/30 hidden sm:block" />

                <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">
                    menu_book
                  </span>
                  <div>
                    <div className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
                      {subjects.length}
                    </div>
                    <div className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
                      Active Subjects
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Navigation Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('curriculum');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline-sm text-body-sm font-semibold transition-all ${
                  activeTab === 'curriculum'
                    ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span>Semester Curriculum</span>
                <span className="font-label-mono-wide text-xs px-2 py-0.5 rounded-full bg-surface-container/60">
                  {subjects.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('saved');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline-sm text-body-sm font-semibold transition-all ${
                  activeTab === 'saved'
                    ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">bookmarks</span>
                <span>Saved Resources</span>
                <span className="font-label-mono-wide text-xs px-2 py-0.5 rounded-full bg-surface-container/60">
                  {savedCount}
                </span>
              </button>
            </div>

            {/* Semester Selector Pill */}
            {activeTab === 'curriculum' && (
              <div className="flex items-center gap-2">
                <span className="font-label-tag text-label-tag text-on-surface-variant uppercase font-medium">
                  Semester:
                </span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/30 overflow-x-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        selectedSemester === sem
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* TAB 1: CURRICULUM VIEW */}
          {/* ========================================================= */}
          {activeTab === 'curriculum' && (
            <div className="space-y-8">
              {/* Search & Resource Filter Bar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-lg">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search across subjects, topics, videos, and articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-x-auto shadow-xs">
                  {['ALL', 'video', 'article', 'pdf', 'documentation'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-body-xs font-semibold uppercase tracking-wider transition-colors ${
                        selectedTypeFilter.toLowerCase() === type.toLowerCase()
                          ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data-Driven Recommendations Section (Section 14) */}
              {recommendations.length > 0 && !searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface-container-low border border-primary/20 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            {rec.action === 'Resume' ? 'play_arrow' : 'tips_and_updates'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-headline-sm text-body-sm font-semibold text-on-surface">
                            {rec.title}
                          </h4>
                          <p className="text-body-xs text-on-surface-variant truncate max-w-xs sm:max-w-md">
                            {rec.subtitle}
                          </p>
                        </div>
                      </div>

                      {rec.subjectId && (
                        <button
                          onClick={() => {
                            const targetSubj = subjects.find((s) => s.id === rec.subjectId);
                            if (targetSubj) {
                              handleOpenSubject(targetSubj, rec.topicId);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-body-xs font-semibold shrink-0 transition-colors"
                        >
                          {rec.action} →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Continue Learning / Recently Studied (Section 9) */}
              {!searchQuery && continueLearning.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-body-md font-semibold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                      <span>Recently Studied</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {continueLearning.map((item) => (
                      <div
                        key={item.activityId}
                        onClick={() => {
                          const target = subjects.find((s) => s.id === item.subjectId);
                          if (target) {
                            handleOpenSubject(target, item.topicId || undefined);
                          }
                        }}
                        className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 transition-colors shadow-xs cursor-pointer flex items-center justify-between group"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <span className="font-label-mono-wide text-[10px] text-primary uppercase font-bold">
                            {item.subjectCode}
                          </span>
                          <h5 className="font-headline-sm text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                            {item.topicTitle || item.subjectName}
                          </h5>
                          <p className="text-[11px] text-on-surface-variant truncate">
                            {item.resourceTitle || item.subjectName}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0">
                          arrow_forward
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Global Search Results View (If query is active) */}
              {searchQuery && searchResults ? (
                <div className="space-y-6">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Search Results for &ldquo;{searchQuery}&rdquo;
                  </h3>

                  {/* Matching Topics */}
                  {searchResults.topics.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-label-mono-wide text-xs uppercase tracking-wider text-primary font-bold">
                        Matching Topics ({searchResults.topics.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.topics.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              const target = subjects.find((s) => s.id === t.subjectId);
                              if (target) handleOpenSubject(target, t.id);
                            }}
                            className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div>
                              <span className="font-label-mono-wide text-[10px] text-primary">
                                {t.subjectCode} • {t.unitName}
                              </span>
                              <h5 className="text-body-sm font-semibold text-on-surface group-hover:text-primary">
                                {t.title}
                              </h5>
                            </div>
                            <span className="material-symbols-outlined text-primary text-[18px]">
                              arrow_forward
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Resources */}
                  {searchResults.resources.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-label-mono-wide text-xs uppercase tracking-wider text-primary font-bold">
                        Matching Resources ({searchResults.resources.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {searchResults.resources.map((r) => (
                          <div
                            key={r.id}
                            className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2 flex flex-col justify-between"
                          >
                            <div>
                              <span className="font-label-mono-wide text-[10px] px-2 py-0.5 rounded bg-surface-container text-primary font-bold uppercase">
                                {r.type}
                              </span>
                              <h5 className="text-body-sm font-semibold text-on-surface pt-1 line-clamp-2">
                                {r.title}
                              </h5>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">
                                {r.subjectName}
                              </p>
                            </div>
                            <div className="flex justify-end pt-2 border-t border-outline-variant/20">
                              {r.type.toLowerCase() === 'video' ? (
                                <button
                                  onClick={() => handleOpenVideo(r)}
                                  className="px-3 py-1 rounded-lg bg-primary text-on-primary text-body-xs font-semibold"
                                >
                                  Watch Video
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenResource(r)}
                                  className="px-3 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-body-xs font-semibold transition-colors"
                                >
                                  Open Resource
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.topics.length === 0 && searchResults.resources.length === 0 && searchResults.subjects.length === 0 && (
                    <div className="p-12 rounded-xl bg-surface-container-low border border-outline-variant/20 text-center space-y-1">
                      <p className="text-body-md text-on-surface font-semibold">
                        No matches found for &ldquo;{searchQuery}&rdquo;.
                      </p>
                      <p className="text-body-xs text-on-surface-variant">
                        Try searching for concepts like &ldquo;linked list&rdquo;, &ldquo;normalization&rdquo;, &ldquo;matrix&rdquo;, or &ldquo;processes&rdquo;.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Main Semester Subjects Grid (Section 2) */}
              {!searchQuery && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        auto_stories
                      </span>
                      <span>Semester {selectedSemester} Subjects ({subjects.length})</span>
                    </h3>
                  </div>

                  {loading ? (
                    <div className="p-16 text-center text-body-md text-on-surface-variant">
                      Loading semester curriculum...
                    </div>
                  ) : subjects.length === 0 ? (
                    <div className="p-16 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">school</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Complete your academic profile to start learning.
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
                        No curriculum subjects configured for this semester yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                      {subjects.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => handleOpenSubject(sub)}
                          className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors group cursor-pointer"
                        >
                          <div className="space-y-space-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
                                {sub.code}
                              </span>
                              <span className="font-label-tag text-label-tag text-on-surface-variant">
                                {sub.credits} Credits
                              </span>
                            </div>

                            <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1 group-hover:text-primary transition-colors">
                              {sub.name}
                            </h4>

                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Instructor: {sub.instructor} • Room: {sub.room}
                            </p>

                            {/* Real Topic Progress Bar */}
                            <div className="space-y-1.5 pt-2">
                              <div className="flex items-center justify-between text-body-xs font-semibold">
                                <span className="text-on-surface-variant">Progress</span>
                                <span className="text-primary font-mono">{sub.status}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-300"
                                  style={{ width: `${sub.progressPercent}%` }}
                                />
                              </div>
                              <div className="flex justify-between font-label-tag text-[10px] text-on-surface-variant font-mono">
                                <span>{sub.completedTopics} of {sub.totalTopics} Topics</span>
                                <span>{sub.resources.length} Resources</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between">
                            <span className="text-body-xs font-semibold text-primary group-hover:underline">
                              Open Subject & Syllabus →
                            </span>
                            <span className="material-symbols-outlined text-primary text-[18px] group-hover:translate-x-0.5 transition-transform">
                              arrow_forward
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SAVED RESOURCES VAULT (Section 15) */}
          {/* ========================================================= */}
          {activeTab === 'saved' && (
            <SavedResourcesView
              savedResources={savedResources}
              onRemoveSaved={handleToggleSaveResource}
              onOpenVideo={handleOpenVideo}
              onOpenResource={handleOpenResource}
              onExploreSubjects={() => setActiveTab('curriculum')}
            />
          )}
        </>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setActiveVideo(null);
        }}
        video={activeVideo}
      />
    </div>
  );
}
