import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.rebootSession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      reelsToday: user.profile.reelsToday,
      reelThreshold: user.profile.reelThreshold,
      doomscrollMins: user.profile.doomscrollMins,
      doomscrollCap: user.profile.doomscrollCap,
      focusScore: user.profile.focusScore,
      sessions,
    });
  } catch (error) {
    console.error('Reboot GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reboot metrics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { durationMins = 25 } = await request.json();

    const session = await prisma.rebootSession.create({
      data: {
        userId: user.id,
        durationMins,
        focusScoreDelta: 4,
      },
    });

    // Update user profile focus score
    await prisma.studentProfile.update({
      where: { userId: user.id },
      data: {
        focusScore: { increment: 4 },
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Reboot POST error:', error);
    return NextResponse.json({ error: 'Failed to record reset session' }, { status: 500 });
  }
}
