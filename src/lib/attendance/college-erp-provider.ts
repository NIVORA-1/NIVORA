import { IAttendanceProvider, ProviderContext } from './attendance-provider';
import { ProviderAttendanceResult, RawProviderAttendanceRecord } from './attendance-types';

/**
 * College ERP Attendance Provider
 *
 * Communicates with institutional ERP systems (e.g. Ellucian Banner, PeopleSoft, Jenzabar, MasterSoft ERP).
 * Configured securely using server-side environment variables:
 * - COLLEGE_ERP_BASE_URL
 * - COLLEGE_ERP_API_KEY / COLLEGE_ERP_CLIENT_SECRET
 * - COLLEGE_ERP_PROVIDER
 *
 * NEVER exposes secrets to client-side code.
 * NEVER returns mock/fake attendance on failure.
 */
export class CollegeERPProvider implements IAttendanceProvider {
  readonly id = 'college_erp' as const;
  readonly name = 'College ERP Gateway';

  private getBaseUrl(): string {
    return (process.env.COLLEGE_ERP_BASE_URL || '').trim().replace(/\/+$/, '');
  }

  private getApiKey(): string {
    return (process.env.COLLEGE_ERP_API_KEY || '').trim();
  }

  isConfigured(): boolean {
    return Boolean(this.getBaseUrl() && this.getApiKey());
  }

  async fetchAttendance(context: ProviderContext): Promise<ProviderAttendanceResult> {
    const baseUrl = this.getBaseUrl();
    const apiKey = this.getApiKey();

    if (!baseUrl || !apiKey) {
      return {
        success: false,
        source: this.id,
        records: [],
        error: 'College ERP provider is not configured. Please configure COLLEGE_ERP_BASE_URL and COLLEGE_ERP_API_KEY.',
      };
    }

    const studentId = context.credentials?.username || context.userId;

    try {
      const endpoint = `${baseUrl}/api/v1/students/${encodeURIComponent(studentId)}/attendance`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'X-User-ID': context.userId,
          ...(context.customHeaders || {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          source: this.id,
          records: [],
          error: `College ERP server responded with status ${response.status}.`,
        };
      }

      const payload = await response.json();
      const rawList: any[] = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];

      const records: RawProviderAttendanceRecord[] = [];

      for (const item of rawList) {
        const subjectCode = (item.courseCode || item.subjectCode || item.code || '').trim();
        const subjectName = (item.courseName || item.subjectName || item.name || subjectCode).trim();
        const attended = Number(item.attended || item.present || item.attendedClasses || 0);
        const total = Number(item.total || item.totalClasses || 0);
        const absent = Number(item.absent || Math.max(0, total - attended));

        if (subjectCode || subjectName) {
          records.push({
            sourceRecordId: item.id ? String(item.id) : undefined,
            subjectCode: subjectCode || subjectName,
            subjectName: subjectName || subjectCode,
            attendedClasses: Math.max(0, attended),
            totalClasses: Math.max(0, total),
            absentClasses: Math.max(0, absent),
            lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
          });
        }
      }

      return {
        success: true,
        source: this.id,
        records,
        lastSynced: new Date(),
        metadata: {
          providerName: process.env.COLLEGE_ERP_PROVIDER || 'Standard ERP Gateway',
          rawCount: rawList.length,
        },
      };
    } catch (err: any) {
      console.error('[CollegeERPProvider] Error fetching attendance:', err?.message || err);
      return {
        success: false,
        source: this.id,
        records: [],
        error: `Could not retrieve attendance from College ERP: ${err?.message || 'Network error'}.`,
      };
    }
  }
}
