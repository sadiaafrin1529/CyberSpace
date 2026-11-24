"use client";

import { useMemo, useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
  type CreateCategoryInput,
} from "@/redux/fetchers/category/categoryApi";
import { buildTree, flattenTree, subtreeIds, type CategoryNode } from "@/lib/categoryTree";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Layers, MoreHorizontal } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogForm,
} from "@/components/ui/dialog";
import type { Dict } from "@/lib/i18n";

interface FormState {
  parentId: string; // "" = root
  slug: string;
  nameEN: string;
  nameAZ: string;
  nameRU: string;
  imageUrl: string;
  isActive: boolean;
  order: string;
}

const emptyForm = (parentId = ""): FormState => ({
  parentId,
  slug: "",
  nameEN: "",
  nameAZ: "",
  nameRU: "",
  imageUrl: "",
  isActive: true,
  order: "0",
});

function categoryToForm(c: Category): FormState {
  return {
    parentId: c.parentId == null ? "" : String(c.parentId),
    slug: c.slug,
    nameEN: c.nameEN,
    nameAZ: c.nameAZ,
    nameRU: c.nameRU,
    imageUrl: c.imageUrl ?? "",
    isActive: c.isActive,
    order: String(c.order),
  };
}

function formToPayload(f: FormState): CreateCategoryInput {
  return {
    parentId: f.parentId ? Number(f.parentId) : null,
    slug: f.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    nameEN: f.nameEN.trim(),
    nameAZ: f.nameAZ.trim(),
    nameRU: f.nameRU.trim(),
    imageUrl: f.imageUrl.trim() || null,
    isActive: f.isActive,
    order: f.order ? parseInt(f.order, 10) : 0,
  };
}

const errMsg = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message ?? fallback;

