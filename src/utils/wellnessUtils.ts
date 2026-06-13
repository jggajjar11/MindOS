/**
 * MindOS Student Wellness Terminal - Core Utility Functions
 * Designed for reliable unit testing and modular runtime logic.
 */

/**
 * Checks a journal text entry against the warning crisis phrases.
 * Returns true if any high-risk matches are detected.
 */
export function checkCrisisKeywords(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const crisisKeywords = ["suicide", "self-harm", "kill myself", "end my life", "suicidal", "cutting myself"];
  return crisisKeywords.some((word) => lower.includes(word));
}

/**
 * Formats duration seconds into readable m:ss format.
 */
export function formatMinSec(secs: number): string {
  if (secs < 0) secs = 0;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Returns Tailwind text colors for various wellness score tiers (out of 100).
 */
export function getWellnessScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-indigo-400";
  if (score >= 30) return "text-amber-400";
  return "text-rose-400";
}

/**
 * Validates onboarding profile values.
 * Returns an object with 'valid' status and an optional error string.
 */
export interface OnboardingValidationResult {
  valid: boolean;
  error?: string;
}

export function validateOnboarding(name: string, examType: string): OnboardingValidationResult {
  if (!name.trim()) {
    return { valid: false, error: "Please introduce yourself by name." };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters long." };
  }
  if (!examType || !examType.trim()) {
    return { valid: false, error: "Please select or customize your target exam preset." };
  }
  return { valid: true };
}
