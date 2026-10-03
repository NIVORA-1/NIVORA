import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getStreamConfig } from '@/lib/personalization';
import { AttendanceService } from '@/lib/attendance/attendance-service';
import { eventService } from '@/lib/events/eventService';

export const dynamic = 'force-dynamic';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Parses time strings like "09:30 AM", "14:00", "9:00am", "11:00" into minutes from midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toLowerCase();
  const isPM = clean.includes('pm');
  const isAM = clean.includes('am');

  const match = clean.match(/(\d+):(\d+)/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientDayParam = searchParams.get('clientDayOfWeek');
    const clientTimeParam = searchParams.get('clientTimeMinutes');

    const now = new Date();
    const streamCode = user.profile?.streamCode || 'CSE';
    const streamConfig = getStreamConfig(streamCode);
    const userSemester = user.profile?.semester || 5;

    // Determine current day of week: 1 (Mon) - 7 (Sun)
    let currentDayOfWeek: number;
    if (clientDayParam) {
      currentDayOfWeek = Math.max(1, Math.min(7, parseInt(clientDayParam, 10)));
    } else {
      const jsDay = now.getDay();
      currentDayOfWeek = jsDay === 0 ? 7 : jsDay;
    }

    // Determine current minutes from midnight
    let currentMinutes: number;
    if (clientTimeParam) {
      currentMinutes = parseInt(clientTimeParam, 10);
    } else {
      currentMinutes = now.getHours() * 60 + now.getMinutes();
    }

    // =========================================================================
    // 1. TODAY'S CLASSES (Real Timetable from prisma.classSchedule)
    // =========================================================================
    const allSchedules = await prisma.classSchedule.findMany({
      where: { userId: user.id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            attendanceRate: true,
            instructor: true,
            room: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    const rawTodayClasses = allSchedules
      .filter((s) => s.dayOfWeek === currentDayOfWeek)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

    let runningClassId: string | null = null;
    let nextClassId: string | null = null;

    const todayClasses = rawTodayClasses.map((cls) => {
      const startMins = parseTimeToMinutes(cls.startTime);
      const endMins = parseTimeToMinutes(cls.endTime);
      const isRunning = currentMinutes >= startMins && currentMinutes < endMins;
      const isUpcoming = startMins > currentMinutes;

      if (isRunning && !runningClassId) {
        runningClassId = cls.id;
      }

      return {
        id: cls.id,
        subjectId: cls.subjectId,
        subjectName: cls.subjectName || cls.subject?.name || 'Academic Class',
        subjectCode: cls.subjectCode || cls.subject?.code || '',
        startTime: cls.startTime,
        endTime: cls.endTime,
        startMins,
        endMins,
        room: cls.room || cls.subject?.room || 'TBD',
        type: cls.type || 'Lecture',
        instructor: cls.instructor || cls.subject?.instructor || 'Faculty',
        isRunning,
        isUpcoming,
      };
    });

    // Find the next upcoming class today
    const upcomingClassObj = todayClasses.find((c) => c.startMins > currentMinutes);
    if (upcomingClassObj) {
      nextClassId = upcomingClassObj.id;
    }

    // =========================================================================
    // 2. ATTENDANCE (Real Attendance from AttendanceService)
    // =========================================================================
    let attendanceSummary = {
      overallPercentage: 0,
      totalAttended: 0,
      totalClasses: 0,
      absentClasses: 0,
      hasRecords: false,
      hasLowAttendance: false,
      records: [] as any[],
    };

    try {
      const { records, overall } = await AttendanceService.getUserAttendance(user.id);
      if (records && records.length > 0) {
        const formattedRecords = records.map((r: any) => {
          const percentage = Math.round(r.attendancePercentage || 0);
          const isLow = percentage < 75;
          return {
            id: r.id,
            subjectCode: r.subjectCode,
            subjectName: r.subjectName,
            attendedClasses: r.attendedClasses,
            totalClasses: r.totalClasses,
            absentClasses: r.absentClasses,
            percentage,
            isLow,
            status: r.status,
          };
        });

        const hasLow = formattedRecords.some((r: any) => r.isLow);

        attendanceSummary = {
          overallPercentage: Math.round(overall?.overallPercentage || 0),
          totalAttended: overall?.totalAttended || 0,
          totalClasses: overall?.totalClasses || 0,
          absentClasses: overall?.totalAbsent || 0,
          hasRecords: true,
          hasLowAttendance: hasLow,
          records: formattedRecords,
        };
      }
    } catch (attErr) {
      console.error('[Dashboard API] Attendance retrieval error:', attErr);
    }

    // =========================================================================
    // 3. ASSIGNMENTS (Pending Assignments Only)
    // =========================================================================
    const userAssignments = await prisma.assignment.findMany({
      where: {
        userId: user.id,
        status: { notIn: ['completed', 'submitted'] },
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const enrichedAssignments = userAssignments.map((asg) => {
      const deadlineDate = asg.deadline ? new Date(asg.deadline) : null;
      let statusTag: 'overdue' | 'today' | 'upcoming' = 'upcoming';
      let statusLabel = 'Upcoming';

      if (deadlineDate) {
        if (deadlineDate < now) {
          statusTag = 'overdue';
          statusLabel = 'Overdue';
        } else if (deadlineDate >= startOfToday && deadlineDate <= endOfToday) {
          statusTag = 'today';
          statusLabel = 'Due Today';
        } else {
          statusTag = 'upcoming';
          const diffMs = deadlineDate.getTime() - now.getTime();
          const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          statusLabel = days === 1 ? 'Due Tomorrow' : `Due in ${days} days`;
        }
      }

      return {
        id: asg.id,
        title: asg.title,
        subjectName: asg.subject?.name || asg.code || 'Academic Assignment',
        subjectCode: asg.subject?.code || '',
        deadline: asg.deadline ? asg.deadline.toISOString() : null,
        deadlineFormatted: deadlineDate
          ? deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'No deadline',
        statusTag,
        statusLabel,
        priority: asg.priority,
        estimatedMins: asg.estimatedMins,
      };
    });

    // Priority sort: overdue first, then today, then upcoming
    enrichedAssignments.sort((a, b) => {
      const order = { overdue: 1, today: 2, upcoming: 3 };
      return order[a.statusTag] - order[b.statusTag];
    });

    const homeAssignments = enrichedAssignments.slice(0, 3);

    // =========================================================================
    // 4. EVENTS (Upcoming College / Community Events)
    // =========================================================================
    const dbEvents = await prisma.event.findMany({
      where: {
        isCancelled: false,
        eventDate: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: { club: { select: { id: true, name: true, slug: true } } },
      orderBy: { eventDate: 'asc' },
      take: 3,
    });

    const homeEvents: any[] = dbEvents.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date || new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: `${e.startTime || '09:00 AM'}${e.endTime ? ' - ' + e.endTime : ''}`,
      location: e.venue || 'Campus Auditorium',
      organizer: e.organizerName || e.club?.name || 'College',
      category: e.category || 'Event',
      url: `/clubs-and-events?eventId=${e.id}`,
      isInternal: true,
    }));

    if (homeEvents.length < 3) {
      try {
        const liveEvents = await eventService.getLiveEvents();
        for (const ev of liveEvents) {
          if (homeEvents.length >= 3) break;
          const exists = homeEvents.some(
            (item) => item.title.trim().toLowerCase() === ev.title.trim().toLowerCase()
          );
          if (!exists) {
            homeEvents.push({
              id: ev.id,
              title: ev.title,
              date: ev.start_date
                ? new Date(ev.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Upcoming',
              time: 'All Day / Flexible',
              location: ev.location || (ev.is_online ? 'Online' : 'Global'),
              organizer: ev.organizer || 'Student Community',
              category: ev.category || 'Tech Event',
              url: ev.registration_url || ev.source_url || '/clubs-and-events',
              isInternal: false,
            });
          }
        }
      } catch (evErr) {
        console.error('[Dashboard API] EventService error:', evErr);
      }
    }

    // =========================================================================
    // 5. LEARNING (Pending Learning Activities Only)
    // =========================================================================
    const completedTopicRecords = await prisma.topicProgress.findMany({
      where: { userId: user.id, isCompleted: true },
      select: { topicId: true },
    });
    const completedTopicIdSet = new Set(completedTopicRecords.map((ct) => ct.topicId));

    const curriculumSubjects = await prisma.subject.findMany({
      where: {
        semester: userSemester,
        streamCode: streamCode,
      },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
      },
      take: 8,
    });

    const pendingLearningItems: any[] = [];
    for (const sub of curriculumSubjects) {
      for (const topic of sub.topics) {
        if (!completedTopicIdSet.has(topic.id)) {
          pendingLearningItems.push({
            id: topic.id,
            title: topic.title,
            subjectId: sub.id,
            subjectName: sub.name,
            subjectCode: sub.code,
            unitName: topic.unitName || `Unit ${topic.unitNumber}`,
            unitNumber: topic.unitNumber,
            order: topic.order,
            isWeak: topic.isWeak,
            progress: topic.masteryPercent || 0,
            dueDate: topic.isWeak ? 'Urgent Revision' : `Unit ${topic.unitNumber} Milestone`,
            actionLink: `/learning?subjectId=${sub.id}&topicId=${topic.id}`,
          });
        }
      }
    }

    // Sort by urgency: weak topics first, then by unit and order
    pendingLearningItems.sort((a, b) => {
      if (a.isWeak && !b.isWeak) return -1;
      if (!a.isWeak && b.isWeak) return 1;
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.order - b.order;
    });

    const homeLearning = pendingLearningItems.slice(0, 3);

    // =========================================================================
    // 6. UPCOMING (Exams, Non-duplicated Deadlines, College Milestones)
    // =========================================================================
    const upcomingList: any[] = [];

    // 6.1 Upcoming Exams
    const upcomingExams = await prisma.exam.findMany({
      where: {
        userId: user.id,
        date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: 'asc' },
      take: 3,
    });

    for (const ex of upcomingExams) {
      const d = new Date(ex.date);
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      upcomingList.push({
        id: `exam-${ex.id}`,
        type: 'Exam',
        title: ex.title,
        subtitle: ex.subject?.name ? `${ex.subject.name} (${ex.subject.code})` : 'Examination',
        date: d,
        dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timeFormatted: ex.startTime || '09:30 AM',
        location: ex.room ? `Room ${ex.room}` : 'Main Exam Hall',
        badge: 'Exam',
        badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        relativeTime: diffDays <= 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`,
        link: '/exams',
      });
    }

    // 6.2 Future Assignment Deadlines (exclude top 3 already on Home)
    const displayedAssignmentIds = new Set(homeAssignments.map((a: any) => a.id));
    const furtherAssignments = userAssignments.filter(
      (a) => !displayedAssignmentIds.has(a.id) && a.deadline && new Date(a.deadline) > now
    );

    for (const asg of furtherAssignments.slice(0, 2)) {
      const d = new Date(asg.deadline!);
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      upcomingList.push({
        id: `asg-${asg.id}`,
        type: 'Assignment',
        title: asg.title,
        subtitle: asg.subject?.name || asg.code || 'Academic Assignment',
        date: d,
        dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timeFormatted: '11:59 PM',
        location: 'Course Portal',
        badge: 'Deadline',
        badgeColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        relativeTime: diffDays <= 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`,
        link: '/assignments',
      });
    }

    // 6.3 Registered Events
    const registeredEvents = await prisma.eventRegistration.findMany({
      where: { userId: user.id, status: 'REGISTERED' },
      include: { event: true },
      take: 2,
    });

    for (const reg of registeredEvents) {
      if (reg.event && new Date(reg.event.eventDate) >= now) {
        const d = new Date(reg.event.eventDate);
        const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        upcomingList.push({
          id: `reg-${reg.id}`,
          type: 'Event',
          title: reg.event.title,
          subtitle: reg.event.organizerName || 'College Event',
          date: d,
          dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timeFormatted: reg.event.startTime || '10:00 AM',
          location: reg.event.venue || 'Campus',
          badge: 'Registered',
          badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          relativeTime: diffDays <= 0 ? 'Today' : `In ${diffDays} days`,
          link: `/clubs-and-events?eventId=${reg.eventId}`,
        });
      }
    }

    upcomingList.sort((a, b) => a.date.getTime() - b.date.getTime());

    // =========================================================================
    // 7. COMMUNITIES (Joined Clubs / Communities Only)
    // =========================================================================
    const memberships = await prisma.clubMembership.findMany({
      where: { userId: user.id },
      include: {
        club: {
          include: {
            announcements: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            events: {
              where: { eventDate: { gte: now } },
              orderBy: { eventDate: 'asc' },
              take: 1,
            },
          },
        },
      },
      take: 4,
    });

    const joinedCommunities = memberships.map((cm) => {
      const latestAnn = cm.club.announcements[0];
      const latestEv = cm.club.events[0];
      let latestActivity = 'Active membership';

      if (latestAnn) {
        latestActivity = `Announcement: "${latestAnn.title}"`;
      } else if (latestEv) {
        latestActivity = `Upcoming Event: "${latestEv.title}" (${latestEv.date})`;
      }

      return {
        id: cm.club.id,
        name: cm.club.name,
        slug: cm.club.slug,
        description: cm.club.description,
        category: cm.club.category,
        role: cm.role,
        logo: cm.club.logo,
        latestActivity,
        url: `/clubs-and-events`,
      };
    });

    // =========================================================================
    // 8. NOTIFICATIONS & BACKWARDS COMPATIBILITY
    // =========================================================================
    const [notifications, plannerTasks] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.plannerTask.findMany({
        where: { userId: user.id },
        orderBy: [{ isCompleted: 'asc' }, { startTime: 'asc' }],
        take: 5,
      }),
    ]);

    const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
      },
      currentDayOfWeek,
      currentDayName: DAY_NAMES[currentDayOfWeek === 7 ? 0 : currentDayOfWeek],
      todayClasses: {
        items: todayClasses,
        runningClassId,
        nextClassId,
        hasClassesToday: todayClasses.length > 0,
        totalClassesWeek: allSchedules.length,
      },
      attendance: attendanceSummary,
      assignments: {
        items: homeAssignments,
        totalPending: userAssignments.length,
        hasPending: userAssignments.length > 0,
      },
      events: {
        items: homeEvents,
        hasEvents: homeEvents.length > 0,
      },
      learning: {
        items: homeLearning,
        totalPending: pendingLearningItems.length,
        hasPending: pendingLearningItems.length > 0,
      },
      upcoming: {
        items: upcomingList.slice(0, 4),
        hasUpcoming: upcomingList.length > 0,
      },
      communities: {
        items: joinedCommunities,
        hasJoined: joinedCommunities.length > 0,
      },
      notifications: {
        unreadCount: unreadNotificationsCount,
        recent: notifications,
      },
      // Preserved for legacy API contracts
      streamConfig,
      plannerTasks,
    });
  } catch (error: any) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
