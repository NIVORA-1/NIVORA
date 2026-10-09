'use client';

import React, { useState } from 'react';
import { useScrollReveal } from '@/components/tour/useScrollReveal';

export default function FragmentationSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.12);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const painPoints = [
    {
      id: 'messaging',
      title: 'MESSAGING DISASTER',
      desc: 'WhatsApp group chats for team assignments losing critical files & deadlines in 500+ unread noise.',
      tag: 'DISPERSED',
      tagColor: 'text-coral bg-coral/10 border-coral/30',
      icon: 'chat_bubble',
      offsetClass: 'md:translate-x-0',
      preview: {
        eyebrow: 'COMMUNICATION DISASTER',
        title: 'Fragmented Team Messaging',
        desc: 'Chat apps mix social noise with academic deadlines, causing critical project files to get lost.',
        details: [
          'Problem: Crucial files drown in 500+ unread messages',
          'Nivora Fix: Dedicated syllabus-linked course channels',
          'Automated deadline extraction to Daily Planner',
        ],
      },
    },
    {
      id: 'pdf',
      title: 'PDF HELL',
      desc: 'Career opportunities buried in unread PDFs & dead institutional portals. Application deadline passed 2 days ago.',
      tag: 'MISSED',
      tagColor: 'text-deep-coral bg-deep-coral/10 border-deep-coral/30',
      icon: 'picture_as_pdf',
      offsetClass: 'md:translate-x-4 md:translate-y-2',
      preview: {
        eyebrow: 'OPPORTUNITY BOTTLENECK',
        title: 'Buried Placement Notices',
        desc: 'Opportunities are distributed via static PDF attachments that expire before students notice them.',
        details: [
          'Problem: Deadlines pass unnoticed in institutional inboxes',
          'Nivora Fix: Aggregated Recruiter Dossier feed',
          'Automatic calendar deadline synchronization',
        ],
      },
    },
    {
      id: 'portal',
      title: 'PORTAL CONFUSION',
      desc: 'College ERP broken on mobile. Attendance marks locked behind 2000s UX and CAPTCHA timeouts.',
      tag: 'BROKEN UX',
      tagColor: 'text-muted-sand bg-muted-sand/20 border-muted-sand/40',
      icon: 'desktop_access_disabled',
      offsetClass: 'md:-translate-x-2 md:translate-y-3',
      preview: {
        eyebrow: 'LEGACY ERP FRICTION',
        title: 'Broken Institutional UX',
        desc: 'University systems were built for administrators in 2005, not for fast mobile-first students.',
        details: [
          'Problem: CAPTCHA timeouts & desktop-only interfaces',
          'Nivora Fix: Modern responsive academic dashboard',
          'Live attendance thresholds & timetable alerts',
        ],
      },
    },
    {
      id: 'burnout',
      title: 'BURNOUT & ANXIETY',
      desc: 'Constant low-grade anxiety of something forgotten across 7 different open browser tabs and Google Drive folders.',
      tag: 'COGNITIVE DRAIN',
      tagColor: 'text-deep-coral bg-deep-coral/10 border-deep-coral/30',
      icon: 'warning',
      offsetClass: 'md:translate-x-6 md:translate-y-2',
      preview: {
        eyebrow: 'COGNITIVE BANDWIDTH DRAIN',
        title: 'Academic Fragmentation Stress',
        desc: 'Juggling dozens of detached tools causes decision fatigue and constant academic worry.',
        details: [
          'Problem: 7 open browser tabs create chronic background stress',
          'Nivora Fix: Intentional 3-item daily priority queue',
          'Integrated Reboot protocol to protect deep focus',
        ],
      },
    },
    {
      id: 'context',
      title: 'LOST CONTEXT',
      desc: 'Four years of projects and learning disappear into the void when your student email account expires.',
      tag: 'PERMANENT LOSS',
      tagColor: 'text-coral bg-coral/10 border-coral/30',
      icon: 'delete_sweep',
      offsetClass: 'md:col-span-2 md:max-w-xl md:mx-auto md:translate-y-4',
      preview: {
        eyebrow: 'GRADUATION VOID',
        title: 'Permanent Context Deletion',
        desc: 'Years of coursework, repos, and lab experiments disappear the day university emails expire.',
        details: [
          'Problem: 4 years of achievements evaporate after graduation',
          'Nivora Fix: Lifetime verifiable student record',
          'Cryptographically verified proof-of-work portfolio',
        ],
      },
    },
  ];

  return (
    <section
      ref={ref}
      id="fragmentation"
      className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-hidden"
    >
      {/* Background Subtle Atmospheric Filaments */}
      <svg
        data-frag-filaments
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 hidden md:block ${
          isVisible ? 'opacity-35' : 'opacity-0'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line x1="20%" y1="32%" x2="50%" y2="46%" stroke="#E85A4F" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="80%" y1="28%" x2="50%" y2="46%" stroke="#D8C3A5" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="28%" y1="68%" x2="50%" y2="52%" stroke="#E98074" strokeWidth="1" strokeDasharray="3 5" />
        <line x1="74%" y1="72%" x2="50%" y2="52%" stroke="#E85A4F" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="20%" cy="32%" r="2.5" fill="#E85A4F" />
        <circle cx="80%" cy="28%" r="2.5" fill="#D8C3A5" />
        <circle cx="28%" cy="68%" r="2.5" fill="#E98074" />
        <circle cx="74%" cy="72%" r="2.5" fill="#E85A4F" />
      </svg>

      {/* Header Label & Heading */}
      <div
        data-frag-heading
        className={`text-center space-y-3 mb-14 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="font-sans text-[11px] tracking-[0.2em] text-on-surface-variant uppercase font-bold">
          FROM DAY 01 — TO PLACEMENT
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-normal tracking-tight text-on-surface leading-[1.08]">
          College life is{' '}
          <span className="italic text-primary">
            fragmented.
          </span>
        </h2>
        <p className="mt-4 font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          Academic record portals. Departmental assignments in Google Classroom. Career portals buried in PDFs. Team chats spread across WhatsApp, Discord, Slack. None of it talks to each other.
        </p>
      </div>

      {/* Asymmetric Problem Cards Grid */}
      <div
        data-frag-cards-grid
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 pb-12 transition-all duration-700 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {painPoints.map((item, idx) => {
          const isExpanded = expandedCard === item.id;
          return (
            <div
              key={item.id}
              data-frag-card
              style={{ transitionDelay: `${idx * 60}ms` }}
              onClick={() => setExpandedCard(isExpanded ? null : item.id)}
              className={`group rounded-2xl bg-surface-container/90 backdrop-blur-sm border border-border/80 p-6 sm:p-7 shadow-sm w-full text-left cursor-pointer hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl transition-all duration-300 ${item.offsetClass} ${
                isExpanded ? 'border-primary ring-1 ring-primary/20 bg-surface-container-high' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border/80 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                  </div>
                  <span className="font-sans text-xs sm:text-sm font-bold tracking-wide text-on-surface">
                    {item.title}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-sans font-bold tracking-wider uppercase ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-sans font-normal">
                {item.desc}
              </p>

              {/* Expandable "Nivora Fix" Solution Reveal */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border/70 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-1.5 font-sans text-[10px] text-primary uppercase font-bold tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>HOW NIVORA RESOLVES THIS</span>
                  </div>
                  <ul className="space-y-1 text-xs text-on-surface-variant font-sans">
                    {item.preview.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tap to Toggle Prompt */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between font-sans text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                <span>{isExpanded ? 'TAP TO COLLAPSE' : 'TAP TO VIEW SOLUTION'}</span>
                <span className="material-symbols-outlined text-[14px] text-primary transition-transform group-hover:translate-x-0.5">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Punchline Quote */}
      <div
        data-frag-quote
        className={`text-center pt-8 border-t border-border/50 max-w-3xl mx-auto transition-all duration-700 delay-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="font-sans text-xs sm:text-sm tracking-[0.14em] text-on-surface-variant uppercase font-semibold">
          THE RESULT: 4 YEARS OF DISCONNECTED FRAGMENTS INSTEAD OF ONE COMPOUNDING ADVANTAGE.
        </p>
      </div>
    </section>
  );
}