export default function CategoriesClient({ t }: { t: Dict }) {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [create, { isLoading: creating }] = useCreateCategoryMutation();
  const [update, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const tree = useMemo(() => buildTree(categories), [categories]);
  const nodeById = useMemo(
    () => new Map(flattenTree(tree).map(({ node }) => [node.id, node])),
    [tree],
  );

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [listError, setListError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  // While searching: keep matches plus their ancestors, and show everything expanded.
  const query = search.trim().toLowerCase();
  const visibleIds = useMemo(() => {
    if (!query) return null;
    const keep = new Set<number>();
    for (const c of categories) {
      const hit = [c.slug, c.nameEN, c.nameAZ, c.nameRU].some((v) =>
        v.toLowerCase().includes(query),
      );
      if (!hit) continue;
      for (let cur: Category | undefined = c; cur && !keep.has(cur.id);) {
        keep.add(cur.id);
        cur = cur.parentId == null ? undefined : nodeById.get(cur.parentId);
      }
    }
    return keep;
  }, [query, categories, nodeById]);

  // Parent choices: every category except the one being edited and its descendants (no cycles).
  const parentOptions = useMemo(() => {
    const self = editing ? nodeById.get(editing.id) : undefined;
    const blocked = new Set(self ? subtreeIds(self) : editing ? [editing.id] : []);
    return flattenTree(tree).filter(({ node }) => !blocked.has(node.id));
  }, [tree, nodeById, editing]);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function expandAll() {
    setExpanded(
      new Set(
        flattenTree(tree)
          .filter(({ node }) => node.children.length)
          .map(({ node }) => node.id),
      ),
    );
  }
  function collapseAll() {
    setExpanded(new Set());
  }

  function openCreate(parentId?: number) {
    setEditing(null);
    setForm(emptyForm(parentId ? String(parentId) : ""));
    setError("");
    setSuccess("");
    setOpen(true);
    if (parentId) setExpanded((prev) => new Set(prev).add(parentId));
  }
  function openEdit(c: Category) {
    setEditing(c);
    setForm(categoryToForm(c));
    setError("");
    setSuccess("");
    setOpen(true);
  }
  function handleOpenChange(v: boolean) {
    if (!v) {
      setOpen(false);
      setEditing(null);
    }
  }
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (!form.nameEN.trim()) return setError("English name is required.");
    try {
      const payload = formToPayload(form);
      if (editing) {
        await update({ id: editing.id, body: payload }).unwrap();
        setSuccess("Updated!");
      } else {
        await create(payload).unwrap();
        setSuccess("Created!");
      }
      setTimeout(() => {
        setSuccess("");
        setOpen(false);
        setEditing(null);
      }, 900);
    } catch (err: unknown) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  async function toggleActive(c: Category) {
    setListError("");
    try {
      await update({ id: c.id, body: { isActive: !c.isActive } }).unwrap();
    } catch (err) {
      setListError(errMsg(err, "Update failed."));
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setListError("");
    try {
      await deleteCategory(pendingDelete.id).unwrap();
    } catch (err) {
      setListError(errMsg(err, "Delete failed."));
    }
    setPendingDelete(null);
  }

  function renderNode(n: CategoryNode): React.ReactNode {
    if (visibleIds && !visibleIds.has(n.id)) return null;
    const hasKids = n.children.length > 0;
    const isOpen = visibleIds ? true : expanded.has(n.id);
    return (
      <li key={n.id} className="ctree__item">
        <div className={`ctree__row${n.isActive ? "" : " is-off"}`}>
          <button
            type="button"
            className={`ctree__chev${hasKids ? "" : " is-leaf"}${isOpen ? " is-open" : ""}`}
            onClick={() => hasKids && toggle(n.id)}
            aria-label={isOpen ? "Collapse" : "Expand"}
            aria-expanded={hasKids ? isOpen : undefined}
            tabIndex={hasKids ? 0 : -1}
          >
            <ChevronRight size={16} />
          </button>
          {n.imageUrl ? (
            <img src={n.imageUrl} alt="" className="ctree__thumb" />
          ) : (
            <div className="ctree__thumb ctree__thumb--empty" aria-hidden="true">
              <Layers size={14} />
            </div>
          )}
          <div className="ctree__main">
            <span className="ctree__name">{n.nameEN}</span>
            <span className="ctree__sub">
              {[n.nameAZ, n.nameRU].filter(Boolean).join(" · ")}
              {hasKids && <span className="ctree__count"> · {n.children.length} sub</span>}
            </span>
          </div>
          <code className="dash-code ctree__slug">{n.slug}</code>
          <span className="ctree__order" title="Display order">
            #{n.order}
          </span>
          <button
            type="button"
            className={`status-badge ${n.isActive ? "status-badge--ok" : "status-badge--off"}`}
            style={{ cursor: "pointer", border: 0 }}
            onClick={() => toggleActive(n)}
            disabled={updating}
            title="Click to toggle"
          >
            {n.isActive ? "Active" : "Off"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="ctree__menu" aria-label={`Actions for ${n.nameEN}`}>
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => openCreate(n.id)}>Add subcategory</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openEdit(n)}>
                {t.dash.edit ?? "Edit"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setPendingDelete(n)}>
                {t.dash.delete ?? "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {hasKids && isOpen && <ul className="ctree__children">{n.children.map(renderNode)}</ul>}
      </li>
    );
  }

  const busy = creating || updating;
  const parentNode = form.parentId ? nodeById.get(Number(form.parentId)) : null;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{t.dash.categories ?? "Categories"}</h1>
          <p className="dash-page-sub">
            Organize categories as a tree with unlimited nesting. Names are multilingual.
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => openCreate()} style={{ flexShrink: 0 }}>
          + Add Category
        </Button>
      </div>

      <div className="dash-toolbar">
        <input
          className="dash-search"
          type="search"
          placeholder="Search name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search categories"
        />
        <div className="dash-filters">
          <button type="button" className="dash-filter-btn" onClick={expandAll}>
            Expand all
          </button>
          <button type="button" className="dash-filter-btn" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
      </div>

      {listError && (
        <p className="pf-alert pf-alert--error" role="alert">
          {listError}
        </p>
      )}

      {isLoading ? (
        <div className="ctree">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ctree__row">
              <span className="skel skel--thumb" />
              <span className="skel skel--md" style={{ width: "40%" }} />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="dash-empty">
          <p>{t.dash.noData}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="dash-empty__cta"
            onClick={() => openCreate()}
          >
            + Add Category
          </Button>
        </div>
      ) : visibleIds && visibleIds.size === 0 ? (
        <div className="dash-empty">
          <p>No categories match “{search}”.</p>
        </div>
      ) : (
        <ul className="ctree">{tree.map(renderNode)}</ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={`Delete “${pendingDelete?.nameEN ?? ""}”?`}
        description="This action cannot be undone. A category that still has subcategories cannot be deleted."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="dlg-hdr-icon dlg-hdr-icon--green">
                <Layers size={20} strokeWidth={2} color="#fff" />
              </div>
              <div>
                <DialogTitle>
                  {editing ? "Edit category" : parentNode ? "Add subcategory" : "Add category"}
                </DialogTitle>
                <DialogDescription>
                  {parentNode && !editing
                    ? `Inside “${parentNode.nameEN}”.`
                    : "Set parent, slug, multilingual names, image and sort order."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogForm id="category-form" onSubmit={handleSubmit} noValidate>
            <DialogBody>
              {error && (
                <p className="pf-alert pf-alert--error" role="alert">
                  {error}
                </p>
              )}
              {success && <p className="pf-alert pf-alert--success">{success}</p>}

              <div className="pf-field" style={{ marginBottom: 12 }}>
                <label htmlFor="cat-parent" className="pf-label">
                  Parent category
                </label>
                <select
                  id="cat-parent"
                  className="pf-input"
                  value={form.parentId}
                  onChange={(e) => setField("parentId", e.target.value)}
                  disabled={busy}
                >
                  <option value="">— None (top level) —</option>
                  {parentOptions.map(({ node, depth }) => (
                    <option key={node.id} value={node.id}>
                      {"  ".repeat(depth)}
                      {depth > 0 ? "↳ " : ""}
                      {node.nameEN}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pf-field" style={{ marginBottom: 12 }}>
                <label htmlFor="cat-slug" className="pf-label">
                  Slug *{" "}
                  <span
                    style={{ fontWeight: 400, fontSize: ".72rem", color: "#8899aa", marginLeft: 4 }}
                  >
                    (unique across all categories; products reference it)
                  </span>
                </label>
                <Input
                  id="cat-slug"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  disabled={busy}
                  maxLength={80}
                  placeholder="e.g. rack-servers"
                  className="pf-input"
                />
              </div>

              <div className="pf-grid-3" style={{ marginBottom: 12 }}>
                {(
                  [
                    ["nameEN", "Name EN *"],
                    ["nameAZ", "Name AZ"],
                    ["nameRU", "Name RU"],
                  ] as const
                ).map(([key, label]) => (
                  <div className="pf-field" key={key}>
                    <label htmlFor={`cat-${key}`} className="pf-label">
                      {label}
                    </label>
                    <Input
                      id={`cat-${key}`}
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      disabled={busy}
                      maxLength={100}
                      className="pf-input"
                    />
                  </div>
                ))}
              </div>

              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setField("imageUrl", url)}
                disabled={busy}
                label="Category Image / Icon"
                hint="PNG or SVG recommended"
              />

              <div className="pf-grid-2" style={{ marginTop: 12 }}>
                <div className="pf-field">
                  <label htmlFor="cat-order" className="pf-label">
                    {t.dash.formOrder ?? "Order"}
                  </label>
                  <Input
                    id="cat-order"
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setField("order", e.target.value)}
                    disabled={busy}
                    className="pf-input"
                  />
                </div>
                <div
                  className="pf-field"
                  style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 20 }}
                >
                  <input
                    id="cat-active"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                    disabled={busy}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="cat-active" className="pf-label" style={{ marginBottom: 0 }}>
                    {t.dash.formActive ?? "Active"}
                  </label>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="category-form" disabled={busy}>
                {busy ? "Saving…" : editing ? t.dash.save : "Create"}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
