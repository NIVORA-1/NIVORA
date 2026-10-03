/**
 * Nivora Exam Timetable AI/OCR Extraction Service
 *
 * Uses Google Gemini 1.5 Flash multimodal vision to extract structured
 * exam schedule data from student exam timetable screenshots, photos, scans, or PDFs.
 *
 * Strictly enforces subject matching against the student's existing subjects:
 * - If a match exists: associates with that subjectId.
 * - If no match exists: marks as unmatched ("Subject not matched") so the student selects an existing subject.
 * - NEVER invents fake subjects.
 */

export interface ExtractedExamEntry {
  id: string; // Temporary unique ID for UI tracking
  subjectCode: string; // e.g. "CS-301"
  subjectName: string; // e.g. "Database Management Systems"
  examType: 'Mid-Term' | 'End-Term' | 'Quiz' | 'Practical' | 'Lab';
  date: string; // "YYYY-MM-DD"
  startTime: string; // e.g. "09:30 AM" or "09:30"
  endTime: string; // e.g. "12:30 PM" or "12:30"
  room: string | null; // e.g. "Hall C" or null
  notes: string | null; // e.g. "Closed book, Scientific calculator allowed"
  subjectMatched: boolean;
  matchedSubjectId: string | null;
  matchedSubjectName: string | null;
  confidence: number;
}

export interface KnownSubjectItem {
  id: string;
  name: string;
  code: string;
  color?: string | null;
  instructor?: string | null;
  room?: string | null;
}

/**
 * Calculates string similarity score between 0.0 and 1.0 (token overlap + substring)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = (str1 || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const s2 = (str2 || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return Math.max(0.75, minLen / maxLen);
  }

  const tokens1 = new Set(s1.split(/\s+/).filter(Boolean));
  const tokens2 = new Set(s2.split(/\s+/).filter(Boolean));

  let intersection = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) intersection++;
  });

  const unionTokens = new Set(Array.from(tokens1).concat(Array.from(tokens2)));
  return unionTokens.size > 0 ? intersection / unionTokens.size : 0;
}

/**
 * Matches an extracted exam subject against known subjects.
 * Never invents subjects.
 */
function matchExamSubject(
  extractedSubject: string,
  extractedCode: string,
  knownSubjects: KnownSubjectItem[]
): {
  matchedSubjectId: string | null;
  matchedSubjectName: string | null;
  subjectMatched: boolean;
} {
  if (!knownSubjects || knownSubjects.length === 0) {
    return { matchedSubjectId: null, matchedSubjectName: null, subjectMatched: false };
  }

  const cleanSubject = extractedSubject.trim().toLowerCase();
  const cleanCode = extractedCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  let bestMatch: KnownSubjectItem | null = null;
  let bestScore = 0;

  for (const sub of knownSubjects) {
    const subCodeClean = (sub.code || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const subNameClean = (sub.name || '').trim().toLowerCase();

    // 1. Exact code match (e.g. CS301 === CS301 or CS-301 === CS301)
    if (cleanCode && subCodeClean && cleanCode === subCodeClean) {
      return {
        matchedSubjectId: sub.id,
        matchedSubjectName: sub.name,
        subjectMatched: true,
      };
    }

    // 2. Exact name match
    if (cleanSubject === subNameClean) {
      return {
        matchedSubjectId: sub.id,
        matchedSubjectName: sub.name,
        subjectMatched: true,
      };
    }

    // 3. Similarity check
    const nameScore = calculateSimilarity(cleanSubject, subNameClean);
    const codeScore = cleanCode ? calculateSimilarity(cleanCode, subCodeClean) : 0;
    const score = Math.max(nameScore, codeScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = sub;
    }
  }

  // If score is high (>= 0.65), treat as match
  if (bestMatch && bestScore >= 0.65) {
    return {
      matchedSubjectId: bestMatch.id,
      matchedSubjectName: bestMatch.name,
      subjectMatched: true,
    };
  }

  // Not matched
  return { matchedSubjectId: null, matchedSubjectName: null, subjectMatched: false };
}

/**
 * Normalizes date string to YYYY-MM-DD
 */
function normalizeDate(rawDate: string): string {
  if (!rawDate) {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  }

  const clean = rawDate.trim();
  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Try parsing date string
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Fallback to today + 7 days
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 7);
  return fallback.toISOString().split('T')[0];
}

/**
 * Normalizes time string (e.g. "09:30 AM", "9:30", "14:00")
 */
