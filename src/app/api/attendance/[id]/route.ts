import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ error: 'Attendance ID is required.' }, { status: 400 });
    }

    const existing = await prisma.attendance.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Attendance record not found or unauthorized.' },
        { status: 404 }
      );
    }

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully.',
    });
  } catch (error: any) {
    console.error('[Attendance Delete API] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete attendance record.' },
      { status: 500 }
    );
  }
}
