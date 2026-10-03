#!/usr/bin/env python3
"""
Nivora Timetable OCR Pipeline  v3.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Free, self-hosted, production-ready timetable extraction.

Stack:
  RapidOCR (ONNX Runtime)  -- OCR engine
  OpenCV                   -- image preprocessing (grayscale, denoise, threshold, deskew, upscale)
  PyMuPDF (fitz)           -- PDF rasterisation
  pdfplumber               -- PDF native table detection (preferred for digital PDFs)
  Pillow                   -- image loading / format conversion

Pipeline:
  IMAGE/PDF
    -> Preprocessing  (grayscale -> denoise -> upscale -> adaptive-threshold -> deskew)
    -> OCR            (RapidOCR with bounding boxes + confidence scores)
    -> Grid Recovery  (cluster words into rows/columns by bounding-box geometry)
    -> Layout Detect  (Day-as-column matrix | Time-as-column matrix | List layout)
    -> Merged-Cell Resolve (a box spanning N columns = 1 entry spanning N time slots)
    -> Field Extract  (subject name/code, faculty, room, type, section)
    -> OCR Error Fix  (common substitution errors: 0->O, 1->I etc. in codes)
    -> Subject Match  (fuzzy matching against student's subject database)
    -> JSON Output

Zero dependency on paid APIs.
Works after production deployment -- no localhost secrets.
"""


import sys
import os
import re
import json
import math
import uuid
from typing import Any, Dict, List, Optional, Tuple

# ─── Day constants ────────────────────────────────────────────────────────────

DAYS_MAP = {
    'mon': ('Monday', 1), 'monday': ('Monday', 1),
    'tue': ('Tuesday', 2), 'tues': ('Tuesday', 2), 'tuesday': ('Tuesday', 2),
    'wed': ('Wednesday', 3), 'wednesday': ('Wednesday', 3),
    'thu': ('Thursday', 4), 'thur': ('Thursday', 4), 'thurs': ('Thursday', 4),
    'thursday': ('Thursday', 4),
    'fri': ('Friday', 5), 'friday': ('Friday', 5),
    'sat': ('Saturday', 6), 'saturday': ('Saturday', 6),
    'sun': ('Sunday', 7), 'sunday': ('Sunday', 7),
}

DAY_REGEX = re.compile(
    r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|'
    r'mon|tue|wed|thu|fri|sat|sun)\b',
    re.IGNORECASE,
)

TIME_RANGE_REGEX = re.compile(
    r'(\d{1,2}[.:]\d{2}|\d{1,2})\s*(?:am|pm)?\s*[-\u2013\u2014to]+\s*'
    r'(\d{1,2}[.:]\d{2}|\d{1,2})\s*(?:am|pm)?',
    re.IGNORECASE,
)
TIME_SINGLE_REGEX = re.compile(r'\b(\d{1,2}[.:]\d{2})\s*(am|pm)?\b', re.IGNORECASE)

COURSE_CODE_REGEX = re.compile(
    r'\b([A-Z]{2,6}[-\s]?\d{3,4}[A-Z]?|[A-Z]{2,6}\d{2,4})\b',
    re.IGNORECASE,
)

FACULTY_PREFIX_REGEX = re.compile(
    r'\b(Dr\.?|Prof\.?|Professor|Mr\.?|Ms\.?|Mrs\.?)\s+([A-Za-z][A-Za-z\s\.]{2,30})',
    re.IGNORECASE,
)

ROOM_REGEX = re.compile(
    r'\b(Room|R(?:oo)?m|Lab|LH|Hall|CR|Classroom|LT|Block)\s*[-:]?\s*([A-Za-z0-9\-]+)',
    re.IGNORECASE,
)

BATCH_REGEX = re.compile(
    r'\b(Batch|Sec(?:tion)?|Div(?:ision)?|Grp|Group)\s*[-:]?\s*([A-Za-z0-9]+)',
    re.IGNORECASE,
)

FREE_CELL_WORDS = frozenset([
    'free', 'nil', 'recess', 'lunch', 'break', 'sports', 'library',
    'holiday', 'gap', 'empty', 'spare', 'na',
])

COMMON_ABBREVIATIONS = {
    'os': 'Operating Systems',
    'dbms': 'Database Management Systems',
    'dsa': 'Data Structures & Algorithms',
    'ds': 'Data Structures',
    'cn': 'Computer Networks',
    'se': 'Software Engineering',
    'ai': 'Artificial Intelligence',
    'ml': 'Machine Learning',
    'daa': 'Design & Analysis of Algorithms',
    'toc': 'Theory of Computation',
    'cd': 'Compiler Design',
    'oops': 'Object Oriented Programming',
    'oop': 'Object Oriented Programming',
    'maths': 'Mathematics',
    'math': 'Mathematics',
    'co': 'Computer Organization',
    'coa': 'Computer Organization & Architecture',
    'wt': 'Web Technologies',
    'cns': 'Cryptography & Network Security',
    'python': 'Python Programming',
    'java': 'Java Programming',
    'cpp': 'C++ Programming',
}

