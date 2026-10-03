import universitiesData from '@/data/universities.json';

export interface University {
  id: string;
  sNo: number;
  name: string;
  state: string;
  type: string;
  established: string;
  fullName: string;
}

export const universities: University[] = universitiesData as University[];

// Normalize string for fast, resilient comparison
export function normalizeUniversityText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Map for fast O(1) or normalized lookup
const normalizedLookup = new Map<string, University>();
const idLookup = new Map<string, University>();

// Populate lookups
universities.forEach((u) => {
  idLookup.set(u.id.toLowerCase(), u);
  normalizedLookup.set(normalizeUniversityText(u.name), u);
  normalizedLookup.set(u.name.toLowerCase().trim(), u);
});

/**
 * Check if a university input is valid against the UGC dataset
 * Allows match by name (case-insensitive, trimmed, punctuation tolerant) or id
 */
export function isValidUniversity(input: string | null | undefined): boolean {
  if (!input || !input.trim()) return false;
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // Check ID
  if (idLookup.has(lower)) return true;

  // Check Exact Name (case-insensitive)
  if (normalizedLookup.has(lower)) return true;

  // Check Normalized Name
  const norm = normalizeUniversityText(trimmed);
  if (normalizedLookup.has(norm)) return true;

  // Check if matches any university name exactly or if fullName starts with input
  return universities.some((u) => {
    const uName = u.name.toLowerCase().trim();
    if (uName === lower) return true;
    if (normalizeUniversityText(u.name) === norm) return true;
    // Check if input is exact match to former name or primary text
    return false;
  });
}

/**
 * Find matching university object by name or ID
 */
export function findUniversity(input: string | null | undefined): University | null {
  if (!input || !input.trim()) return null;
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (idLookup.has(lower)) return idLookup.get(lower)!;
  if (normalizedLookup.has(lower)) return normalizedLookup.get(lower)!;

  const norm = normalizeUniversityText(trimmed);
  if (normalizedLookup.has(norm)) return normalizedLookup.get(norm)!;

  const found = universities.find(
    (u) =>
      u.name.toLowerCase().trim() === lower ||
      normalizeUniversityText(u.name) === norm
  );

  return found || null;
}

/**
 * Autocomplete search for universities
 * - case-insensitive
 * - whitespace-tolerant
 * - partial-match capable
 * - prioritizes matches that begin with the typed text
 */
export function searchUniversities(query: string, limit = 20): University[] {
  if (!query || !query.trim()) return [];

  const rawQuery = query.trim().toLowerCase();
  const normQuery = normalizeUniversityText(query);
  if (!rawQuery && !normQuery) return [];

  const queryTokens = normQuery.split(' ').filter(Boolean);

  // Categorize results for prioritized sorting
  const startsWithMatches: University[] = [];
  const wordStartsWithMatches: University[] = [];
  const substringMatches: University[] = [];
  const stateOrDetailsMatches: University[] = [];

  for (const u of universities) {
    const nameLower = u.name.toLowerCase();
    const normName = normalizeUniversityText(u.name);
    const fullNameLower = u.fullName.toLowerCase();
    const stateLower = u.state.toLowerCase();

    // 1. Name starts directly with the query
    if (nameLower.startsWith(rawQuery) || normName.startsWith(normQuery)) {
      startsWithMatches.push(u);
      continue;
    }

    // 2. Any word in the university name starts with query
    const words = normName.split(' ');
    const hasWordStart = words.some((w) => w.startsWith(normQuery));
    if (hasWordStart) {
      wordStartsWithMatches.push(u);
      continue;
    }

    // 3. Name contains the query or all query tokens
    const containsDirect = nameLower.includes(rawQuery) || normName.includes(normQuery);
    const allTokensMatch = queryTokens.every((token) => normName.includes(token));
    if (containsDirect || allTokensMatch) {
      substringMatches.push(u);
      continue;
    }

    // 4. Matches state or full address/details
    if (stateLower.includes(rawQuery) || fullNameLower.includes(rawQuery)) {
      stateOrDetailsMatches.push(u);
    }
  }

  const combined = [
    ...startsWithMatches,
    ...wordStartsWithMatches,
    ...substringMatches,
    ...stateOrDetailsMatches,
  ];

  return combined.slice(0, limit);
}
