import { IAttendanceProvider, ProviderContext } from './attendance-provider';
import {
  ProviderAttendanceResult,
  RawProviderAttendanceRecord,
  ManualAttendanceInput,
} from './attendance-types';

/**
 * Manual Attendance Provider
 *
 * Provides a fallback mechanism allowing students to enter their own real attendance numbers
 * when their college does not have an automated ERP API available.
 *
 * Always marks records as source: 'manual'.
 */
export class ManualAttendanceProvider implements IAttendanceProvider {
  readonly id = 'manual' as const;
  readonly name = 'Manual Attendance Entry';

  isConfigured(): boolean {
    return true;
  }

  async fetchAttendance(context: ProviderContext): Promise<ProviderAttendanceResult> {
    // When called to process manual entries passed in context
    const inputList: ManualAttendanceInput[] = (context as any).manualEntries || [];

    const records: RawProviderAttendanceRecord[] = [];

    for (const item of inputList) {
      const attended = Math.max(0, Number(item.attendedClasses || 0));
      const total = Math.max(0, Number(item.totalClasses || 0));
      const absent = Math.max(0, total - attended);

      records.push({
        subjectCode: (item.subjectCode || item.subjectName).trim(),
        subjectName: (item.subjectName || item.subjectCode).trim(),
        attendedClasses: attended,
        totalClasses: total,
        absentClasses: absent,
        lastUpdated: new Date(),
      });
    }

    return {
      success: true,
      source: this.id,
      records,
      lastSynced: new Date(),
    };
  }
}
