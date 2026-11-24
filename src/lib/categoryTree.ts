import type { Category } from "@/redux/fetchers/category/categoryApi";

export type CategoryNode = Category & { children: CategoryNode[] };

const byOrder = (a: Category, b: Category) => a.order - b.order || a.id - b.id;

/**
 * Builds the nested tree from the flat list. Unlimited depth.
 * With `activeOnly`, an inactive category hides its entire subtree (public storefront rule).
 */
export function buildTree(flat: Category[], opts: { activeOnly?: boolean } = {}): CategoryNode[] {
  const rows = opts.activeOnly ? flat.filter((c) => c.isActive) : flat;
  const nodes = new Map<number, CategoryNode>(
    [...rows].sort(byOrder).map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: CategoryNode[] = [];
  for (const n of nodes.values()) {
    if (n.parentId == null) roots.push(n);
    else nodes.get(n.parentId)?.children.push(n); // missing parent => pruned subtree
  }
  return roots;
}

/** Depth-first flat list (parents before children), each with its depth. */
export function flattenTree(
  nodes: CategoryNode[],
  depth = 0,
): { node: CategoryNode; depth: number }[] {
  return nodes.flatMap((n) => [{ node: n, depth }, ...flattenTree(n.children, depth + 1)]);
}

/** Ids of a node and all of its descendants. */
export function subtreeIds(node: CategoryNode): number[] {
  return [node.id, ...node.children.flatMap(subtreeIds)];
}

/** Slugs of a node and all of its descendants (products reference categories by slug). */
export function subtreeSlugs(node: CategoryNode): string[] {
  return [node.slug, ...node.children.flatMap(subtreeSlugs)];
}

/** Finds a node anywhere in the tree. */
export function findNode(nodes: CategoryNode[], slug: string): CategoryNode | null {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const hit = findNode(n.children, slug);
    if (hit) return hit;
  }
  return null;
}

/** Path from a root down to the node with `slug` (inclusive), or [] if not found. */
export function pathTo(nodes: CategoryNode[], slug: string): CategoryNode[] {
  for (const n of nodes) {
    if (n.slug === slug) return [n];
    const sub = pathTo(n.children, slug);
    if (sub.length) return [n, ...sub];
  }
  return [];
}

export function localizedName(c: Pick<Category, "nameEN" | "nameAZ" | "nameRU">, lang: string) {
  const v = lang === "az" ? c.nameAZ : lang === "ru" ? c.nameRU : c.nameEN;
  return v || c.nameEN;
}
