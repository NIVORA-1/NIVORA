import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    }

    const body = await request.json();
    const { status, score, notes, title, priority } = body;

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(status !== undefined && {
          status,
          submittedAt: status === 'completed' || status === 'submitted' ? new Date() : null,
        }),
        ...(score !== undefined && { score: parseFloat(String(score)) }),
        ...(title !== undefined && { title: title.trim() }),
        ...(priority !== undefined && { priority }),
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
    });

    return NextResponse.json({
      success: true,
      assignment: updated,
      message: 'Assignment updated.',
    });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update assignment.' },
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
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    }

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment removed.',
    });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete assignment.' },
      { status: 500 }
    );
  }
}
