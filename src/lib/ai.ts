/**
 * Nivora Centralized AI Service
 *
 * Exclusively uses Google Gemini API Free Tier (gemini-1.5-flash).
 * Does NOT require paid OpenAI or credit card billing.
 *
 * Server-side only: never exposes GEMINI_API_KEY to client code.
 * Implements timeout aborts, rate-limit (429) friendly handling,
 * retries for transient errors, and structured JSON parsing.
 */

export interface GenerateAIOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
  jsonMode?: boolean;
  timeoutMs?: number;
  retries?: number;
}

export interface AIResponse<T = any> {
  success: boolean;
  text: string;
  data?: T;
  isRateLimited?: boolean;
  error?: string;
  modelUsed: string;
}

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
export const FREE_TIER_LIMIT_MESSAGE =
  'AI service is temporarily unavailable or the free usage limit has been reached. Please try again later.';

/**
 * Strips markdown code blocks (e.g. ```json ... ```) from LLM output for safe JSON parsing.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * Primary shared AI generation function across all Nivora tools.
 * Calls Google's Gemini API Free Tier with timeout, rate-limiting, and error handling.
 */
export async function generateAIResponse<T = any>(
  prompt: string,
  options: GenerateAIOptions = {}
): Promise<AIResponse<T>> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const configuredModel = options.model || DEFAULT_GEMINI_MODEL;
  const timeoutMs = options.timeoutMs ?? 30000; // 30s default
  const candidateModels = Array.from(
    new Set([configuredModel, 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'].filter(Boolean))
  );

  if (!apiKey) {
    console.warn('[Nivora AI] GEMINI_API_KEY is not configured in environment variables.');
    return {
      success: false,
      text: '',
      error: FREE_TIER_LIMIT_MESSAGE,
      isRateLimited: true,
      modelUsed: configuredModel,
    };
  }

  const bodyPayload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  };

  if (options.systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  if (options.jsonMode) {
    bodyPayload.generationConfig.responseMimeType = 'application/json';
  }

  let lastError = FREE_TIER_LIMIT_MESSAGE;
  let lastModel = configuredModel;

  for (let m = 0; m < candidateModels.length; m++) {
    const currentModel = candidateModels[m];
    const hasNextCandidate = m < candidateModels.length - 1;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
    lastModel = currentModel;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 1. Rate Limit / Quota Exceeded handling (HTTP 429)
      if (response.status === 429) {
        console.warn(`[Nivora AI] Gemini rate-limit encountered (429) on ${currentModel}.`);
        return {
          success: false,
          text: '',
          error: FREE_TIER_LIMIT_MESSAGE,
          isRateLimited: true,
          modelUsed: currentModel,
        };
      }

      // 2. Authentication error (HTTP 400 / 401 / 403 on invalid key)
      if (response.status === 401 || response.status === 403) {
        console.error(`[Nivora AI] Invalid or unauthorized GEMINI_API_KEY (HTTP ${response.status}).`);
        return {
          success: false,
          text: '',
          error: FREE_TIER_LIMIT_MESSAGE,
          modelUsed: currentModel,
        };
      }

      // 3. Fallback on 404 or 503
      if ((response.status === 404 || response.status === 503) && hasNextCandidate) {
        console.warn(`[Nivora AI] Model ${currentModel} returned HTTP ${response.status}. Trying next candidate model...`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[Nivora AI] Gemini API returned error ${response.status} for ${currentModel}:`, errorText);
        lastError = FREE_TIER_LIMIT_MESSAGE;
        if (hasNextCandidate) continue;
        return {
          success: false,
          text: '',
          error: FREE_TIER_LIMIT_MESSAGE,
          modelUsed: currentModel,
        };
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        console.warn('[Nivora AI] Empty candidates in Gemini response:', json);
        if (hasNextCandidate) continue;
        return {
          success: false,
          text: '',
          error: 'The AI model returned an empty response. Please try rephrasing your request.',
          modelUsed: currentModel,
        };
      }

      // If JSON mode was requested, parse the payload
      let parsedData: T | undefined;
      if (options.jsonMode) {
        try {
          const cleaned = cleanJsonOutput(rawText);
          parsedData = JSON.parse(cleaned) as T;
        } catch (parseErr) {
          console.error('[Nivora AI] Failed to parse JSON from Gemini output:', parseErr, rawText);
          return {
            success: false,
            text: rawText,
            error: 'Failed to parse structured response from AI model. Please retry.',
            modelUsed: currentModel,
          };
        }
      }

      return {
        success: true,
        text: rawText,
        data: parsedData,
        modelUsed: currentModel,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = (err as Error)?.name === 'AbortError';

      if (isAbort) {
        console.warn(`[Nivora AI] Gemini request timed out after ${timeoutMs}ms on ${currentModel}.`);
      } else {
        console.error(`[Nivora AI] Error querying model ${currentModel}:`, err);
      }

      if (hasNextCandidate) continue;

      return {
        success: false,
        text: '',
        error: isAbort ? 'The AI request timed out. Please check your network connection and try again.' : FREE_TIER_LIMIT_MESSAGE,
        modelUsed: currentModel,
      };
    }
  }

  return {
    success: false,
    text: '',
    error: lastError,
    modelUsed: lastModel,
  };
}
