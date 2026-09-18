'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { getStreamConfig } from '@/lib/personalization';

export default function SubjectsPage() {
  const { currentStream } = useApp();
  const streamConfig = getStreamConfig(currentStream);

  const subjects = [
    {
      code: currentStream === 'BBA' ? 'BBA-301' : currentStream === 'MECH' ? 'ME-301' : currentStream === 'LAW' ? 'LAW-301' : 'CS-301',
      name: currentStream === 'BBA' ? 'Strategic Marketing & Brand Equity' : currentStream === 'MECH' ? 'Applied Thermodynamics & Heat Transfer' : currentStream === 'LAW' ? 'Constitutional Law of India II' : 'Database Management Systems (DBMS)',
      credits: '4.0 CREDITS',
      instructor: 'Dr. K. Sharma',
      room: 'Block C, Hall B-204',
      attendance: '84.6%',
      safeMisses: 6,
      grade: 'Grade A (88%)',
      modules: '17 / 25 Modules',
      percent: 68,
      nextSession: 'Tomorrow 10:00 AM',
    },
    {
      code: currentStream === 'BBA' ? 'BBA-302' : currentStream === 'MECH' ? 'ME-302' : currentStream === 'LAW' ? 'LAW-302' : 'CS-302',
      name: currentStream === 'BBA' ? 'Financial Modeling & DCF Valuation' : currentStream === 'MECH' ? 'Machine Design & Kinematics' : currentStream === 'LAW' ? 'Company Law & Corporate Governance' : 'Data Structures & Algorithms (DSA)',
      credits: '4.0 CREDITS',
      instructor: 'Prof. A. Bannerjee',
      room: 'Turing Lecture Hall 1',
      attendance: '89.2%',
      safeMisses: 8,
      grade: 'Grade A+ (94%)',
      modules: '22 / 30 Modules',
      percent: 73,
      nextSession: 'Thursday 02:00 PM',
    },
    {
      code: currentStream === 'BBA' ? 'BBA-303' : currentStream === 'MECH' ? 'ME-303' : currentStream === 'LAW' ? 'LAW-303' : 'CS-303',
      name: currentStream === 'BBA' ? 'Business Analytics & Decision Science' : currentStream === 'MECH' ? 'Finite Element Analysis (FEA)' : currentStream === 'LAW' ? 'Law of Evidence & Trial Procedure' : 'Operating Systems (OS)',
      credits: '4.0 CREDITS',
      instructor: 'Dr. V. Raman',
      room: 'Systems Lab 3',
      attendance: '82.0%',
      safeMisses: 4,
      grade: 'Grade A (86%)',
      modules: '14 / 24 Modules',
      percent: 58,
      nextSession: 'Wednesday 09:00 AM',
    },
    {
      code: currentStream === 'BBA' ? 'BBA-304' : currentStream === 'MECH' ? 'ME-304' : currentStream === 'LAW' ? 'LAW-304' : 'CS-304',
      name: currentStream === 'BBA' ? 'Organizational Behavior' : currentStream === 'MECH' ? 'Manufacturing Processes' : currentStream === 'LAW' ? 'Intellectual Property Rights' : 'Computer Networks (CN)',
      credits: '3.5 CREDITS',
      instructor: 'Prof. S. Sengupta',
      room: 'Hall B-102',
      attendance: '91.5%',
      safeMisses: 9,
      grade: 'Grade A+ (92%)',
      modules: '10 / 20 Modules',
      percent: 50,
      nextSession: 'Friday 11:30 AM',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto space-y-space-xl pb-space-4xl animate-in fade-in duration-200">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant uppercase">
            <span>Academic Core</span>
            <span>/</span>
            <span className="text-primary font-semibold">{streamConfig.code} Curriculum</span>
            <span>•</span>
            <span className="text-secondary">Semester 5</span>
          </div>
          <h1 className="font-display-quote text-display-hero text-on-surface tracking-tight font-normal italic">
            My Subjects
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Registered academic modules, faculty directives, attendance thresholds, and active learning tracks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-label-mono-wide text-primary">
            4 Core Modules Active
          </span>
        </div>
      </section>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {subjects.map((sub) => (
          <div
            key={sub.code}
            className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-space-lg flex flex-col justify-between shadow-md hover:border-outline-variant transition-all group"
          >
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-mono-wide text-label-mono-wide font-semibold tracking-wider">
                    {sub.code}
                  </span>
                  <span className="font-label-tag text-label-tag text-on-surface-variant">
                    {sub.credits}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium font-label-mono-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>{sub.grade}</span>
                </div>
              </div>

              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                  {sub.name}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
                  <span>{sub.instructor}</span>
                  <span>•</span>
                  <span>{sub.room}</span>
                </p>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 pt-space-xs font-label-tag text-label-tag text-on-surface-variant">
                <div className="p-2 rounded-lg bg-surface-container">
                  <span className="uppercase block text-on-surface-variant/70 text-[9px]">
                    Attendance
                  </span>
                  <span className="font-label-mono-wide text-xs text-on-surface font-semibold">
                    {sub.attendance}
                  </span>
                  <span className="text-secondary text-[10px] block">({sub.safeMisses} safe)</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container">
                  <span className="uppercase block text-on-surface-variant/70 text-[9px]">
                    Progress
                  </span>
                  <span className="font-label-mono-wide text-xs text-on-surface font-semibold">
                    {sub.percent}%
                  </span>
                  <span className="text-on-surface-variant text-[10px] block">{sub.modules}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container">
                  <span className="uppercase block text-on-surface-variant/70 text-[9px]">
                    Next Up
                  </span>
                  <span className="font-label-mono-wide text-xs text-primary font-semibold truncate block">
                    {sub.nextSession}
                  </span>
                </div>
              </div>

              {/* Progress Channel */}
              <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${sub.percent}%` }}
                />
              </div>
            </div>

            <div className="pt-space-md flex items-center justify-between border-t border-outline-variant/20 mt-space-md">
              <span className="font-label-tag text-xs text-on-surface-variant">
                Syllabus Verified
              </span>
              <Link
                href={`/subjects/${sub.code}`}
                className="flex items-center gap-1 font-button-text text-body-sm text-primary hover:text-primary-fixed group-hover:translate-x-1 transition-all font-semibold"
              >
                <span>Enter Workspace</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
