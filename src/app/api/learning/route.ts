import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const semesterParam = searchParams.get('semester');
    const resourceType = searchParams.get('type')?.trim().toLowerCase() || '';
    const selectedSubjectId = searchParams.get('subjectId')?.trim() || '';

    const profile = user.profile;
    const streamCode = profile?.streamCode || 'CSE';
    const activeSemester = semesterParam ? parseInt(semesterParam, 10) : profile?.semester || 1;

    // Fetch subjects for this student's degree/stream/semester
    const subjects = await prisma.subject.findMany({
      where: {
        semester: activeSemester,
        streamCode: streamCode,
      },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
        resources: true,
      },
      orderBy: { code: 'asc' },
    });

    // Fetch user's topic progress
    const userTopicProgress = await prisma.topicProgress.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
      select: {
        topicId: true,
        subjectId: true,
        completedAt: true,
      },
    });

    const completedTopicIds = new Set(userTopicProgress.map((tp) => tp.topicId));

    // Fetch user's saved resources
    const savedResources = await prisma.savedResource.findMany({
      where: { userId: user.id },
      select: { resourceId: true },
    });
    const savedResourceIds = new Set(savedResources.map((sr) => sr.resourceId));

    // Fetch recent study activity
    const recentActivities = await prisma.learningActivity.findMany({
      where: { userId: user.id },
      include: {
        subject: { select: { id: true, code: true, name: true } },
        topic: { select: { id: true, title: true } },
        resource: { select: { id: true, title: true, type: true, url: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    // Format subjects with real student-specific progress
    const formattedSubjects = subjects.map((subj) => {
      const totalTopics = subj.topics.length;
      const completedCount = subj.topics.filter((t) => completedTopicIds.has(t.id)).length;
      const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

      const topicsWithStatus = subj.topics.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        order: t.order,
        unitName: t.unitName,
        unitNumber: t.unitNumber,
        isCompleted: completedTopicIds.has(t.id),
      }));

      const resourcesWithStatus = subj.resources
        .filter((r) => {
          if (resourceType && resourceType !== 'all') {
            return r.type.toLowerCase() === resourceType;
          }
          return true;
        })
        .map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          type: r.type,
          url: r.url,
          thumbnailUrl: r.thumbnailUrl,
          channel: r.channel,
          duration: r.duration,
          fileSize: r.fileSize,
          author: r.author,
          topicId: r.topicId,
          isSaved: savedResourceIds.has(r.id),
        }));

      return {
        id: subj.id,
        code: subj.code,
        name: subj.name,
        credits: subj.credits,
        semester: subj.semester,
        streamCode: subj.streamCode,
        instructor: subj.instructor,
        room: subj.room,
        totalTopics,
        completedTopics: completedCount,
        progressPercent,
        status:
          completedCount === 0
            ? 'Not started'
            : completedCount === totalTopics
            ? 'Completed'
            : `${progressPercent}%`,
        topics: topicsWithStatus,
        resources: resourcesWithStatus,
      };
    });

    // Format Recently Studied
    const continueLearning = recentActivities.map((act) => ({
      activityId: act.id,
      subjectId: act.subjectId,
      subjectCode: act.subject.code,
      subjectName: act.subject.name,
      topicId: act.topicId,
      topicTitle: act.topic?.title || null,
      resourceId: act.resourceId,
      resourceTitle: act.resource?.title || null,
      startedAt: act.startedAt,
    }));

    // Data-driven Recommendations
    const recommendations: { title: string; subtitle: string; action: string; subjectId?: string; topicId?: string }[] = [];

    if (continueLearning.length > 0) {
      const latest = continueLearning[0];
      recommendations.push({
        title: `Continue where you left off`,
        subtitle: `${latest.subjectName} • ${latest.topicTitle || 'Review concepts'}`,
        action: 'Resume',
        subjectId: latest.subjectId,
        topicId: latest.topicId || undefined,
      });
    }

    // Find subjects with in-progress topics
    const inProgressSubject = formattedSubjects.find(
      (s) => s.completedTopics > 0 && s.completedTopics < s.totalTopics
    );
    if (inProgressSubject) {
      const remaining = inProgressSubject.totalTopics - inProgressSubject.completedTopics;
      const nextTopic = inProgressSubject.topics.find((t) => !t.isCompleted);
      recommendations.push({
        title: `${remaining} topic${remaining > 1 ? 's' : ''} remaining in ${inProgressSubject.name}`,
        subtitle: nextTopic ? `Next topic: ${nextTopic.title}` : `Complete the semester track`,
        action: 'Study',
        subjectId: inProgressSubject.id,
        topicId: nextTopic?.id,
      });
    } else {
      const unstarted = formattedSubjects.find((s) => s.completedTopics === 0);
      if (unstarted && unstarted.topics.length > 0) {
        recommendations.push({
          title: `Start your first topic in ${unstarted.name}`,
          subtitle: `${unstarted.topics[0].title}`,
          action: 'Begin',
          subjectId: unstarted.id,
          topicId: unstarted.topics[0].id,
        });
      }
    }

    // Handle global search if provided
    let searchResults: any = null;
    if (search) {
      const matchingTopics: any[] = [];
      const matchingResources: any[] = [];
      const matchingSubjects: any[] = [];

      formattedSubjects.forEach((sub) => {
        if (sub.name.toLowerCase().includes(search) || sub.code.toLowerCase().includes(search)) {
          matchingSubjects.push(sub);
        }
        sub.topics.forEach((top) => {
          if (top.title.toLowerCase().includes(search) || (top.description && top.description.toLowerCase().includes(search))) {
            matchingTopics.push({
              ...top,
              subjectId: sub.id,
              subjectCode: sub.code,
              subjectName: sub.name,
            });
          }
        });
        sub.resources.forEach((res) => {
          if (
            res.title.toLowerCase().includes(search) ||
            (res.description && res.description.toLowerCase().includes(search)) ||
            (res.author && res.author.toLowerCase().includes(search))
          ) {
            matchingResources.push({
              ...res,
              subjectId: sub.id,
              subjectCode: sub.code,
              subjectName: sub.name,
            });
          }
        });
      });

      searchResults = {
        subjects: matchingSubjects,
        topics: matchingTopics,
        resources: matchingResources,
      };
    }

    return NextResponse.json({
      student: {
        id: user.id,
        name: user.name,
        degree: profile?.degree || 'B.Tech',
        streamCode,
        semester: activeSemester,
        year: profile?.year || 1,
      },
      subjects: formattedSubjects,
      continueLearning,
      recommendations,
      savedResourcesCount: savedResourceIds.size,
      searchResults,
    });
  } catch (error) {
    console.error('Learning GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning workspace' }, { status: 500 });
  }
}
