import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { analyzeTimetableImage, KnownSubjectItem } from '@/lib/timetableOcrService';
import { getStudentSubjects } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let base64Data = '';
    let mimeType = 'image/jpeg';
    let fileName = 'timetable-upload.png';
    let fileSize = 0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No timetable file provided in upload.', success: false }, { status: 400 });
      }

      fileName = file.name || fileName;
      mimeType = file.type || mimeType;
      fileSize = file.size || 0;

      // Max 15MB file size limit (Security)
      if (fileSize > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Please upload a timetable file under 15MB.', success: false },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      base64Data = buffer.toString('base64');
    } else {
      const body = await request.json();
      base64Data = body.base64Data || '';
      mimeType = body.mimeType || 'image/jpeg';
      fileName = body.fileName || fileName;
      fileSize = body.fileSize || 0;

      // If data URL prefix is included (e.g. data:application/pdf;base64,...), strip it
      if (base64Data.includes(',')) {
        const parts = base64Data.split(',');
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
        base64Data = parts[1];
      }
    }

    // Supported formats: PDF, JPG, PNG, WEBP, HEIC, screenshots
    const validMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ];
    const isSupported =
      validMimes.includes(mimeType.toLowerCase()) ||
      ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].some((ext) =>
        fileName.toLowerCase().endsWith(ext)
      );

    if (!isSupported) {
      return NextResponse.json(
        {
          error: 'Unsupported file format. Please upload a PDF timetable, JPG, PNG, WEBP, or HEIC screenshot.',
          success: false,
        },
        { status: 400 }
      );
    }

    if (!base64Data) {
      return NextResponse.json({ error: 'Empty or invalid timetable data received.', success: false }, { status: 400 });
    }

    // Gather student's known subjects from database Subject records and Academic Syllabus
    const knownSubjects: KnownSubjectItem[] = [];

    // 1. Existing subjects
    const dbSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        instructor: true,
        room: true,
      },
    });

    for (const sub of dbSubjects) {
      knownSubjects.push({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        instructor: sub.instructor,
        room: sub.room,
      });
    }

    // 2. Academic syllabus subjects from student's profile if available
    try {
      const academicData = await getStudentSubjects(user.id);
      if (academicData?.available && Array.isArray(academicData.subjects)) {
        for (const acSub of academicData.subjects) {
          const exists = knownSubjects.some(
            (k) => (k.code && k.code === acSub.code) || k.name.toLowerCase() === acSub.name.toLowerCase()
          );
          if (!exists) {
            knownSubjects.push({
              id: acSub.id,
              name: acSub.name,
              code: acSub.code,
              type: acSub.subjectType || 'Lecture',
            });
          }
        }
      }
    } catch (e) {
      console.warn('[Classes Upload] Academic subjects fetch skipped:', e);
    }

    // Perform self-hosted PaddleOCR / PyMuPDF analysis
    const result = await analyzeTimetableImage({
      base64Data,
      mimeType,
      fileName,
      knownSubjects,
    });

    if (!result.success) {
      const statusCode = result.statusCode || 422;
      return NextResponse.json(
        {
          error: result.error || "We couldn't read this timetable. Please upload a clearer image or PDF.",
          success: false,
          statusCode,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      entries: result.entries,
      totalEntries: result.totalEntriesCount,
      detectedDays: result.detectedDaysCount,
      knownSubjects,
      fileName,
      fileSize,
    });
  } catch (error: any) {
    console.error('Error in /api/classes/upload:', error);
    return NextResponse.json(
      { error: "We couldn't read this timetable. Please upload a clearer image or PDF.", success: false },
      { status: 500 }
    );
  }
}
