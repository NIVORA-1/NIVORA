import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVerificationCode, hashCode } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address format.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    let devCode: string | undefined;

    if (user) {
      // Invalidate any previously active unused password reset requests for this user
      await prisma.passwordReset.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          expiresAt: new Date(0),
        },
      });

      // Generate a secure 6-digit code
      const code = generateVerificationCode();
      const codeHash = hashCode(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt,
          attempts: 0,
        },
      });

      // Dispatch verification email through service
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        code,
      });

      if (process.env.NODE_ENV !== 'production') {
        devCode = code;
      }
    }

    // Generic response to prevent user enumeration
    const responsePayload: { success: boolean; message: string; devCode?: string } = {
      success: true,
      message: 'If an account exists for this email, a verification code has been sent.',
    };

    if (process.env.NODE_ENV !== 'production' && devCode) {
      responsePayload.devCode = devCode;
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
