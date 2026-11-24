"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/data/catalog";
import { useLang } from "@/lib/useLang";
import {
  useGetShopProductsQuery,
  type ShopQueryArgs,
  type ShopSort,
} from "@/redux/fetchers/product/productApi";
import { useGetCategoriesQuery } from "@/redux/fetchers/category/categoryApi";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./ProductCardSkeleton";
import { FadeUp } from "./Motion";
import CategoryNav from "./shop/CategoryNav";
import CategoryFilterTree from "./shop/CategoryFilterTree";
import { buildTree, findNode, localizedName, type CategoryNode } from "@/lib/categoryTree";

const PAGE_SIZE = 12;
const SORTS: ShopSort[] = ["relevance", "nameAsc", "priceAsc", "priceDesc"];
const DEBOUNCE_MS = 350;

const csv = (v: string | null) =>
  v
    ? v
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
const toNum = (v: string | null) => {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Compact page list with ellipses, e.g. 1 … 4 5 6 … 20. */
function pageList(page: number, total: number): (number | "gap")[] {
  const keep = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of [...keep].sort((a, b) => a - b)) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function ShopClient() {
  const { lang, t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const { data: dbCats = [] } = useGetCategoriesQuery();

  // Unlimited-depth tree. Inactive categories hide their whole subtree from the storefront.
  const tree = useMemo<CategoryNode[]>(
    () =>
      dbCats.length > 0
        ? buildTree(dbCats, { activeOnly: true })
        : CATEGORIES.map((c) => ({
            id: 0,
            slug: c.id,
            parentId: null,
            nameEN: c.name.en,
            nameAZ: c.name.az,
            nameRU: c.name.ru,
            imageUrl: null,
            isActive: true,
            order: 0,
            createdAt: "",
            updatedAt: "",
            children: [],
          })),
    [dbCats],
  );

  /* ── Filters live in the URL (shareable, survives refresh / back / forward) ── */
  const urlKey = params.toString();
  const latest = useRef(urlKey);
  useEffect(() => {
    latest.current = urlKey;
  }, [urlKey]);

  const selectedCats = useMemo(() => csv(params.get("category")), [params]);
  const selectedBrands = useMemo(() => csv(params.get("brand")), [params]);
  const urlQ = params.get("q") ?? "";
  const urlMin = toNum(params.get("min"));
  const urlMax = toNum(params.get("max"));
  const sortParam = params.get("sort") as ShopSort | null;
  const sort: ShopSort = sortParam && SORTS.includes(sortParam) ? sortParam : "relevance";
  const page = Math.max(1, Math.floor(toNum(params.get("page")) ?? 1));

  /** Patch the query string. Any filter change returns to page 1 unless `page` is part of the patch. */
  const update = useCallback(
    (patch: Record<string, string | string[] | number | null>) => {
      const next = new URLSearchParams(latest.current);
      for (const [k, v] of Object.entries(patch)) {
        const val = Array.isArray(v) ? v.join(",") : v === null ? "" : String(v);
        if (val === "" || (k === "page" && val === "1") || (k === "sort" && val === "relevance"))
          next.delete(k);
        else next.set(k, val);
      }
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      latest.current = qs;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  /* ── Debounced text search + price slider (local draft → URL) ── */
  const [qInput, setQInput] = useState(urlQ);
  const committedQ = useRef(urlQ);
  useEffect(() => {
    if (urlQ !== committedQ.current) {
      committedQ.current = urlQ; // changed from outside (chip, back button, clear all)
      setQInput(urlQ);
    }
  }, [urlQ]);
  useEffect(() => {
    const next = qInput.trim();
    if (next === committedQ.current) return;
    const id = setTimeout(() => {
      committedQ.current = next;
      update({ q: next });
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [qInput, update]);

  const [draft, setDraft] = useState<{ min: number | null; max: number | null }>({
    min: urlMin,
    max: urlMax,
  });
  const committedPrice = useRef(`${urlMin ?? ""}-${urlMax ?? ""}`);
  useEffect(() => {
    const key = `${urlMin ?? ""}-${urlMax ?? ""}`;
    if (key !== committedPrice.current) {
      committedPrice.current = key;
      setDraft({ min: urlMin, max: urlMax });
    }
  }, [urlMin, urlMax]);
  useEffect(() => {
    const key = `${draft.min ?? ""}-${draft.max ?? ""}`;
    if (key === committedPrice.current) return;
    const id = setTimeout(() => {
      committedPrice.current = key;
      update({ min: draft.min, max: draft.max });
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [draft, update]);

  /* ── Data: one server-side query for filters + sorting + pagination + facet counts ── */
  const args = useMemo<ShopQueryArgs>(
    () => ({
      category: selectedCats,
      brand: selectedBrands,
      q: urlQ,
      minPrice: urlMin,
      maxPrice: urlMax,
      sort,
      page,
      limit: PAGE_SIZE,
      lang: lang.toUpperCase() as ShopQueryArgs["lang"],
    }),
    [selectedCats, selectedBrands, urlQ, urlMin, urlMax, sort, page, lang],
  );
  const { data, isLoading, isFetching, isError, refetch } = useGetShopProductsQuery(args);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const facets = data?.facets;

  // A stale ?page= beyond the last page (e.g. after a filter shrank the result) snaps back.
  useEffect(() => {
    if (data && page > data.totalPages) update({ page: data.totalPages });
  }, [data, page, update]);

  const catCounts = useMemo(
    () => new Map(Object.entries(facets?.categories ?? {})),
    [facets?.categories],
  );
  // Matching products per category including all descendants (slug → total).
  const subtreeCounts = useMemo(() => {
    const m = new Map<string, number>();
    const walk = (n: CategoryNode): number => {
      const sum = (catCounts.get(n.slug) ?? 0) + n.children.reduce((s, c) => s + walk(c), 0);
      m.set(n.slug, sum);
      return sum;
    };
    tree.forEach(walk);
    return m;
  }, [tree, catCounts]);

  const brandNames = useMemo(
    () =>
      [...new Set([...Object.keys(facets?.brands ?? {}), ...selectedBrands])].sort((a, b) =>
        a.localeCompare(b),
      ),
    [facets?.brands, selectedBrands],
  );
  const priceBounds = facets?.price ?? null;

  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [openSec, setOpenSec] = useState({ cats: true, brands: true, price: true });
  const resultsRef = useRef<HTMLElement>(null);

  const shownBrands = showAllBrands ? brandNames : brandNames.slice(0, 6);
  const activeCount =
    selectedCats.length +
    selectedBrands.length +
    (urlMin !== null || urlMax !== null ? 1 : 0) +
    (urlQ ? 1 : 0);
  const singleSelected = selectedCats.length === 1 ? findNode(tree, selectedCats[0]) : null;
  const activeSubs = singleSelected?.children ?? [];

  // Lock page scroll while the mobile filter drawer is open; Esc closes it.
  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  // Toggle against the latest URL, not the last render, so rapid clicks never act on stale state.
  const toggleIn = (key: "category" | "brand", value: string) => {
    const cur = csv(new URLSearchParams(latest.current).get(key));
    update({ [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] });
  };
  const toggleCategory = (slug: string) => toggleIn("category", slug);
  const toggleBrand = (b: string) => toggleIn("brand", b);
  const clearAll = () => {
    setQInput("");
    update({ category: null, brand: null, q: null, min: null, max: null });
  };
  const goPage = (p: number) => {
    update({ page: p });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Slider values equal to the catalogue bounds mean "no limit". */
  const setRange = (lo: number | null, hi: number | null) => {
    if (!priceBounds) return;
    setDraft({
      min: lo !== null && lo > priceBounds.min ? lo : null,
      max: hi !== null && hi < priceBounds.max ? hi : null,
    });
  };
  const numInput = (v: string) => (v === "" ? null : Math.max(0, Number(v)));

  if (isError && !data) {
    return (
      <div className="container section">
        <div className="empty">
          <p className="muted">{t.common.error}</p>
          <button type="button" className="btn btn--primary" onClick={() => refetch()}>
            {t.common.retry}
          </button>
        </div>
      </div>
    );
  }

  const lo = draft.min ?? priceBounds?.min ?? 0;
  const hi = draft.max ?? priceBounds?.max ?? 0;
  const span = priceBounds ? Math.max(1, priceBounds.max - priceBounds.min) : 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const sectionHead = (key: "cats" | "brands" | "price", label: string, badge?: number) => (
    <button
      type="button"
      className="fsec__head"
      aria-expanded={openSec[key]}
      onClick={() => setOpenSec((o) => ({ ...o, [key]: !o[key] }))}
    >
      <span>
        {label}
        {badge ? <em className="fsec__badge">{badge}</em> : null}
      </span>
      <ChevronDown size={16} className={`fsec__chev${openSec[key] ? " is-open" : ""}`} />
    </button>
  );

  return (
    <div className="shop">
      <div className="container">
        <form className="sbar" role="search" onSubmit={(e) => e.preventDefault()}>
          <Search size={20} className="sbar__icon" aria-hidden="true" />
          <label className="sr" htmlFor="shop-q">
            {t.common.search}
          </label>
          <input
            id="shop-q"
            type="search"
            value={qInput}
            placeholder={t.shop.searchPlaceholder}
            onChange={(e) => setQInput(e.target.value)}
            autoComplete="off"
          />
          {qInput && (
            <button
              type="button"
              className="sbar__clear"
              aria-label={t.shop.clear}
              onClick={() => setQInput("")}
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="sbar__btn">
            {t.common.search}
          </button>
        </form>
      </div>

      <CategoryNav
        tree={tree}
        selected={selectedCats}
        onSelect={(slug) => update({ category: slug ? [slug] : null })}
        lang={lang}
        allLabel={t.common.all}
        title={t.shop.categories}
        counts={subtreeCounts}
      />

      <div className="container shop__layout">
        {filtersOpen && (
          <div
            className="filters-backdrop"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          id="filters"
          className={`filters${filtersOpen ? " is-open" : ""}`}
          aria-label={t.shop.filters}
        >
          <div className="filters__top">
            <h2>{t.shop.filters}</h2>
            <button
              type="button"
              className="filters__close"
              aria-label={t.shop.closeFilters}
              onClick={() => setFiltersOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="filters__scroll">
            {tree.length > 0 && (
              <section className="fsec">
                {sectionHead("cats", t.shop.categories, selectedCats.length)}
                {openSec.cats && (
                  <CategoryFilterTree
                    tree={tree}
                    selected={selectedCats}
                    counts={subtreeCounts}
                    lang={lang}
                    onToggle={toggleCategory}
                  />
                )}
              </section>
            )}

            {brandNames.length > 0 && (
              <section className="fsec">
                {sectionHead("brands", t.shop.brands, selectedBrands.length)}
                {openSec.brands && (
                  <>
                    <ul className="blist">
                      {shownBrands.map((b) => (
                        <li key={b}>
                          <label className="ck">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(b)}
                              onChange={() => toggleBrand(b)}
                            />
                            <span className="ck__box" aria-hidden="true" />
                            <span className="ck__label">{b}</span>
                            <span className="ck__count">{facets?.brands[b] ?? 0}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {brandNames.length > 6 && (
                      <button
                        type="button"
                        className="linkbtn"
                        onClick={() => setShowAllBrands((v) => !v)}
                      >
                        {showAllBrands ? t.shop.showLess : t.shop.showMore}
                      </button>
                    )}
                  </>
                )}
              </section>
            )}

            {priceBounds && (
              <section className="fsec">
                {sectionHead("price", `${t.shop.priceRange} (USD)`)}
                {openSec.price && (
                  <>
                    <div className="dual">
                      <div className="dual__track" aria-hidden="true">
                        <span
                          className="dual__fill"
                          style={{
                            left: `${(Math.max(0, lo - priceBounds.min) / span) * 100}%`,
                            right: `${100 - (Math.min(span, hi - priceBounds.min) / span) * 100}%`,
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        aria-label={t.shop.min}
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={Math.min(Math.max(lo, priceBounds.min), priceBounds.max)}
                        onChange={(e) => setRange(Math.min(Number(e.target.value), hi), draft.max)}
                      />
                      <input
                        type="range"
                        aria-label={t.shop.max}
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={Math.min(Math.max(hi, priceBounds.min), priceBounds.max)}
                        onChange={(e) => setRange(draft.min, Math.max(Number(e.target.value), lo))}
                      />
                    </div>
                    <div className="range">
                      <div>
                        <label htmlFor="pmin">{t.shop.min}</label>
                        <input
                          id="pmin"
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder={String(priceBounds.min)}
                          value={draft.min ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, min: numInput(e.target.value) }))
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="pmax">{t.shop.max}</label>
                        <input
                          id="pmax"
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder={String(priceBounds.max)}
                          value={draft.max ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, max: numInput(e.target.value) }))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}
          </div>

          <div className="filters__foot">
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => setFiltersOpen(false)}
            >
              {t.shop.showResults} ({total})
            </button>
            {activeCount > 0 && (
              <button type="button" className="linkbtn" onClick={clearAll}>
                {t.shop.clearAll}
              </button>
            )}
          </div>
        </aside>

        <section className="results" aria-live="polite" ref={resultsRef}>
          <div className="toolbar">
            <button
              type="button"
              className="toolbar__filters"
              aria-expanded={filtersOpen}
              aria-controls="filters"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} />
              {t.shop.filters}
              {activeCount > 0 && <span className="toolbar__badge">{activeCount}</span>}
            </button>
            <p className="toolbar__count">
              {t.shop.showing}{" "}
              <strong>
                {from}–{to}
              </strong>{" "}
              {t.shop.of} <strong>{total}</strong> {t.shop.products}
            </p>
            <div className="toolbar__ctrl">
              <label htmlFor="sort" className="toolbar__label">
                {t.shop.sortBy}
              </label>
              <div className="selwrap">
                <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
                  <option value="relevance">{t.shop.sortRelevance}</option>
                  <option value="nameAsc">{t.shop.sortNameAsc}</option>
                  {priceBounds && <option value="priceAsc">{t.shop.sortPriceAsc}</option>}
                  {priceBounds && <option value="priceDesc">{t.shop.sortPriceDesc}</option>}
                </select>
                <ChevronDown size={15} aria-hidden="true" />
              </div>
              <div className="seg" role="group">
                <button
                  type="button"
                  className={view === "grid" ? "is-active" : ""}
                  aria-pressed={view === "grid"}
                  aria-label={t.shop.gridView}
                  onClick={() => setView("grid")}
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                    <path
                      d="M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h5v5h-5z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={view === "list" ? "is-active" : ""}
                  aria-pressed={view === "list"}
                  aria-label={t.shop.listView}
                  onClick={() => setView("list")}
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                    <path d="M3 4h14v3H3zM3 9h14v3H3zM3 14h14v3H3z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="chips" aria-label={t.shop.filters}>
              {selectedCats.map((slug) => {
                const node = findNode(tree, slug);
                return (
                  <button
                    key={`c-${slug}`}
                    type="button"
                    className="chip"
                    onClick={() => toggleCategory(slug)}
                  >
                    {node ? localizedName(node, lang) : slug} <X size={13} aria-hidden="true" />
                  </button>
                );
              })}
              {selectedBrands.map((b) => (
                <button
                  key={`b-${b}`}
                  type="button"
                  className="chip chip--brand"
                  onClick={() => toggleBrand(b)}
                >
                  {b} <X size={13} aria-hidden="true" />
                </button>
              ))}
              {(urlMin !== null || urlMax !== null) && (
                <button
                  type="button"
                  className="chip chip--brand"
                  onClick={() => update({ min: null, max: null })}
                >
                  {urlMin ?? priceBounds?.min ?? 0} – {urlMax ?? priceBounds?.max ?? "∞"}{" "}
                  <X size={13} aria-hidden="true" />
                </button>
              )}
              {urlQ && (
                <button
                  type="button"
                  className="chip chip--brand"
                  onClick={() => {
                    setQInput("");
                    update({ q: null });
                  }}
                >
                  “{urlQ}” <X size={13} aria-hidden="true" />
                </button>
              )}
              <button type="button" className="chips__clear" onClick={clearAll}>
                {t.shop.clearAll}
              </button>
            </div>
          )}

          {activeSubs.length > 0 && (
            <ul className="subcats" aria-label={t.shop.categories}>
              {activeSubs.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    className="subcat"
                    onClick={() => update({ category: [c.slug] })}
                  >
                    {c.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageUrl} alt="" className="subcat__img" loading="lazy" />
                    )}
                    <span className="subcat__name">{localizedName(c, lang)}</span>
                    <span className="subcat__count">{subtreeCounts.get(c.slug) ?? 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isLoading ? (
            <ProductGridSkeleton count={PAGE_SIZE} />
          ) : items.length === 0 ? (
            <div className="empty empty--shop">
              <div className="empty__icon" aria-hidden="true">
                <Search size={26} />
              </div>
              <h3>{t.shop.noResults}</h3>
              <p className="muted">{t.shop.noResultsHint}</p>
              <button type="button" className="btn btn--primary" onClick={clearAll}>
                {t.shop.reset}
              </button>
            </div>
          ) : (
            <>
              <div
                className={`pgrid${view === "list" ? " pgrid--list" : ""}${isFetching ? " is-fetching" : ""}`}
                aria-busy={isFetching}
              >
                {items.map((p, i) => (
                  <FadeUp key={p.id} delay={Math.min((i % 4) * 0.055, 0.165)}>
                    <ProductCard product={p} view={view} />
                  </FadeUp>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pager" aria-label={t.shop.page}>
                  <button
                    type="button"
                    className="pager__btn"
                    disabled={page <= 1}
                    onClick={() => goPage(page - 1)}
                    aria-label={t.shop.prev}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {pageList(page, totalPages).map((p, i) =>
                    p === "gap" ? (
                      <span key={`g${i}`} className="pager__gap" aria-hidden="true">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        className={`pager__btn${p === page ? " is-active" : ""}`}
                        aria-current={p === page ? "page" : undefined}
                        onClick={() => goPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="pager__btn"
                    disabled={page >= totalPages}
                    onClick={() => goPage(page + 1)}
                    aria-label={t.shop.next}
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
