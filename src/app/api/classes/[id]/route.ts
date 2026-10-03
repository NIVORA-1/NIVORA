import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Class ID is required.' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Class entry not found or permission denied.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      dayOfWeek,
      dayName,
      startTime,
      endTime,
      subjectName,
      subjectCode,
      instructor,
      room,
      type,
      section,
      subjectId,
      needsReview,
      notes,
    } = body;

    const updated = await prisma.classSchedule.update({
      where: { id },
      data: {
        ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(String(dayOfWeek), 10) }),
        ...(dayName !== undefined && { dayName }),
        ...(startTime !== undefined && { startTime: startTime.trim() }),
        ...(endTime !== undefined && { endTime: endTime.trim() }),
        ...(subjectName !== undefined && { subjectName: subjectName.trim() }),
        ...(subjectCode !== undefined && { subjectCode: subjectCode ? subjectCode.trim() : null }),
        ...(instructor !== undefined && { instructor: instructor ? instructor.trim() : 'TBD' }),
        ...(room !== undefined && { room: room ? room.trim() : 'TBD' }),
        ...(type !== undefined && { type: type || 'Lecture' }),
        ...(section !== undefined && { section: section ? section.trim() : null }),
        ...(subjectId !== undefined && { subjectId: subjectId || null }),
        ...(needsReview !== undefined && { needsReview: Boolean(needsReview) }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
    });

    return NextResponse.json({
      success: true,
      classItem: updated,
      message: 'Class updated successfully.',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/classes/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update class.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Class ID is required.' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Class entry not found or permission denied.' },
        { status: 404 }
      );
    }

    await prisma.classSchedule.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Class entry deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/classes/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete class.' },
      { status: 500 }
    );
  }
}
