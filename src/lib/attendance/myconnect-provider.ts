import { IAttendanceProvider, ProviderContext } from './attendance-provider';
import { ProviderAttendanceResult, RawProviderAttendanceRecord } from './attendance-types';

const DEFAULT_MYCONNECT_BASE_URL =
  process.env.MYCONNECT_BASE_URL || 'https://demo.servergi.com:8071/CentralLoginAPIG6';

/**
 * MyConnect Attendance Provider
 *
 * Communicates with the authorized GiIndia ERP / MyConnect mobile attendance gateway.
 * Reuses the existing session authentication mechanism without creating a secondary login system.
 *
 * CRITICAL RULE:
 * If the MyConnect service is unreachable or returns invalid/empty records,
 * returns success: false with an appropriate error message.
 * NEVER returns mock/hardcoded fake attendance data!
 */
export class MyConnectProvider implements IAttendanceProvider {
  readonly id = 'myconnect' as const;
  readonly name = 'MyConnect ERP';

  private getBaseUrl(contextUrl?: string): string {
    return (contextUrl || process.env.MYCONNECT_BASE_URL || DEFAULT_MYCONNECT_BASE_URL)
      .trim()
      .replace(/\/+$/, '');
  }

  isConfigured(): boolean {
    return true;
  }

  async fetchAttendance(context: ProviderContext): Promise<ProviderAttendanceResult> {
    const username = context.credentials?.username;
    const sessionToken = context.sessionToken || context.credentials?.token;
    const baseUrl = this.getBaseUrl(context.collegeUrl);

    if (!username && !sessionToken) {
      return {
        success: false,
        source: this.id,
        records: [],
        error: 'MyConnect session is not active. Please connect your student account to sync attendance.',
      };
    }

    const studentIdentifier = username || 'student';

    try {
      // Endpoint 1: Semester Attendance
      const semesterEndpoint = `${baseUrl}/api/mgetcurrsemattendance/`;
      const periodEndpoint = `${baseUrl}/API/MobileStdAttendance/DateAndPeriodWiseAtt`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Attempt primary endpoint
      let response = await fetch(semesterEndpoint, {
        method: 'GET',
        headers: {
          'User-ID': studentIdentifier,
          'Accept': 'application/json',
          'User-Agent': 'Nivora-Student-OS/2.6 (Android; MobileAttendance)',
        },
        signal: controller.signal,
      }).catch(() => null);

      // If primary endpoint failed, attempt alternate verified endpoint
      if (!response || !response.ok) {
        response = await fetch(periodEndpoint, {
          method: 'GET',
          headers: {
            'User-ID': studentIdentifier,
            'Accept': 'application/json',
            'User-Agent': 'Nivora-Student-OS/2.6 (Android; MobileAttendance)',
          },
          signal: controller.signal,
        }).catch(() => null);
      }

      clearTimeout(timeoutId);

      if (!response || !response.ok) {
        return {
          success: false,
          source: this.id,
          records: [],
          error: 'Attendance data unavailable. Unable to retrieve attendance from your connected source.',
        };
      }

      const payload = await response.json().catch(() => null);
      if (!payload) {
        return {
          success: false,
          source: this.id,
          records: [],
          error: 'Attendance data unavailable. Empty or invalid response from MyConnect server.',
        };
      }

      const rawItems: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.subjectWise)
        ? payload.subjectWise
        : [];

      if (rawItems.length === 0) {
        return {
          success: false,
          source: this.id,
          records: [],
          error: 'No attendance records returned from your college ERP source for this term.',
        };
      }

      const records: RawProviderAttendanceRecord[] = [];

      for (const item of rawItems) {
        const subjectCode = (
          item.subjectCode ||
          item.code ||
          item.CourseCode ||
          item.SubCode ||
          ''
        ).trim();

        const subjectName = (
          item.subjectName ||
          item.subject ||
          item.name ||
          item.CourseName ||
          item.SubName ||
          subjectCode
        ).trim();

        const attended = Number(
          item.present ??
          item.attended ??
          item.PresentClasses ??
          item.AttendedClasses ??
          0
        );

        const total = Number(
          item.total ??
          item.totalClasses ??
          item.TotalClasses ??
          0
        );

        const absent = Number(
          item.absent ??
          item.absentClasses ??
          item.AbsentClasses ??
          Math.max(0, total - attended)
        );

        if (subjectCode || subjectName) {
          records.push({
            sourceRecordId: item.id ? String(item.id) : undefined,
            subjectCode: subjectCode || subjectName,
            subjectName: subjectName || subjectCode,
            attendedClasses: Math.max(0, attended),
            totalClasses: Math.max(0, total),
            absentClasses: Math.max(0, absent),
            lastUpdated: new Date(),
          });
        }
      }

      if (records.length === 0) {
        return {
          success: false,
          source: this.id,
          records: [],
          error: 'Attendance data unavailable. Could not parse valid subject attendance from ERP response.',
        };
      }

      return {
        success: true,
        source: this.id,
        records,
        lastSynced: new Date(),
      };
    } catch (err: any) {
      console.error('[MyConnectProvider] Fetch error:', err?.message || err);
      return {
        success: false,
        source: this.id,
        records: [],
        error: 'Attendance data unavailable. Network timeout or connection failure to college ERP gateway.',
      };
    }
  }
}
