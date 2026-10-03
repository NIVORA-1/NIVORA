'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useMusic } from '@/context/MusicContext';
import NivoraMascot from './NivoraMascot';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'init-welcome',
  role: 'assistant',
  content: `Hey! 👋 I'm your Nivora AI companion.\n\nHow can I help you today? Ask me any question, explore a tough concept, plan your study routine, or just talk things through.`,
  time: 'Now',
};

const QUICK_STARTERS = [
  { label: 'Explain recursion', prompt: 'Explain recursion to me with a simple intuition' },
  { label: 'What is a linked list?', prompt: 'What is a linked list and when should I use one?' },
  { label: 'Help me plan my evening', prompt: 'Help me plan a productive 2-hour evening study session' },
  { label: 'I need motivation', prompt: 'I am feeling overwhelmed with coursework and need some motivation' },
];

/**
 * Nivora AI Assist — Floating Mascot & Quick Chat Popup
 *
 * Replaces the static header button with a floating digital companion at the bottom-right.
 * Clicking the mascot opens the quick conversational chat popup.
 * Intelligently offsets its position if the music dock or mini player is active.
 */
export default function AiAssistModal() {
  const { isAiAssistOpen, setIsAiAssistOpen, user, aiAssistContext, setAiAssistContext } = useApp();
  const { showMiniPlayer, enableMusicPlayer, hasEverPlayed } = useMusic();
  const pathname = usePathname();

  const isMusicPage = pathname?.startsWith('/music');
  // Intelligently detect if any floating music player controls are visible on screen
  const isMiniPlayerActive = !isMusicPage && showMiniPlayer && enableMusicPlayer && hasEverPlayed;
  const isBottomPlayerActive = isMusicPage || isMiniPlayerActive;

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-fill input when opened with learning context
  useEffect(() => {
    if (aiAssistContext && isAiAssistOpen) {
      if (aiAssistContext.topic) {
        setInput(`Can you explain ${aiAssistContext.topic} in ${aiAssistContext.subject || 'this subject'} with concepts and real examples?`);
      } else if (aiAssistContext.subject) {
        setInput(`What are the key concepts and study advice for ${aiAssistContext.subject}?`);
      }
    }
  }, [aiAssistContext, isAiAssistOpen]);

  // Focus input when popup opens
  useEffect(() => {
    if (isAiAssistOpen && !isMinimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isAiAssistOpen, isMinimized]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isAiAssistOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isAiAssistOpen, isMinimized]);

  // ESC to close popup
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAiAssistOpen) {
        setIsAiAssistOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAiAssistOpen, setIsAiAssistOpen]);

  // Close when clicking outside of the popup and mascot trigger
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isAiAssistOpen &&
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('[data-mascot-trigger="true"]')
      ) {
        setIsAiAssistOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAiAssistOpen, setIsAiAssistOpen]);

  const handleToggle = () => {
    setIsAiAssistOpen(!isAiAssistOpen);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const handleClose = () => {
    setIsAiAssistOpen(false);
    setIsMinimized(false);
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          pathname,
          context: aiAssistContext,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Let me know if you would like me to unpack that further!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I ran into a connection glitch. Please try asking again in a moment.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  };

  // Determine dynamic bottom offset to avoid overlapping music player or mobile navigation
  // Desktop: default bottom-6 (24px) or bottom-24 (96px) when music dock/mini player is active
  const mascotBottomClass = isBottomPlayerActive
    ? 'bottom-20 sm:bottom-24'
    : 'bottom-5 sm:bottom-7';

  const popupBottomClass = isBottomPlayerActive
    ? 'bottom-[148px] sm:bottom-[164px]'
    : 'bottom-[80px] sm:bottom-[94px]';

  return (
    <>
      {/* ── FLOATING CHAT POPUP ── */}
      {isAiAssistOpen && (
        <div
          ref={popupRef}
          role="dialog"
          aria-label="Nivora AI Assist Chat"
          className={`fixed right-4 sm:right-7 z-45 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[420px] rounded-2xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${popupBottomClass} ${
            isMinimized ? 'h-14' : 'h-[560px] max-h-[75vh] sm:max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-outline-variant/30 bg-surface-container/90 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mascot Mini Avatar */}
              <div className="w-8 h-8 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-xs">
                <img
                  src="/nivora-companion.webp"
                  alt="Nivora AI"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-on-surface leading-none truncate">
                    Nivora AI
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-deep-coral/15 text-deep-coral font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
                    Companion
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant font-medium mt-0.5 truncate">
                  How can I help?
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Minimize / Restore */}
              <button
                type="button"
                onClick={() => setIsMinimized((v) => !v)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isMinimized ? 'expand_less' : 'remove'}
                </span>
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-deep-coral hover:bg-error-container/20 transition-colors cursor-pointer"
                aria-label="Close AI Assist"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Body (Messages & Input) */}
          {!isMinimized && (
            <>
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 selection:bg-coral/20">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-6 h-6 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center p-0.5 shrink-0 mt-0.5 shadow-2xs">
                          <img
                            src="/nivora-companion.webp"
                            alt="AI"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[84%] whitespace-pre-wrap ${
                          isUser
                            ? 'bg-deep-coral text-white rounded-tr-xs shadow-xs'
                            : 'bg-surface-container border border-outline-variant/25 text-on-surface rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {isUser && (
                        <div className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-outline-variant/30">
                          {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Quick Prompts on initial conversation */}
                {messages.length === 1 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-semibold px-0.5">
                      Suggestions to get started
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {QUICK_STARTERS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleSend(item.prompt)}
                          disabled={isLoading}
                          className="text-left px-3 py-2 rounded-xl bg-surface-container/70 border border-outline-variant/30 hover:border-coral/50 hover:bg-surface-container-high text-xs text-on-surface transition-all disabled:opacity-50 cursor-pointer flex items-center justify-between group"
                        >
                          <span>{item.label}</span>
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40 group-hover:text-deep-coral group-hover:translate-x-0.5 transition-all">
                            arrow_forward
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center p-0.5 shrink-0 mt-0.5">
                      <img
                        src="/nivora-companion.webp"
                        alt="Thinking"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-tl-xs bg-surface-container border border-outline-variant/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-deep-coral/60 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-deep-coral/60 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-deep-coral/60 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <div className="px-3 pb-3 pt-2 border-t border-outline-variant/30 bg-surface-container/90 shrink-0">
                {aiAssistContext && (
                  <div className="mb-2 px-2.5 py-1 rounded-lg bg-surface-container-high border border-primary/20 flex items-center justify-between text-[11px] text-primary font-mono animate-in fade-in">
                    <span className="truncate">
                      Context: {aiAssistContext.subject}
                      {aiAssistContext.topic ? ` → ${aiAssistContext.topic}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiAssistContext(null)}
                      className="text-on-surface-variant hover:text-error ml-2 text-xs"
                      title="Clear context"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Nivora AI anything..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface border border-outline-variant/50 hover:border-outline-variant text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-deep-coral focus:ring-1 focus:ring-deep-coral focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2.5 rounded-xl bg-deep-coral text-white hover:bg-deep-coral/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs active:scale-95"
                    aria-label="Send message"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-on-surface-variant/50 mt-1.5 px-0.5">
                  <span>Enter to send · ESC to close</span>
                  <span className="text-[9px] font-mono">Quick Assist</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FLOATING NIVORA AI CHARACTER (TRIGGER) ── */}
      <div
        data-mascot-trigger="true"
        className={`fixed right-4 sm:right-7 z-40 transition-all duration-300 ${mascotBottomClass}`}
      >
        <NivoraMascot
          size="default"
          isActive={isAiAssistOpen}
          isFloating={!isAiAssistOpen}
          onClick={handleToggle}
          tooltipText="Nivora AI"
          ariaLabel={isAiAssistOpen ? 'Close Nivora AI' : 'Open Nivora AI'}
        />
      </div>
    </>
  );
}

export { AiAssistModal as FloatingNivoraAi };
