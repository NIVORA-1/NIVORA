import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Please log in to connect with peers.' }, { status: 401 });
    }

    const body = await request.json();
    const receiverId = body.receiverId?.trim();
    const note = body.note?.trim() || null;

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required.' }, { status: 400 });
    }

    if (receiverId === currentUser.id) {
      return NextResponse.json({ error: 'You cannot send a connection request to yourself.' }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    // Check existing connection in either direction
    const existing = await prisma.studentConnection.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId },
          { senderId: receiverId, receiverId: currentUser.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return NextResponse.json({
          message: 'You are already connected with this student.',
          connectionId: existing.id,
          status: 'ACCEPTED',
        });
      }

      if (existing.status === 'PENDING') {
        // If current user is the receiver, accept it!
        if (existing.receiverId === currentUser.id) {
          const updated = await prisma.studentConnection.update({
            where: { id: existing.id },
            data: { status: 'ACCEPTED' },
          });
          return NextResponse.json({
            message: `Connection request from ${targetUser.name} accepted!`,
            connectionId: updated.id,
            status: 'ACCEPTED',
          });
        }
        // Current user already sent request
        return NextResponse.json({
          message: 'Connection request is already pending.',
          connectionId: existing.id,
          status: 'PENDING',
        });
      }

      // If previously rejected, re-open as pending
      const reopened = await prisma.studentConnection.update({
        where: { id: existing.id },
        data: {
          senderId: currentUser.id,
          receiverId,
          status: 'PENDING',
          note,
        },
      });

      return NextResponse.json({
        message: `Connection request sent to ${targetUser.name}.`,
        connectionId: reopened.id,
        status: 'PENDING',
      });
    }

    // Create new pending connection
    const newConn = await prisma.studentConnection.create({
      data: {
        senderId: currentUser.id,
        receiverId,
        status: 'PENDING',
        note,
      },
    });

    return NextResponse.json({
      message: `Connection request sent to ${targetUser.name}!`,
      connectionId: newConn.id,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Send connection request error:', error);
    return NextResponse.json({ error: 'Failed to send connection request.' }, { status: 500 });
  }
}
