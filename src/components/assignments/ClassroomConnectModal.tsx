'use client';

import React from 'react';

interface ClassroomConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  lastSyncedAt?: string | null;
  onDisconnect?: () => void;
}

export default function ClassroomConnectModal({
  isOpen,
  onClose,
  isConnected,
  lastSyncedAt,
  onDisconnect,
}: ClassroomConnectModalProps) {
  if (!isOpen) return null;

  const handleStartOAuth = () => {
    window.location.href = '/api/classroom/auth';
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-surface-container-low border border-outline-variant/40 p-6 sm:p-7 shadow-2xl space-y-5 my-auto text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface font-semibold text-base sm:text-lg">
                Google Classroom
              </h3>
              <p className="text-xs text-on-surface-variant font-label-mono-wide">
                Official API Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {isConnected ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Classroom Connected</span>
              </div>
              <p className="text-on-surface-variant">
                Your Google Classroom account is linked and synchronizing active coursework with NIVORA.
              </p>
              {lastSyncedAt && (
                <p className="text-[11px] text-on-surface-variant font-label-mono-wide">
                  Last synchronized: {new Date(lastSyncedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStartOAuth}
                className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Re-authenticate / Refresh Permissions</span>
              </button>

              {onDisconnect && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Disconnect Google Classroom? Previously imported assignments will remain in your account.')) {
                      onDisconnect();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-error/10 hover:bg-error/20 text-error font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">link_off</span>
                  <span>Disconnect Google Classroom</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-on-surface-variant leading-relaxed">
              Connect your institutional Google account to automatically import assignments, homework, and deadlines directly into your NIVORA workspace.
            </p>

            <div className="space-y-2.5 p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/30">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified_user</span>
                <div>
                  <h4 className="font-semibold text-on-surface">Strictly Read-Only Access</h4>
                  <p className="text-on-surface-variant text-[11px]">
                    We only request read permissions to view enrolled courses and published assignments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">lock</span>
                <div>
                  <h4 className="font-semibold text-on-surface">Tokens Encrypted at Rest</h4>
                  <p className="text-on-surface-variant text-[11px]">
                    OAuth tokens are securely encrypted using AES-256-GCM and never shared with other users.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">rule</span>
                <div>
                  <h4 className="font-semibold text-on-surface">No Unwanted Modifications</h4>
                  <p className="text-on-surface-variant text-[11px]">
                    We never submit work or modify your Classroom grades or course submissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartOAuth}
                className="w-full py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Continue to Google Authorization</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
