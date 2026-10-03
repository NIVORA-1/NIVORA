'use client';

import React, { useState } from 'react';
import { MusicCategory, Track } from '@/lib/musicData';
import { validateAudioUrl, validateCoverUrl } from '@/lib/audioUrlValidator';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from './MusicArtwork';

interface BulkMusicImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTracks: Track[]) => void;
}

export default function BulkMusicImporterModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkMusicImporterModalProps) {
  const { importTracks, refreshLibrary } = useMusic();

  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single Track Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Nivora Sounds');
  const [album, setAlbum] = useState('Nivora Music');
  const [genre, setGenre] = useState('Focus');
  const [category, setCategory] = useState<MusicCategory>('focus');
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState('03:00');

  // Validation & Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Audio Testing / Preview State
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [audioTestStatus, setAudioTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [audioTestDetails, setAudioTestDetails] = useState('');

  // Batch Form State
  const [batchJson, setBatchJson] = useState('');
  const [batchResults, setBatchResults] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  // Real-time audio URL validation check
  const audioValidation = audioUrl.trim() ? validateAudioUrl(audioUrl.trim()) : null;
  const coverValidation = coverUrl.trim() ? validateCoverUrl(coverUrl.trim()) : null;

  // Test external audio URL in browser
  const handleTestAudioStream = () => {
    const cleanUrl = audioUrl.trim();
    const val = validateAudioUrl(cleanUrl);
    if (!val.isValid || !val.cleanUrl) {
      setAudioTestStatus('failed');
      setAudioTestDetails(val.error || 'Please enter a valid HTTPS audio URL first.');
      return;
    }

    setIsTestingAudio(true);
    setAudioTestStatus('testing');
    setAudioTestDetails('Verifying external stream...');

    const testAudio = new Audio();
    testAudio.preload = 'metadata';

    const timer = setTimeout(() => {
      testAudio.src = '';
      setIsTestingAudio(false);
      setAudioTestStatus('failed');
      setAudioTestDetails('Connection timed out. Check network or CORS permissions.');
    }, 9000);

    testAudio.onloadedmetadata = () => {
      clearTimeout(timer);
      setIsTestingAudio(false);
      setAudioTestStatus('success');
      if (testAudio.duration && !isNaN(testAudio.duration) && isFinite(testAudio.duration)) {
        const durSec = Math.round(testAudio.duration);
        const m = Math.floor(durSec / 60);
        const s = durSec % 60;
        setDuration(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        setAudioTestDetails(`Stream verified (${m}:${s.toString().padStart(2, '0')})`);
      } else {
        setAudioTestDetails('Stream verified and accessible');
      }
    };

    testAudio.onerror = () => {
      clearTimeout(timer);
      setIsTestingAudio(false);
      setAudioTestStatus('failed');
      setAudioTestDetails('Could not stream audio. Verify HTTPS URL and CORS headers.');
    };

    testAudio.src = val.cleanUrl;
  };

  // Submit Single Track Form
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanTitle = title.trim();
    const cleanAudioUrl = audioUrl.trim();
    const cleanCoverUrl = coverUrl.trim();

    if (!cleanTitle) {
      setErrorMessage('Track Title is required.');
      return;
    }

    const val = validateAudioUrl(cleanAudioUrl);
    if (!val.isValid || !val.cleanUrl) {
      setErrorMessage(val.error || 'Please provide a valid HTTPS audio URL.');
      return;
    }

    if (cleanCoverUrl) {
      const cVal = validateCoverUrl(cleanCoverUrl);
      if (!cVal.isValid) {
        setErrorMessage(cVal.error || 'Invalid cover image URL.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: cleanTitle,
        artist: artist.trim() || 'Nivora Sounds',
        album: album.trim() || 'Nivora Music',
        genre: genre.trim() || 'Focus',
        category,
        coverUrl: cleanCoverUrl || null,
        audioUrl: val.cleanUrl,
        duration,
      };

      const res = await fetch('/api/music/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save audio track.');
      }

      setSuccessMessage(`Successfully added "${cleanTitle}" to Nivora Music library!`);
      importTracks([data.track]);
      await refreshLibrary();
      if (onSuccess) onSuccess([data.track]);

      // Reset fields
      setTitle('');
      setAudioUrl('');
      setCoverUrl('');
      setAudioTestStatus('idle');
      setAudioTestDetails('');
    } catch (err: any) {
      console.error('Add track error:', err);
      setErrorMessage(err.message || 'Error saving track to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Batch JSON Import
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setBatchResults(null);

    if (!batchJson.trim()) {
      setErrorMessage('Please paste a JSON array of tracks.');
      return;
    }

    let parsedList: any[];
    try {
      parsedList = JSON.parse(batchJson);
      if (!Array.isArray(parsedList)) {
        throw new Error('Payload must be a JSON array of track objects.');
      }
    } catch (parseErr: any) {
      setErrorMessage(`Invalid JSON format: ${parseErr.message}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/music/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedList),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Batch import failed.');
      }

      setBatchResults({
        imported: data.createdCount || data.tracks?.length || 0,
        failed: data.errors?.length || 0,
        errors: (data.errors || []).map((err: any) => `${err.title || 'Track'}: ${err.error}`),
      });

      if (data.tracks && data.tracks.length > 0) {
        importTracks(data.tracks);
        await refreshLibrary();
        if (onSuccess) onSuccess(data.tracks);
      }

      setSuccessMessage(`Batch import complete: ${data.createdCount} track(s) added!`);
      setBatchJson('');
    } catch (err: any) {
      console.error('Batch import error:', err);
      setErrorMessage(err.message || 'Failed to import tracks.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-surface-container rounded-2xl border border-outline-variant/40 shadow-2xl overflow-hidden text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[24px]">
              music_note
            </span>
            <div>
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                Add External Audio Track
              </h2>
              <p className="font-body-sm text-[11px] text-on-surface-variant">
                Configure external HTTPS audio streams without storing audio files in repository
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
            title="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-outline-variant/20 px-6 pt-3 bg-surface-container-low shrink-0 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`pb-2.5 text-xs font-bold font-label-tag transition-colors border-b-2 cursor-pointer ${
              activeTab === 'single'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Single Track URL Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`pb-2.5 text-xs font-bold font-label-tag transition-colors border-b-2 cursor-pointer ${
              activeTab === 'batch'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Batch JSON Import
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-error-container/20 border border-error/40 text-on-surface flex items-start gap-2.5 text-xs animate-in fade-in">
              <span className="material-symbols-outlined text-error text-[18px] shrink-0">error</span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/40 text-on-surface flex items-start gap-2.5 text-xs animate-in fade-in">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {activeTab === 'single' ? (
            <form id="single-track-form" onSubmit={handleSingleSubmit} className="space-y-4">
              {/* Row 1: Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Track Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Synthetic Horizons"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Nivora Sounds"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Album & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Album</label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="e.g. Focus Sessions Vol. 1"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g. Lo-Fi / Ambient"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MusicCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="focus">Focus Flow</option>
                    <option value="lofi">Lo-Fi Study</option>
                    <option value="ambient">Ambient Soundscape</option>
                    <option value="classical">Classical Piano/Strings</option>
                    <option value="nature">Nature Acoustics</option>
                    <option value="binaural">Binaural Beat</option>
                    <option value="campus">Campus Atmosphere</option>
                  </select>
                </div>
              </div>

              {/* Audio URL Field (STEP 6 REQUIRED) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-on-surface">
                    Audio URL (HTTPS) <span className="text-primary">*</span>
                  </label>
                  <button
                    type="button"
                    disabled={isTestingAudio || !audioUrl.trim()}
                    onClick={handleTestAudioStream}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isTestingAudio ? 'refresh' : 'play_circle'}
                    </span>
                    <span>{isTestingAudio ? 'Testing Stream...' : 'Test Stream URL'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    required
                    value={audioUrl}
                    onChange={(e) => {
                      setAudioUrl(e.target.value);
                      setAudioTestStatus('idle');
                      setAudioTestDetails('');
                    }}
                    placeholder="https://upload.wikimedia.org/.../track.mp3 or https://archive.org/.../stream.mp3"
                    className={`w-full px-3 py-2.5 rounded-xl bg-surface-container-highest border text-xs text-on-surface font-label-mono-wide focus:outline-none transition-colors ${
                      audioValidation && !audioValidation.isValid
                        ? 'border-error'
                        : audioValidation && audioValidation.isValid
                        ? 'border-emerald-500/80'
                        : 'border-outline-variant/30 focus:border-primary'
                    }`}
                  />
                  {audioValidation && (
                    <div className="absolute right-3 top-2.5 flex items-center">
                      {audioValidation.isValid ? (
                        <span className="material-symbols-outlined text-[18px] text-emerald-400" title="Valid HTTPS URL">
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-error" title={audioValidation.error}>
                          error
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation Message or Test Feedback */}
                {audioValidation && !audioValidation.isValid && (
                  <p className="text-[11px] text-error mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    <span>{audioValidation.error}</span>
                  </p>
                )}

                {audioTestDetails && (
                  <p
                    className={`text-[11px] mt-1 flex items-center gap-1 font-medium ${
                      audioTestStatus === 'success'
                        ? 'text-emerald-400'
                        : audioTestStatus === 'failed'
                        ? 'text-error'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {audioTestStatus === 'success' ? 'check' : 'warning'}
                    </span>
                    <span>{audioTestDetails}</span>
                  </p>
                )}

                <p className="text-[10px] text-on-surface-variant mt-1">
                  Only legally permissible external HTTPS audio URLs (e.g. Wikimedia Commons, Archive.org, CC-BY streams).
                </p>
              </div>

              {/* Cover URL & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Cover Image URL (HTTPS Optional)
                  </label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or leave blank for category visualizer"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  {coverValidation && !coverValidation.isValid && (
                    <p className="text-[11px] text-error mt-1">{coverValidation.error}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Duration (mm:ss or secs)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="03:00"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30 shadow-sm">
                  <MusicArtwork
                    src={coverUrl.trim()}
                    alt={title || 'Track Preview'}
                    category={category}
                    title={title || 'Track Preview'}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-on-surface truncate">
                    {title.trim() || 'Track Title Preview'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate">
                    {artist.trim()} • {category.toUpperCase()} • {duration}
                  </div>
                  <div className="text-[10px] text-primary truncate font-label-mono-wide">
                    {audioUrl.trim() || 'No audio URL specified'}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Batch JSON Import Mode */
            <form id="batch-track-form" onSubmit={handleBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Paste JSON Array of Music Tracks
                </label>
                <textarea
                  rows={8}
                  value={batchJson}
                  onChange={(e) => setBatchJson(e.target.value)}
                  placeholder={`[
  {
    "title": "Acoustic Horizon",
    "artist": "Nivora Sounds",
    "audioUrl": "https://upload.wikimedia.org/.../track1.mp3",
    "coverUrl": "https://images.unsplash.com/...",
    "category": "focus",
    "duration": 210
  }
]`}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/30 text-xs text-on-surface font-label-mono-wide focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {batchResults && (
                <div className="p-3 rounded-xl bg-surface-container-highest border border-outline-variant/30 space-y-1.5 text-xs">
                  <div className="font-bold text-on-surface flex items-center justify-between">
                    <span>Import Summary</span>
                    <span className="text-emerald-400">{batchResults.imported} Added</span>
                  </div>
                  {batchResults.failed > 0 && (
                    <div className="text-error space-y-0.5">
                      <div className="font-semibold">{batchResults.failed} Failed / Invalid:</div>
                      {batchResults.errors.slice(0, 3).map((err, i) => (
                        <div key={i} className="text-[11px] text-error/90 truncate">• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-outline-variant/20 bg-surface-container-low shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form={activeTab === 'single' ? 'single-track-form' : 'batch-track-form'}
            disabled={isSubmitting || (activeTab === 'single' && !title.trim())}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-fixed disabled:opacity-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{activeTab === 'single' ? 'Save Track' : 'Import All Tracks'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
