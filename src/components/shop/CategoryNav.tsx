"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { localizedName, pathTo, type CategoryNode } from "@/lib/categoryTree";

interface Props {
  tree: CategoryNode[];
  /** Selected category slugs (empty = "All"). */
  selected: string[];
  onSelect: (slug: string | null) => void;
  lang: string;
  allLabel: string;
  title: string;
  /** Product count per category slug, including its descendants. */
  counts: Map<string, number>;
}

/** Hover menus only on real pointer devices that are wide enough; touch / small screens get the accordion. */
const HOVER_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 900px)";

function useHoverCapable() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(HOVER_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}

/**
 * One shared hover state for the whole menu hierarchy. `chain[d]` is the slug open at depth d.
 * Nothing closes on a per-item mouseleave: the menu only closes when the pointer leaves the whole <nav>
 * (flyouts are DOM descendants of it), and switching to a sibling while a flyout is open is delayed
 * slightly (hover intent) so diagonal mouse moves toward the flyout do not swap it for a neighbour.
 */
interface HoverApi {
  chain: string[];
  enter: (depth: number, slug: string) => void;
  openNow: (depth: number, slug: string) => void;
  cancelPending: () => void;
}
const HoverCtx = createContext<HoverApi | null>(null);

const SWITCH_DELAY = 140;
const CLOSE_DELAY = 280;

interface CommonProps {
  selected: string[];
  onSelect: (slug: string | null) => void;
  lang: string;
  counts: Map<string, number>;
  openPath: Set<string>;
}

/* ------------------------------------------------------------------ */
/* Desktop: recursive hover flyouts                                    */
/* ------------------------------------------------------------------ */

