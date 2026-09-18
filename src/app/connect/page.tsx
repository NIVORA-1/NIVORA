'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STREAMS } from '@/lib/personalization';

interface MeetingRoom {
  id: string;
  title: string;
  platform: 'Google Meet' | 'Zoom' | 'MS Teams';
  time: string;
  status: 'live' | 'upcoming';
  participants: number;
  host: string;
  url: string;
  course: string;
}

const INITIAL_ROOMS: MeetingRoom[] = [
  {
    id: 'room-1',
    title: 'Distributed Systems Project Sprint Sync',
    platform: 'Zoom',
    time: 'Live Now',
    status: 'live',
    participants: 4,
    host: 'Systems Project Lead & Team',
    url: 'https://zoom.us/j/demo-stream',
    course: 'CS-305',
  },
  {
    id: 'room-2',
    title: 'DBMS TA Office Hours: Normalization & Indexing',
    platform: 'Google Meet',
    time: '15:00 Today',
    status: 'upcoming',
    participants: 12,
    host: 'Teaching Assistant (Vikram)',
    url: 'https://meet.google.com/demo-stream',
    course: 'CS-301',
  },
  {
    id: 'room-3',
    title: 'Operating Systems Deadlock Proof Review',
    platform: 'MS Teams',
    time: '17:30 Tomorrow',
    status: 'upcoming',
    participants: 8,
    host: 'Prof. C. Verma',
    url: 'https://teams.microsoft.com/demo-stream',
    course: 'CS-303',
  },
];

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  content: string;
  time: string;
  channel: string;
}

const INITIAL_CHATS: ChatMessage[] = [
  {
    id: 'c-1',
    sender: 'Prof. Dr. K. Sharma',
    role: 'Instructor',
    content: 'Uploaded Bernstein 3NF synthesis cheatsheet to the Resource Vault. Mid-term review starts Thursday.',
    time: '10:14 AM',
    channel: 'CS-301 Official',
  },
  {
    id: 'c-2',
    sender: 'Aman Patel',
    role: 'Peer · Study Group',
    content: 'Who wants to do 40m Pomodoro in the Library 40Hz Audio Lounge before the 2 PM lab?',
    time: '11:20 AM',
    channel: 'Semester 5 General',
  },
  {
    id: 'c-3',
    sender: 'Placement Cell',
    role: 'Admin',
    content: 'Jane Street Systems OA slots have been locked. Check your Career Portal dossier for timing.',
    time: '12:05 PM',
    channel: 'Campus Recruitment',
  },
];

