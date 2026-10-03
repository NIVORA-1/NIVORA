import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';

/**
 * Nivora Timetable Self-Hosted OCR & Schedule Parser Service
 *
 * Powered by PaddleOCR (RapidOCR ONNX Runtime) and PyMuPDF.
 * Free, offline, self-hosted timetable extraction without any paid cloud OCR APIs.
 * Supports PDF timetable documents (digital & scanned) and images (JPG, PNG, Screenshots).
 */

export interface ExtractedClassEntry {
  id: string; // Temporary unique ID for UI tracking
  day: string; // 'Monday', 'Tuesday', etc.
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "10:00"
  start_time?: string;
  end_time?: string;
  subject: string; // e.g. "Operating Systems"
  subjectName?: string;
  subjectCode: string; // e.g. "CS-303"
  courseCode?: string | null;
  faculty?: string | null; // e.g. "Dr. Alan Turing" or null if unknown
  room?: string | null; // e.g. "Room 204" or null if unknown
  classType: 'Lecture' | 'Lab' | 'Tutorial';
  type?: 'LECTURE' | 'LAB' | 'TUTORIAL';
  section?: string | null; // e.g. "Batch A" or null
  needsReview: boolean; // Flagged if OCR confidence is low or ambiguous
  reviewReason?: string | null;
  confidence: number; // 0.0 - 1.0
  matchedSubjectId?: string | null;
  matchedSubjectName?: string | null;
  suggestedSubject?: {
    id: string;
    name: string;
    code: string;
    similarity: number;
  } | null;
}

export interface KnownSubjectItem {
  id: string;
  name: string;
  code: string;
  type?: string | null;
  instructor?: string | null;
  room?: string | null;
}

const OCR_FAILURE_MESSAGE = "We couldn't read this timetable. Please upload a clearer image or PDF.";

/**
 * Executes the self-hosted Python PaddleOCR timetable parser.
 */
function runPythonParser(
  filePath: string,
  knownSubjectsJsonPath?: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const pythonExe = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'parse_timetable.py');

    const args = [scriptPath, filePath];
    if (knownSubjectsJsonPath) {
      args.push(knownSubjectsJsonPath);
    }

    execFile(
      pythonExe,
      args,
      {
        cwd: process.cwd(),
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          // If the script exited with an error code, stdout might still have the JSON error response
          if (stdout && stdout.trim().startsWith('{')) {
            return resolve({ stdout, stderr });
          }
          return reject(error);
        }
        resolve({ stdout, stderr });
      }
    );
  });
}

/**
 * Primary timetable extraction function.
 * Uses completely free, self-hosted PaddleOCR and PyMuPDF.
 * Zero dependency on Google Gemini, AWS, Azure, Google Vision, or any paid API.
 */
export async function analyzeTimetableImage(options: {
  base64Data: string;
  mimeType: string;
  fileName?: string;
  knownSubjects?: KnownSubjectItem[];
}): Promise<{
  success: boolean;
  entries: ExtractedClassEntry[];
  error?: string;
  statusCode?: number;
  detectedDaysCount?: number;
  totalEntriesCount?: number;
}> {
  console.log(
    `[Timetable OCR] Request started: analyzing timetable using self-hosted PaddleOCR (${options.base64Data.length} chars, mime: ${options.mimeType})`
  );

  let ext = '.jpg';
  const mime = (options.mimeType || '').toLowerCase();
  const rawFileName = (options.fileName || '').toLowerCase();

  if (mime === 'application/pdf' || rawFileName.endsWith('.pdf')) {
    ext = '.pdf';
  } else if (mime === 'image/png' || rawFileName.endsWith('.png')) {
    ext = '.png';
  } else if (mime === 'image/webp' || rawFileName.endsWith('.webp')) {
    ext = '.webp';
  } else if (mime === 'image/heic' || rawFileName.endsWith('.heic')) {
    ext = '.heic';
  }

  const uniqueId = `nivora-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tempFilePath = path.join(os.tmpdir(), `${uniqueId}${ext}`);
  let tempKnownSubjectsPath: string | undefined;

  try {
    // 1. Write the file buffer to a temporary file
    const buffer = Buffer.from(options.base64Data, 'base64');
    await fs.promises.writeFile(tempFilePath, buffer);

    // 2. If student has known subjects, write them to temporary JSON file for fuzzy matching
    if (options.knownSubjects && options.knownSubjects.length > 0) {
      tempKnownSubjectsPath = path.join(os.tmpdir(), `${uniqueId}-subjects.json`);
      await fs.promises.writeFile(
        tempKnownSubjectsPath,
        JSON.stringify(options.knownSubjects, null, 2),
        'utf-8'
      );
    }

    // 3. Execute self-hosted PaddleOCR parser
    const { stdout, stderr } = await runPythonParser(tempFilePath, tempKnownSubjectsPath);

    if (stderr && stderr.includes('Error')) {
      console.warn('[Timetable OCR] Python stderr warning:', stderr.slice(0, 300));
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(stdout.trim());
    } catch (parseErr) {
      console.error('[Timetable OCR] Failed to parse JSON output from parser:', stdout);
      return {
        success: false,
        entries: [],
        statusCode: 422,
        error: OCR_FAILURE_MESSAGE,
      };
    }

    if (!parsedResult.success) {
      console.warn('[Timetable OCR] Parser reported failure:', parsedResult.error);
      return {
        success: false,
        entries: [],
        statusCode: 422,
        error: parsedResult.error || OCR_FAILURE_MESSAGE,
      };
    }

    const rawEntries: ExtractedClassEntry[] = Array.isArray(parsedResult.entries)
      ? parsedResult.entries
      : [];

    if (rawEntries.length === 0) {
      return {
        success: false,
        entries: [],
        statusCode: 422,
        error: OCR_FAILURE_MESSAGE,
      };
    }

    const uniqueDays = parsedResult.detectedDaysCount || new Set(rawEntries.map((e) => e.day)).size;

    console.log(
      `[Timetable OCR] Final status: SUCCESS | PaddleOCR extracted ${rawEntries.length} timetable entries across ${uniqueDays} days.`
    );

    return {
      success: true,
      entries: rawEntries,
      detectedDaysCount: uniqueDays,
      totalEntriesCount: rawEntries.length,
    };
  } catch (err: any) {
    console.error('[Timetable OCR] Execution error in analyzeTimetableImage:', err);
    return {
      success: false,
      entries: [],
      statusCode: 500,
      error: OCR_FAILURE_MESSAGE,
    };
  } finally {
    // 4. Cleanup temporary files immediately (Security & disk space preservation)
    try {
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath);
      }
    } catch (cleanupErr) {
      console.warn('[Timetable OCR] Warning: could not delete temp file:', tempFilePath);
    }

    if (tempKnownSubjectsPath) {
      try {
        if (fs.existsSync(tempKnownSubjectsPath)) {
          await fs.promises.unlink(tempKnownSubjectsPath);
        }
      } catch (cleanupErr) {
        console.warn('[Timetable OCR] Warning: could not delete temp subjects file:', tempKnownSubjectsPath);
      }
    }
  }
}
