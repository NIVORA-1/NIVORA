'use client';

import React from 'react';
import Link from 'next/link';
import NivoraLogo from '@/components/ui/NivoraLogo';

export default function TourFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest pt-16 pb-12 px-4 sm:px-8 text-on-surface-variant">
      <div className="max-w-7xl mx-auto">
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-border/40">
          {/* Brand Info (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <NivoraLogo size="medium" href="/" />
            <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed font-normal">
              A coherent student ecosystem for high-performing learners.
              <br />
              Built for those who build.
            </p>
          </div>

          {/* Navigation Links (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
            {/* Column 1: SYSTEM */}
            <div className="space-y-3">
              <h4 className="font-sans text-[11px] uppercase tracking-wider text-on-surface font-bold">
                SYSTEM
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/subjects" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Subjects
                  </Link>
                </li>
                <li>
                  <Link href="/planner" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Planner
                  </Link>
                </li>
                <li>
                  <Link href="/reboot" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Reboot
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: ACADEMICS */}
            <div className="space-y-3">
              <h4 className="font-sans text-[11px] uppercase tracking-wider text-on-surface font-bold">
                ACADEMICS
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/learning" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Learning Hub
                  </Link>
                </li>
                <li>
                  <Link href="/assignments" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Assignments
                  </Link>
                </li>
                <li>
                  <Link href="/exams" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Assessments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: GROWTH */}
            <div className="space-y-3">
              <h4 className="font-sans text-[11px] uppercase tracking-wider text-on-surface font-bold">
                GROWTH
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/skills" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Skills
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/career" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Career
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: COMMUNITY */}
            <div className="space-y-3">
              <h4 className="font-sans text-[11px] uppercase tracking-wider text-on-surface font-bold">
                COMMUNITY
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/connect" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Peer Lounges
                  </Link>
                </li>
                <li>
                  <Link href="/clubs-and-events" className="inline-block py-0.5 hover:text-primary transition-colors">
                    Clubs &amp; Events
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom System Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-on-surface-variant font-medium">
          <div>
            &copy; 2026 NIVORA Ecosystem
          </div>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-on-surface transition-colors">Privacy</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-on-surface transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
