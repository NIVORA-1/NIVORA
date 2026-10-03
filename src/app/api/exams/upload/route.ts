import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { analyzeExamTimetableImage, KnownSubjectItem } from '@/lib/examOcrService';
import { getStudentSubjects } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 1. Server-side validation of Gemini API key (never expose key to client)
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!geminiKey || geminiKey === 'YOUR_GEMINI_API_KEY') {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key is not configured on the server. Please add your Gemini key in .env',
        },
        { status: 503 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let base64Data = '';
    let mimeType = 'image/jpeg';
    let fileName = 'exam-timetable.png';
    let fileSize = 0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No exam timetable file provided.', success: false }, { status: 400 });
      }

      fileName = file.name || fileName;
      mimeType = file.type || mimeType;
      fileSize = file.size || 0;

      // Max 20MB file size limit for PDF or hi-res images
      if (fileSize > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Please upload an image or PDF under 20MB.', success: false },
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

      // Strip data URL prefix if present
      if (base64Data.includes(',')) {
        const parts = base64Data.split(',');
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
        base64Data = parts[1];
      }
    }

    // Format validation (Supports JPG, PNG, WEBP, HEIC, PDF)
    const validMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'application/pdf',
    ];
    const isSupported =
      validMimes.includes(mimeType.toLowerCase()) ||
      ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.pdf'].some((ext) =>
        fileName.toLowerCase().endsWith(ext)
      );

    if (!isSupported) {
      return NextResponse.json(
        {
          error: 'Unsupported file format. Please upload a JPG, PNG, WEBP, HEIC image, or PDF document.',
          success: false,
        },
        { status: 400 }
      );
    }

    if (!base64Data) {
      return NextResponse.json({ error: 'Empty or invalid file data received.', success: false }, { status: 400 });
    }

    // 2. Gather student's known existing subjects to match against
    const knownSubjects: KnownSubjectItem[] = [];

    // Existing database subjects
    const dbSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        instructor: true,
        room: true,
      },
    });

    for (const sub of dbSubjects) {
      knownSubjects.push({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        color: sub.color,
        instructor: sub.instructor,
        room: sub.room,
      });
    }

    // Academic syllabus subjects from student's profile if available
    try {
      const academicData = await getStudentSubjects(user.id);
      if (academicData?.available && Array.isArray(academicData.subjects)) {
        for (const acSub of academicData.subjects) {
          const exists = knownSubjects.some(
            (k) => (k.code && k.code.toLowerCase() === acSub.code.toLowerCase()) ||
                   k.name.toLowerCase() === acSub.name.toLowerCase()
          );
          if (!exists) {
            knownSubjects.push({
              id: acSub.id,
              name: acSub.name,
              code: acSub.code,
            });
          }
        }
      }
    } catch (e) {
      console.warn('[Exam Upload] Academic subjects fetch skipped:', e);
    }

    // 3. Process with Gemini Vision OCR
    const ocrResult = await analyzeExamTimetableImage({
      base64Data,
      mimeType,
      knownSubjects,
    });

    if (!ocrResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: ocrResult.error || 'Failed to analyze exam timetable image.',
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: ocrResult.entries,
      totalDetected: ocrResult.entries.length,
      knownSubjects,
      fileName,
      fileSize,
    });
  } catch (error: any) {
    console.error('[Exam Upload] Unexpected exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Server error occurred during timetable OCR processing.',
      },
      { status: 500 }
    );
  }
}
