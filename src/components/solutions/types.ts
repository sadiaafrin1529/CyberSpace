import type { Locale } from "@/lib/i18n";
import {
  SOLUTION_COLORS,
  type Solution,
  type SolutionColor,
  type SolutionTranslation,
} from "@/redux/fetchers/solution/solutionApi";

/** Same rule as News and Careers: the visitor's language, else English, else the first available. */
export const pickTranslation = (s: Solution, lang: Locale): SolutionTranslation =>
  s.translations.find((t) => t.lang === lang.toUpperCase()) ??
  s.translations.find((t) => t.lang === "EN") ??
  s.translations[0];

/** The card colour is chosen from a fixed set; anything unknown falls back to blue. */
export const safeColor = (c: string): SolutionColor =>
  (SOLUTION_COLORS as readonly string[]).includes(c) ? (c as SolutionColor) : "blue";

/** Full description is plain text: blank lines separate paragraphs. */
export const paragraphs = (text: string | null | undefined): string[] =>
  (text ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