export default function ConnectPage() {
  const { currentStream, user } = useApp();
  const streamData = STREAMS[currentStream] || STREAMS.CSE;

  const [activeTab, setActiveTab] = useState<'rooms' | 'channels'>('rooms');
  const [rooms, setRooms] = useState<MeetingRoom[]>(INITIAL_ROOMS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHATS);
  const [newMessage, setNewMessage] = useState('');
  const [isInstantRoomModalOpen, setIsInstantRoomModalOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomPlatform, setNewRoomPlatform] = useState<'Google Meet' | 'Zoom' | 'MS Teams'>('Google Meet');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    const room: MeetingRoom = {
      id: `room-${Date.now()}`,
      title: newRoomTitle,
      platform: newRoomPlatform,
      time: 'Live Now',
      status: 'live',
      participants: 1,
      host: `${user?.name || 'Student'} (Host)`,
      url: 'https://meet.google.com/new-instant-room',
      course: streamData.defaultSubjects[0]?.code || 'CORE',
    };
    setRooms([room, ...rooms]);
    setNewRoomTitle('');
    setIsInstantRoomModalOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `c-${Date.now()}`,
      sender: `${user?.name || 'Student'} (You)`,
      role: 'Student',
      content: newMessage,
      time: 'Just now',
      channel: 'CS-301 Official',
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-center gap-space-xs font-label-mono-wide text-label-mono-wide text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-primary font-semibold">SYNCHRONOUS ACADEMIC COMMS</span>
            <span>/</span>
            <span>PEER LOUNGES</span>
          </div>
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Connect</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Virtual meeting bridges, course channels, and study group peer coordination.
          </p>
        </div>

        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => setIsInstantRoomModalOpen(true)}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-button-text text-button-text font-semibold shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">video_call</span>
            <span>+ Instant Study Bridge</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-space-md py-1.5 rounded-lg font-button-text text-button-text transition-colors flex items-center gap-2 ${
            activeTab === 'rooms'
              ? 'bg-secondary-container text-on-secondary-container font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">video_camera_front</span>
          <span>Active Meeting Bridges ({rooms.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-space-md py-1.5 rounded-lg font-button-text text-button-text transition-colors flex items-center gap-2 ${
            activeTab === 'channels'
              ? 'bg-secondary-container text-on-secondary-container font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">forum</span>
          <span>Academic Notices & Chat</span>
        </button>
      </div>

      {/* Active Meeting Bridges */}
      {activeTab === 'rooms' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between space-y-space-md hover:border-primary/40 transition-colors"
            >
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono-wide text-label-tag px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                    {room.course}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-tag text-label-tag flex items-center gap-1 ${
                      room.status === 'live'
                        ? 'bg-error/20 text-error font-semibold'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {room.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>}
                    {room.status === 'live' ? 'LIVE NOW' : room.time}
                  </span>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold pt-1 line-clamp-2">
                  {room.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Host: {room.host} • Platform: {room.platform}
                </p>
              </div>

              <div className="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-1 text-on-surface-variant font-label-mono-wide text-label-tag">
                  <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                  <span>{room.participants} Online</span>
                </div>

                <a
                  href={room.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed transition-colors flex items-center gap-1"
                >
                  <span>Join</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Academic Chat & Notices */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-8 p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col h-[520px] justify-between">
            <div className="overflow-y-auto space-y-space-md pr-2 flex-1">
              {messages.map((msg) => (
                <div key={msg.id} className="p-space-sm rounded-lg bg-surface-container border border-outline-variant/20 space-y-1">
                  <div className="flex items-center justify-between font-label-mono-wide text-label-tag text-on-surface-variant">
                    <span className="text-primary font-semibold">{msg.sender} ({msg.role})</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">{msg.content}</p>
                  <span className="inline-block font-label-tag text-[10px] text-on-surface-variant/70 uppercase">
                    #{msg.channel}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-space-sm border-t border-outline-variant/20 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Post an academic query or study sync..."
                className="flex-1 px-space-md py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary text-body-sm"
              />
              <button
                type="submit"
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-button-text text-button-text font-semibold hover:bg-primary-fixed"
              >
                Send
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-space-md">
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm space-y-2">
              <span className="font-label-mono-wide text-label-tag text-secondary uppercase font-semibold">
                CAMPUS STUDY CHANNELS
              </span>
              <div className="space-y-1 text-body-sm">
                <div className="p-2 rounded bg-surface-container text-on-surface font-medium cursor-pointer hover:bg-surface-container-high">
                  # CS-301 Official Announcements
                </div>
                <div className="p-2 rounded bg-surface-container text-on-surface font-medium cursor-pointer hover:bg-surface-container-high">
                  # CS-302 Practicum Discussions
                </div>
                <div className="p-2 rounded bg-surface-container text-on-surface font-medium cursor-pointer hover:bg-surface-container-high">
                  # Library Silent Focus Pod 3
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INSTANT ROOM MODAL */}
      {isInstantRoomModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRoom}
            className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-space-lg space-y-space-md"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Create Study Bridge
              </h3>
              <button
                type="button"
                onClick={() => setIsInstantRoomModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-xs">
              <label className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                Meeting Topic
              </label>
              <input
                type="text"
                required
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="e.g. Raft Consensus Whitepaper Review"
                className="w-full px-space-md py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-space-xs">
              <label className="font-label-tag text-label-tag text-on-surface-variant uppercase">
                Platform
              </label>
              <select
                value={newRoomPlatform}
                onChange={(e) => setNewRoomPlatform(e.target.value as 'Google Meet' | 'Zoom' | 'MS Teams')}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="MS Teams">MS Teams</option>
              </select>
            </div>

            <div className="flex justify-end gap-space-xs pt-space-xs">
              <button
                type="button"
                onClick={() => setIsInstantRoomModalOpen(false)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-button-text text-button-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-button-text text-button-text font-semibold shadow-sm"
              >
                Launch Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
