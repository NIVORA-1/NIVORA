'use client';

import React, { useState, useRef, useCallback } from 'react';
import { MusicCategory, Track, mapDbTrackToTrack } from '@/lib/musicData';
import { extractMetadataFromFile, ExtractedMetadata, inferCategory, validateAudioFile } from '@/lib/audioMetadata';
import { useMusic } from '@/context/MusicContext';
import MusicArtwork from './MusicArtwork';

interface BulkMusicImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTracks: Track[]) => void;
}

interface UploadStatus {
  state: 'waiting' | 'uploading' | 'uploaded' | 'failed';
  error?: string;
}

const ACCEPTED_TYPES = ['.mp3', '.wav', '.ogg', '.m4a', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'];

export default function BulkMusicImporterModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkMusicImporterModalProps) {
  const { allTracks, importTracks } = useMusic();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ExtractedMetadata[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [globalCategory, setGlobalCategory] = useState<MusicCategory>('focus');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<Record<number, UploadStatus>>({});
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    failedCount: number;
    skippedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal state
  const resetState = () => {
    setSelectedItems([]);
    setRawFiles([]);
    setUploadStatuses({});
    setUploadProgressPercent(0);
    setImportSummary(null);
    setIsUploading(false);
    setIsProcessingFiles(false);
  };

  const handleClose = () => {
    if (isUploading) {
      if (!window.confirm('Upload in progress. Are you sure you want to cancel?')) {
        return;
      }
    }
    resetState();
    onClose();
  };

  // Process selected files
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return (
        ACCEPTED_TYPES.includes(ext) ||
        file.type.startsWith('audio/') ||
        ACCEPTED_TYPES.includes(file.type)
      );
    });

    if (fileArray.length === 0) return;

    setIsProcessingFiles(true);
    const newExtracted: ExtractedMetadata[] = [];
    const validRawFiles: File[] = [];

    for (const file of fileArray) {
      try {
        const metadata = await extractMetadataFromFile(file);

        // Check if track already exists in Nivora library
        const isDuplicate = allTracks.some(
          (t) =>
            t.title.toLowerCase() === metadata.title.toLowerCase() ||
            (metadata.fileHash && (t as any).fileHash === metadata.fileHash) ||
            (metadata.fileName && (t as any).fileName === metadata.fileName)
        );

        metadata.isDuplicate = isDuplicate;
        metadata.duplicateResolution = 'skip';
        metadata.category = globalCategory;

        newExtracted.push(metadata);
        validRawFiles.push(file);
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }

    setSelectedItems((prev) => [...prev, ...newExtracted]);
    setRawFiles((prev) => [...prev, ...validRawFiles]);
    setIsProcessingFiles(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const removeItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
    setRawFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemCategory = (index: number, category: MusicCategory) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, category } : item))
    );
  };

  const updateItemTitle = (index: number, title: string) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, title } : item))
    );
  };

  const updateItemResolution = (index: number, resolution: 'skip' | 'replace' | 'keep') => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, duplicateResolution: resolution } : item))
    );
  };

  const applyGlobalCategory = (category: MusicCategory) => {
    setGlobalCategory(category);
    setSelectedItems((prev) => prev.map((item) => ({ ...item, category })));
  };

  const autoDetectAllCategories = () => {
    setSelectedItems((prev) =>
      prev.map((item) => ({
        ...item,
        category: inferCategory(item.genre, item.title, item.fileName),
      }))
    );
  };

  // Perform bulk upload with real-time per-file progress and retry support
  const handleStartImport = async (onlyFailed = false) => {
    if (selectedItems.length === 0) return;

    setIsUploading(true);
    setImportSummary(null);

    // Identify target items to process
    const targetIndices = selectedItems
      .map((_, idx) => idx)
      .filter((idx) => {
        const item = selectedItems[idx];
        if (item.isValid === false) return false;
        if (!onlyFailed) return true;
        return uploadStatuses[idx]?.state === 'failed';
      });

    if (targetIndices.length === 0) {
      setIsUploading(false);
      return;
    }

    // Set target items to waiting status initially
    setUploadStatuses((prev) => {
      const updated = { ...prev };
      targetIndices.forEach((idx) => {
        updated[idx] = { state: 'waiting' };
      });
      return updated;
    });

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const allImportedTracks: Track[] = [];

    for (let step = 0; step < targetIndices.length; step++) {
      const idx = targetIndices[step];
      const item = selectedItems[idx];
      const file = rawFiles[idx];

      // If duplicate and user chose skip
      if (item.isDuplicate && item.duplicateResolution === 'skip') {
        setUploadStatuses((prev) => ({
          ...prev,
          [idx]: { state: 'uploaded' },
        }));
        skippedCount++;
        setUploadProgressPercent(Math.round(((step + 1) / targetIndices.length) * 100));
        continue;
      }

      // Mark this file as actively uploading
      setUploadStatuses((prev) => ({
        ...prev,
        [idx]: { state: 'uploading' },
      }));

      try {
        const formData = new FormData();
        const singleMeta = {
          fileName: item.fileName,
          fileSize: item.fileSize,
          mimeType: item.mimeType,
          title: item.title,
          artist: item.artist,
          album: item.album,
          genre: item.genre,
          duration: item.duration,
          category: item.category,
          fileHash: item.fileHash,
          duplicateResolution: item.duplicateResolution || 'skip',
        };

        formData.append('metadata', JSON.stringify([singleMeta]));
        formData.append('file_0', file);
        if (item.artworkBlob) {
          formData.append('artwork_0', item.artworkBlob, `${item.fileName}-artwork.jpg`);
        }

        const response = await fetch('/api/music/tracks', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (data.importedTracks && data.importedTracks.length > 0) {
            const clientTracks: Track[] = data.importedTracks.map(mapDbTrackToTrack);
            allImportedTracks.push(...clientTracks);
            // Immediately add to music context state so it becomes instantly playable!
            importTracks(clientTracks);
            successCount++;
            setUploadStatuses((prev) => ({
              ...prev,
              [idx]: { state: 'uploaded' },
            }));
          } else if (data.skippedCount > 0) {
            skippedCount++;
            setUploadStatuses((prev) => ({
              ...prev,
              [idx]: { state: 'uploaded' },
            }));
          } else {
            throw new Error('Track was not imported');
          }
        } else {
          throw new Error(data.error || 'Server rejected track upload');
        }
      } catch (err: any) {
        console.error(`Error uploading ${item.fileName}:`, err);
        failedCount++;
        setUploadStatuses((prev) => ({
          ...prev,
          [idx]: { state: 'failed', error: err.message || 'Upload failed' },
        }));
      }

      setUploadProgressPercent(Math.round(((step + 1) / targetIndices.length) * 100));
    }

    setImportSummary({
      successCount,
      failedCount,
      skippedCount,
    });
    setIsUploading(false);

    if (allImportedTracks.length > 0 && onSuccess) {
      onSuccess(allImportedTracks);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-surface-container-low border border-outline-variant/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">library_music</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Bulk Music Importer
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Import local MP3, WAV, OGG, or M4A audio files into your Nivora Music Library.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dropzone Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[0.99]'
                : 'border-outline-variant/40 hover:border-primary/50 bg-surface-container/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".mp3,.wav,.ogg,.m4a,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-sm mb-3">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <h4 className="font-headline-sm text-sm font-bold text-on-surface">
              Drag & Drop Music Files Here
            </h4>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 max-w-sm">
              Supports <strong className="text-on-surface">MP3, WAV, OGG, M4A</strong>. Multiple file selection enabled.
            </p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-primary shadow-sm">
              Browse Files
            </div>
          </div>

          {/* Loading Extraction Indicator */}
          {isProcessingFiles && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs font-label-mono-wide text-primary">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              <span>Scanning audio metadata & waveforms...</span>
            </div>
          )}

          {/* Selected Files Preview & Category Bar */}
          {selectedItems.length > 0 && (
            <div className="space-y-4">
              {/* Batch Settings Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/30">
                <div className="flex items-center gap-2 font-body-sm text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">checklist</span>
                  <span>Selected Music — {selectedItems.length} tracks</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-label-tag">
                    <span>Category:</span>
                    <select
                      value={globalCategory}
                      onChange={(e) => applyGlobalCategory(e.target.value as MusicCategory)}
                      className="bg-surface-container-high border border-outline-variant/40 rounded-lg px-2 py-1 text-xs text-on-surface font-label-mono-wide uppercase focus:outline-none"
                    >
                      <option value="focus">Focus</option>
                      <option value="lofi">Lo-Fi</option>
                      <option value="ambient">Ambient</option>
                      <option value="classical">Classical</option>
                      <option value="nature">Nature</option>
                      <option value="binaural">Binaural</option>
                      <option value="campus">Campus</option>
                    </select>
                  </div>

                  <button
                    onClick={autoDetectAllCategories}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant border border-outline-variant/40 text-[11px] font-semibold text-on-surface flex items-center gap-1"
                    title="Auto-detect categories from file names and genres"
                  >
                    <span className="material-symbols-outlined text-[14px] text-primary">magic_button</span>
                    <span>Auto Detect</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar (Visible while uploading or completed) */}
              {(isUploading || importSummary) && (
                <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-label-mono-wide">
                    <span className="text-on-surface font-semibold">
                      {isUploading ? 'Importing music...' : 'Import complete'}
                    </span>
                    <span className="text-primary font-bold">
                      {importSummary
                        ? `${importSummary.successCount} / ${selectedItems.length} tracks`
                        : `${uploadProgressPercent}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgressPercent}%` }}
                    />
                  </div>
                  {importSummary && (
                    <div className="text-xs text-on-surface-variant flex items-center gap-4 pt-1">
                      <span className="text-primary font-bold">✓ {importSummary.successCount} imported</span>
                      {importSummary.skippedCount > 0 && (
                        <span className="text-secondary font-semibold">↷ {importSummary.skippedCount} skipped</span>
                      )}
                      {importSummary.failedCount > 0 && (
                        <span className="text-error font-bold">✕ {importSummary.failedCount} failed</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Track Item Cards */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedItems.map((item, idx) => {
                  const status = uploadStatuses[idx];
                  return (
                    <div
                      key={`${item.fileName}-${idx}`}
                      className="p-3 rounded-xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-3 transition-colors text-xs"
                    >
                      {/* Artwork thumbnail */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-outline-variant/40 bg-surface-container-high">
                        {item.artworkPreviewUrl ? (
                          <img
                            src={item.artworkPreviewUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MusicArtwork
                            alt={item.title}
                            category={item.category}
                            title={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info & Title edit */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 text-primary font-label-mono-wide text-[9px] uppercase font-bold shrink-0">
                            {item.fileExtension || 'AUDIO'}
                          </span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItemTitle(idx, e.target.value)}
                            disabled={isUploading || item.isValid === false}
                            className="bg-transparent font-bold text-on-surface border-b border-transparent hover:border-outline-variant/50 focus:border-primary focus:outline-none w-full truncate"
                          />
                          {item.isDuplicate && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-label-tag text-[9px] uppercase font-bold shrink-0">
                              Already in Nivora
                            </span>
                          )}
                          {item.isValid === false && (
                            <span className="px-1.5 py-0.5 rounded bg-error-container/20 border border-error/40 text-error font-label-tag text-[9px] uppercase font-bold shrink-0" title={item.validationError}>
                              Invalid File
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[10.5px] text-on-surface-variant font-label-mono-wide truncate">
                          <span className="truncate">{item.fileName}</span>
                          <span>•</span>
                          <span>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                          <span>•</span>
                          <span>{Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</span>
                          {item.artist && item.artist !== 'Nivora Sounds' && (
                            <>
                              <span>•</span>
                              <span className="truncate text-on-surface-variant/80">{item.artist}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Duplicate Resolution Options (if duplicate detected) */}
                      {item.isDuplicate && (
                        <div className="flex items-center gap-1 shrink-0">
                          {(['skip', 'replace', 'keep'] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => updateItemResolution(idx, choice)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-colors ${
                                item.duplicateResolution === choice
                                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                              }`}
                            >
                              {choice === 'keep' ? 'Keep Both' : choice === 'replace' ? 'Replace' : 'Skip'}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Category selector */}
                      <div className="shrink-0">
                        <select
                          value={item.category}
                          onChange={(e) => updateItemCategory(idx, e.target.value as MusicCategory)}
                          disabled={isUploading}
                          className="bg-surface-container border border-outline-variant/40 rounded-lg px-2 py-1 text-[11px] text-on-surface font-label-mono-wide uppercase focus:outline-none"
                        >
                          <option value="focus">Focus</option>
                          <option value="lofi">Lo-Fi</option>
                          <option value="ambient">Ambient</option>
                          <option value="classical">Classical</option>
                          <option value="nature">Nature</option>
                          <option value="binaural">Binaural</option>
                          <option value="campus">Campus</option>
                        </select>
                      </div>

                      {/* Upload status indicator */}
                      {status && (
                        <div className="shrink-0 w-20 text-right">
                          {status.state === 'waiting' && (
                            <span className="text-on-surface-variant/60 font-mono text-[10px]">○ Waiting</span>
                          )}
                          {status.state === 'uploading' && (
                            <span className="text-amber-400 font-mono text-[10px] flex items-center gap-1 justify-end">
                              <span className="material-symbols-outlined animate-spin text-[12px]">progress_activity</span>
                              <span>Uploading</span>
                            </span>
                          )}
                          {status.state === 'uploaded' && (
                            <span className="text-primary font-bold text-[10px]">✓ Uploaded</span>
                          )}
                          {status.state === 'failed' && (
                            <span className="text-error font-bold text-[10px]" title={status.error}>✕ Failed</span>
                          )}
                        </div>
                      )}

                      {/* Remove Button */}
                      {!isUploading && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-1 rounded text-on-surface-variant/70 hover:text-error transition-colors shrink-0"
                          title="Remove file"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-sm">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {importSummary ? 'Close' : 'Cancel'}
          </button>

          <div className="flex items-center gap-3">
            {importSummary && importSummary.failedCount > 0 && (
              <button
                onClick={() => handleStartImport(true)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-bold text-on-surface flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>Retry Failed</span>
              </button>
            )}

            {selectedItems.length > 0 && !importSummary && (
              <button
                onClick={() => handleStartImport(false)}
                disabled={isUploading}
                className={`px-5 py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-xs font-bold shadow-md hover:bg-primary-fixed flex items-center gap-2 transition-all ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">file_upload</span>
                    <span>Import {selectedItems.length} Track{selectedItems.length === 1 ? '' : 's'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
