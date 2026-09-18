import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashCode, signResetToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = String(code).trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json(
        { error: 'Verification code must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid code or request expired. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Find the latest unused reset request for this user
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'No active verification code found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Enforce maximum 5 attempts
    if (resetRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new code.' },
        { status: 429 }
      );
    }

    // Increment attempts count
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify code
    const incomingHash = hashCode(cleanCode);
    if (incomingHash !== resetRecord.codeHash) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check and try again.' },
        { status: 400 }
      );
    }

    // Mark as verified and generate short-lived single-use authorization token
    const resetToken = signResetToken({
      userId: user.id,
      email: user.email,
      resetId: resetRecord.id,
    });

    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: {
        verifiedAt: new Date(),
        resetToken,
      },
    });

    return NextResponse.json({
      success: true,
      resetToken,
      message: 'Code verified successfully.',
    });
  } catch (error) {
    console.error('Verify reset code API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
