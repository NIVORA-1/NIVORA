'use client';

import React from 'react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    description?: string | null;
    url: string;
    channel?: string | null;
    duration?: string | null;
    subjectName?: string;
    topicTitle?: string | null;
  } | null;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  video,
}: VideoPlayerModalProps) {
  if (!isOpen || !video) return null;

  // Extract YouTube embed URL if applicable
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const id = new URL(url).searchParams.get('v');
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(video.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/20 bg-surface-container flex items-center justify-between gap-4">
          <div className="space-y-0.5 truncate pr-4">
            <div className="flex items-center gap-2">
              <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold border border-primary/20">
                Educational Video
              </span>
              {video.channel && (
                <span className="font-label-tag text-label-tag text-on-surface-variant font-medium">
                  {video.channel}
                </span>
              )}
            </div>
            <h3 className="font-headline-sm text-body-md sm:text-headline-sm text-on-surface font-semibold truncate pt-0.5">
              {video.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
            aria-label="Close video player"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-primary">play_circle</span>
              <p className="text-body-md text-on-surface">External Educational Resource</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text font-semibold hover:bg-primary-fixed transition-colors"
              >
                <span>Open Video in New Tab</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="p-4 sm:p-5 bg-surface-container-low border-t border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5 text-body-xs text-on-surface-variant">
            {video.subjectName && (
              <p className="font-medium text-on-surface">
                Subject: <span className="text-primary">{video.subjectName}</span>
                {video.topicTitle ? ` • Topic: ${video.topicTitle}` : ''}
              </p>
            )}
            {video.description && (
              <p className="line-clamp-2 max-w-2xl">{video.description}</p>
            )}
          </div>

          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg text-body-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Watch on YouTube</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
}
