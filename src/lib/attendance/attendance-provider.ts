import { ProviderAttendanceResult, AttendanceSource } from './attendance-types';

export interface ProviderContext {
  userId: string;
  sessionToken?: string;
  collegeUrl?: string;
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
  };
  customHeaders?: Record<string, string>;
}

export interface IAttendanceProvider {
  readonly id: AttendanceSource;
  readonly name: string;

  /**
   * Fetches real attendance from the provider.
   * If real attendance is unavailable, MUST return success: false with an explanatory error.
   * MUST NEVER return fake/mock attendance fallback.
   */
  fetchAttendance(context: ProviderContext): Promise<ProviderAttendanceResult>;

  /**
   * Checks whether this provider is currently configured and authorized to connect.
   */
  isConfigured(): boolean;
}
