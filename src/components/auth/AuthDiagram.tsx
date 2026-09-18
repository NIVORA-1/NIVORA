'use client';

import React from 'react';

export type DiagramType = 'login' | 'forgot' | 'verify' | 'reset';

interface AuthDiagramProps {
  type: DiagramType;
}

export default function AuthDiagram({ type }: AuthDiagramProps) {
  if (type === 'login') {
    return (
      <div className="w-full max-w-[420px] rounded-2xl bg-[#111c21] border border-[#1e2f37] p-5 shadow-lg relative overflow-hidden select-none">
        <svg viewBox="0 0 400 240" className="w-full h-auto">
          {/* Radial connector lines */}
          <line x1="200" y1="120" x2="90" y2="60" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="120" x2="200" y2="45" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="120" x2="310" y2="65" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="120" x2="330" y2="135" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="120" x2="300" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="120" x2="210" y2="205" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="120" x2="115" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="120" x2="70" y2="135" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Satellite Nodes */}
          {/* Learn */}
          <g transform="translate(60, 48)">
            <rect width="60" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Learn</text>
          </g>

          {/* Plan */}
          <g transform="translate(173, 33)">
            <rect width="54" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Plan</text>
          </g>

          {/* Focus */}
          <g transform="translate(282, 53)">
            <rect width="58" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Focus</text>
          </g>

          {/* Projects */}
          <g transform="translate(42, 123)">
            <rect width="68" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Projects</text>
          </g>

          {/* Career */}
          <g transform="translate(305, 123)">
            <rect width="64" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Career</text>
          </g>

          {/* Skills */}
          <g transform="translate(86, 183)">
            <rect width="58" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Skills</text>
          </g>

          {/* AI */}
          <g transform="translate(186, 193)">
            <rect width="48" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">AI</text>
          </g>

          {/* Community */}
          <g transform="translate(262, 183)">
            <rect width="82" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Community</text>
          </g>

          {/* Center NIVORA CORE */}
          <g transform="translate(178, 100)">
            <rect width="44" height="40" rx="10" fill="#1a2d35" stroke="#36505c" strokeWidth="1.5" />
            <image href="/assets/nivora-logo.png" x="2" y="3" width="40" height="34" preserveAspectRatio="xMidYMid meet" />
          </g>
          <text x="200" y="156" fill="#8a938c" fontSize="8.5" letterSpacing="0.12em" textAnchor="middle" fontFamily="monospace" fontWeight="600">NIVORA CORE</text>
        </svg>
        <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#8a938c] font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8fc5a7]" />
          <span>Built around you.</span>
        </div>
      </div>
    );
  }

  if (type === 'forgot') {
    return (
      <div className="w-full max-w-[420px] rounded-2xl bg-[#111c21] border border-[#1e2f37] p-5 shadow-lg relative overflow-hidden select-none">
        <svg viewBox="0 0 400 240" className="w-full h-auto">
          {/* Radiating lines */}
          <line x1="200" y1="125" x2="110" y2="70" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="205" y2="60" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="305" y2="70" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="125" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="285" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Encrypted Vault */}
          <g transform="translate(62, 58)">
            <rect width="102" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Encrypted Vault</text>
          </g>

          {/* Secure Auth */}
          <g transform="translate(178, 48)">
            <rect width="86" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Secure Auth</text>
          </g>

          {/* Zero Friction */}
          <g transform="translate(276, 58)">
            <rect width="88" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Zero Friction</text>
          </g>

          {/* Academic ID */}
          <g transform="translate(85, 183)">
            <rect width="90" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Academic ID</text>
          </g>

          {/* Multi-factor Safety */}
          <g transform="translate(240, 183)">
            <rect width="120" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Multi-factor Safety</text>
          </g>

          {/* Center Lock node */}
          <g transform="translate(180, 105)">
            <rect width="40" height="40" rx="10" fill="#1a2d35" stroke="#36505c" strokeWidth="1.5" />
            {/* Lock icon */}
            <path d="M15 17 V14 A5 5 0 0 1 25 14 V17 M13 17 H27 V28 H13 Z" fill="none" stroke="#8fc5a7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="200" y="161" fill="#8a938c" fontSize="8.5" letterSpacing="0.12em" textAnchor="middle" fontFamily="monospace" fontWeight="600">NIVORA CORE</text>
        </svg>
        <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#8a938c] font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8fc5a7]" />
          <span>Secure student authentication • NIVORA Core</span>
        </div>
      </div>
    );
  }

  if (type === 'verify') {
    return (
      <div className="w-full max-w-[420px] rounded-2xl bg-[#111c21] border border-[#1e2f37] p-5 shadow-lg relative overflow-hidden select-none">
        <svg viewBox="0 0 400 240" className="w-full h-auto">
          {/* Connector lines */}
          <line x1="200" y1="125" x2="135" y2="65" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="280" y2="65" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="310" y2="135" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="275" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="145" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="200" y1="125" x2="105" y2="135" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Identity Vault */}
          <g transform="translate(86, 53)">
            <rect width="94" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Identity Vault</text>
          </g>

          {/* OTP Shield */}
          <g transform="translate(245, 53)">
            <rect width="82" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">OTP Shield</text>
          </g>

          {/* Single Session */}
          <g transform="translate(56, 123)">
            <rect width="94" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Single Session</text>
          </g>

          {/* Instant Sync */}
          <g transform="translate(270, 123)">
            <rect width="86" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Instant Sync</text>
          </g>

          {/* .EDU Verified */}
          <g transform="translate(105, 183)">
            <rect width="94" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">.EDU Verified</text>
          </g>

          {/* End-to-End */}
          <g transform="translate(235, 183)">
            <rect width="86" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
            <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">End-to-End</text>
          </g>

          {/* Center Envelope node */}
          <g transform="translate(180, 105)">
            <rect width="40" height="40" rx="10" fill="#1a2d35" stroke="#36505c" strokeWidth="1.5" />
            <path d="M12 15 L20 21 L28 15 M12 15 H28 V27 H12 Z" fill="none" stroke="#8fc5a7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="200" y="161" fill="#8a938c" fontSize="8.5" letterSpacing="0.12em" textAnchor="middle" fontFamily="monospace" fontWeight="600">NIVORA CORE</text>
        </svg>
        <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#8a938c] font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8fc5a7]" />
          <span>Encrypted one-time passcode • Valid for 10 minutes</span>
        </div>
      </div>
    );
  }

  // type === 'reset'
  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-[#111c21] border border-[#1e2f37] p-5 shadow-lg relative overflow-hidden select-none">
      <svg viewBox="0 0 400 240" className="w-full h-auto">
        {/* Connector lines */}
        <line x1="200" y1="125" x2="115" y2="65" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="125" x2="185" y2="60" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="125" x2="285" y2="65" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="125" x2="115" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="125" x2="190" y2="200" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="125" x2="280" y2="195" stroke="#253a44" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Argon2id Hash */}
        <g transform="translate(68, 53)">
          <rect width="96" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
          <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Argon2id Hash</text>
        </g>

        {/* Salted Secrets */}
        <g transform="translate(176, 48)">
          <rect width="94" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
          <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Salted Secrets</text>
        </g>

        {/* Revoke Old Sessions */}
        <g transform="translate(282, 53)">
          <rect width="84" height="34" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
          <circle cx="10" cy="17" r="2.5" fill="#8fc5a7" />
          <text x="18" y="15" fill="#c0c9c1" fontSize="9.5" fontFamily="sans-serif" fontWeight="500">Revoke Old</text>
          <text x="18" y="27" fill="#c0c9c1" fontSize="9.5" fontFamily="sans-serif" fontWeight="500">Sessions</text>
        </g>

        {/* 256-bit AES */}
        <g transform="translate(72, 183)">
          <rect width="92" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
          <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">256-bit AES</text>
        </g>

        {/* Workspace Sync */}
        <g transform="translate(176, 188)">
          <rect width="96" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
          <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Workspace Sync</text>
        </g>

        {/* Audit Trail */}
        <g transform="translate(284, 183)">
          <rect width="80" height="24" rx="12" fill="#17242a" stroke="#253a44" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.5" fill="#8fc5a7" />
          <text x="21" y="15" fill="#c0c9c1" fontSize="10.5" fontFamily="sans-serif" fontWeight="500">Audit Trail</text>
        </g>

        {/* Center Shield Lock node */}
        <g transform="translate(180, 105)">
          <rect width="40" height="40" rx="10" fill="#1a2d35" stroke="#36505c" strokeWidth="1.5" />
          <path d="M15 17 V14 A5 5 0 0 1 25 14 V17 M13 17 H27 V28 H13 Z" fill="none" stroke="#8fc5a7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="200" y="158" fill="#8a938c" fontSize="8" letterSpacing="0.1em" textAnchor="middle" fontFamily="monospace" fontWeight="700">ZERO-LEAK GUARD</text>
        <text x="200" y="168" fill="#586762" fontSize="7" letterSpacing="0.05em" textAnchor="middle" fontFamily="monospace">NIVORA Security Shield</text>
      </svg>
      <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#8a938c] font-sans">
        <svg className="w-3.5 h-3.5 text-[#8fc5a7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>All previous active web and mobile sessions will be safely logged out.</span>
      </div>
    </div>
  );
}
