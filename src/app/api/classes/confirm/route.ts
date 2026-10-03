import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ExtractedClassEntry } from '@/lib/timetableOcrService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      entries,
      mode = 'replace',
      fileName,
      fileSize,
      imageUrl,
    } = body as {
      entries: ExtractedClassEntry[];
      mode?: 'replace' | 'merge';
      fileName?: string;
      fileSize?: number;
      imageUrl?: string;
    };

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'No confirmed timetable entries provided.' },
        { status: 400 }
      );
    }

    // Run in a transaction to guarantee data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. If replace mode, remove previous timetable entries for this user
      if (mode === 'replace') {
        await tx.classSchedule.deleteMany({
          where: { userId: user.id },
        });
      }

      // 2. Fetch existing subjects to match & link correctly (prevents duplicate subject records)
      const existingSubjects = await tx.subject.findMany();

      // 3. Fetch existing classes for this user to prevent duplicate classes on re-upload
      const existingUserClasses = await tx.classSchedule.findMany({
        where: { userId: user.id },
      });

      const savedEntries = [];
      const processedSlotSignatures = new Set<string>();

      for (const entry of entries) {
        // Clean fields
        const cleanDayOfWeek = entry.dayOfWeek || 1;
        const cleanDayName = entry.day || 'Monday';
        const cleanStartTime = (entry.startTime || entry.start_time || '09:00').trim();
        const cleanEndTime = (entry.endTime || entry.end_time || '10:00').trim();
        const cleanSubject = (entry.subject || entry.subjectName || 'Unassigned Subject').trim();
        const entryCode = (entry.courseCode || entry.subjectCode || '').trim();
        const cleanFaculty = (entry.faculty || '').trim();
        const cleanRoom = (entry.room || '').trim();
        const cleanSection = (entry.section || '').trim();
        const cleanType =
          entry.classType ||
          (entry.type
            ? entry.type.toLowerCase().includes('lab')
              ? 'Lab'
              : entry.type.toLowerCase().includes('tut')
              ? 'Tutorial'
              : 'Lecture'
            : 'Lecture');

        // Prevent duplicate class entries within the same submission batch
        const batchSlotKey = `${cleanDayOfWeek}_${cleanStartTime}_${cleanSubject.toLowerCase()}`;
        if (processedSlotSignatures.has(batchSlotKey)) {
          continue;
        }
        processedSlotSignatures.add(batchSlotKey);

        // Subject matching: check if OCR matched or if subject already exists
        let finalSubjectId: string | null = null;

        if (entry.matchedSubjectId) {
          const matched = existingSubjects.find((s) => s.id === entry.matchedSubjectId);
          if (matched) {
            finalSubjectId = matched.id;
          }
        }

        // If not directly matched, match against existing subjects by code or name
        if (!finalSubjectId) {
          const matchByCodeOrName = existingSubjects.find((s) => {
            const codeMatch = entryCode && s.code.toLowerCase() === entryCode.toLowerCase();
            const nameMatch = s.name.toLowerCase() === cleanSubject.toLowerCase();
            return codeMatch || nameMatch;
          });
          if (matchByCodeOrName) {
            finalSubjectId = matchByCodeOrName.id;
          }
        }

        // Prevent duplicate classes if already present in student's schedule (e.g. merge mode / re-upload)
        const duplicateClass = existingUserClasses.find(
          (c) =>
            c.dayOfWeek === cleanDayOfWeek &&
            c.startTime === cleanStartTime &&
            (mode === 'merge' || c.subjectName.toLowerCase() === cleanSubject.toLowerCase())
        );

        if (duplicateClass) {
          // Update existing class instead of creating duplicate
          const updated = await tx.classSchedule.update({
            where: { id: duplicateClass.id },
            data: {
              subjectId: finalSubjectId || duplicateClass.subjectId,
              dayName: cleanDayName,
              endTime: cleanEndTime,
              subjectName: cleanSubject,
              subjectCode: entryCode || duplicateClass.subjectCode,
              instructor: cleanFaculty || duplicateClass.instructor,
              room: cleanRoom || duplicateClass.room,
              type: cleanType,
              section: cleanSection || duplicateClass.section,
              needsReview: Boolean(entry.needsReview),
              notes: entry.reviewReason || duplicateClass.notes,
            },
          });
          savedEntries.push(updated);
        } else {
          // Create new class schedule record
          const created = await tx.classSchedule.create({
            data: {
              userId: user.id,
              subjectId: finalSubjectId,
              dayOfWeek: cleanDayOfWeek,
              dayName: cleanDayName,
              startTime: cleanStartTime,
              endTime: cleanEndTime,
              subjectName: cleanSubject,
              subjectCode: entryCode || null,
              instructor: cleanFaculty || 'TBD',
              room: cleanRoom || 'TBD',
              type: cleanType,
              section: cleanSection || null,
              needsReview: Boolean(entry.needsReview),
              notes: entry.reviewReason || null,
            },
          });
          savedEntries.push(created);
        }
      }

      // 4. Record timetable upload audit/history
      await tx.timetableUpload.create({
        data: {
          userId: user.id,
          imageUrl: imageUrl || null,
          fileName: fileName || 'timetable-import.pdf',
          fileSize: fileSize || null,
          entriesCount: savedEntries.length,
          status: 'completed',
        },
      });

      return savedEntries;
    });

    return NextResponse.json({
      success: true,
      mode,
      count: result.length,
      message: `Successfully saved ${result.length} classes to your personal schedule.`,
    });
  } catch (error: any) {
    console.error('Error in /api/classes/confirm:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save confirmed timetable.' },
      { status: 500 }
    );
  }
}
