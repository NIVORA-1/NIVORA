import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getStreamConfig } from '@/lib/personalization';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Onboarding GET API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      step,
      isFinal = false,
      name,
      college,
      degree,
      stream,
      streamCode,
      specialization,
      year,
      semester,
      currentCgpa,
      targetCgpa,
      academicGoals,
      studyDuration,
      preferredStudyTime,
      studyStyle,
      dailyStudyGoal,
      interests,
    } = body;

    // Build partial profile update object
    const profileUpdate: Record<string, any> = {};

    if (typeof step === 'number') {
      profileUpdate.onboardingStep = step;
    }

    if (isFinal) {
      profileUpdate.onboardingCompleted = true;
      profileUpdate.onboardingStep = 5;
    }

    if (college !== undefined) profileUpdate.college = college;
    if (degree !== undefined) profileUpdate.degree = degree;
    if (stream !== undefined) profileUpdate.stream = stream;
    if (streamCode !== undefined) profileUpdate.streamCode = streamCode;
    if (specialization !== undefined) profileUpdate.specialization = specialization;
    if (year !== undefined) profileUpdate.year = Math.max(1, Math.min(6, parseInt(String(year)) || 1));
    if (semester !== undefined) profileUpdate.semester = Math.max(1, Math.min(12, parseInt(String(semester)) || 1));

    if (currentCgpa !== undefined && currentCgpa !== '' && currentCgpa !== null) {
      const parsedCgpa = parseFloat(String(currentCgpa));
      if (!isNaN(parsedCgpa)) profileUpdate.cgpa = parsedCgpa;
    }

    if (targetCgpa !== undefined && targetCgpa !== '' && targetCgpa !== null) {
      const parsedTarget = parseFloat(String(targetCgpa));
      if (!isNaN(parsedTarget)) profileUpdate.targetCgpa = parsedTarget;
    }

    if (Array.isArray(academicGoals)) {
      profileUpdate.academicGoals = academicGoals;
    }

    if (studyDuration !== undefined) profileUpdate.studyDuration = studyDuration;
    if (preferredStudyTime !== undefined) profileUpdate.preferredStudyTime = preferredStudyTime;
    if (studyStyle !== undefined) profileUpdate.studyStyle = studyStyle;
    if (dailyStudyGoal !== undefined) profileUpdate.dailyStudyGoal = dailyStudyGoal;

    if (Array.isArray(interests)) {
      profileUpdate.interests = interests;
    }

    // If final, establish careerGoal and bio if not already set
    if (isFinal) {
      const code = streamCode || user.profile?.streamCode || 'CSE';
      const streamConfig = getStreamConfig(code);
      if (!user.profile?.careerGoal || user.profile.careerGoal === 'Distributed Systems Engineer') {
        profileUpdate.careerGoal = streamConfig.careerRoadmap.role;
      }
      if (Array.isArray(interests) && interests.length > 0) {
        profileUpdate.bio = `Interested in ${interests.slice(0, 3).join(', ')}`;
      }
    }

    // Update user record if name was provided
    if (name && name.trim() && name.trim() !== user.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    // Upsert student profile
    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        college: college || 'University Campus',
        degree: degree || 'B.Tech',
        stream: stream || 'Computer Science & Engineering',
        streamCode: streamCode || 'CSE',
        specialization: specialization || 'General Studies',
        year: year ? parseInt(String(year)) : 1,
        semester: semester ? parseInt(String(semester)) : 1,
        cgpa: profileUpdate.cgpa || 0.0,
        targetCgpa: profileUpdate.targetCgpa || null,
        onboardingCompleted: isFinal,
        onboardingStep: typeof step === 'number' ? step : (isFinal ? 5 : 0),
        academicGoals: Array.isArray(academicGoals) ? academicGoals : [],
        studyDuration: studyDuration || '45 min',
        preferredStudyTime: preferredStudyTime || 'Morning',
        studyStyle: studyStyle || 'Deep Focus',
        dailyStudyGoal: dailyStudyGoal || '2 hours',
        interests: Array.isArray(interests) ? interests : [],
      },
      update: profileUpdate,
    });

    // If finalizing onboarding, ensure personalized planner tasks match the stream & goals
    if (isFinal) {
      const code = updatedProfile.streamCode || 'CSE';
      const streamConfig = getStreamConfig(code);
      const todayStr = new Date().toISOString().split('T')[0];

      // Check existing planner tasks
      const existingTaskCount = await prisma.plannerTask.count({
        where: { userId: user.id },
      });

      if (existingTaskCount === 0) {
        const firstSub = streamConfig.defaultSubjects[0];
        const secondSub = streamConfig.defaultSubjects[1];

        await prisma.plannerTask.createMany({
          data: [
            {
              userId: user.id,
              title: `${firstSub ? firstSub.name : 'Curriculum Orientation'} Lecture`,
              description: 'Introductory syllabus overview & core concepts.',
              category: 'classes',
              date: todayStr,
              startTime: '10:00 AM',
              endTime: '11:30 AM',
              isCompleted: false,
              priority: 'high',
              relatedSubjectCode: firstSub?.code,
            },
            {
              userId: user.id,
              title: `Deep Work: ${secondSub ? secondSub.name : 'Focus Session'}`,
              description: `Dedicated ${updatedProfile.studyDuration || '45 min'} study block (${updatedProfile.studyStyle || 'Deep Focus'}).`,
              category: 'deepwork',
              date: todayStr,
              startTime: '02:00 PM',
              endTime: '03:00 PM',
              isCompleted: false,
              priority: 'medium',
              relatedSubjectCode: secondSub?.code,
            },
          ],
        });
      }
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      onboardingCompleted: updatedProfile.onboardingCompleted,
    });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