function normalizeTime(rawTime: string, defaultTime = '09:30 AM'): string {
  if (!rawTime) return defaultTime;
  const clean = rawTime.trim();

  // If already standard format
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (match12) {
    const hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const meridiem = (match12[3] || (hours >= 12 ? 'PM' : 'AM')).toUpperCase();
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours.toString().padStart(2, '0')}:${minutes} ${meridiem}`;
  }

  return clean;
}

/**
 * Normalizes exam type
 */
function normalizeExamType(rawType: string): 'Mid-Term' | 'End-Term' | 'Quiz' | 'Practical' | 'Lab' {
  const lower = (rawType || '').toLowerCase();
  if (lower.includes('final') || lower.includes('end') || lower.includes('sem')) return 'End-Term';
  if (lower.includes('quiz') || lower.includes('class test') || lower.includes('test')) return 'Quiz';
  if (lower.includes('pract') || lower.includes('viva')) return 'Practical';
  if (lower.includes('lab')) return 'Lab';
  return 'Mid-Term';
}

/**
 * Primary AI/OCR extraction function for Exam Timetables.
 */
export async function analyzeExamTimetableImage(options: {
  base64Data: string;
  mimeType: string;
  knownSubjects?: KnownSubjectItem[];
}): Promise<{
  success: boolean;
  entries: ExtractedExamEntry[];
  error?: string;
  totalEntriesCount?: number;
}> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return {
      success: false,
      entries: [],
      error: 'Gemini API key is not configured on the server. Please add your Gemini key in .env',
    };
  }

  let mimeType = options.mimeType || 'image/jpeg';
  if (mimeType === 'application/octet-stream' || !mimeType) {
    mimeType = 'image/jpeg';
  }
  if (mimeType === 'image/jpg') {
    mimeType = 'image/jpeg';
  }

  const prompt = `You are an expert college and university examination timetable OCR assistant.
Analyze this exam timetable image or document with high precision.
Extract every examination date, paper, test, and evaluation slot.

Tasks:
1. Detect Subject / Course Code (e.g. "CS-301", "CS301", "22CS301", "MAT101").
2. Detect Subject / Course Name (expand obvious abbreviations, e.g. "DBMS" -> "Database Management Systems", "OS" -> "Operating Systems").
3. Detect Exam Type: "Mid-Term", "End-Term", "Quiz", "Practical", or "Lab".
4. Detect Date of examination in "YYYY-MM-DD" format.
5. Detect Start Time (e.g. "09:30 AM", "02:00 PM").
6. Detect End Time (e.g. "12:30 PM", "05:00 PM").
7. Detect Examination Hall / Room (e.g. "Hall C", "Room 204", "East Block 302"). If absent or unknown, return null.
8. Detect special instructions or Notes (e.g. "Open book", "Calculator allowed", "Carry ID"). If absent, return null.
9. Assign a confidence score from 0.0 to 1.0.

Return STRICT JSON only matching this schema without markdown fences:
{
  "entries": [
    {
      "subjectCode": "CS-301",
      "subjectName": "Database Management Systems",
      "examType": "Mid-Term",
      "date": "2025-09-18",
      "startTime": "09:30 AM",
      "endTime": "12:30 PM",
      "room": "Hall C, East Academic Block",
      "notes": "Bring non-programmable calculator",
      "confidence": 0.95
    }
  ]
}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const bodyPayload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: options.base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 400 || response.status === 403) {
      console.error('[Exam OCR] Gemini auth error status:', response.status);
      return {
        success: false,
        entries: [],
        error: 'Invalid or unauthorized Gemini API key. Please check your GEMINI_API_KEY in .env.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        entries: [],
        error: 'Gemini AI service rate-limit reached. Please wait a moment and try again.',
      };
    }

    if (response.status >= 500) {
      return {
        success: false,
        entries: [],
        error: `Gemini API service is temporarily unavailable (HTTP ${response.status}). Please try again shortly.`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        entries: [],
        error: `OCR extraction failed (HTTP ${response.status}). Please try a clearer screenshot or document.`,
      };
    }

    const json = await response.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return {
        success: false,
        entries: [],
        error: 'The AI model could not detect any readable examination entries. Please ensure the timetable image is clear and sharp.',
      };
    }

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    let parsedResult: { entries: any[] };
    try {
      parsedResult = JSON.parse(cleaned);
    } catch {
      return {
        success: false,
        entries: [],
        error: 'AI returned an unparseable response. Please retry with a clearer image.',
      };
    }

    const rawEntries = Array.isArray(parsedResult.entries) ? parsedResult.entries : [];
    if (rawEntries.length === 0) {
      return {
        success: false,
        entries: [],
        error: 'No examination schedule slots could be identified from this document. Please ensure the timetable is clearly visible.',
      };
    }

    const knownSubjects = options.knownSubjects || [];
    const mappedEntries: ExtractedExamEntry[] = rawEntries.map((item, index) => {
      const code = (item.subjectCode || item.code || '').trim();
      const name = (item.subjectName || item.subject || 'Unassigned Subject').trim();
      const examType = normalizeExamType(item.examType || item.type);
      const date = normalizeDate(item.date);
      const startTime = normalizeTime(item.startTime, '09:30 AM');
      const endTime = normalizeTime(item.endTime, '12:30 PM');
      const room = item.room && typeof item.room === 'string' && item.room.trim() ? item.room.trim() : null;
      const notes = item.notes && typeof item.notes === 'string' && item.notes.trim() ? item.notes.trim() : null;
      const confidence = typeof item.confidence === 'number' ? item.confidence : 0.9;

      // Subject matching: Never invent subjects
      const match = matchExamSubject(name, code, knownSubjects);

      return {
        id: `exam-entry-${Date.now()}-${index}`,
        subjectCode: code,
        subjectName: name,
        examType,
        date,
        startTime,
        endTime,
        room,
        notes,
        subjectMatched: match.subjectMatched,
        matchedSubjectId: match.matchedSubjectId,
        matchedSubjectName: match.matchedSubjectName,
        confidence,
      };
    });

    // Deduplicate entries with identical date and subject/code
    const seen = new Set<string>();
    const uniqueEntries: ExtractedExamEntry[] = [];
    for (const entry of mappedEntries) {
      const sig = `${entry.date}_${entry.startTime}_${(entry.subjectCode || entry.subjectName).toLowerCase()}`;
      if (!seen.has(sig)) {
        seen.add(sig);
        uniqueEntries.push(entry);
      }
    }

    // Sort by date then start time
    uniqueEntries.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    return {
      success: true,
      entries: uniqueEntries,
      totalEntriesCount: uniqueEntries.length,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('[Exam OCR] Exception during OCR processing:', err);
    return {
      success: false,
      entries: [],
      error:
        err.name === 'AbortError'
          ? 'Timetable analysis timed out. Please try uploading a smaller image or compressed screenshot.'
          : 'An unexpected network error occurred while analyzing the timetable. Please retry.',
    };
  }
}
