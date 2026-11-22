import type { Locale } from "@/lib/i18n";
import { pickLang } from "@/components/projects/types";
import type {
  BundleItem,
  SolutionBundle,
  SolutionCategory,
  SolutionSection,
} from "@/redux/fetchers/solution/solutionApi";

export const categoryText = (c: SolutionCategory, lang: Locale) => {
  const tr = pickLang(c.translations, lang);
  return {
    name: tr?.name ?? c.name,
    description: tr?.description ?? null,
    instruction: tr?.instruction ?? null,
  };
};

export const sectionText = (s: SolutionSection, lang: Locale) => {
  const tr = pickLang(s.translations, lang);
  return { title: tr?.title ?? s.title, description: tr?.description ?? null };
};

export const bundleText = (b: SolutionBundle, lang: Locale) => {
  const tr = pickLang(b.translations, lang);
  return {
    title: tr?.title ?? b.title,
    description: tr?.description ?? null,
    badge: tr?.badge ?? null,
  };
};

/** One "What's included" line: the line's own text, else the linked product's name; price from the line, else the product. */
export const itemLine = (i: BundleItem, bundleCurrency: string, lang: Locale) => {
  const own = pickLang(i.translations, lang);
  const productName = i.product ? pickLang(i.product.translations, lang)?.name : undefined;
  const price = i.price ?? i.product?.price ?? null;
  return {
    title: own?.title || productName || "",
    description: own?.description ?? null,
    price,
    currency: i.product?.currency ?? bundleCurrency,
  };
};

export const featureTitle = (f: SolutionBundle["features"][number], lang: Locale) =>
  pickLang(f.translations, lang)?.title ?? "";

/** The admin-set bundle price, else the sum of its priced lines; null when nothing has a price. */
export const bundlePrice = (b: SolutionBundle) => {
  if (b.price !== null && b.price !== undefined && b.price !== "") {
    return { amount: Number(b.price), currency: b.currency };
  }
  const priced = b.items
    .map((i) => ({ p: i.price ?? i.product?.price ?? null, c: i.product?.currency ?? b.currency }))
    .filter((x) => x.p !== null && Number.isFinite(Number(x.p)));
  if (!priced.length) return null;
  return {
    amount: priced.reduce((sum, x) => sum + Number(x.p), 0),
    currency: priced[0].c ?? b.currency,
  };
};

/** Accent colour as CSS custom properties; falls back to the brand blue for an invalid value. */
export const accentStyle = (hex: string): React.CSSProperties => {
  const ok = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#1457d9";
  return { ["--sx-c" as string]: ok, ["--sx-s" as string]: `${ok}1a` };
};
