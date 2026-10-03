import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject')?.trim();

    // Ensure at least a few default study groups exist in database
    const count = await prisma.studyGroup.count();
    if (count === 0) {
      await prisma.studyGroup.createMany({
        data: [
          {
            name: 'Distributed Systems & Cloud Architecture',
            subjectCode: 'CS-301',
            membersCount: 48,
            lastActive: '10m ago',
            description: 'Core discussion space for Raft consensus, Byzantine fault tolerance, and RPC frameworks.',
          },
          {
            name: 'Database Kernels & Query Optimization',
            subjectCode: 'CS-302',
            membersCount: 36,
            lastActive: '25m ago',
            description: 'B-tree vs LSM-tree trade-offs, query planning, and concurrency control.',
          },
          {
            name: 'Autonomous Robotics & ROS2 Mechatronics',
            subjectCode: 'ME-304',
            membersCount: 29,
            lastActive: '1h ago',
            description: 'Hardware controllers, inverse kinematics, and brushless drive sync.',
          },
          {
            name: 'Transformer Architectures & PyTorch LLMs',
            subjectCode: 'DS-305',
            membersCount: 52,
            lastActive: '5m ago',
            description: 'FlashAttention kernel optimizations, quantizations, and inference throughput.',
          },
        ],
      });

      const groups = await prisma.studyGroup.findMany();
      if (groups.length > 0) {
        await prisma.discussion.createMany({
          data: [
            {
              groupId: groups[0].id,
              authorName: 'Aarav Sharma',
              title: 'Leader election split-vote handling in 5-node cluster',
              content: 'Has anyone benchmarked election timeout jitter between 150ms-300ms vs 250ms-500ms on simulated high packet loss?',
              repliesCount: 8,
            },
            {
              groupId: groups[1].id,
              authorName: 'Rishabh S.',
              title: 'LSM Compaction strategies under 90% write-heavy workloads',
              content: 'Comparing leveled compaction write amplification with FIFO windowing for telemetry streams.',
              repliesCount: 5,
            },
            {
              groupId: groups[2].id,
              authorName: 'Rohan Mehta',
              title: 'CAN Bus baud rate sync between STM32 and ROS2 micro-agent',
              content: 'Encountering occasional frame drop at 1Mbps when running 6 brushless actuators simultaneously.',
              repliesCount: 11,
            },
          ],
        });
      }
    }

    const discussions = await prisma.discussion.findMany({
      where: subject && subject !== 'ALL'
        ? {
            group: {
              subjectCode: subject,
            },
          }
        : undefined,
      include: {
        group: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const groups = await prisma.studyGroup.findMany({
      orderBy: { membersCount: 'desc' },
    });

    return NextResponse.json({
      discussions: discussions.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        authorName: d.authorName,
        groupName: d.group.name,
        subjectCode: d.group.subjectCode,
        repliesCount: d.repliesCount,
        createdAt: d.createdAt.toISOString(),
      })),
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        subjectCode: g.subjectCode,
        membersCount: g.membersCount,
        lastActive: g.lastActive,
        description: g.description,
      })),
    });
  } catch (error) {
    console.error('Discussions GET error:', error);
    return NextResponse.json({ discussions: [], groups: [] });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to start a discussion.' }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, title, content } = body;

    if (!groupId || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Group, title, and content are required.' }, { status: 400 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        groupId,
        authorName: user.name,
        title: title.trim(),
        content: content.trim(),
        repliesCount: 0,
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json({
      id: discussion.id,
      title: discussion.title,
      content: discussion.content,
      authorName: discussion.authorName,
      groupName: discussion.group.name,
      subjectCode: discussion.group.subjectCode,
      repliesCount: 0,
      createdAt: discussion.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    return NextResponse.json({ error: 'Failed to create discussion.' }, { status: 500 });
  }
}
