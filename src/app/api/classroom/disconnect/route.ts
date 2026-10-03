import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { deleteImportedAssignments = false } = body;

    // 1. Remove or set connection to disconnected and clear tokens
    await prisma.googleClassroomConnection.deleteMany({
      where: { userId: user.id },
    });

    // 2. Clear course sync records
    await prisma.googleClassroomCourse.deleteMany({
      where: { userId: user.id },
    });

    // 3. Only delete assignments if explicitly requested by user; otherwise keep them intact
    if (deleteImportedAssignments) {
      await prisma.assignment.deleteMany({
        where: {
          userId: user.id,
          source: 'google_classroom',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Google Classroom disconnected successfully. Previously imported assignments have been retained in your workspace.',
    });
  } catch (error: any) {
    console.error('Error in /api/classroom/disconnect:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect Google Classroom.' },
      { status: 500 }
    );
  }
}
