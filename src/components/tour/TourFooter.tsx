'use client';

import React from 'react';
import Link from 'next/link';
import NivoraLogo from '@/components/ui/NivoraLogo';

export default function TourFooter() {
  return (
    <footer className="w-full bg-[#070F13] border-t border-[#29383D]/60 pt-16 pb-12 px-4 sm:px-8 text-[#A6ADA9]">
      <div className="max-w-7xl mx-auto">
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#29383D]/40">
          {/* Brand Info (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <NivoraLogo size="medium" href="/" />
            <p className="text-xs text-[#A6ADA9] max-w-sm leading-relaxed font-normal">
              A coherent student ecosystem for high-performing learners.
              <br />
              Built for those who build.
            </p>
          </div>

          {/* Navigation Links (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
            {/* Column 1: SYSTEM */}
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0E8] font-bold">
                SYSTEM
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/subjects" className="inline-block py-0.5">
                    Subjects
                  </Link>
                </li>
                <li>
                  <Link href="/planner" className="inline-block py-0.5">
                    Planner
                  </Link>
                </li>
                <li>
                  <Link href="/reboot" className="inline-block py-0.5">
                    Reboot
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: ACADEMICS */}
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0E8] font-bold">
                ACADEMICS
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/learning" className="inline-block py-0.5">
                    Learning Hub
                  </Link>
                </li>
                <li>
                  <Link href="/assignments" className="inline-block py-0.5">
                    Assignments
                  </Link>
                </li>
                <li>
                  <Link href="/exams" className="inline-block py-0.5">
                    Assessments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: GROWTH */}
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0E8] font-bold">
                GROWTH
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/skills" className="inline-block py-0.5">
                    Skills
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="inline-block py-0.5">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/career" className="inline-block py-0.5">
                    Career
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: COMMUNITY */}
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0E8] font-bold">
                COMMUNITY
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/connect" className="inline-block py-0.5">
                    Peer Lounges
                  </Link>
                </li>
                <li>
                  <Link href="/clubs-and-events" className="inline-block py-0.5">
                    Clubs &amp; Events
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom System Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#747F7B]">
          <div>
            &copy; 2026 NIVORA Ecosystem
          </div>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
