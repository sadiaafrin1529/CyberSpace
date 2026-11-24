"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, FolderTree, Search, X } from "lucide-react";
import type { Category } from "@/redux/fetchers/category/categoryApi";
import { useLang } from "@/lib/useLang";
import {
  buildTree,
  flattenTree,
  localizedName,
  pathTo,
  type CategoryNode,
} from "@/lib/categoryTree";

interface Props {
  id?: string;
  /** Slug of the selected category (products reference categories by slug). */
  value: string;
  onChange: (slug: string) => void;
  categories: Category[];
  disabled?: boolean;
}

/**
 * File-tree style category selector. Recursive (unlimited depth), always visible,
 * every category at every level is selectable. Shows the selected path below.
 */
export default function CategoryTreePicker({ id, value, onChange, categories, disabled }: Props) {
  const { lang } = useLang();
  // Only active categories are offered; an inactive parent hides its whole subtree.
  const tree = useMemo(() => buildTree(categories, { activeOnly: true }), [categories]);
  const fullTree = useMemo(() => buildTree(categories), [categories]);
  // Path comes from the full tree so a product already assigned to an inactive category still shows it.
  const selectedPath = useMemo(() => pathTo(fullTree, value), [fullTree, value]);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Expand the ancestors of the selected category (create → none, edit → its parents).
  const selectedKey = selectedPath.map((n) => n.id).join("/");
  const didInit = useRef(false);
  useEffect(() => {
    if (!selectedKey) return;
    if (didInit.current && rootRef.current?.contains(document.activeElement)) return; // user is interacting
    didInit.current = true;
    setExpanded((prev) => new Set([...prev, ...selectedPath.slice(0, -1).map((n) => n.id)]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const q = search.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    const byId = new Map(flattenTree(tree).map(({ node }) => [node.id, node]));
    return flattenTree(tree)
      .filter(({ node }) =>
        [node.slug, node.nameEN, node.nameAZ, node.nameRU].some((v) => v.toLowerCase().includes(q)),
      )
      .map(({ node }) => {
        const trail: CategoryNode[] = [];
        for (let cur = node.parentId == null ? undefined : byId.get(node.parentId); cur;) {
          trail.unshift(cur);
          cur = cur.parentId == null ? undefined : byId.get(cur.parentId);
        }
        return { node, trail };
      });
  }, [q, tree]);

  function toggle(nodeId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function pick(n: CategoryNode) {
    onChange(n.slug);
    // Clicking a category with children also opens it.
    if (n.children.length) setExpanded((prev) => new Set(prev).add(n.id));
  }

  function renderNode(n: CategoryNode): React.ReactNode {
    const hasKids = n.children.length > 0;
    const isOpen = expanded.has(n.id);
    const selected = n.slug === value;
    const onPath = !selected && selectedPath.some((p) => p.id === n.id);
    return (
      <li key={n.id} className="ctp__item" role="none">
        <div className={`ctp__row${selected ? " is-selected" : ""}${onPath ? " is-path" : ""}`}>
          <button
            type="button"
            className={`ctp__chev${hasKids ? "" : " is-leaf"}${isOpen ? " is-open" : ""}`}
            aria-label={isOpen ? "Collapse" : "Expand"}
            aria-expanded={hasKids ? isOpen : undefined}
            tabIndex={hasKids ? 0 : -1}
            disabled={disabled}
            onClick={() => hasKids && toggle(n.id)}
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            role="treeitem"
            aria-selected={selected}
            aria-expanded={hasKids ? isOpen : undefined}
            className="ctp__pick"
            disabled={disabled}
            onClick={() => pick(n)}
          >
            {n.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={n.imageUrl} alt="" className="ctp__icon" />
            ) : (
              <span className={`ctp__dot${hasKids ? " is-parent" : ""}`} aria-hidden="true" />
            )}
            <span className="ctp__name">{localizedName(n, lang)}</span>
            {hasKids && <span className="ctp__count">{n.children.length}</span>}
            {selected && <Check size={15} className="ctp__check" aria-hidden="true" />}
          </button>
        </div>
        {hasKids && (
          <div className={`ctp__collapse${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
            <ul role="group" className="ctp__children">
              {n.children.map(renderNode)}
            </ul>
          </div>
        )}
      </li>
    );
  }

  const pathLabel = selectedPath.length
    ? selectedPath.map((n) => localizedName(n, lang))
    : value
      ? [`${value} (not in category tree)`]
      : [];

  return (
    <div className={`ctp${disabled ? " is-disabled" : ""}`} ref={rootRef}>
      <div className="ctp__searchbox">
        <Search size={15} aria-hidden="true" />
        <input
          id={id}
          type="text"
          className="ctp__search"
          placeholder="Search categories…"
          aria-label="Search categories"
          value={search}
          disabled={disabled}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            // Never submit the product form from the search box.
            if (e.key === "Enter") e.preventDefault();
            if (e.key === "Escape") setSearch("");
          }}
        />
        {search && (
          <button
            type="button"
            className="ctp__clear"
            aria-label="Clear search"
            onClick={() => setSearch("")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="ctp__scroll">
        {tree.length === 0 ? (
          <p className="ctp__empty">No active categories.</p>
        ) : results ? (
          results.length === 0 ? (
            <p className="ctp__empty">No categories match “{search}”.</p>
          ) : (
            <ul className="ctp__results" role="listbox" aria-label="Search results">
              {results.map(({ node, trail }) => (
                <li key={node.id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={node.slug === value}
                    className={`ctp__result${node.slug === value ? " is-selected" : ""}`}
                    disabled={disabled}
                    onClick={() => {
                      onChange(node.slug);
                      setSearch("");
                    }}
                  >
                    <span className="ctp__result-name">{localizedName(node, lang)}</span>
                    {trail.length > 0 && (
                      <span className="ctp__result-path">
                        {trail.map((t) => localizedName(t, lang)).join(" → ")}
                      </span>
                    )}
                    {node.slug === value && (
                      <Check size={15} className="ctp__check" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <ul className="ctp__root" role="tree" aria-label="Categories">
            {tree.map(renderNode)}
          </ul>
        )}
      </div>

      <div className={`ctp__path${pathLabel.length ? "" : " is-empty"}`} aria-live="polite">
        <FolderTree size={15} aria-hidden="true" />
        {pathLabel.length ? (
          <span className="ctp__crumbs">
            {pathLabel.map((p, i) => (
              <span key={i} className={i === pathLabel.length - 1 ? "is-last" : ""}>
                {i > 0 && <i aria-hidden="true"> → </i>}
                {p}
              </span>
            ))}
          </span>
        ) : (
          <span>No category selected</span>
        )}
      </div>
    </div>
  );
}
