import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Please log in to manage connections.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId')?.trim();
    const studentId = searchParams.get('studentId')?.trim();

    let targetConnection = null;

    if (connectionId) {
      targetConnection = await prisma.studentConnection.findUnique({
        where: { id: connectionId },
      });
    } else if (studentId) {
      targetConnection = await prisma.studentConnection.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: studentId },
            { senderId: studentId, receiverId: currentUser.id },
          ],
        },
      });
    }

    if (!targetConnection) {
      return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
    }

    // Ensure current user is part of the connection
    if (
      targetConnection.senderId !== currentUser.id &&
      targetConnection.receiverId !== currentUser.id
    ) {
      return NextResponse.json({ error: 'Unauthorized to delete this connection.' }, { status: 403 });
    }

    await prisma.studentConnection.delete({
      where: { id: targetConnection.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Connection removed successfully.',
    });
  } catch (error) {
    console.error('Delete connection error:', error);
    return NextResponse.json({ error: 'Failed to remove connection.' }, { status: 500 });
  }
}
