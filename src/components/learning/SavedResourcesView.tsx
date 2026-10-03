'use client';

import React from 'react';
import { ResourceItem } from './SubjectTopicWorkspace';

export interface SavedResourceDetail extends ResourceItem {
  subjectCode: string;
  subjectName: string;
  topicTitle?: string | null;
  savedAt: string;
}

interface SavedResourcesViewProps {
  savedResources: SavedResourceDetail[];
  onRemoveSaved: (resourceId: string) => Promise<void>;
  onOpenVideo: (resource: ResourceItem, topicTitle?: string) => void;
  onOpenResource: (resource: ResourceItem, topicTitle?: string) => void;
  onExploreSubjects: () => void;
}

export default function SavedResourcesView({
  savedResources,
  onRemoveSaved,
  onOpenVideo,
  onOpenResource,
  onExploreSubjects,
}: SavedResourcesViewProps) {
  if (savedResources.length === 0) {
    return (
      <div className="p-16 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[24px]">bookmark_border</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
          You haven&apos;t saved any resources yet.
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
          Bookmark helpful YouTube lectures, documentation links, and PDF study notes to access them quickly here.
        </p>
        <button
          onClick={onExploreSubjects}
          className="mt-2 px-5 py-2.5 rounded-xl text-body-sm font-semibold bg-primary text-on-primary hover:bg-primary-fixed transition-colors"
        >
          Explore Semester Subjects →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">bookmarks</span>
          <span>Saved Learning Vault ({savedResources.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedResources.map((res) => {
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
                    onClick={() => onOpenVideo(res, res.topicTitle || undefined)}
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
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {res.subjectCode}
                  </span>
                </div>

                <div>
                  <h4 className="font-headline-sm text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-primary font-medium mt-0.5 truncate">
                    {res.subjectName} {res.topicTitle ? `• ${res.topicTitle}` : ''}
                  </p>
                </div>

                {res.description && (
                  <p className="text-body-xs text-on-surface-variant line-clamp-2">
                    {res.description}
                  </p>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2 text-body-xs">
                <button
                  type="button"
                  onClick={() => onRemoveSaved(res.id)}
                  className="px-2.5 py-1 rounded-lg text-body-xs font-semibold bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  <span>Remove</span>
                </button>

                {isVideo ? (
                  <button
                    type="button"
                    onClick={() => onOpenVideo(res, res.topicTitle || undefined)}
                    className="px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed text-body-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                    <span>Watch</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenResource(res, res.topicTitle || undefined)}
                    className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-body-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Open</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
