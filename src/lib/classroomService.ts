/**
 * Nivora Google Classroom Integration Service
 *
 * Implements official Google Classroom REST API v1 interactions with OAuth 2.0.
 * Read-only scopes:
 * - https://www.googleapis.com/auth/classroom.courses.readonly
 * - https://www.googleapis.com/auth/classroom.coursework.me.readonly
 *
 * Strict Security:
 * - Server-side only
 * - Client secrets never exposed to frontend
 * - OAuth tokens encrypted at rest via AES-256-GCM
 * - Refresh tokens never exposed to frontend
 * - Duplicate prevention via (userId, source, externalId)
 */

import prisma from '@/lib/prisma';
import { encryptToken, decryptToken } from '@/lib/tokenEncryption';
import { getStudentSubjects } from '@/lib/academicService';

export const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'openid',
  'email',
  'profile',
];

export interface GoogleClassroomCourseItem {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  courseState?: string;
  alternateLink?: string;
}

export interface GoogleClassroomWorkItem {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
    seconds?: number;
    nanos?: number;
  };
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION' | string;
  topicId?: string;
}

/**
 * Retrieves Google Classroom OAuth credentials from environment variables.
 * Checks GOOGLE_CLASSROOM_CLIENT_ID / GOOGLE_CLASSROOM_CLIENT_SECRET first,
 * falling back to GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
 */
export function getClassroomOAuthCredentials() {
  const clientId =
    process.env.GOOGLE_CLASSROOM_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    '';
  const clientSecret =
    process.env.GOOGLE_CLASSROOM_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    '';
  const configuredRedirect = process.env.GOOGLE_CLASSROOM_REDIRECT_URI?.trim() || '';

  return { clientId, clientSecret, configuredRedirect };
}

/**
 * Builds Google OAuth 2.0 Authorization URL specifically for Google Classroom access
 */