OCR_CHAR_FIXES = [
    (re.compile(r'(?<=[A-Z])0(?=[A-Z])', re.I), 'O'),
    (re.compile(r'(?<=[A-Z])1(?=[A-Z])', re.I), 'I'),
    (re.compile(r'(?<=[A-Z\d])8(?=[A-Z])', re.I), 'B'),
    (re.compile(r'(?<=\d)[oO](?=\d)'), '0'),
    (re.compile(r'\bPYTH0N\b', re.I), 'PYTHON'),
    (re.compile(r'\b0S\b'), 'OS'),
    (re.compile(r'\bC0A\b'), 'COA'),
    (re.compile(r'\bD8MS\b'), 'DBMS'),
]


# ─── Utility functions ────────────────────────────────────────────────────────

def fix_ocr_code(text):
    for pattern, replacement in OCR_CHAR_FIXES:
        text = pattern.sub(replacement, text)
    return text


def normalize_time_str(raw, default_hour=9):
    if not raw:
        return '{:02d}:00'.format(default_hour)
    clean = raw.strip().lower().replace('.', ':')
    meridiem = None
    if 'pm' in clean:
        meridiem = 'pm'
        clean = clean.replace('pm', '').strip()
    elif 'am' in clean:
        meridiem = 'am'
        clean = clean.replace('am', '').strip()
    if ':' in clean:
        parts = clean.split(':')
        try:
            h, m = int(parts[0].strip()), int(parts[1].strip()[:2])
        except ValueError:
            return '{:02d}:00'.format(default_hour)
    else:
        try:
            h, m = int(clean), 0
        except ValueError:
            return '{:02d}:00'.format(default_hour)
    if meridiem == 'pm' and h < 12:
        h += 12
    elif meridiem == 'am' and h == 12:
        h = 0
    elif meridiem is None and 1 <= h <= 6:
        h += 12
    return '{:02d}:{:02d}'.format(max(0, min(23, h)), max(0, min(59, m)))


def token_similarity(s1, s2):
    t1 = set(re.findall(r'[a-z0-9]+', (s1 or '').lower()))
    t2 = set(re.findall(r'[a-z0-9]+', (s2 or '').lower()))
    if not t1 or not t2:
        return 0.0
    return len(t1 & t2) / len(t1 | t2)


def char_similarity(s1, s2):
    def bigrams(s):
        s = re.sub(r'[^a-z0-9]', '', s.lower())
        return [s[i:i+2] for i in range(len(s) - 1)] if len(s) >= 2 else list(s)
    bg1, bg2 = bigrams(s1), bigrams(s2)
    if not bg1 or not bg2:
        return 0.0
    s1_set, s2_set = set(bg1), set(bg2)
    return 2 * len(s1_set & s2_set) / (len(s1_set) + len(s2_set))


def match_known_subject(name, code, known_subjects):
    if not known_subjects:
        return None, None, None
    clean_code = fix_ocr_code(re.sub(r'[^a-z0-9]', '', (code or '').lower()))
    clean_name = (name or '').strip().lower()
    best_match = None
    best_score = 0.0
    for sub in known_subjects:
        sub_code = re.sub(r'[^a-z0-9]', '', (sub.get('code') or '').lower())
        sub_name = (sub.get('name') or '').strip().lower()
        if clean_code and sub_code and clean_code == sub_code:
            return sub.get('id'), sub.get('name'), None
        if clean_name and sub_name and clean_name == sub_name:
            return sub.get('id'), sub.get('name'), None
        n_score = token_similarity(clean_name, sub_name)
        c_score = char_similarity(clean_code, sub_code) if clean_code and sub_code else 0.0
        score = max(n_score, c_score * 0.9)
        if score > best_score:
            best_score = score
            best_match = sub
    if not best_match:
        return None, None, None
    suggestion = {
        'id': best_match.get('id'),
        'name': best_match.get('name'),
        'code': best_match.get('code'),
        'similarity': round(best_score, 2),
    }
    if best_score >= 0.70:
        return best_match.get('id'), best_match.get('name'), None
    elif best_score >= 0.35:
        return None, None, suggestion
    return None, None, None


# ─── Image preprocessing ──────────────────────────────────────────────────────

