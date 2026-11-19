import type { PublicProduct } from "@/data/catalog";

/**
 * Case- and accent-insensitive folding that never changes the string length,
 * so match positions found in the folded text map 1:1 onto the original text (for highlighting).
 * Azerbaijani ə / ı and Russian ё do not decompose, so they are mapped by hand.
 */
const EXTRA: Record<string, string> = { ə: "e", ı: "i", ё: "е" };

export function fold(text: string): string {
  let out = "";
  for (const ch of text) {
    const lower = ch.toLowerCase();
    const mapped = EXTRA[lower] ?? lower.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    // keep length 1 per char; anything that would collapse or expand falls back to the plain lowercase char
    out += mapped.length === 1 ? mapped : lower.length === 1 ? lower : ch;
  }
  return out;
}

export const tokenize = (query: string): string[] =>
  fold(query)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

export interface SearchHit {
  product: PublicProduct;
  score: number;
}

/**
 * All words of the query must appear somewhere in the product's searchable text:
 * names in every language, part number (SKU), brand, category label and descriptions.
 * Better matches sort first: name starts with the query, then a name word starts with it,
 * then the name contains it, then matches in SKU / brand, then anything else.
 */
export function searchProducts(
  products: PublicProduct[],
  query: string,
  categoryLabel: (p: PublicProduct) => string,
): PublicProduct[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const phrase = tokens.join(" ");

  const hits: SearchHit[] = [];
  for (const product of products) {
    const names = [product.name, ...Object.values(product.names ?? {})].map(fold);
    const sku = fold(product.sku);
    const brand = fold(product.brand ?? "");
    const rest = fold(
      [categoryLabel(product), ...Object.values(product.descriptions ?? {})].join(" "),
    );
    const haystack = [...names, sku, brand, rest].join(" \n ");
    if (!tokens.every((t) => haystack.includes(t))) continue;

    const primary = fold(product.name);
    let score = 4;
    if (names.some((n) => n.startsWith(phrase))) score = 0;
    else if (names.some((n) => n.split(/[\s\-_/(),.]+/).some((w) => w.startsWith(tokens[0]))))
      score = 1;
    else if (names.some((n) => tokens.every((t) => n.includes(t)))) score = 2;
    else if (tokens.every((t) => sku.includes(t) || brand.includes(t))) score = 3;
    hits.push({ product, score: score * 1000 + Math.min(primary.length, 999) });
  }
  return hits.sort((a, b) => a.score - b.score).map((h) => h.product);
}

/** Splits `text` into plain and matched parts for <mark> highlighting. */
export function highlightParts(text: string, tokens: string[]): { text: string; hit: boolean }[] {
  if (tokens.length === 0 || !text) return [{ text, hit: false }];
  const folded = fold(text);
  const marked = new Array<boolean>(text.length).fill(false);
  for (const t of tokens) {
    for (let i = folded.indexOf(t); i !== -1; i = folded.indexOf(t, i + t.length)) {
      for (let k = i; k < i + t.length; k++) marked[k] = true;
    }
  }
  const parts: { text: string; hit: boolean }[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || marked[i] !== marked[start]) {
      parts.push({ text: text.slice(start, i), hit: marked[start] });
      start = i;
    }
  }
  return parts;
}