export function getGoogleClassroomAuthUrl(state: string, redirectUri: string): string {
  const { clientId } = getClassroomOAuthCredentials();
  if (!clientId) {
    throw new Error('Google Classroom OAuth Client ID is not configured on the server. Please add GOOGLE_CLASSROOM_CLIENT_ID or GOOGLE_CLIENT_ID to .env');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: CLASSROOM_SCOPES.join(' '),
    access_type: 'offline', // Ensures refresh_token is issued
    prompt: 'consent', // Forces consent screen to grant refresh token
    include_granted_scopes: 'true',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges Google OAuth authorization code for Classroom access & refresh tokens
 */
export async function exchangeClassroomCode(code: string, redirectUri: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scopes: string[];
  googleAccountId?: string;
  email?: string;
}> {
  const { clientId, clientSecret } = getClassroomOAuthCredentials();

  if (!clientId || !clientSecret) {
    throw new Error('Google Classroom OAuth credentials (GOOGLE_CLASSROOM_CLIENT_ID / GOOGLE_CLASSROOM_CLIENT_SECRET) missing.');
  }

  console.log('[Classroom OAuth] Exchanging code with redirectUri:', redirectUri);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.json().catch(() => ({}));
    console.error('[Classroom OAuth] Token exchange error:', tokenRes.status, errorBody);
    const errorMsg = errorBody.error_description || errorBody.error || `HTTP ${tokenRes.status}`;
    if (errorBody.error === 'redirect_uri_mismatch') {
      throw new Error(`redirect_uri_mismatch: Callback URL "${redirectUri}" does not match the Authorized Redirect URI in Google Cloud Console.`);
    }
    if (errorBody.error === 'invalid_grant') {
      throw new Error('invalid_grant: Authorization code expired or already used. Please reconnect.');
    }
    if (errorBody.error === 'invalid_client') {
      throw new Error('invalid_client: Client ID or Client Secret is incorrect in server .env.');
    }
    throw new Error(`Google token exchange failed: ${errorMsg}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;
  const expiresIn = tokenData.expires_in || 3600;
  const scopes = (tokenData.scope || '').split(' ').filter(Boolean);

  let googleAccountId: string | undefined;
  let email: string | undefined;

  // Retrieve user info if id_token or userinfo is available
  try {
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (infoRes.ok) {
      const userInfo = await infoRes.json();
      googleAccountId = userInfo.sub;
      email = userInfo.email;
    }
  } catch (err) {
    console.warn('[Classroom OAuth] User info fetch skipped:', err);
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    scopes,
    googleAccountId,
    email,
  };
}

/**
 * Ensures a valid access token for the given user, refreshing it if expired
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const connection = await prisma.googleClassroomConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    throw new Error('Google Classroom is not connected for this user.');
  }

  if (connection.status === 'disconnected') {
    throw new Error('Google Classroom connection was disconnected. Please reconnect.');
  }

  const now = new Date();
  const expiresAt = connection.expiresAt ? new Date(connection.expiresAt) : null;
  // If token is still valid with at least 2 minutes of buffer, return decrypted token
  if (expiresAt && expiresAt.getTime() - now.getTime() > 2 * 60 * 1000) {
    return decryptToken(connection.accessToken);
  }

  // Token expired or expiring soon -> Refresh using refresh_token
  if (!connection.refreshToken) {
    throw new Error('No refresh token available. Please reconnect Google Classroom.');
  }

  const { clientId, clientSecret } = getClassroomOAuthCredentials();
  if (!clientId || !clientSecret) {
    throw new Error('Google Classroom OAuth credentials not configured on the server.');
  }

  const decryptedRefreshToken = decryptToken(connection.refreshToken);

  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: decryptedRefreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!refreshRes.ok) {
    const errText = await refreshRes.text().catch(() => '');
    console.error('[Classroom OAuth] Token refresh failed:', refreshRes.status, errText);

    // Update connection status to expired
    await prisma.googleClassroomConnection.update({
      where: { userId },
      data: { status: 'expired' },
    });

    throw new Error('Google Classroom authorization expired or was revoked. Please reconnect.');
  }

  const refreshedData = await refreshRes.json();
  const newAccessToken = refreshedData.access_token;
  const newExpiresIn = refreshedData.expires_in || 3600;
  const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000);

  // Update in database with encrypted token
  await prisma.googleClassroomConnection.update({
    where: { userId },
    data: {
      accessToken: encryptToken(newAccessToken),
      expiresAt: newExpiresAt,
      status: 'connected',
      // Some providers rotate refresh tokens
      ...(refreshedData.refresh_token && {
        refreshToken: encryptToken(refreshedData.refresh_token),
      }),
    },
  });

  return newAccessToken;
}

/**
 * Fetches active courses for the student using the official Google Classroom API
 */
export async function fetchClassroomCourses(accessToken: string): Promise<GoogleClassroomCourseItem[]> {
  const url = 'https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE';

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    console.error('[Classroom API] courses.list error:', res.status, err);
    throw new Error(`Failed to fetch Google Classroom courses (HTTP ${res.status}).`);
  }

  const data = await res.json();
  return (data.courses || []) as GoogleClassroomCourseItem[];
}

/**
 * Fetches published coursework for a course using the official Google Classroom API
 */
export async function fetchCourseWorkList(
  courseId: string,
  accessToken: string
): Promise<GoogleClassroomWorkItem[]> {
  const url = `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?courseWorkStates=PUBLISHED`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    // If course permissions prevent coursework reading, return empty array gracefully
    if (res.status === 403 || res.status === 404) {
      console.warn(`[Classroom API] Cannot access coursework for course ${courseId}: HTTP ${res.status}`);
      return [];
    }
    const err = await res.text().catch(() => '');
    console.error(`[Classroom API] coursework.list error for course ${courseId}:`, res.status, err);
    throw new Error(`Failed to fetch coursework for course ${courseId} (HTTP ${res.status}).`);
  }

  const data = await res.json();
  return (data.courseWork || []) as GoogleClassroomWorkItem[];
}

/**
 * Helper: Calculates string similarity between 0.0 and 1.0
 */
function stringSimilarity(s1: string, s2: string): number {
  const clean1 = (s1 || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const clean2 = (s2 || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 1.0;

  if (clean1.includes(clean2) || clean2.includes(clean1)) {
    return Math.max(0.75, Math.min(clean1.length, clean2.length) / Math.max(clean1.length, clean2.length));
  }

  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);
  let matches = 0;
  words1.forEach((w) => {
    if (words2.includes(w)) matches++;
  });
  return (matches * 2) / (words1.length + words2.length);
}

/**
 * Matches a Google Classroom course to a NIVORA subject
 * Matching priority:
 * 1. Existing stored Google Classroom course mapping
 * 2. Exact subject/course code match
 * 3. Exact normalized subject name match
 * 4. Reasonable normalized-name match
 */
export function matchCourseToSubject(
  course: GoogleClassroomCourseItem,
  storedSubjectId: string | null,
  knownSubjects: Array<{ id: string; name: string; code: string }>
): {
  matchedSubjectId: string | null;
  matchedSubjectName: string | null;
  confidence: number;
} {
  // 1. Existing stored mapping
  if (storedSubjectId) {
    const found = knownSubjects.find((s) => s.id === storedSubjectId);
    if (found) {
      return { matchedSubjectId: found.id, matchedSubjectName: found.name, confidence: 1.0 };
    }
    return { matchedSubjectId: storedSubjectId, matchedSubjectName: null, confidence: 1.0 };
  }

  const courseNameClean = (course.name || '').trim().toLowerCase();
  const courseSectionClean = (course.section || '').trim().toLowerCase();

  // 2. Exact code match (e.g. course name or section contains "CS301")
  for (const s of knownSubjects) {
    const codeClean = (s.code || '').trim().toLowerCase();
    if (codeClean && (courseNameClean.includes(codeClean) || courseSectionClean.includes(codeClean))) {
      return { matchedSubjectId: s.id, matchedSubjectName: s.name, confidence: 0.95 };
    }
  }

  // 3. Exact normalized name match
  for (const s of knownSubjects) {
    const subNameClean = (s.name || '').trim().toLowerCase();
    if (subNameClean === courseNameClean) {
      return { matchedSubjectId: s.id, matchedSubjectName: s.name, confidence: 0.9 };
    }
  }

  // 4. Reasonable normalized-name match (> 0.6 similarity)
  let bestMatch: { id: string; name: string } | null = null;
  let bestScore = 0;

  for (const s of knownSubjects) {
    const score = stringSimilarity(s.name, course.name);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = s;
    }
  }

  if (bestMatch && bestScore >= 0.6) {
    return { matchedSubjectId: bestMatch.id, matchedSubjectName: bestMatch.name, confidence: bestScore };
  }

  return { matchedSubjectId: null, matchedSubjectName: null, confidence: 0 };
}

/**
 * Formats a Google Classroom due date/time into an ISO DateTime object and formatted strings
 */
function parseGoogleDueDate(
  dueDate?: GoogleClassroomWorkItem['dueDate'],
  dueTime?: GoogleClassroomWorkItem['dueTime']
): {
  deadline: Date | null;
  dueDateStr: string | null;
  dueTimeStr: string | null;
} {
  if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) {
    return { deadline: null, dueDateStr: null, dueTimeStr: null };
  }

  const hours = dueTime?.hours ?? 23;
  const minutes = dueTime?.minutes ?? 59;
  const seconds = dueTime?.seconds ?? 59;

  // Build UTC timestamp
  const dateObj = new Date(Date.UTC(dueDate.year, dueDate.month - 1, dueDate.day, hours, minutes, seconds));

  // Human readable date string e.g. "06 Oct 2026"
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dueDateStr = `${String(dueDate.day).padStart(2, '0')} ${monthNames[dueDate.month - 1]} ${dueDate.year}`;

  // Human readable time string e.g. "11:59 PM"
  const isPM = hours >= 12;
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const dueTimeStr = `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

  return { deadline: dateObj, dueDateStr, dueTimeStr };
}

/**
 * Computes assignment priority based on deadline proximity
 */
function computePriority(deadline: Date | null): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL' {
  if (!deadline) return 'NORMAL';
  const diffHours = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours < 24) return 'CRITICAL';
  if (diffHours < 72) return 'HIGH';
  if (diffHours < 168) return 'MEDIUM';
  return 'NORMAL';
}

export interface SyncResult {
  success: boolean;
  syncedCoursesCount: number;
  syncedAssignmentsCount: number;
  unmappedCourses: Array<{ id: string; googleCourseId: string; name: string }>;
  errors: string[];
}

/**
 * Comprehensive Google Classroom synchronization for an authenticated student
 */
export async function syncStudentClassroom(userId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    syncedCoursesCount: 0,
    syncedAssignmentsCount: 0,
    unmappedCourses: [],
    errors: [],
  };

  const accessToken = await getValidAccessToken(userId);

  // 1. Fetch courses from Google Classroom
  let courses: GoogleClassroomCourseItem[] = [];
  try {
    courses = await fetchClassroomCourses(accessToken);
  } catch (err: any) {
    console.error('[Classroom Sync] fetchClassroomCourses failed:', err);
    result.errors.push(err.message || 'Failed to fetch courses from Google Classroom.');
    return result;
  }

  // 2. Fetch known subjects (from DB Subject records & Academic Syllabus)
  const knownSubjects: Array<{ id: string; name: string; code: string }> = [];
  const dbSubjects = await prisma.subject.findMany({
    select: { id: true, name: true, code: true },
  });
  knownSubjects.push(...dbSubjects);

  try {
    const acData = await getStudentSubjects(userId);
    if (acData?.available && Array.isArray(acData.subjects)) {
      acData.subjects.forEach((s) => {
        if (!knownSubjects.some((k) => k.code === s.code)) {
          knownSubjects.push({ id: s.id, name: s.name, code: s.code });
        }
      });
    }
  } catch (e) {
    // Non-fatal
  }

  // 3. Process each course and upsert into GoogleClassroomCourse
  const syncedCourseRecords = [];
  for (const c of courses) {
    // Check if course is already mapped
    const existing = await prisma.googleClassroomCourse.findUnique({
      where: {
        userId_googleCourseId: {
          userId,
          googleCourseId: c.id,
        },
      },
    });

    const match = matchCourseToSubject(c, existing?.nivoraSubjectId || null, knownSubjects);

    const upserted = await prisma.googleClassroomCourse.upsert({
      where: {
        userId_googleCourseId: {
          userId,
          googleCourseId: c.id,
        },
      },
      create: {
        userId,
        googleCourseId: c.id,
        courseName: c.name || 'Untitled Course',
        courseSection: c.section || null,
        courseDescription: c.descriptionHeading || c.description || null,
        courseState: c.courseState || 'ACTIVE',
        nivoraSubjectId: match.matchedSubjectId,
      },
      update: {
        courseName: c.name || 'Untitled Course',
        courseSection: c.section || null,
        courseDescription: c.descriptionHeading || c.description || null,
        courseState: c.courseState || 'ACTIVE',
        ...(match.matchedSubjectId && !existing?.nivoraSubjectId && {
          nivoraSubjectId: match.matchedSubjectId,
        }),
      },
    });

    syncedCourseRecords.push(upserted);

    if (!upserted.nivoraSubjectId) {
      result.unmappedCourses.push({
        id: upserted.id,
        googleCourseId: upserted.googleCourseId,
        name: upserted.courseName,
      });
    }
  }

  result.syncedCoursesCount = syncedCourseRecords.length;

  // 4. Fetch coursework for each course and upsert assignments
  let totalAssignments = 0;

  for (const courseRecord of syncedCourseRecords) {
    try {
      const workList = await fetchCourseWorkList(courseRecord.googleCourseId, accessToken);

      for (const work of workList) {
        // Only process supported coursework types (ASSIGNMENT, SHORT_ANSWER_QUESTION, MULTIPLE_CHOICE_QUESTION)
        const allowedTypes = ['ASSIGNMENT', 'SHORT_ANSWER_QUESTION', 'MULTIPLE_CHOICE_QUESTION'];
        if (work.workType && !allowedTypes.includes(work.workType)) {
          continue;
        }

        const { deadline, dueDateStr, dueTimeStr } = parseGoogleDueDate(work.dueDate, work.dueTime);
        const priority = computePriority(deadline);

        // Find existing assignment by (google_course_id + google_coursework_id + user_id) as required by Rule 11
        const existingAssignment = await prisma.assignment.findFirst({
          where: {
            userId,
            externalCourseId: courseRecord.googleCourseId,
            externalId: work.id,
          },
        });

        // Determine status: preserve student's completed state if marked completed in NIVORA
        let status = 'pending';
        if (existingAssignment?.status === 'completed') {
          status = 'completed';
        } else if (deadline && deadline.getTime() < Date.now()) {
          status = 'pending'; // Overdue status handled by display logic
        }

        const subjectIdToLink = courseRecord.nivoraSubjectId || null;

        if (existingAssignment) {
          // Update existing assignment
          await prisma.assignment.update({
            where: { id: existingAssignment.id },
            data: {
              title: work.title || existingAssignment.title,
              description: work.description || existingAssignment.description,
              deadline: deadline ?? existingAssignment.deadline,
              dueDate: dueDateStr ?? existingAssignment.dueDate,
              dueTime: dueTimeStr ?? existingAssignment.dueTime,
              priority,
              externalUrl: work.alternateLink || existingAssignment.externalUrl,
              maxScore: work.maxPoints ? Number(work.maxPoints) : existingAssignment.maxScore,
              workType: work.workType || 'ASSIGNMENT',
              subjectId: subjectIdToLink || existingAssignment.subjectId,
              lastSyncedAt: new Date(),
            },
          });
        } else {
          // Create new imported assignment
          await prisma.assignment.create({
            data: {
              userId,
              subjectId: subjectIdToLink,
              title: work.title || 'Untitled Assignment',
              code: courseRecord.courseName.slice(0, 10).toUpperCase(),
              description: work.description || '',
              deadline,
              dueDate: dueDateStr,
              dueTime: dueTimeStr,
              priority,
              status,
              source: 'google_classroom',
              externalId: work.id,
              externalCourseId: courseRecord.googleCourseId,
              externalUrl: work.alternateLink || null,
              workType: work.workType || 'ASSIGNMENT',
              maxScore: work.maxPoints ? Number(work.maxPoints) : 100,
              lastSyncedAt: new Date(),
            },
          });
        }

        totalAssignments++;
      }
    } catch (cwErr: any) {
      console.warn(`[Classroom Sync] Course ${courseRecord.googleCourseId} coursework fetch error:`, cwErr);
      result.errors.push(`Course "${courseRecord.courseName}": ${cwErr.message || 'Coursework sync skipped'}`);
    }
  }

  result.syncedAssignmentsCount = totalAssignments;

  // 5. Update last_synced_at on connection
  await prisma.googleClassroomConnection.update({
    where: { userId },
    data: {
      lastSyncedAt: new Date(),
      status: 'connected',
    },
  });

  result.success = true;
  return result;
}
