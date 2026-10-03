import prisma from '@/lib/prisma';
import { IAttendanceProvider, ProviderContext } from './attendance-provider';
import { CollegeERPProvider } from './college-erp-provider';
import { MyConnectProvider } from './myconnect-provider';
import { ManualAttendanceProvider } from './manual-provider';
import {
  AttendanceSource,
  calculateAttendancePercentage,
  calculateOverallAttendanceSummary,
  NormalizedAttendanceRecord,
  OverallAttendanceSummary,
  RawProviderAttendanceRecord,
  ManualAttendanceInput,
} from './attendance-types';

export class AttendanceService {
  private static providers: Map<AttendanceSource, IAttendanceProvider> = new Map<AttendanceSource, IAttendanceProvider>([
    ['college_erp', new CollegeERPProvider()],
    ['myconnect', new MyConnectProvider()],
    ['manual', new ManualAttendanceProvider()],
  ]);

  /**
   * Returns a registered attendance provider by ID.
   */
  public static getProvider(id: AttendanceSource): IAttendanceProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Unknown attendance provider: ${id}`);
    }
    return provider;
  }

  /**
   * Matches raw provider attendance against the student's existing NIVORA subjects.
   *
   * Priority:
   * 1. Exact subject_code match (case-insensitive)
   * 2. Provider subject ID match
   * 3. Normalized subject name match
   *
   * If no match exists:
   * Returns null for subjectId. NEVER silently assigns to another subject!
   */
  public static matchSubject(
    rawRecord: RawProviderAttendanceRecord,
    existingSubjects: Array<{ id: string; name: string; code: string }>
  ): { matchedSubjectId: string | null; matchedSubjectName?: string } {
    const rawCode = (rawRecord.subjectCode || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const rawName = (rawRecord.subjectName || '').trim().toLowerCase();

    // 1. Match by subject_code
    if (rawCode) {
      const byCode = existingSubjects.find(
        (s) => s.code && s.code.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === rawCode
      );
      if (byCode) {
        return { matchedSubjectId: byCode.id, matchedSubjectName: byCode.name };
      }
    }

    // 2. Match by normalized subject name
    if (rawName) {
      const byExactName = existingSubjects.find(
        (s) => s.name && s.name.trim().toLowerCase() === rawName
      );
      if (byExactName) {
        return { matchedSubjectId: byExactName.id, matchedSubjectName: byExactName.name };
      }

      // Token overlap similarity for names
      const rawTokens = new Set(rawName.split(/\s+/).filter((t) => t.length > 2));
      for (const sub of existingSubjects) {
        const subName = sub.name.trim().toLowerCase();
        const subTokens = subName.split(/\s+/).filter((t) => t.length > 2);
        const matchCount = subTokens.filter((t) => rawTokens.has(t)).length;

        if (subTokens.length > 0 && matchCount / subTokens.length >= 0.7) {
          return { matchedSubjectId: sub.id, matchedSubjectName: sub.name };
        }
      }
    }

    // No confident match: strictly return null (do not invent or guess)
    return { matchedSubjectId: null };
  }

  /**
   * Retrieves all real attendance records for an authenticated user.
   */
  public static async getUserAttendance(userId: string): Promise<{
    records: NormalizedAttendanceRecord[];
    overall: OverallAttendanceSummary;
    unmatched: NormalizedAttendanceRecord[];
  }> {
    const dbRecords = await prisma.attendance.findMany({
      where: { userId },
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
      orderBy: [{ subjectCode: 'asc' }],
    });

    const normalized: NormalizedAttendanceRecord[] = dbRecords.map((r) => ({
      id: r.id,
      userId: r.userId,
      subjectId: r.subjectId,
      subjectCode: r.subjectCode,
      subjectName: r.subjectName,
      attendedClasses: r.attendedClasses,
      totalClasses: r.totalClasses,
      absentClasses: r.absentClasses,
      attendancePercentage: r.attendancePercentage,
      lastUpdated: r.lastUpdated,
      source: r.source as AttendanceSource,
      sourceRecordId: r.sourceRecordId,
      matchedSubject: r.subject,
    }));

    const overall = calculateOverallAttendanceSummary(normalized);
    const unmatched = normalized.filter((r) => !r.subjectId);

    return {
      records: normalized,
      overall,
      unmatched,
    };
  }

  /**
   * Synchronizes attendance from an external provider (College ERP or MyConnect).
   *
   * Flow:
   * 1. Authenticate & request attendance from configured provider.
   * 2. Normalize provider response.
   * 3. Match subjects against student's existing subjects.
   * 4. Upsert attendance records by [userId, subjectCode].
   * 5. Update last_updated timestamp.
   *
   * SAFETY: If provider sync fails, NEVER overwrites or deletes existing valid data.
   */
  public static async syncAttendance(
    userId: string,
    providerId: AttendanceSource,
    context: ProviderContext
  ): Promise<{
    success: boolean;
    syncedCount: number;
    error?: string;
    overall?: OverallAttendanceSummary;
  }> {
    const provider = this.getProvider(providerId);

    // Fetch from real provider
    const fetchResult = await provider.fetchAttendance(context);

    if (!fetchResult.success || fetchResult.records.length === 0) {
      return {
        success: false,
        syncedCount: 0,
        error: fetchResult.error || 'Attendance data unavailable from your connected source.',
      };
    }

    // Fetch existing subjects for matching
    const existingSubjects = await prisma.subject.findMany({
      select: { id: true, name: true, code: true },
    });

    const now = new Date();
    let syncedCount = 0;

    // Run in a transaction to guarantee data integrity
    await prisma.$transaction(async (tx) => {
      for (const item of fetchResult.records) {
        const code = item.subjectCode.trim();
        const name = item.subjectName.trim() || code;
        const attended = Math.max(0, item.attendedClasses);
        const total = Math.max(0, item.totalClasses);
        const absent = Math.max(0, item.absentClasses ?? (total - attended));
        const percentage = calculateAttendancePercentage(attended, total);

        // Subject matching
        const { matchedSubjectId } = this.matchSubject(item, existingSubjects);

        // Upsert by [userId, subjectCode] to avoid duplicate records on repeated syncs
        await tx.attendance.upsert({
          where: {
            userId_subjectCode: {
              userId,
              subjectCode: code,
            },
          },
          update: {
            subjectId: matchedSubjectId,
            subjectName: name,
            attendedClasses: attended,
            totalClasses: total,
            absentClasses: absent,
            attendancePercentage: percentage,
            lastUpdated: now,
            source: fetchResult.source,
            sourceRecordId: item.sourceRecordId || null,
          },
          create: {
            userId,
            subjectId: matchedSubjectId,
            subjectCode: code,
            subjectName: name,
            attendedClasses: attended,
            totalClasses: total,
            absentClasses: absent,
            attendancePercentage: percentage,
            lastUpdated: now,
            source: fetchResult.source,
            sourceRecordId: item.sourceRecordId || null,
          },
        });

        syncedCount++;
      }
    });

    const userSummary = await this.getUserAttendance(userId);

    return {
      success: true,
      syncedCount,
      overall: userSummary.overall,
    };
  }

  /**
   * Saves or updates a manual attendance entry.
   * Clearly flags record with source: 'manual'.
   */
  public static async recordManualAttendance(
    userId: string,
    input: ManualAttendanceInput
  ): Promise<NormalizedAttendanceRecord> {
    const attended = Math.max(0, Number(input.attendedClasses || 0));
    const total = Math.max(0, Number(input.totalClasses || 0));

    if (attended > total) {
      throw new Error('Attended classes cannot exceed total classes.');
    }

    const code = (input.subjectCode || input.subjectName).trim();
    const name = (input.subjectName || input.subjectCode).trim();
    const absent = Math.max(0, total - attended);
    const percentage = calculateAttendancePercentage(attended, total);

    // Verify subjectId if provided
    let verifiedSubjectId: string | null = null;
    if (input.subjectId) {
      const sub = await prisma.subject.findUnique({
        where: { id: input.subjectId },
        select: { id: true },
      });
      if (sub) verifiedSubjectId = sub.id;
    }

    const saved = await prisma.attendance.upsert({
      where: {
        userId_subjectCode: {
          userId,
          subjectCode: code,
        },
      },
      update: {
        subjectId: verifiedSubjectId,
        subjectName: name,
        attendedClasses: attended,
        totalClasses: total,
        absentClasses: absent,
        attendancePercentage: percentage,
        lastUpdated: new Date(),
        source: 'manual',
      },
      create: {
        userId,
        subjectId: verifiedSubjectId,
        subjectCode: code,
        subjectName: name,
        attendedClasses: attended,
        totalClasses: total,
        absentClasses: absent,
        attendancePercentage: percentage,
        lastUpdated: new Date(),
        source: 'manual',
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
    });

    return {
      id: saved.id,
      userId: saved.userId,
      subjectId: saved.subjectId,
      subjectCode: saved.subjectCode,
      subjectName: saved.subjectName,
      attendedClasses: saved.attendedClasses,
      totalClasses: saved.totalClasses,
      absentClasses: saved.absentClasses,
      attendancePercentage: saved.attendancePercentage,
      lastUpdated: saved.lastUpdated,
      source: saved.source as AttendanceSource,
      matchedSubject: saved.subject,
    };
  }

  /**
   * Manually maps an unmatched attendance record to a NIVORA subject.
   */
  public static async mapSubjectManually(
    userId: string,
    attendanceId: string,
    subjectId: string
  ): Promise<boolean> {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true, code: true },
    });

    if (!subject) {
      throw new Error('Selected subject does not exist.');
    }

    const existing = await prisma.attendance.findFirst({
      where: { id: attendanceId, userId },
    });

    if (!existing) {
      throw new Error('Attendance record not found or unauthorized.');
    }

    await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        subjectId: subject.id,
      },
    });

    return true;
  }
}
