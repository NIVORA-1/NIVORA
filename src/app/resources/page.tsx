'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface ResourceAsset {
  id: string;
  title: string;
  course: string;
  type: 'PYQ' | 'SLIDES' | 'CHEATSHEET' | 'LAB' | 'NOTES';
  format: string;
  size: string;
  downloads: number;
  starred: boolean;
  author: string;
  verified: boolean;
  summary: string;
}

const INITIAL_RESOURCES: ResourceAsset[] = [
  {
    id: 'res-1',
    title: 'CS-301 Mid-Term PYQ Papers (2020-2024) with Solved Rubrics',
    course: 'CS-301',
    type: 'PYQ',
    format: 'PDF',
    size: '8.4 MB',
    downloads: 342,
    starred: true,
    author: 'Prof. Dr. K. Sharma',
    verified: true,
    summary: 'Comprehensive past 5-year question solutions covering 3NF/BCNF minimal covers, B+ Tree node split algorithms, query execution trees, and lock-based concurrency schedules.',
  },
  {
    id: 'res-2',
    title: 'Bernstein 3NF Synthesis Algorithm & Extraneous Attribute Cheatsheet',
    course: 'CS-301',
    type: 'CHEATSHEET',
    format: 'PDF',
    size: '1.2 MB',
    downloads: 512,
    starred: true,
    author: 'Department of CSE',
    verified: true,
    summary: 'Step-by-step mathematical algorithm for computing canonical covers Fc, creating lossless join decompositions, and testing dependency preservation.',
  },
  {
    id: 'res-3',
    title: 'AVL Trees, Heaps & Red-Black Tree Rotation Blueprint',
    course: 'CS-302',
    type: 'NOTES',
    format: 'PDF',
    size: '3.6 MB',
    downloads: 289,
    starred: false,
    author: 'Prof. A. Bannerjee',
    verified: true,
    summary: 'Complete diagrammatic proofs for LL, RR, LR, and RL balance factor corrections with time complexity invariants.',
  },
  {
    id: 'res-4',
    title: 'POSIX Mutexes & Semaphores: Producer-Consumer Lab Manual',
    course: 'CS-303',
    type: 'LAB',
    format: 'ZIP',
    size: '2.1 MB',
    downloads: 198,
    starred: false,
    author: 'Systems Lab Staff',
    verified: true,
    summary: 'Tested C source code templates, circular buffer implementations, and Jepsen chaos verification tests.',
  },
  {
    id: 'res-5',
    title: 'VLSM Subnetting & CIDR Route Aggregation Lecture Deck',
    course: 'CS-304',
    type: 'SLIDES',
    format: 'PPTX',
    size: '14.8 MB',
    downloads: 165,
    starred: false,
    author: 'Prof. S. Sengupta',
    verified: true,
    summary: 'Annotated presentation slides explaining hierarchical addressing, supernetting, and border gateway protocol routing tables.',
  },
  {
    id: 'res-6',
    title: 'Raft Consensus Protocol & Invariants Quick Reference Guide',
    course: 'CS-305',
    type: 'CHEATSHEET',
    format: 'PDF',
    size: '1.8 MB',
    downloads: 420,
    starred: true,
    author: 'Stanford / Ongaro Reference',
    verified: true,
    summary: 'State transitions for Follower, Candidate, and Leader roles. Quorum vote logic, log matching property, and leader completeness theorem.',
  },
];

