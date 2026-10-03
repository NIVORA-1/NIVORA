import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getStudentSubjects } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Parses time string (e.g. "09:30 AM", "14:00", "9:00am") into minutes from midnight for sorting
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
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientDayParam = searchParams.get('clientDayOfWeek'); // 1-7 from client if provided
    const clientTimeParam = searchParams.get('clientTimeMinutes'); // minutes from midnight

    // Fetch student's class schedules
    const schedules = await prisma.classSchedule.findMany({
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

    // Also fetch subjects list for linking dropdowns / metadata
    const userSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        attendanceRate: true,
        instructor: true,
        room: true,
      },
    });

    // Academic subjects from syllabus
    let academicSubjects: any[] = [];
    try {
      const acRes = await getStudentSubjects(user.id);
      if (acRes?.available && Array.isArray(acRes.subjects)) {
        academicSubjects = acRes.subjects;
      }
    } catch {
      // Ignore
    }

    // Determine today's day of week: 1 (Mon) - 7 (Sun)
    let currentDayOfWeek: number;
    let currentMinutes: number;

    if (clientDayParam) {
      currentDayOfWeek = Math.max(1, Math.min(7, parseInt(clientDayParam, 10)));
    } else {
      const now = new Date();
      const jsDay = now.getDay(); // 0 is Sunday, 1 is Monday
      currentDayOfWeek = jsDay === 0 ? 7 : jsDay;
    }

    if (clientTimeParam) {
      currentMinutes = parseInt(clientTimeParam, 10);
    } else {
      const now = new Date();
      currentMinutes = now.getHours() * 60 + now.getMinutes();
    }

    // Filter today's classes and sort by time
    const todayClasses = schedules
      .filter((s) => s.dayOfWeek === currentDayOfWeek)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

    // Find next upcoming class
    let nextClass = todayClasses.find((cls) => {
      const endMins = parseTimeToMinutes(cls.endTime);
      return endMins > currentMinutes;
    });

    // If no remaining class today, look for the next day's first class
    if (!nextClass && schedules.length > 0) {
      for (let offset = 1; offset <= 7; offset++) {
        let checkDay = currentDayOfWeek + offset;
        if (checkDay > 7) checkDay -= 7;

        const dayList = schedules
          .filter((s) => s.dayOfWeek === checkDay)
          .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

        if (dayList.length > 0) {
          nextClass = dayList[0];
          break;
        }
      }
    }

    // Group classes by day (1-7)
    const groupedByDay: Record<number, typeof schedules> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };

    schedules.forEach((s) => {
      if (groupedByDay[s.dayOfWeek]) {
        groupedByDay[s.dayOfWeek].push(s);
      }
    });

    const uniqueSubjectsCount = new Set(
      schedules.map((s) => s.subjectName || s.subject?.name || s.subjectCode)
    ).size;

    return NextResponse.json({
      success: true,
      hasTimetable: schedules.length > 0,
      totalClasses: schedules.length,
      currentDayOfWeek,
      currentDayName: DAY_NAMES[currentDayOfWeek === 7 ? 0 : currentDayOfWeek],
      todayClasses,
      nextClass: nextClass || null,
      schedules,
      groupedByDay,
      userSubjects,
      academicSubjects,
      stats: {
        totalSlots: schedules.length,
        uniqueSubjects: uniqueSubjectsCount,
        hasReviewedAll: !schedules.some((s) => s.needsReview),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/classes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch timetable schedules.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const deleteResult = await prisma.classSchedule.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: 'Timetable cleared successfully.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/classes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear timetable.' },
      { status: 500 }
    );
  }
}
