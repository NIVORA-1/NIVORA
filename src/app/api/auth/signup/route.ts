import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signSessionToken, AUTH_COOKIE } from '@/lib/auth';
import { getStreamConfig } from '@/lib/personalization';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, stream = 'CSE', year = 1 } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const streamConfig = getStreamConfig(stream);
    const yearNum = Math.max(1, Math.min(5, parseInt(String(year)) || 1));
    const semester = Math.min(10, Math.max(1, yearNum * 2 - 1));

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: cleanName,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=172329&textColor=8fc5a7`,
        profile: {
          create: {
            college: 'University Campus',
            degree: streamConfig.degree,
            stream: streamConfig.name,
            streamCode: streamConfig.code,
            specialization: streamConfig.specializations[0] || 'General Studies',
            year: yearNum,
            semester: semester,
            cgpa: 0.0,
            streakDays: 0,
            modulesVerified: 0,
            totalModules: 0,
            hoursPacedWeek: 0.0,
            focusScore: 0,
            reelsToday: 0,
            reelThreshold: 30,
            doomscrollMins: 0,
            doomscrollCap: 30,
            careerGoal: streamConfig.careerRoadmap.role,
            bio: '',
            onboardingCompleted: false,
            onboardingStep: 0,
            academicGoals: [],
            interests: [],
          },
        },
      },
      include: { profile: true },
    });

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      profile: user.profile,
    };

    const response = NextResponse.json({ success: true, user: safeUser }, { status: 201 });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