export default function ResourcesPage() {
  const { currentStream } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [resources, setResources] = useState<ResourceAsset[]>(INITIAL_RESOURCES);
  const [previewDoc, setPreviewDoc] = useState<ResourceAsset | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filter logic
  const filtered = resources.filter((item) => {
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;
    if (selectedSubject !== 'ALL' && item.course !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.course.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleStar = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, starred: !r.starred } : r))
    );
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Context & Header Architecture */}
      <header className="flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant/80">
            <span className="text-primary font-semibold">ACADEMIC CORE</span>
            <span>/</span>
            <span>LEARNING VAULT</span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline"></span>
            <span className="text-tertiary">SEMESTER 5 · FALL &apos;25</span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline"></span>
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              OFFLINE CACHED
            </span>
          </div>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => alert('Synced with campus OneDrive repository! All 284 files verified.')}
              className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-all font-button-text text-button-text border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">sync</span>
              <span>Sync Campus Drive</span>
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-all font-button-text text-button-text border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>+ Upload</span>
            </button>
            <button
              onClick={() => setSearchQuery('3NF Normalization')}
              className="flex items-center gap-space-2xs px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-all font-button-text text-button-text shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>AI Semantic Search</span>
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="max-w-3xl">
            <h1 className="font-display-quote text-display-hero italic tracking-tight text-on-surface leading-none mb-space-xs">
              Resource Vault
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant/90 font-light max-w-2xl">
              Curated academic repository of peer-reviewed lecture notes, professor slide decks, PYQ archives with rubrics, laboratory blueprints, and verified cheatsheets for {streamData.name}.
            </p>
          </div>

          <div className="flex items-center gap-space-sm self-start md:self-end">
            <div className="flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-mono-wide text-label-tag border border-outline-variant/20">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              <span>FACULTY AUTHENTICATED</span>
            </div>
            <div className="flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-wide text-label-tag border border-outline-variant/20">
              <span className="material-symbols-outlined text-[14px] text-tertiary">cloud_done</span>
              <span>1.4 GB LOCAL</span>
            </div>
          </div>
        </div>

        {/* 4-Column Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-xs">
          <div className="p-space-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1 transition-all hover:bg-surface-container">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-mono-wide text-label-tag uppercase tracking-wider">Total Repository</span>
              <span className="material-symbols-outlined text-[18px] text-primary">library_books</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">284</span>
              <span className="font-label-tag text-label-tag text-on-surface-variant">Indexed Assets</span>
            </div>
            <span className="font-label-mono-wide text-label-tag text-primary">100% Offline Ready</span>
          </div>

          <div className="p-space-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1 transition-all hover:bg-surface-container">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-mono-wide text-label-tag uppercase tracking-wider">PYQ Solutions</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">history_edu</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">46</span>
              <span className="font-label-tag text-label-tag text-on-surface-variant">Solved Papers</span>
            </div>
            <span className="font-label-mono-wide text-label-tag text-on-surface-variant/80">With Grading Rubrics</span>
          </div>

          <div className="p-space-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1 transition-all hover:bg-surface-container">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-mono-wide text-label-tag uppercase tracking-wider">Faculty Decks</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">slideshow</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">82</span>
              <span className="font-label-tag text-label-tag text-on-surface-variant">Annotated Decks</span>
            </div>
            <span className="font-label-mono-wide text-label-tag text-primary">3 New This Week</span>
          </div>

          <div className="p-space-card-padding rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1 transition-all hover:bg-surface-container">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-mono-wide text-label-tag uppercase tracking-wider">Quick Access</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">star</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                {resources.filter((r) => r.starred).length}
              </span>
              <span className="font-label-tag text-label-tag text-on-surface-variant">Starred Items</span>
            </div>
            <span className="font-label-mono-wide text-label-tag text-on-surface-variant/80">Filtered for Finals</span>
          </div>
        </div>
      </header>

      {/* Omnisearch & Multi-Faceted Filter Matrix */}
      <section className="flex flex-col gap-space-md p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20">
        <div className="relative flex items-center w-full">
          <div className="absolute left-space-md flex items-center pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across 284 papers, formula cheatsheets, lecture transcripts, and course codes (e.g. CS-301 BCNF, Red-Black Trees)..."
            className="w-full pl-12 pr-28 py-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary font-body-md text-body-md transition-all"
          />
          <div className="absolute right-space-sm flex items-center gap-space-2xs">
            <kbd className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag">⌘K</kbd>
          </div>
        </div>

        {/* Subject Filters */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-2xs">
            <span className="font-label-mono-wide text-label-tag text-on-surface-variant mr-1">SUBJECT:</span>
            <button
              onClick={() => setSelectedSubject('ALL')}
              className={`px-space-sm py-1 rounded-full font-label-tag text-label-tag transition-colors ${
                selectedSubject === 'ALL'
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Subjects
            </button>
            {streamData.defaultSubjects.map((sub) => (
              <button
                key={sub.code}
                onClick={() => setSelectedSubject(sub.code)}
                className={`px-space-sm py-1 rounded-full font-label-tag text-label-tag transition-colors ${
                  selectedSubject === sub.code
                    ? 'bg-secondary-container text-on-secondary-container font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {sub.code} {sub.name.slice(0, 15)}...
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'PYQ', 'CHEATSHEET', 'SLIDES', 'LAB', 'NOTES'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-lg text-label-tag font-label-mono-wide transition-colors ${
                  selectedType === t
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors"
          >
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                    {item.course}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-tag text-label-tag">
                    {item.type}
                  </span>
                </div>

                <button
                  onClick={() => toggleStar(item.id)}
                  className="text-on-surface-variant hover:text-tertiary transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      item.starred ? 'text-tertiary fill-current' : ''
                    }`}
                  >
                    {item.starred ? 'star' : 'star_border'}
                  </span>
                </button>
              </div>

              <h3
                onClick={() => setPreviewDoc(item)}
                className="font-headline-sm text-headline-sm text-on-surface font-semibold hover:text-primary transition-colors cursor-pointer pt-1 line-clamp-2"
              >
                {item.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                {item.summary}
              </p>
            </div>

            <div className="pt-space-sm border-t border-outline-variant/20 space-y-space-xs">
              <div className="flex items-center justify-between font-label-mono-wide text-label-tag text-on-surface-variant">
                <span>{item.author}</span>
                <span>{item.format} · {item.size}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setPreviewDoc(item)}
                  className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text transition-colors flex items-center gap-1 border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => alert(`Downloaded ${item.title} (${item.size}) for offline access.`)}
                  className="px-space-sm py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-button-text text-button-text transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PREVIEW DOCUMENT MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-3xl shadow-2xl p-space-lg space-y-space-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {previewDoc.title}
                  </h3>
                  <span className="font-label-mono-wide text-label-tag text-on-surface-variant">
                    {previewDoc.course} • {previewDoc.author} • {previewDoc.format} ({previewDoc.size})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <span className="font-label-mono-wide text-label-tag text-secondary uppercase font-semibold">
                DOCUMENT EXECUTIVE SUMMARY
              </span>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                {previewDoc.summary}
              </p>
            </div>

            {/* Document Render Simulation */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 font-mono text-body-sm text-primary space-y-2">
              <div className="text-on-surface-variant font-sans text-label-tag uppercase tracking-widest border-b border-outline-variant/20 pb-1">
                Verified Academic Extract
              </div>
              <p className="leading-relaxed">
                THEOREM: A relation schema R is in Boyce-Codd Normal Form (BCNF) with respect to a set of functional dependencies F if, for all functional dependencies in F+ of the form X -&gt; Y, where X is a subset of R and Y is a subset of R, at least one of the following holds:
                <br />
                1. X -&gt; Y is a trivial functional dependency (Y is a subset of X)
                <br />
                2. X is a superkey for R.
              </p>
            </div>

            <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/20">
              <div className="flex items-center gap-1 text-on-surface-variant font-label-tag text-label-tag">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>Cryptographically verified against syllabus standard</span>
              </div>

              <div className="flex items-center gap-space-xs">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Downloaded ${previewDoc.title}`);
                    setPreviewDoc(null);
                  }}
                  className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-button-text text-button-text font-semibold shadow-sm"
                >
                  Download Full PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Upload Academic Resource
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-space-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-primary/60 cursor-pointer transition-colors bg-surface-container">
              <span className="material-symbols-outlined text-[36px] text-primary">cloud_upload</span>
              <div className="font-headline-sm text-body-md text-on-surface">Drag & Drop files here</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Supports PDF, PPTX, DOCX, ZIP up to 50 MB
              </p>
            </div>

            <div className="flex justify-end gap-space-xs pt-space-xs">
              <button
                onClick={() => setIsUploadOpen(false)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Resource uploaded and queued for peer verification!');
                  setIsUploadOpen(false);
                }}
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-button-text text-button-text font-semibold shadow-sm"
              >
                Upload & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
