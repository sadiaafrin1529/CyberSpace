import type { Locale } from "@/lib/i18n";
import type {
  Project,
  ProjectCategory,
  ProjectSummary,
} from "@/redux/fetchers/project/projectApi";

/** Same rule as News and Careers: the visitor's language, else English, else the first available. */
export const pickLang = <T extends { lang: string }>(items: T[], lang: Locale): T | undefined =>
  items.find((t) => t.lang === lang.toUpperCase()) ?? items.find((t) => t.lang === "EN") ?? items[0];

export const categoryName = (
  c: { name: string; translations: { lang: string; name: string }[] },
  lang: Locale,
) => pickLang(c.translations as { lang: string; name: string }[], lang)?.name ?? c.name;

export const projectCardText = (p: ProjectSummary, lang: Locale) => {
  const tr = pickLang(p.translations, lang);
  return {
    title: tr?.title ?? p.title,
    shortDescription: tr?.shortDescription ?? null,
    category: categoryName(p.category, lang),
  };
};

export const projectDetailText = (p: Project, lang: Locale) => {
  const tr = pickLang(p.translations, lang);
  return {
    title: tr?.title ?? p.title,
    shortDescription: tr?.shortDescription ?? null,
    description: tr?.description ?? null,
    category: categoryName(p.category, lang),
  };
};

export type PublicCategory = Pick<ProjectCategory, "id" | "slug" | "name" | "translations">;