def preprocess_image(img_bgr):
    """
    Preprocess a BGR OpenCV image for optimal OCR on timetable images.
    Steps: upscale → grayscale → denoise → deskew → adaptive threshold
    """
    import cv2
    import numpy as np

    h, w = img_bgr.shape[:2]
    # Upscale if small
    if w < 1200:
        scale = 1200.0 / w
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
        h, w = img_bgr.shape[:2]
    # Downscale if very large
    if w > 3000:
        scale = 3000.0 / w
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = img_bgr.shape[:2]
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)
    # Deskew
    try:
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100,
                                minLineLength=w // 4, maxLineGap=20)
        if lines is not None:
            angles = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                if x2 != x1:
                    angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
                    if abs(angle) < 15:
                        angles.append(angle)
            if angles:
                median_angle = sorted(angles)[len(angles) // 2]
                if abs(median_angle) > 0.3:
                    M = cv2.getRotationMatrix2D((w / 2, h / 2), median_angle, 1.0)
                    gray = cv2.warpAffine(gray, M, (w, h),
                                          flags=cv2.INTER_LINEAR,
                                          borderMode=cv2.BORDER_REPLICATE)
    except Exception:
        pass
    # Adaptive threshold for colored backgrounds
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 10
    )
    return cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)


# ─── Bounding box class ───────────────────────────────────────────────────────

class Box:
    __slots__ = ('text', 'conf', 'x0', 'y0', 'x1', 'y1', 'cx', 'cy')

    def __init__(self, text, conf, x0, y0, x1, y1):
        self.text = text.strip()
        self.conf = float(conf)
        self.x0, self.y0 = float(x0), float(y0)
        self.x1, self.y1 = float(x1), float(y1)
        self.cx = (x0 + x1) / 2.0
        self.cy = (y0 + y1) / 2.0

    @property
    def w(self):
        return self.x1 - self.x0

    @property
    def h(self):
        return self.y1 - self.y0


# ─── Grid helpers ─────────────────────────────────────────────────────────────

