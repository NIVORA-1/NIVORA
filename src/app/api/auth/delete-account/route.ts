import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getCurrentUser, AUTH_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Your password is required to permanently delete this account.' },
        { status: 400 }
      );
    }

    // Verify confirmation password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Account deletion aborted.' },
        { status: 400 }
      );
    }

    // Delete user (cascades to profile, tasks, reboot sessions, notifications, etc.)
    await prisma.user.delete({
      where: { id: user.id },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Your Nivora account and all personal data have been permanently deleted.',
    });

    // Clear session cookie
    response.cookies.set(AUTH_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Delete account API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting account.' },
      { status: 500 }
    );
  }
}
