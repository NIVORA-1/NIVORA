'use client';

import React, { useState } from 'react';
import { IeeeCitationResult } from '@/lib/academicEngine';
import AiFallbackBanner from './AiFallbackBanner';

const SAMPLE_PAPERS = [
  {
    title: 'Attention Is All You Need',
    authors: 'A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin',
    venue: 'Advances in Neural Information Processing Systems (NeurIPS)',
    year: '2017',
    volume: '30',
    pages: '5998-6008',
    doi: '10.48550/arXiv.1706.03762',
    type: 'Conference Paper',
  },
  {
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'K. He, X. Zhang, S. Ren, and J. Sun',
    venue: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
    year: '2016',
    pages: '770-778',
    doi: '10.1109/CVPR.2016.90',
    type: 'Conference Paper',
  },
];

export default function IeeeCitationTool() {
  const [mode, setMode] = useState<'doi' | 'manual'>('doi');

  // DOI Lookup state
  const [doiInput, setDoiInput] = useState('10.1145/3318464.3389700');

  // Manual Fields
  const [title, setTitle] = useState(SAMPLE_PAPERS[0].title);
  const [authors, setAuthors] = useState(SAMPLE_PAPERS[0].authors);
  const [venue, setVenue] = useState(SAMPLE_PAPERS[0].venue);
  const [year, setYear] = useState(SAMPLE_PAPERS[0].year);
  const [volume, setVolume] = useState(SAMPLE_PAPERS[0].volume || '');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState(SAMPLE_PAPERS[0].pages);
  const [doi, setDoi] = useState(SAMPLE_PAPERS[0].doi);
  const [publicationType, setPublicationType] = useState('Conference Paper');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IeeeCitationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<'ieee' | 'bibtex' | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCopiedFormat(null);

    try {
      const payload =
        mode === 'doi'
          ? {
              tool: 'cite-ieee',
              mode: 'doi',
              doi: doiInput,
              url: doiInput.startsWith('http') ? doiInput : undefined,
            }
          : {
              tool: 'cite-ieee',
              mode: 'manual',
              title,
              authors,
              venue,
              year,
              volume,
              issue,
              pages,
              doi,
              publicationType,
            };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || 'Failed to generate IEEE citation');
      }

      setResult(json.data);

      // If in DOI mode, prefill manual fields from returned metadata for convenience
      if (mode === 'doi' && json.data.metadata) {
        const m = json.data.metadata;
        if (m.title) setTitle(m.title);
        if (m.authors) setAuthors(m.authors);
        if (m.venue) setVenue(m.venue);
        if (m.year) setYear(m.year);
        if (m.volume) setVolume(m.volume);
        if (m.issue) setIssue(m.issue);
        if (m.pages) setPages(m.pages);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while generating citation.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_PAPERS[0]) => {
    setTitle(sample.title);
    setAuthors(sample.authors);
    setVenue(sample.venue);
    setYear(sample.year);
    setVolume(sample.volume || '');
    setPages(sample.pages);
    setDoi(sample.doi);
    setPublicationType(sample.type);
    if (sample.doi) setDoiInput(sample.doi);
  };

  const handleCopy = (type: 'ieee' | 'bibtex') => {
    if (!result) return;
    const text = type === 'ieee' ? result.ieeeFormat : result.bibtex;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedFormat(type);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input Panel ── */}
      <form onSubmit={handleGenerate} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">format_quote</span>
            <h3 className="font-semibold text-on-surface text-base">IEEE Citation Generator</h3>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
            Official IEEE Reference Standards
          </span>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-2 p-1 bg-surface rounded-xl border border-outline-variant/30 w-fit">
          <button
            type="button"
            onClick={() => setMode('doi')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              mode === 'doi'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Digital DOI / URL Resolver
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              mode === 'manual'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Bibliographic Manual Form
          </button>
        </div>

        {/* Sample Paper Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-on-surface-variant/70">Load Academic Paper Template:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PAPERS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(s)}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* DOI Input Mode */}
        {mode === 'doi' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
              Digital Object Identifier (DOI) or Publication URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={doiInput}
                onChange={(e) => setDoiInput(e.target.value)}
                placeholder="e.g. 10.1145/3318464.3389700 or https://doi.org/..."
                className="flex-1 bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant/70">
              Queries the open Crossref scholarly metadata registry directly to extract exact authors, venue, volume, and pages.
            </p>
          </div>
        )}

        {/* Manual Form Mode */}
        {mode === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Paper / Publication Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Attention Is All You Need"
                className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Authors (Initials and Last Names)
                </label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="e.g. A. Vaswani, N. Shazeer, J. Uszkoreit"
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Publication Type
                </label>
                <select
                  value={publicationType}
                  onChange={(e) => setPublicationType(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="Conference Paper">Conference Proceedings</option>
                  <option value="Journal Article">Periodical / Journal Article</option>
                  <option value="Book Chapter">Book Chapter / Monograph</option>
                  <option value="Technical Report">Technical Report / Whitepaper</option>
                  <option value="Web Resource">Web / Online Standard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Journal / Conference / Publisher Name
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. IEEE Trans. Software Eng. or NeurIPS"
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2024"
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Volume (vol.)
                </label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Issue (no.)
                </label>
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  Pages (pp.)
                </label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 102-115"
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                  DOI / URL
                </label>
                <input
                  type="text"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="e.g. 10.1109/..."
                  className="w-full bg-surface border border-outline-variant/50 hover:border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="text-[11px] text-on-surface-variant/60">
            Generates standardized IEEE reference string, BibTeX for LaTeX, and validation report.
          </div>
          <button
            type="submit"
            disabled={isLoading || (mode === 'doi' && !doiInput.trim())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                <span>Querying Registry…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">format_quote</span>
                <span>Generate Citation</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Error Banner ── */}
      {error && (
        <AiFallbackBanner message={error} onRetry={handleGenerate} />
      )}

      {/* ── Result Panel ── */}
      {result && (
        <div className="rounded-2xl bg-surface-container border border-primary/20 shadow-md overflow-hidden space-y-0">
          {/* Header */}
          <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                <h4 className="font-semibold text-on-surface text-base">IEEE Citation Verified</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 uppercase">
                  {result.citationType}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">{result.validationNotes}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy('ieee')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-semibold text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedFormat === 'ieee' ? 'check' : 'content_copy'}
                </span>
                <span>{copiedFormat === 'ieee' ? 'Copied!' : 'Copy IEEE'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy('bibtex')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors text-xs font-semibold shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedFormat === 'bibtex' ? 'check' : 'code'}
                </span>
                <span>{copiedFormat === 'bibtex' ? 'Copied BibTeX!' : 'Copy BibTeX'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Formatted IEEE Citation Box */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                Standard IEEE Formatted Reference
              </div>
              <div className="p-4 rounded-xl bg-surface border border-outline-variant/30 font-serif text-sm sm:text-base text-on-surface leading-relaxed shadow-inner">
                {result.ieeeFormat}
              </div>
            </div>

            {/* BibTeX Entry */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-mono">
                <span>BibTeX Format (LaTeX / Overleaf)</span>
                <span className="text-primary font-mono lowercase">ready for .bib</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-outline-variant/30 bg-surface">
                <pre className="p-4 text-xs font-mono text-on-surface overflow-x-auto leading-relaxed">
                  <code>{result.bibtex}</code>
                </pre>
              </div>
            </div>

            {/* Missing Fields Audit */}
            {result.missingFields && result.missingFields.length > 0 ? (
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 space-y-2">
                <div className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
                  <span>Bibliographic Field Verification Report</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  To adhere to strict peer-reviewed publishing standards, note the following absent fields:
                </p>
                <ul className="space-y-1 text-xs text-on-surface-variant list-disc pl-4 leading-relaxed">
                  {result.missingFields.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Complete citation: All recommended IEEE bibliographic fields are present.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