def cluster_rows(boxes):
    """Cluster OCR boxes into horizontal rows using y-center proximity."""
    if not boxes:
        return []
    boxes = sorted(boxes, key=lambda b: (b.cy, b.cx))
    heights = sorted([b.h for b in boxes if b.h > 2])
    median_h = heights[len(heights) // 2] if heights else 15.0
    threshold = max(6.0, median_h * 0.7)
    rows = []
    current = [boxes[0]]
    current_cy = boxes[0].cy
    for b in boxes[1:]:
        if abs(b.cy - current_cy) <= threshold:
            current.append(b)
            current_cy = sum(x.cy for x in current) / len(current)
        else:
            rows.append(sorted(current, key=lambda x: x.cx))
            current = [b]
            current_cy = b.cy
    if current:
        rows.append(sorted(current, key=lambda x: x.cx))
    return rows


def assign_column(cx, col_boundaries):
    """Given x-center and sorted column boundaries, return column index."""
    for i, boundary in enumerate(col_boundaries):
        if cx < boundary:
            return i
    return len(col_boundaries)


def build_col_boundaries(col_centers):
    """Build split boundaries as midpoints between adjacent column centers."""
    centers = sorted(col_centers)
    return [(centers[i] + centers[i + 1]) / 2.0 for i in range(len(centers) - 1)]


# ─── Field extraction ─────────────────────────────────────────────────────────

def extract_fields(raw_text):
    """Extract subject code/name, faculty, room, section, class_type from raw cell text."""
    text = raw_text.strip()
    # Subject code
    subject_code = ''
    code_match = COURSE_CODE_REGEX.search(text)
    if code_match:
        candidate = code_match.group(1).strip()
        if not DAY_REGEX.fullmatch(candidate):
            subject_code = fix_ocr_code(candidate.upper())
    # Faculty
    faculty = None
    fac_match = FACULTY_PREFIX_REGEX.search(text)
    if fac_match:
        prefix = fac_match.group(1).rstrip('.')
        name_part = re.split(r'\b(Room|Lab|LH|CR|Hall|Block)\b', fac_match.group(2), flags=re.I)[0].strip()
        if name_part:
            faculty = '{}. {}'.format(prefix, name_part).strip()
    # Room
    room = None
    room_match = ROOM_REGEX.search(text)
    if room_match:
        label = room_match.group(1).capitalize()
        num = re.split(r'\b(Prof|Dr|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b', room_match.group(2), flags=re.I)[0].strip()
        if num:
            room = '{} {}'.format(label, num)
    # Batch/section
    section = None
    batch_match = BATCH_REGEX.search(text)
    if batch_match:
        section = '{} {}'.format(batch_match.group(1).capitalize(), batch_match.group(2).upper())
    # Build subject name by removing known tokens
    rem = text
    rem = DAY_REGEX.sub(' ', rem)
    rem = TIME_RANGE_REGEX.sub(' ', rem)
    rem = TIME_SINGLE_REGEX.sub(' ', rem)
    if code_match:
        rem = re.sub(re.escape(code_match.group(1)), ' ', rem, flags=re.I)
    if room_match:
        rem = ROOM_REGEX.sub(' ', rem)
    if fac_match:
        rem = FACULTY_PREFIX_REGEX.sub(' ', rem)
    if batch_match:
        rem = BATCH_REGEX.sub(' ', rem)
    rem = re.sub(r'[\(\)\[\]\{\}|,;:\-/\\]+', ' ', rem)
    rem = re.sub(r'\s+', ' ', rem).strip()
    # Remove class-type keywords that may have leaked into the name
    rem = re.sub(r'\b(Lab|Laboratory|Lecture|Tutorial|Practical|Workshop|Seminar)\b', ' ', rem, flags=re.I)
    # Remove orphan single-character tokens (e.g. leftover "A" from "Batch A")
    rem = re.sub(r'\b[A-Z]\b', ' ', rem)
    rem = re.sub(r'\s+', ' ', rem).strip()
    subject_name = rem or subject_code
    lower_sub = subject_name.lower()
    if lower_sub in COMMON_ABBREVIATIONS:
        subject_name = COMMON_ABBREVIATIONS[lower_sub]
    upper_all = (subject_name + ' ' + (room or '') + ' ' + text).upper()
    if re.search(r'\bLAB\b|\bPRACTICAL\b|\bWORKSHOP\b', upper_all):
        class_type = 'Lab'
    elif re.search(r'\bTUT(ORIAL)?\b|\bSEMINAR\b', upper_all):
        class_type = 'Tutorial'
    else:
        class_type = 'Lecture'
    return {
        'subject_code': subject_code,
        'subject_name': subject_name,
        'faculty': faculty,
        'room': room,
        'section': section,
        'class_type': class_type,
    }


def make_entry(day, day_num, start_time, end_time, cell_text, avg_conf, known_subjects, seq):
    """Build a structured timetable entry from raw cell text. Returns None for free/empty cells."""
    lower = cell_text.lower().strip()
    if not lower:
        return None
    tokens = set(re.findall(r'[a-z]+', lower))
    if tokens and tokens.issubset(FREE_CELL_WORDS):
        return None
    if re.fullmatch(r'[-\u2013\u2014\s\.]*', cell_text):
        return None
    fields = extract_fields(cell_text)
    subject_name = fields['subject_name']
    subject_code = fields['subject_code']
    if not subject_name and not subject_code:
        return None
    matched_id, matched_name, suggested = match_known_subject(subject_name, subject_code, known_subjects)
    needs_review = False
    review_reason = None
    if avg_conf < 0.65:
        needs_review = True
        review_reason = 'Low OCR confidence \u2014 please verify this cell'
    elif not subject_name or subject_name in ('Unassigned Subject', subject_code):
        needs_review = True
        review_reason = 'Subject name could not be identified'
    elif len(subject_name) <= 1:
        needs_review = True
        review_reason = 'Could not confidently read this cell \u2014 please verify'
    if not subject_name:
        subject_name = 'Unassigned Subject'
        needs_review = True
        review_reason = 'Could not confidently read this cell \u2014 please verify'
    return {
        'id': 'ocr-{}-{}'.format(seq, uuid.uuid4().hex[:6]),
        'day': day,
        'dayOfWeek': day_num,
        'startTime': start_time,
        'endTime': end_time,
        'start_time': start_time,
        'end_time': end_time,
        'subject': subject_name,
        'subjectName': subject_name,
        'subjectCode': subject_code,
        'courseCode': subject_code or None,
        'faculty': fields['faculty'],
        'room': fields['room'],
        'classType': fields['class_type'],
        'type': fields['class_type'].upper(),
        'section': fields['section'],
        'needsReview': needs_review,
        'reviewReason': review_reason,
        'confidence': round(float(avg_conf), 2),
        'matchedSubjectId': matched_id,
        'matchedSubjectName': matched_name,
        'suggestedSubject': suggested,
    }


def deduplicate_sort(entries):
    """Remove duplicate entries and sort chronologically by day and start time."""
    seen = set()
    out = []
    for e in entries:
        key = (e['day'], e['startTime'], (e['subjectCode'] or e['subject'] or '').lower().strip())
        if key not in seen:
            seen.add(key)
            out.append(e)
    out.sort(key=lambda e: (e['dayOfWeek'], e['startTime']))
    return out


# ─── Main extractor class ─────────────────────────────────────────────────────

class TimetableExtractor:
    """
    Orchestrates the full timetable OCR pipeline.
    Supports: images (JPG/PNG/WEBP/HEIC) and PDFs (digital + scanned).
    """

    def __init__(self, known_subjects=None):
        self.known_subjects = known_subjects or []
        self._ocr = None
        self._seq = 0

    @property
    def ocr(self):
        if self._ocr is None:
            from rapidocr_onnxruntime import RapidOCR
            self._ocr = RapidOCR()
        return self._ocr

    def _next_seq(self):
        self._seq += 1
        return self._seq

    # ── Public entry points ────────────────────────────────────────────────

    def extract_pdf(self, path):
        """Extract from PDF. Tries pdfplumber (digital) → render + OCR (scanned)."""
        entries = []

        # Strategy 1: pdfplumber native table detection (most accurate for digital PDFs)
        try:
            import pdfplumber
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages[:6]:
                    tables = page.extract_tables()
                    for table in tables:
                        if table and len(table) >= 2:
                            parsed = self._parse_pdfplumber_table(table)
                            entries.extend(parsed)
                    if entries:
                        break
        except Exception as e:
            sys.stderr.write('[pdfplumber] skipped: {}\n'.format(e))

        if entries:
            return deduplicate_sort(entries)

        # Strategy 2: PyMuPDF text layer + OCR fallback
        try:
            import pymupdf
            import cv2
            import numpy as np
            doc = pymupdf.open(path)
            for page_idx in range(min(len(doc), 5)):
                page = doc[page_idx]
                words = page.get_text('words')
                if words and len(words) > 20:
                    text_check = ' '.join(w[4] for w in words[:50]).lower()
                    if any(d in text_check for d in ['mon', 'tue', 'wed', 'thu', 'fri']):
                        boxes = [
                            Box(w[4], 0.95, float(w[0]), float(w[1]), float(w[2]), float(w[3]))
                            for w in words if w[4].strip()
                        ]
                        parsed = self._structure_boxes(boxes)
                        if parsed:
                            entries.extend(parsed)
                            continue
                pix = page.get_pixmap(dpi=200)
                img_bytes = pix.tobytes('png')
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is not None:
                    ocr_entries = self._ocr_image(img)
                    entries.extend(ocr_entries)
            doc.close()
        except Exception as e:
            sys.stderr.write('[pdf-render] error: {}\n'.format(e))

        return deduplicate_sort(entries)

    def extract_image(self, path):
        """Extract from image file (JPG/PNG/WEBP/HEIC/etc.)."""
        import cv2
        img = cv2.imread(path)
        if img is None:
            try:
                from PIL import Image
                import numpy as np
                pil = Image.open(path).convert('RGB')
                img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
            except Exception as e:
                sys.stderr.write('[image-load] failed: {}\n'.format(e))
                return []
        return self._ocr_image(img)

    # ── Internal helpers ────────────────────────────────────────────────────

    def _ocr_image(self, img_bgr):
        """Run preprocessing + RapidOCR and return structured entries."""
        preprocessed = preprocess_image(img_bgr)
        ocr_result, _ = self.ocr(preprocessed)
        if not ocr_result:
            # Retry on original image in case preprocessing hurt quality
            ocr_result, _ = self.ocr(img_bgr)
        if not ocr_result:
            return []
        boxes = []
        for item in ocr_result:
            poly, text_or_tuple = item[0], item[1]
            if isinstance(text_or_tuple, (list, tuple)):
                text = str(text_or_tuple[0]) if text_or_tuple else ''
                conf = float(text_or_tuple[1]) if len(text_or_tuple) > 1 else 0.80
            else:
                text = str(text_or_tuple)
                conf = float(item[2]) if len(item) > 2 else 0.80
            text = text.strip()
            if not text:
                continue
            xs = [pt[0] for pt in poly]
            ys = [pt[1] for pt in poly]
            boxes.append(Box(text, conf, min(xs), min(ys), max(xs), max(ys)))
        return deduplicate_sort(self._structure_boxes(boxes))

    def _parse_pdfplumber_table(self, table):
        """
        Parse a 2-D list-of-lists table from pdfplumber.
        Detects layout: day-column header | time-column header | day-row header.
        """
        if not table or not table[0]:
            return []

        def clean(cell):
            return (cell or '').strip().replace('\n', ' ').replace('\r', ' ')

        table = [[clean(c) for c in row] for row in table]
        header = table[0]

        # Pattern A: header row contains day names
        day_header_cols = {}
        for c_idx, cell in enumerate(header):
            dm = DAY_REGEX.search(cell)
            if dm:
                k = dm.group(1).lower()
                if k in DAYS_MAP:
                    day_header_cols[c_idx] = DAYS_MAP[k]
        if len(day_header_cols) >= 3:
            return self._parse_table_day_cols(table, day_header_cols)

        # Pattern B: header row contains time ranges
        time_header_cols = {}
        for c_idx, cell in enumerate(header):
            tm = TIME_RANGE_REGEX.search(cell)
            if tm:
                time_header_cols[c_idx] = (normalize_time_str(tm.group(1), 9),
                                            normalize_time_str(tm.group(2), 10))
        if len(time_header_cols) >= 2:
            return self._parse_table_time_cols(table, time_header_cols)

        # Pattern C: first column has day names, first row has time ranges
        day_row_map = {}
        for r_idx, row in enumerate(table):
            if row:
                dm = DAY_REGEX.search(row[0])
                if dm:
                    k = dm.group(1).lower()
                    if k in DAYS_MAP:
                        day_row_map[r_idx] = DAYS_MAP[k]
        if len(day_row_map) >= 3:
            time_header = {}
            for c_idx, cell in enumerate(header):
                tm = TIME_RANGE_REGEX.search(cell)
                if tm:
                    time_header[c_idx] = (normalize_time_str(tm.group(1), 9),
                                           normalize_time_str(tm.group(2), 10))
            if time_header:
                return self._parse_table_time_rows(table, day_row_map, time_header)
        return []

    def _parse_table_day_cols(self, table, day_cols):
        """Days as columns, time slots as rows."""
        entries = []
        for r_idx in range(1, len(table)):
            row = table[r_idx]
            if not row:
                continue
            tm = TIME_RANGE_REGEX.search(' '.join(row[:2]))
            if not tm:
                continue
            start_t = normalize_time_str(tm.group(1))
            end_t = normalize_time_str(tm.group(2))
            for c_idx, (day_name, day_num) in day_cols.items():
                if c_idx >= len(row):
                    continue
                entry = make_entry(day_name, day_num, start_t, end_t, row[c_idx], 0.92,
                                   self.known_subjects, self._next_seq())
                if entry:
                    entries.append(entry)
        return entries

    def _parse_table_time_cols(self, table, time_cols):
        """Time slots as columns, days as rows."""
        entries = []
        current_day, current_day_num = 'Monday', 1
        for r_idx in range(1, len(table)):
            row = table[r_idx]
            if not row:
                continue
            dm = DAY_REGEX.search(' '.join(row[:2]))
            if dm:
                k = dm.group(1).lower()
                if k in DAYS_MAP:
                    current_day, current_day_num = DAYS_MAP[k]
            for c_idx, (start_t, end_t) in time_cols.items():
                if c_idx >= len(row):
                    continue
                entry = make_entry(current_day, current_day_num, start_t, end_t, row[c_idx], 0.92,
                                   self.known_subjects, self._next_seq())
                if entry:
                    entries.append(entry)
        return entries

    def _parse_table_time_rows(self, table, day_rows, time_cols):
        """Days as rows, time slots as columns."""
        entries = []
        for r_idx, (day_name, day_num) in day_rows.items():
            row = table[r_idx]
            for c_idx, (start_t, end_t) in time_cols.items():
                if c_idx >= len(row):
                    continue
                entry = make_entry(day_name, day_num, start_t, end_t, row[c_idx], 0.92,
                                   self.known_subjects, self._next_seq())
                if entry:
                    entries.append(entry)
        return entries

    # ── Box-based layout detection ─────────────────────────────────────────

    def _structure_boxes(self, boxes):
        """
        Detect timetable layout from OCR boxes and parse entries.
        Order: day-column matrix → time-column matrix → list fallback.
        """
        if not boxes:
            return []
        rows = cluster_rows(boxes)
        result = self._try_day_column_layout(rows)
        if result:
            return result
        result = self._try_time_column_layout(rows)
        if result:
            return result
        return self._parse_list_layout(rows)

    def _try_day_column_layout(self, rows):
        """
        Detect: day names in the header row → day columns.
        Supports merged cells (subject spanning multiple time-slot rows).
        """
        if len(rows) < 3:
            return []
        header_row_idx = -1
        day_cols = []  # (day_name, day_num, x0, x1)
        for r_idx, row in enumerate(rows[:6]):
            found = []
            for b in row:
                dm = DAY_REGEX.search(b.text)
                if dm:
                    k = dm.group(1).lower()
                    if k in DAYS_MAP:
                        d_name, d_num = DAYS_MAP[k]
                        found.append((d_name, d_num, b.x0, b.x1))
            if len(found) >= 3:
                header_row_idx = r_idx
                day_cols = found
                break
        if header_row_idx == -1 or len(day_cols) < 3:
            return []

        col_centers = [(x0 + x1) / 2 for (_, _, x0, x1) in day_cols]
        col_widths = [(x1 - x0) for (_, _, x0, x1) in day_cols]
        col_boundaries = build_col_boundaries(col_centers)
        median_col_w = sorted(col_widths)[len(col_widths) // 2] if col_widths else 80.0

        entries = []
        current_start = '09:00'
        current_end = '10:00'

        for r_idx in range(header_row_idx + 1, len(rows)):
            row = rows[r_idx]
            if not row:
                continue
            row_text = ' '.join(b.text for b in row[:3])
            tm = TIME_RANGE_REGEX.search(row_text)
            if tm:
                current_start = normalize_time_str(tm.group(1))
                current_end = normalize_time_str(tm.group(2))

            col_cells = {i: [] for i in range(len(day_cols))}
            for b in row:
                c_idx = assign_column(b.cx, col_boundaries)
                if c_idx < len(day_cols):
                    col_cells[c_idx].append(b)
            # Handle wide boxes (merged cells across multiple day columns)
            for b in row:
                if b.w > median_col_w * 1.5:
                    start_c = assign_column(b.x0 + 5, col_boundaries)
                    end_c = assign_column(b.x1 - 5, col_boundaries)
                    if start_c != end_c:
                        for c in range(start_c, min(end_c + 1, len(day_cols))):
                            if b not in col_cells[c]:
                                col_cells[c].append(b)

            for c_idx, cell_boxes in col_cells.items():
                if not cell_boxes:
                    continue
                cell_text = ' '.join(b.text for b in cell_boxes)
                avg_conf = sum(b.conf for b in cell_boxes) / len(cell_boxes)
                d_name, d_num, _, _ = day_cols[c_idx]
                entry = make_entry(d_name, d_num, current_start, current_end, cell_text,
                                   avg_conf, self.known_subjects, self._next_seq())
                if entry:
                    entries.append(entry)
        return entries

    def _try_time_column_layout(self, rows):
        """
        Detect: time ranges in the header row → time columns.
        Supports merged cells (one cell spanning multiple time slots).
        """
        if len(rows) < 3:
            return []
        header_row_idx = -1
        time_cols = []  # (start_t, end_t, x0, x1)
        for r_idx, row in enumerate(rows[:6]):
            row_text = ' '.join(b.text for b in row)
            matches = list(TIME_RANGE_REGEX.finditer(row_text))
            if len(matches) >= 2:
                header_row_idx = r_idx
                # Try to get x extents per time match from individual boxes
                time_boxes = [b for b in row if TIME_RANGE_REGEX.search(b.text)]
                if len(time_boxes) >= len(matches):
                    for i, m in enumerate(matches):
                        b = time_boxes[min(i, len(time_boxes) - 1)]
                        time_cols.append((normalize_time_str(m.group(1)),
                                          normalize_time_str(m.group(2)),
                                          b.x0, b.x1))
                else:
                    # Distribute evenly across row width
                    row_x0 = min(b.x0 for b in row)
                    row_x1 = max(b.x1 for b in row)
                    col_w = (row_x1 - row_x0) / max(1, len(matches))
                    for i, m in enumerate(matches):
                        x0 = row_x0 + i * col_w
                        x1 = row_x0 + (i + 1) * col_w
                        time_cols.append((normalize_time_str(m.group(1)),
                                          normalize_time_str(m.group(2)),
                                          x0, x1))
                break
        if header_row_idx == -1 or len(time_cols) < 2:
            return []

        # Remove duplicates (same start/end time)
        seen_times = set()
        unique_time_cols = []
        for tc in time_cols:
            key = (tc[0], tc[1])
            if key not in seen_times:
                seen_times.add(key)
                unique_time_cols.append(tc)
        time_cols = unique_time_cols
        if len(time_cols) < 2:
            return []

        col_centers = [(x0 + x1) / 2 for (_, _, x0, x1) in time_cols]
        col_widths = [(x1 - x0) for (_, _, x0, x1) in time_cols]
        col_boundaries = build_col_boundaries(col_centers)
        median_col_w = sorted(col_widths)[len(col_widths) // 2] if col_widths else 80.0

        entries = []
        current_day = 'Monday'
        current_day_num = 1

        for r_idx in range(header_row_idx + 1, len(rows)):
            row = rows[r_idx]
            if not row:
                continue
            first_text = ' '.join(b.text for b in row[:2])
            dm = DAY_REGEX.search(first_text)
            if dm:
                k = dm.group(1).lower()
                if k in DAYS_MAP:
                    current_day, current_day_num = DAYS_MAP[k]

            day_col_end_x = time_cols[0][2] - 10
            col_cells = {i: [] for i in range(len(time_cols))}
            for b in row:
                if b.cx < day_col_end_x:
                    continue
                c_idx = assign_column(b.cx, col_boundaries)
                if c_idx < len(time_cols):
                    col_cells[c_idx].append(b)

            used_keys = set()
            for c_idx, cell_boxes in col_cells.items():
                if not cell_boxes:
                    continue
                cell_text = ' '.join(b.text for b in cell_boxes)
                avg_conf = sum(b.conf for b in cell_boxes) / len(cell_boxes)

                # Determine actual time span (handles merged cells)
                box_x0 = min(b.x0 for b in cell_boxes)
                box_x1 = max(b.x1 for b in cell_boxes)
                is_merged = (box_x1 - box_x0) > median_col_w * 1.5

                if is_merged:
                    span_start_c = min(assign_column(box_x0 + 5, col_boundaries), len(time_cols) - 1)
                    span_end_c = min(assign_column(box_x1 - 5, col_boundaries), len(time_cols) - 1)
                    start_t = time_cols[span_start_c][0]
                    end_t = time_cols[span_end_c][1]
                else:
                    start_t = time_cols[c_idx][0]
                    end_t = time_cols[c_idx][1]

                dedup_key = (current_day, start_t, cell_text[:20])
                if dedup_key in used_keys:
                    continue
                used_keys.add(dedup_key)

                entry = make_entry(current_day, current_day_num, start_t, end_t,
                                   cell_text, avg_conf, self.known_subjects, self._next_seq())
                if entry:
                    entries.append(entry)
        return entries

    def _parse_list_layout(self, rows):
        """Fallback: row-by-row schedule where each row has day, time, and subject."""
        entries = []
        current_day = 'Monday'
        current_day_num = 1
        current_start = '09:00'
        current_end = '10:00'
        for row in rows:
            combined = ' '.join(b.text for b in row)
            avg_conf = sum(b.conf for b in row) / len(row) if row else 0.80
            lower_comb = combined.lower()
            if re.search(r'\bsubject\b', lower_comb) and re.search(r'\b(day|time|code)\b', lower_comb):
                continue
            dm = DAY_REGEX.search(combined)
            if dm:
                k = dm.group(1).lower()
                if k in DAYS_MAP:
                    current_day, current_day_num = DAYS_MAP[k]
            tm = TIME_RANGE_REGEX.search(combined)
            if tm:
                current_start = normalize_time_str(tm.group(1))
                current_end = normalize_time_str(tm.group(2))
            else:
                singles = TIME_SINGLE_REGEX.findall(combined)
                if len(singles) >= 2:
                    current_start = normalize_time_str(singles[0][0])
                    current_end = normalize_time_str(singles[1][0])
                elif len(singles) == 1:
                    current_start = normalize_time_str(singles[0][0])
                    h, m = map(int, current_start.split(':'))
                    current_end = '{:02d}:{:02d}'.format((h + 1) % 24, m)
            entry = make_entry(current_day, current_day_num, current_start, current_end,
                               combined, avg_conf, self.known_subjects, self._next_seq())
            if entry:
                entries.append(entry)
        return entries


# ─── Entry point ──────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python parse_timetable.py <file> [subjects.json]',
            'entries': [],
        }))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({
            'success': False,
            'error': 'File not found: {}'.format(file_path),
            'entries': [],
        }))
        sys.exit(1)

    known_subjects = []
    if len(sys.argv) >= 3 and os.path.exists(sys.argv[2]):
        try:
            with open(sys.argv[2], 'r', encoding='utf-8') as f:
                known_subjects = json.load(f)
        except Exception as e:
            sys.stderr.write('Warning: could not load known subjects: {}\n'.format(e))

    try:
        extractor = TimetableExtractor(known_subjects=known_subjects)
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            entries = extractor.extract_pdf(file_path)
        else:
            entries = extractor.extract_image(file_path)

        if not entries:
            print(json.dumps({
                'success': False,
                'error': (
                    "We couldn't read this timetable. "
                    "Please upload a clearer image or PDF. "
                    "Ensure the timetable is not rotated or heavily compressed."
                ),
                'entries': [],
                'totalEntriesCount': 0,
                'detectedDaysCount': 0,
            }))
            sys.exit(0)

        detected_days = len(set(e['day'] for e in entries))
        print(json.dumps({
            'success': True,
            'entries': entries,
            'totalEntriesCount': len(entries),
            'detectedDaysCount': detected_days,
            'totalEntries': len(entries),
            'detectedDays': detected_days,
        }, indent=2))

    except Exception as e:
        sys.stderr.write('Parser error: {}\n'.format(e))
        import traceback
        sys.stderr.write(traceback.format_exc())
        print(json.dumps({
            'success': False,
            'error': "We couldn't read this timetable. Please upload a clearer image or PDF.",
            'entries': [],
            'details': str(e),
        }))
        sys.exit(1)


if __name__ == '__main__':
    main()

