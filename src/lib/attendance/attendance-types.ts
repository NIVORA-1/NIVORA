/**
 * NIVORA Attendance System Types & Calculation Utilities
 * Production-ready real attendance integration.
 */

export type AttendanceSource = 'college_erp' | 'myconnect' | 'manual';

export interface RawProviderAttendanceRecord {
  sourceRecordId?: string | null;
  subjectCode: string;
  subjectName: string;
  attendedClasses: number;
  totalClasses: number;
  absentClasses?: number;
  lastUpdated?: Date | string;
}

export interface ProviderAttendanceResult {
  success: boolean;
  source: AttendanceSource;
  records: RawProviderAttendanceRecord[];
  error?: string;
  lastSynced?: Date;
  metadata?: Record<string, any>;
}

export interface NormalizedAttendanceRecord {
  id?: string;
  userId: string;
  subjectId: string | null;
  subjectCode: string;
  subjectName: string;
  attendedClasses: number;
  totalClasses: number;
  absentClasses: number;
  attendancePercentage: number;
  lastUpdated: Date;
  source: AttendanceSource;
  sourceRecordId?: string | null;
  matchedSubject?: {
    id: string;
    name: string;
    code: string;
    color?: string | null;
  } | null;
}

export interface OverallAttendanceSummary {
  totalAttended: number;
  totalClasses: number;
  totalAbsent: number;
  overallPercentage: number;
  subjectsCount: number;
  lastUpdated: Date | null;
  status: 'Optimal' | 'Attention' | 'Critical';
  safeMisses: number;
  classesRequiredFor75: number;
}

export interface ManualAttendanceInput {
  subjectId?: string | null;
  subjectCode: string;
  subjectName: string;
  attendedClasses: number;
  totalClasses: number;
}

/**
 * Accurately calculates attendance percentage based on real numbers.
 * Formula: (total_classes > 0) ? (attended_classes / total_classes) * 100 : 0
 * Rounded to 1 decimal place. Never calculated from mock values.
 */
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (!total || total <= 0) return 0;
  if (!attended || attended < 0) return 0;
  const pct = (attended / total) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Calculates overall attendance across multiple subjects.
 * Formula: Total attended classes across subjects / Total classes across subjects * 100
 * IMPORTANT: NEVER averages subject percentages because that produces incorrect mathematical results.
 */
export function calculateOverallAttendanceSummary(
  records: Array<{ attendedClasses: number; totalClasses: number; lastUpdated?: Date | string }>
): OverallAttendanceSummary {
  let totalAttended = 0;
  let totalClasses = 0;
  let latestDate: Date | null = null;

  for (const r of records) {
    totalAttended += Math.max(0, r.attendedClasses || 0);
    totalClasses += Math.max(0, r.totalClasses || 0);

    if (r.lastUpdated) {
      const d = new Date(r.lastUpdated);
      if (!latestDate || d > latestDate) {
        latestDate = d;
      }
    }
  }

  const totalAbsent = Math.max(0, totalClasses - totalAttended);
  const overallPercentage = calculateAttendancePercentage(totalAttended, totalClasses);

  let status: 'Optimal' | 'Attention' | 'Critical' = 'Optimal';
  if (overallPercentage < 75.0) {
    status = overallPercentage < 65.0 ? 'Critical' : 'Attention';
  }

  // Safe misses calculation: attended / (total + x) >= 0.75 => x <= (attended / 0.75) - total
  let safeMisses = 0;
  if (totalClasses > 0 && overallPercentage >= 75.0) {
    safeMisses = Math.max(0, Math.floor(totalAttended / 0.75 - totalClasses));
  }

  // Lectures required consecutively to reach 75%: (attended + x) / (total + x) >= 0.75
  let classesRequiredFor75 = 0;
  if (totalClasses > 0 && overallPercentage < 75.0) {
    classesRequiredFor75 = Math.max(0, Math.ceil((0.75 * totalClasses - totalAttended) / 0.25));
  }

  return {
    totalAttended,
    totalClasses,
    totalAbsent,
    overallPercentage,
    subjectsCount: records.length,
    lastUpdated: latestDate,
    status,
    safeMisses,
    classesRequiredFor75,
  };
}
