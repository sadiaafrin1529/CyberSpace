"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { CATEGORIES, type CategoryId, type PublicProduct } from "@/data/catalog";
import { useLang } from "@/lib/useLang";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { highlightParts, searchProducts, tokenize } from "@/lib/productSearch";
import { useGetProductsQuery } from "@/redux/fetchers/product/productApi";
import { useGetSettingsQuery } from "@/redux/fetchers/settings/settingsApi";
import { useGetCategoriesQuery } from "@/redux/fetchers/category/categoryApi";
import { PriceText, StockBadge } from "./ProductCard";
import ProductImage from "./ProductImage";

const DEBOUNCE_MS = 250;
const MAX_BRAND_CHIPS = 8;

const SearchIcon = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {highlightParts(text, tokens).map((p, i) =>
        p.hit ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>,
      )}
    </>
  );
}

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <ul className="srow-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="srow srow--skeleton">
          <span className="srow__thumb skel" />
          <span className="srow__main">
            <span className="skel skel--line" style={{ width: `${62 - (i % 3) * 10}%` }} />
            <span
              className="skel skel--line skel--thin"
              style={{ width: `${38 + (i % 2) * 12}%` }}
            />
          </span>
          <span className="srow__side">
            <span className="skel skel--line" style={{ width: 64 }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function SearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lang, t } = useLang();
  const router = useRouter();
  // The catalogue is loaded once (and cached by RTK Query, shared with the Shop page) when the modal first opens.
  const {
    data: rawProducts = [],
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery(undefined, { skip: !open });
  const { data: settings = { showPrices: true, showStock: true } } = useGetSettingsQuery(
    undefined,
    { skip: !open },
  );
  const { data: dbCats = [], isLoading: catsLoading } = useGetCategoriesQuery(undefined, {
    skip: !open,
  });

  const [query, setQuery] = useState("");
  // -1 = nothing highlighted: Enter does nothing until the user picks a row.
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);

  const close = () => onOpenChange(false);

  // Fresh search every time the modal opens.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(-1);
    }
  }, [open]);

  const products = useMemo<PublicProduct[]>(
    () =>
      rawProducts.map((p) => ({
        ...p,
        price: settings.showPrices ? p.price : null,
        currency: settings.showPrices ? p.currency : null,
        stock: settings.showStock ? p.stock : null,
      })),
    [rawProducts, settings],
  );

  // Nothing is shown until the real categories have loaded, so the static fallback never flashes.
  const categories = useMemo(
    () =>
      catsLoading
        ? []
        : dbCats.length > 0
          ? dbCats
              .filter((c) => c.isActive)
              .map((c) => ({ id: c.slug, name: { en: c.nameEN, az: c.nameAZ, ru: c.nameRU } }))
          : CATEGORIES,
    [dbCats, catsLoading],
  );
  const categoryName = (p: PublicProduct) => {
    const c = categories.find((x) => x.id === p.category);
    return c ? (c.name[lang] ?? c.name.en) : "";
  };

  // Brands that really exist in the catalogue, most products first: one-click starting points.
  const brands = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of products) if (p.brand) count.set(p.brand, (count.get(p.brand) ?? 0) + 1);
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_BRAND_CHIPS)
      .map(([b]) => b);
  }, [products]);

  const trimmed = debounced.trim();
  const hasQuery = query.trim().length > 0;
  const typing = query.trim() !== trimmed; // typed something the debounce has not caught up with yet
  const tokens = useMemo(() => tokenize(trimmed), [trimmed]);
  const results = useMemo(
    () => (trimmed ? searchProducts(products, trimmed, categoryName) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, trimmed, categories, lang],
  );
  const loading = hasQuery && (isLoading || typing);

  // Highlight the best match as soon as results change; nothing is highlighted without a query.
  useEffect(() => setActive(trimmed ? 0 : -1), [trimmed, products.length]);
  useEffect(() => {
    bodyRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const hrefOf = (p: PublicProduct) => `/${lang}/shop/${p.id}`;
  const displayName = (p: PublicProduct) => p.names?.[lang] ?? p.names?.en ?? p.name;
  const pickBrand = (b: string) => {
    setQuery(b);
    inputRef.current?.focus();
  };

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (loading || results.length === 0 || !hasQuery) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[active];
      if (!target) return;
      router.push(hrefOf(target));
      close();
    }
  }

  function renderRow(p: PublicProduct, i: number) {
    const name = displayName(p);
    const cat = categoryName(p);
    return (
      <li key={p.id} style={{ ["--i" as string]: Math.min(i, 8) }}>
        <Link
          href={hrefOf(p)}
          className={`srow${i === active ? " is-active" : ""}`}
          data-active={i === active}
          onClick={close}
          onMouseEnter={() => setActive(i)}
        >
          <span className="srow__thumb">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" loading="lazy" />
            ) : (
              <ProductImage category={p.category as CategoryId} label={name} />
            )}
          </span>
          <span className="srow__main">
            <span className="srow__name">
              <Highlight text={name} tokens={tokens} />
            </span>
            <span className="srow__meta">
              {p.brand && (
                <span className="srow__brand">
                  <Highlight text={p.brand} tokens={tokens} />
                </span>
              )}
              {cat && <span className="srow__tag">{cat}</span>}
              <span className="srow__sku">
                <Highlight text={p.sku} tokens={tokens} />
              </span>
            </span>
          </span>
          <span className="srow__side">
            <PriceText product={p} />
            <StockBadge stock={p.stock} />
          </span>
          <svg
            className="srow__arrow"
            viewBox="0 0 20 20"
            width="16"
            height="16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 10h12M11 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </li>
    );
  }

  const brandChips = brands.length > 0 && (
    <>
      <div className="smodal__section">
        <span>{t.common.searchBrands}</span>
      </div>
      <div className="smodal__chips">
        {brands.map((b) => (
          <button key={b} type="button" className="smodal__chip" onClick={() => pickBrand(b)}>
            {b}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="smodal__overlay" />
        <Dialog.Content
          className="smodal"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="smodal__sr">{t.common.search}</Dialog.Title>
          <Dialog.Description className="smodal__sr">{t.common.searchHint}</Dialog.Description>

          <div className="smodal__bar">
            <span className="smodal__bar-icon">
              {loading ? (
                <span className="smodal__spin" aria-hidden="true" />
              ) : (
                <SearchIcon size={18} />
              )}
            </span>
            <input
              ref={inputRef}
              className="smodal__input"
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t.common.searchPlaceholder}
              aria-label={t.common.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {query && (
              <button
                type="button"
                className="smodal__clear"
                aria-label={t.common.searchClear}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                {t.common.searchClear}
              </button>
            )}
            <Dialog.Close className="smodal__close" aria-label={t.common.searchClose}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Dialog.Close>
          </div>

          <div className="smodal__body" ref={bodyRef}>
            {isError ? (
              <div className="smodal__state" role="alert">
                <p>{t.common.error}</p>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => refetch()}
                >
                  {t.common.retry}
                </button>
              </div>
            ) : !hasQuery ? (
              // Initial state: no products listed, just an invitation to search plus ways in.
              <>
                <div className="smodal__hero">
                  <span className="smodal__hero-icon">
                    <SearchIcon size={22} />
                  </span>
                  <p className="smodal__state-title">{t.common.searchStartTitle}</p>
                  <p className="smodal__state-sub">{t.common.searchHint}</p>
                </div>
                {brandChips}
                {categories.length > 0 && (
                  <>
                    <div className="smodal__section">
                      <span>{t.common.searchCategories}</span>
                    </div>
                    <div className="smodal__chips">
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/${lang}/shop?category=${encodeURIComponent(c.id)}`}
                          className="smodal__chip"
                          onClick={close}
                        >
                          {c.name[lang] ?? c.name.en}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : loading ? (
              <SkeletonRows />
            ) : results.length === 0 ? (
              <>
                <div className="smodal__state">
                  <span className="smodal__hero-icon">
                    <SearchIcon size={22} />
                  </span>
                  <p className="smodal__state-title">{t.common.searchNoResults}</p>
                  <p className="smodal__state-sub">{t.common.searchNoResultsHint}</p>
                </div>
                {brandChips}
              </>
            ) : (
              <>
                <div className="smodal__section smodal__section--sticky">
                  <span>
                    {results.length} {t.common.searchResults}
                  </span>
                  <Link
                    href={`/${lang}/shop?q=${encodeURIComponent(query.trim())}`}
                    onClick={close}
                    className="smodal__viewall"
                  >
                    {t.common.searchViewAll} →
                  </Link>
                </div>
                <ul className="srow-list" key={trimmed}>
                  {results.map(renderRow)}
                </ul>
              </>
            )}
          </div>

          <div className="smodal__foot" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> {t.common.searchKeyNavigate}
            </span>
            <span>
              <kbd>↵</kbd> {t.common.searchKeyOpen}
            </span>
            <span>
              <kbd>esc</kbd> {t.common.searchKeyClose}
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
