import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { subjectCode, missedCount } = await request.json();

    const subject = await prisma.subject.findFirst({
      where: { code: subjectCode },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Standard university semester model (approx 45 total lectures conducted)
    const totalLectures = 45;
    const currentlyAttended = Math.round((subject.attendanceRate / 100) * totalLectures);
    const newTotal = totalLectures + missedCount;
    const projectedCompliance = ((currentlyAttended / newTotal) * 100).toFixed(1);
    const statutoryMin = 75.0;
    const isSafe = parseFloat(projectedCompliance) >= statutoryMin;

    // Calculate maximum allowable misses while maintaining 75%
    // attended / (total + x) >= 0.75  =>  x <= (attended / 0.75) - total
    const safeBuffer = Math.max(0, Math.floor(currentlyAttended / 0.75 - totalLectures));

    return NextResponse.json({
      subjectCode: subject.code,
      subjectName: subject.name,
      currentRate: subject.attendanceRate,
      simulatedMisses: missedCount,
      projectedCompliance: parseFloat(projectedCompliance),
      delta: (parseFloat(projectedCompliance) - subject.attendanceRate).toFixed(1),
      isSafe,
      safeBuffer,
      advisory: isSafe
        ? `Compliant: You have a buffer of ${safeBuffer} allowable absence(s) remaining.`
        : `Critical: Projected compliance falls below statutory 75.0% threshold. Requires medical or dean waiver.`,
    });
  } catch (error) {
    console.error('Attendance simulate error:', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
