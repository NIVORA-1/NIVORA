import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyResetToken, AUTH_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resetToken, newPassword, confirmPassword, signOutAllSessions = true } = body;

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Reset authorization token is missing or invalid. Please request a new code.' },
        { status: 401 }
      );
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Both password and confirmation password are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // Password criteria validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    if (!hasUpper || !hasLower) {
      return NextResponse.json(
        { error: 'Password must include both uppercase and lowercase letters.' },
        { status: 400 }
      );
    }

    const hasNumber = /\d/.test(newPassword);
    if (!hasNumber) {
      return NextResponse.json(
        { error: 'Password must include at least one number.' },
        { status: 400 }
      );
    }

    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    if (!hasSpecial) {
      return NextResponse.json(
        { error: 'Password must include at least one special character.' },
        { status: 400 }
      );
    }

    // Verify token validity
    const payload = verifyResetToken(resetToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Reset authorization session expired. Please request a new code.' },
        { status: 401 }
      );
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { id: payload.resetId },
    });

    if (!resetRecord || resetRecord.usedAt !== null) {
      return NextResponse.json(
        { error: 'This reset token has already been used or is invalid. Please request a new code.' },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: 'Reset session expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and mark reset record as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: payload.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in.',
    });

    // Clear any existing session cookie if sign out from all sessions was selected
    if (signOutAllSessions) {
      response.cookies.set(AUTH_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
