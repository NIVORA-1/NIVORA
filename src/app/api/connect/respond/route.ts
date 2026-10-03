import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Please log in to manage connection requests.' }, { status: 401 });
    }

    const body = await request.json();
    const connectionId = body.connectionId?.trim();
    const action = body.action?.trim().toUpperCase(); // 'ACCEPT' | 'REJECT'

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required.' }, { status: 400 });
    }

    if (action !== 'ACCEPT' && action !== 'REJECT') {
      return NextResponse.json({ error: 'Invalid action. Must be ACCEPT or REJECT.' }, { status: 400 });
    }

    const connection = await prisma.studentConnection.findUnique({
      where: { id: connectionId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection request not found.' }, { status: 404 });
    }

    // Only the receiver can accept/reject an incoming pending request
    if (connection.receiverId !== currentUser.id) {
      return NextResponse.json({ error: 'You are not authorized to respond to this request.' }, { status: 403 });
    }

    if (action === 'ACCEPT') {
      const updated = await prisma.studentConnection.update({
        where: { id: connectionId },
        data: { status: 'ACCEPTED' },
      });

      return NextResponse.json({
        message: `Connected with ${connection.sender.name}!`,
        connectionId: updated.id,
        status: 'ACCEPTED',
      });
    } else {
      // Reject request
      await prisma.studentConnection.update({
        where: { id: connectionId },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json({
        message: `Connection request from ${connection.sender.name} declined.`,
        connectionId,
        status: 'REJECTED',
      });
    }
  } catch (error) {
    console.error('Respond to connection request error:', error);
    return NextResponse.json({ error: 'Failed to process connection response.' }, { status: 500 });
  }
}
