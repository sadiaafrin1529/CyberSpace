"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Layers, Pencil, Trash2 } from "lucide-react";
import {
  useGetSolutionCategoriesQuery,
  useUpdateSolutionCategoryMutation,
  useDeleteSolutionCategoryMutation,
  useReorderSolutionCategoriesMutation,
  type SolutionCategory,
} from "@/redux/fetchers/solution/solutionApi";
import SolutionIcon from "@/components/solutions/SolutionIcon";
import Pagination from "@/components/dashboard/Pagination";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CategoryFormDialog from "./CategoryFormDialog";
import { ReorderButtons, errMsg, move, Toggle } from "./shared";

const LIMIT = 100;

export default function CategoriesManager({
  lang,
  createRequest,
}: {
  lang: string;
  createRequest: number;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useGetSolutionCategoriesQuery({
    search: search.trim(),
    status,
    page,
    limit: LIMIT,
  });
  const [updateCategory] = useUpdateSolutionCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteSolutionCategoryMutation();
  const [reorder, { isLoading: reordering }] = useReorderSolutionCategoriesMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SolutionCategory | null>(null);
  const [toDelete, setToDelete] = useState<SolutionCategory | null>(null);
  const [rowError, setRowError] = useState("");

  const categories = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const filtered = !!search.trim() || !!status;
  // Reordering rewrites the order of the whole list, so it only works on the full, single-page list.
  const canReorder = !filtered && total <= LIMIT && !reordering;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  // The header "New Category" button bumps createRequest.
  const lastRequest = useRef(createRequest);
  useEffect(() => {
    if (createRequest !== lastRequest.current) {
      lastRequest.current = createRequest;
      openCreate();
    }
  }, [createRequest]);

  async function toggle(c: SolutionCategory, key: "isActive" | "showOnHome") {
    setRowError("");
    try {
      await updateCategory({ id: c.id, body: { [key]: !c[key] } }).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Update failed."));
    }
  }

  async function moveRow(index: number, dir: -1 | 1) {
    setRowError("");
    try {
      await reorder(move(categories, index, dir).map((c) => c.id)).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Reorder failed."));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setRowError("");
    try {
      // A category that still has sections is deleted together with everything inside it.
      await deleteCategory({
        id: toDelete.id,
        cascade: (toDelete._count?.sections ?? 0) > 0,
      }).unwrap();
      toast.success("Category deleted", toDelete.name);
    } catch (err) {
      // A 409 explains that the category still has sections.
      const msg = errMsg(err, "Delete failed.");
      setRowError(msg);
      toast.error(msg);
    }
    setToDelete(null);
  }

  const cols = 7;

  return (
    <div>
      <div className="pm-card">
        <div className="pm-toolbar">
          <Input
            className="pf-input pm-search"
            placeholder="Search categories…"
            aria-label="Search categories"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="pf-input"
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
            style={{ maxWidth: 170 }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Disabled</option>
          </select>
          <span className="pm-toolbar__meta" aria-live="polite">
            {isFetching && !isLoading
              ? "Updating…"
              : `${total} ${total === 1 ? "category" : "categories"}`}
          </span>
        </div>

        {rowError && (
          <p className="pf-alert pf-alert--error" role="alert" style={{ margin: "0 20px 12px" }}>
            {rowError}
          </p>
        )}

        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Category</th>
                <th>Colour</th>
                <th>Sections</th>
                <th>Active</th>
                <th>Homepage</th>
                <th className="pm-table__actions-h">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: cols }).map((__, j) => (
                      <td key={j}>
                        <span className="skel skel--sm" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={cols} className="pm-table__msg" style={{ color: "var(--red)" }}>
                    Failed to load categories.
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={cols}>
                    <div className="pm-empty">
                      <span className="pm-empty__icon">
                        <Layers size={26} />
                      </span>
                      <h3>{filtered ? "No categories match your filters" : "No categories yet"}</h3>
                      <p>
                        {filtered
                          ? "Try a different search term or status."
                          : "Create a category, then add sections and bundles to it."}
                      </p>
                      {!filtered && (
                        <Button type="button" size="sm" onClick={openCreate}>
                          Create your first category
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <ReorderButtons
                        index={i}
                        count={categories.length}
                        disabled={!canReorder}
                        onMove={(d) => moveRow(i, d)}
                        label={c.name}
                      />
                    </td>
                    <td>
                      <div className="pm-project">
                        <span className="sol-thumb" style={{ color: c.accentColor }}>
                          <SolutionIcon icon={c.icon} size={20} />
                        </span>
                        <div className="pm-project__text">
                          <strong>{c.name}</strong>
                          <small>/{c.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        title={c.accentColor}
                        aria-label={`Accent colour ${c.accentColor}`}
                        style={{
                          display: "inline-block",
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: c.accentColor,
                          border: "1px solid var(--border)",
                        }}
                      />
                    </td>
                    <td>
                      <span className="pm-badge">{c._count?.sections ?? 0}</span>
                    </td>
                    <td>
                      <Toggle
                        label={`${c.name} active`}
                        checked={c.isActive}
                        onChange={() => toggle(c, "isActive")}
                      />
                    </td>
                    <td>
                      <Toggle
                        label={`${c.name} on homepage`}
                        checked={c.showOnHome}
                        onChange={() => toggle(c, "showOnHome")}
                      />
                    </td>
                    <td>
                      <div className="pm-actions">
                        <a
                          className="pm-icon-btn"
                          href={`/${lang}/solutions/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on website"
                          aria-label={`View ${c.name} on website`}
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          type="button"
                          className="pm-icon-btn"
                          title="Edit"
                          aria-label={`Edit ${c.name}`}
                          onClick={() => {
                            setEditing(c);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="pm-icon-btn pm-icon-btn--danger"
                          title="Delete"
                          aria-label={`Delete ${c.name}`}
                          onClick={() => setToDelete(c)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} limit={LIMIT} total={total} onPage={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete "${toDelete?.name ?? ""}"?`}
        description={
          (toDelete?._count?.sections ?? 0) > 0
            ? `This also permanently deletes its ${toDelete?._count?.sections} section(s) and every bundle, item and feature inside them. Existing inquiries are kept. This cannot be undone. To hide it without deleting, disable the category instead.`
            : "This permanently deletes the category. This cannot be undone."
        }
        confirmText={(toDelete?._count?.sections ?? 0) > 0 ? "Delete everything" : "Delete"}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <CategoryFormDialog open={formOpen} category={editing} onOpenChange={setFormOpen} />
    </div>
  );
}
