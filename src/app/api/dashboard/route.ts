import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getStreamConfig } from '@/lib/personalization';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const streamCode = user.profile?.streamCode || 'CSE';
    const streamConfig = getStreamConfig(streamCode);

    const [
      plannerTasks,
      notifications,
      achievements,
      rebootSessions,
      subjects,
      careerDossier,
    ] = await Promise.all([
      prisma.plannerTask.findMany({
        where: { userId: user.id },
        orderBy: [{ isCompleted: 'asc' }, { startTime: 'asc' }],
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.achievement.findMany({
        where: { userId: user.id },
        orderBy: { unlockedAt: 'desc' },
        take: 5,
      }),
      prisma.rebootSession.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      prisma.subject.findMany({
        where: { streamCode },
        include: {
          assignments: {
            where: { status: 'pending' },
            orderBy: { deadline: 'asc' },
            take: 3,
          },
          classes: {
            take: 4,
          },
          exams: {
            take: 2,
          },
          topics: {
            where: { isWeak: true },
            take: 2,
          },
        },
        take: 6,
      }),
      prisma.careerDossier.findUnique({
        where: { userId: user.id },
        include: { applications: true },
      }),
    ]);

    // Build today's priorities tailored to this specific user & stream
    const pendingAssignments = subjects.flatMap((s) =>
      s.assignments.map((a) => ({ ...a, subjectName: s.name, subjectCode: s.code }))
    );
    const weakTopics = subjects.flatMap((s) =>
      s.topics.map((t) => ({ ...t, subjectName: s.name, subjectCode: s.code }))
    );

    const priorities = [
      {
        id: 'p-1',
        type: 'assignment',
        title: pendingAssignments[0]
          ? `${pendingAssignments[0].subjectCode} Assignment: ${pendingAssignments[0].title}`
          : `${streamConfig.defaultSubjects[0]?.code || 'CORE'}: Fundamental Problem Set`,
        dueText: 'Due tomorrow at 11:59 PM • Est. time: 35 min',
        link: '/assignments',
        actionText: 'Start',
      },
      {
        id: 'p-2',
        type: 'revision',
        title: weakTopics[0]
          ? `${weakTopics[0].subjectCode} Revision: ${weakTopics[0].title}`
          : `${streamConfig.defaultSubjects[1]?.name || 'Core'} Targeted Conceptual Review`,
        dueText: 'Weakest topic in recent quiz • Recommended: 45 min',
        link: `/subjects/${streamConfig.defaultSubjects[0]?.code || 'CS-301'}?tab=quizzes`,
        actionText: 'Start',
      },
      {
        id: 'p-3',
        type: 'deepwork',
        title: `${streamConfig.defaultSubjects[2]?.name || 'Core Curriculum'} Deep Study Block`,
        dueText: 'Focused independent review • Est. time: 45 min',
        link: '/planner',
        actionText: 'Plan',
      },
    ];

    // Next scheduled class
    const nextClass = {
      time: '10:00 AM',
      relativeTime: 'in 42 min',
      title: streamConfig.defaultSubjects[0]
        ? `${streamConfig.defaultSubjects[0].name} (${streamConfig.defaultSubjects[0].code})`
        : 'Core Academic Lecture',
      location: streamConfig.defaultSubjects[0]?.room || 'Hall B-204',
      instructor: streamConfig.defaultSubjects[0]?.instructor || 'Prof. Faculty',
    };

    // Personalized insight
    const insight = {
      message: `Your recent ${streamConfig.defaultSubjects[0]?.name || 'curriculum'} assessments indicate key areas for revision before midterm evaluations.`,
      recommendation: `Spend 40 minutes revising ${streamConfig.defaultSubjects[0]?.name || 'core units'} before tomorrow's lecture.`,
      deficitVector: `Module 04 Speed Quiz score was below the ${user.profile?.cgpa ? (user.profile.cgpa * 10).toFixed(0) : '85'}% benchmark.`,
      impact: `${streamConfig.defaultSubjects[0]?.code || 'CORE'} examination carries substantial weightage.`,
    };

    // Calculate digital balance limit delta
    const doomscrollMins = user.profile?.doomscrollMins ?? 0;
    const doomscrollCap = user.profile?.doomscrollCap ?? 30;
    const isAboveLimit = doomscrollMins > doomscrollCap;
    const limitDeltaMins = Math.max(0, doomscrollMins - doomscrollCap);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
      },
      streamConfig,
      priorities,
      nextClass,
      insight,
      plannerTasks,
      notifications,
      achievements,
      rebootSessions,
      subjects,
      careerDossier,
      digitalBalance: {
        isAboveLimit,
        limitDeltaMins,
        reelsToday: user.profile?.reelsToday ?? 0,
        reelThreshold: user.profile?.reelThreshold ?? 30,
        doomscrollMins,
        doomscrollCap,
        focusScore: user.profile?.focusScore ?? 75,
      },
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