function HoverItem({
  node,
  depth,
  onPick,
  ...c
}: CommonProps & { node: CategoryNode; depth: number; onPick: () => void }) {
  const liRef = useRef<HTMLLIElement>(null);
  const subRef = useRef<HTMLUListElement>(null);
  const hover = useContext(HoverCtx)!;
  const hasKids = node.children.length > 0;
  const isRoot = depth === 0;
  const isOpen = hover.chain[depth] === node.slug;

  // Keep the flyout inside the viewport: flip sideways and/or shift up when it would overflow.
  const place = useCallback(() => {
    const li = liRef.current;
    const sub = subRef.current;
    if (!li || !sub) return;
    sub.style.removeProperty("--shift-y");
    li.classList.remove("is-flip");
    const margin = 12;
    const liRect = li.getBoundingClientRect();
    const w = sub.offsetWidth;
    const h = sub.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    if (isRoot) {
      // Dropdown opens below the item, left-aligned; right-align it if it would overflow.
      if (liRect.left + w > vw - margin) li.classList.add("is-flip");
    } else {
      // Flyout opens to the right; flip to the left when there is no room.
      if (liRect.right + w > vw - margin && liRect.left - w >= margin) li.classList.add("is-flip");
      const top = liRect.top - 6;
      if (top + h > vh - margin)
        sub.style.setProperty("--shift-y", `${Math.max(vh - margin - h - top, margin - top)}px`);
    }
  }, [isRoot]);

  const active = c.selected.includes(node.slug);
  const onPath = c.openPath.has(node.slug);
  const label = localizedName(node, c.lang);
  const count = c.counts.get(node.slug) ?? 0;

  return (
    <li
      ref={liRef}
      className={`cnav__item${hasKids ? " has-kids" : ""}${isRoot ? " is-root" : ""}${isOpen ? " is-open" : ""}`}
      onMouseEnter={() => {
        place();
        hover.enter(depth, node.slug);
      }}
      onFocus={() => {
        place();
        hover.openNow(depth, node.slug);
      }}
    >
      <button
        type="button"
        className={`cnav__link${active ? " is-active" : ""}${onPath ? " is-path" : ""}`}
        aria-haspopup={hasKids ? "menu" : undefined}
        onClick={() => {
          c.onSelect(node.slug);
          onPick();
        }}
      >
        {node.imageUrl && !isRoot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.imageUrl} alt="" className="cnav__img" loading="lazy" />
        )}
        <span className="cnav__label">{label}</span>
        {!isRoot && <span className="cnav__count">{count}</span>}
        {hasKids &&
          (isRoot ? (
            <ChevronDown size={14} className="cnav__arrow" aria-hidden="true" />
          ) : (
            <ChevronRight size={14} className="cnav__arrow" aria-hidden="true" />
          ))}
      </button>
      {hasKids && (
        <ul ref={subRef} className="cnav__sub" role="menu" onMouseEnter={hover.cancelPending}>
          {node.children.map((ch) => (
            <HoverItem key={ch.slug} node={ch} depth={depth + 1} onPick={onPick} {...c} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile / touch: recursive tap-to-expand accordion                   */
/* ------------------------------------------------------------------ */

function AccordionItem({
  node,
  depth,
  expanded,
  toggle,
  onPick,
  ...c
}: CommonProps & {
  node: CategoryNode;
  depth: number;
  expanded: Set<string>;
  toggle: (slug: string) => void;
  onPick: () => void;
}) {
  const hasKids = node.children.length > 0;
  const isOpen = expanded.has(node.slug);
  const label = localizedName(node, c.lang);
  return (
    <li className="cacc__item">
      <div
        className={`cacc__row${c.selected.includes(node.slug) ? " is-active" : ""}`}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <button
          type="button"
          className="cacc__link"
          onClick={() => {
            c.onSelect(node.slug);
            onPick();
          }}
        >
          <span>{label}</span>
          <span className="cnav__count">{c.counts.get(node.slug) ?? 0}</span>
        </button>
        {hasKids && (
          <button
            type="button"
            className={`cacc__toggle${isOpen ? " is-open" : ""}`}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
            onClick={() => toggle(node.slug)}
          >
            <ChevronDown size={18} />
          </button>
        )}
      </div>
      {hasKids && isOpen && (
        <ul className="cacc__list">
          {node.children.map((ch) => (
            <AccordionItem
              key={ch.slug}
              node={ch}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              onPick={onPick}
              {...c}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */

export default function CategoryNav({
  tree,
  selected,
  onSelect,
  lang,
  allLabel,
  title,
  counts,
}: Props) {
  const hoverMode = useHoverCapable();
  const [panelOpen, setPanelOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const selectedPaths = selected.map((s) => pathTo(tree, s));
  const pathNodes = selectedPaths[0] ?? [];
  const openPath = new Set(selectedPaths.flat().map((n) => n.slug));
  const selectedNode = pathNodes[pathNodes.length - 1];

  // Reveal the selected category inside the accordion (e.g. when arriving via ?category=).
  const pathKey = selectedPaths
    .flat()
    .map((n) => n.slug)
    .join("/");
  useEffect(() => {
    if (!pathKey) return;
    setExpanded((prev) => new Set([...prev, ...pathKey.split("/")]));
  }, [pathKey]);

  // ---- shared hover state (desktop) ----
  const [chain, setChain] = useState<string[]>([]);
  const chainRef = useRef<string[]>([]);
  const pendingT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apply = useCallback((next: string[]) => {
    chainRef.current = next;
    setChain(next);
  }, []);
  const cancelPending = useCallback(() => {
    if (pendingT.current) clearTimeout(pendingT.current);
    pendingT.current = null;
  }, []);
  const cancelClose = useCallback(() => {
    if (closeT.current) clearTimeout(closeT.current);
    closeT.current = null;
  }, []);
  const closeAll = useCallback(() => {
    cancelPending();
    cancelClose();
    apply([]);
  }, [apply, cancelPending, cancelClose]);
  useEffect(
    () => () => {
      if (pendingT.current) clearTimeout(pendingT.current);
      if (closeT.current) clearTimeout(closeT.current);
    },
    [],
  );

  const hoverApi: HoverApi = {
    chain,
    cancelPending,
    openNow: (depth, slug) => {
      cancelPending();
      apply([...chainRef.current.slice(0, depth), slug]);
    },
    enter: (depth, slug) => {
      cancelClose();
      cancelPending();
      const cur = chainRef.current;
      if (cur[depth] === slug) return;
      const next = [...cur.slice(0, depth), slug];
      // Nothing open at this level yet: open immediately. Otherwise wait a beat (hover intent).
      if (cur[depth] === undefined) apply(next);
      else pendingT.current = setTimeout(() => apply(next), SWITCH_DELAY);
    },
  };

  const toggle = useCallback((slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  if (tree.length === 0) return null;

  const common = { selected, onSelect, lang, counts, openPath };

  // Closing the CSS hover menu after a pick: blur the focused button so :focus-within lets go.
  const closeHover = () => {
    closeAll();
    (document.activeElement as HTMLElement | null)?.blur?.();
  };

  if (hoverMode) {
    return (
      <HoverCtx.Provider value={hoverApi}>
        <nav
          className="cnav container"
          aria-label={title}
          onMouseEnter={cancelClose}
          onMouseLeave={() => {
            cancelPending();
            closeT.current = setTimeout(() => apply([]), CLOSE_DELAY);
          }}
          onKeyDown={(e) => e.key === "Escape" && closeAll()}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeAll();
          }}
        >
          <ul className="cnav__bar">
            <li className="cnav__item is-root" onMouseEnter={() => hoverApi.enter(0, "")}>
              <button
                type="button"
                className={`cnav__link${selected.length === 0 ? " is-active" : ""}`}
                onClick={() => {
                  onSelect(null);
                  closeAll();
                }}
              >
                <span className="cnav__label">{allLabel}</span>
              </button>
            </li>
            {tree.map((n) => (
              <HoverItem key={n.slug} node={n} depth={0} onPick={closeHover} {...common} />
            ))}
          </ul>
        </nav>
      </HoverCtx.Provider>
    );
  }

  return (
    <nav className="cacc container" aria-label={title}>
      <button
        type="button"
        className="cacc__head"
        aria-expanded={panelOpen}
        onClick={() => setPanelOpen((v) => !v)}
      >
        <span>
          {title}
          {selectedNode && (
            <strong>
              {" "}
              · {localizedName(selectedNode, lang)}
              {selected.length > 1 ? ` +${selected.length - 1}` : ""}
            </strong>
          )}
        </span>
        <ChevronDown size={18} className={`cacc__headarrow${panelOpen ? " is-open" : ""}`} />
      </button>
      {panelOpen && (
        <ul className="cacc__list cacc__list--root">
          <li className="cacc__item">
            <div className={`cacc__row${selected.length === 0 ? " is-active" : ""}`}>
              <button
                type="button"
                className="cacc__link"
                onClick={() => {
                  onSelect(null);
                  setPanelOpen(false);
                }}
              >
                <span>{allLabel}</span>
              </button>
            </div>
          </li>
          {tree.map((n) => (
            <AccordionItem
              key={n.slug}
              node={n}
              depth={0}
              expanded={expanded}
              toggle={toggle}
              onPick={() => setPanelOpen(false)}
              {...common}
            />
          ))}
        </ul>
      )}
    </nav>
  );
}
