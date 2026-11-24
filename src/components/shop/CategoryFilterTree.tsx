"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { localizedName, pathTo, type CategoryNode } from "@/lib/categoryTree";

interface Props {
  tree: CategoryNode[];
  /** Selected category slugs (multi-select). */
  selected: string[];
  /** Matching product count per category slug, including all descendants. */
  counts: Map<string, number>;
  lang: string;
  onToggle: (slug: string) => void;
}

/**
 * Recursive category filter. Expanding (chevron) and selecting (checkbox) are separate actions.
 * Selecting a category matches its products and every descendant's (resolved server-side).
 */
export default function CategoryFilterTree({ tree, selected, counts, lang, onToggle }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Reveal selected categories (e.g. arriving from a shared URL) without collapsing what the user opened.
  const selectedKey = selected.join(",");
  const seen = useRef("");
  useEffect(() => {
    // tree.length is part of the key so a URL-selected category is revealed once the tree has loaded.
    const key = `${selectedKey}|${tree.length}`;
    if (seen.current === key) return;
    seen.current = key;
    const ancestors = selected.flatMap((s) =>
      pathTo(tree, s)
        .slice(0, -1)
        .map((n) => n.slug),
    );
    if (ancestors.length) setExpanded((prev) => new Set([...prev, ...ancestors]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, tree]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggleOpen(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function renderNode(n: CategoryNode): React.ReactNode {
    const hasKids = n.children.length > 0;
    const isOpen = expanded.has(n.slug);
    const isSel = selectedSet.has(n.slug);
    const count = counts.get(n.slug) ?? 0;
    const label = localizedName(n, lang);
    return (
      <li key={n.slug} className="ftree__item" data-slug={n.slug}>
        <div
          className={`ftree__row${isSel ? " is-selected" : ""}${count === 0 && !isSel ? " is-empty" : ""}`}
        >
          <button
            type="button"
            className={`ftree__chev${hasKids ? "" : " is-leaf"}${isOpen ? " is-open" : ""}`}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
            aria-expanded={hasKids ? isOpen : undefined}
            tabIndex={hasKids ? 0 : -1}
            onClick={() => hasKids && toggleOpen(n.slug)}
          >
            <ChevronRight size={15} />
          </button>
          <label className="ck ftree__label">
            <input type="checkbox" checked={isSel} onChange={() => onToggle(n.slug)} />
            <span className="ck__box" aria-hidden="true" />
            <span className="ck__label">{label}</span>
            <span className="ck__count">{count}</span>
          </label>
        </div>
        {hasKids && (
          <div className={`ftree__collapse${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
            <ul className="ftree__children">{n.children.map(renderNode)}</ul>
          </div>
        )}
      </li>
    );
  }

  return <ul className="ftree">{tree.map(renderNode)}</ul>;
}
