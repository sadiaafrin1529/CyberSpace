"use client";

import { useEffect, useRef, useState } from "react";
import { ListTree, Pencil, Trash2 } from "lucide-react";
import {
  useGetSolutionCategoriesQuery,
  useGetSolutionSectionsQuery,
  useUpdateSolutionSectionMutation,
  useDeleteSolutionSectionMutation,
  useReorderSolutionSectionsMutation,
  type SolutionSection,
} from "@/redux/fetchers/solution/solutionApi";
import SolutionIcon from "@/components/solutions/SolutionIcon";
import Pagination from "@/components/dashboard/Pagination";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SectionFormDialog from "./SectionFormDialog";
import { ReorderButtons, errMsg, move, pickName, Toggle } from "./shared";

const LIMIT = 100;

export default function SectionsManager({ createRequest }: { createRequest: number }) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [page, setPage] = useState(1);

  const { data: catData } = useGetSolutionCategoriesQuery({ limit: 100 });
  const categories = catData?.data ?? [];
  const { data, isLoading, isFetching, isError } = useGetSolutionSectionsQuery({
    search: search.trim(),
    categoryId: categoryId ? Number(categoryId) : undefined,
    status,
    page,
    limit: LIMIT,
  });
  const [updateSection] = useUpdateSolutionSectionMutation();
  const [deleteSection, { isLoading: deleting }] = useDeleteSolutionSectionMutation();
  const [reorder, { isLoading: reordering }] = useReorderSolutionSectionsMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SolutionSection | null>(null);
  const [toDelete, setToDelete] = useState<SolutionSection | null>(null);
  const [rowError, setRowError] = useState("");

  const sections = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const filtered = !!search.trim() || !!status || !!categoryId;
  // Order is per category: reordering needs exactly one category, unfiltered and on one page.
  const canReorder = !!categoryId && !search.trim() && !status && total <= LIMIT && !reordering;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  // The header "New Section" button bumps createRequest.
  const lastRequest = useRef(createRequest);
  useEffect(() => {
    if (createRequest !== lastRequest.current) {
      lastRequest.current = createRequest;
      openCreate();
    }
  }, [createRequest]);

  async function toggleActive(s: SolutionSection) {
    setRowError("");
    try {
      await updateSection({ id: s.id, body: { isActive: !s.isActive } }).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Update failed."));
    }
  }

  async function moveRow(index: number, dir: -1 | 1) {
    setRowError("");
    try {
      await reorder(move(sections, index, dir).map((s) => s.id)).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Reorder failed."));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setRowError("");
    try {
      // A section that still has bundles is deleted together with them.
      await deleteSection({
        id: toDelete.id,
        cascade: (toDelete._count?.bundles ?? 0) > 0,
      }).unwrap();
      toast.success("Section deleted", toDelete.title);
    } catch (err) {
      // A 409 explains that the section still has bundles.
      const msg = errMsg(err, "Delete failed.");
      setRowError(msg);
      toast.error(msg);
    }
    setToDelete(null);
  }

  const cols = 6;

  return (
    <div>
      <div className="pm-card">
        <div className="pm-toolbar">
          <Input
            className="pf-input pm-search"
            placeholder="Search sections…"
            aria-label="Search sections"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="pf-input"
            aria-label="Filter by category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 220 }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
              : `${total} ${total === 1 ? "section" : "sections"}`}
          </span>
        </div>

        {!canReorder && sections.length > 1 && !isLoading && (
          <p className="pm-hint" style={{ margin: "0 20px 12px" }}>
            Select a single category (no other filters) to reorder its sections.
          </p>
        )}

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
                <th>Section</th>
                <th>Category</th>
                <th>Bundles</th>
                <th>Active</th>
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
                    Failed to load sections.
                  </td>
                </tr>
              ) : sections.length === 0 ? (
                <tr>
                  <td colSpan={cols}>
                    <div className="pm-empty">
                      <span className="pm-empty__icon">
                        <ListTree size={26} />
                      </span>
                      <h3>{filtered ? "No sections match your filters" : "No sections yet"}</h3>
                      <p>
                        {filtered
                          ? "Try a different search term, category or status."
                          : categories.length === 0
                            ? "Create a solution category first, then add sections to it."
                            : "Create a section, then add bundles to it."}
                      </p>
                      {!filtered && categories.length > 0 && (
                        <Button type="button" size="sm" onClick={openCreate}>
                          Create your first section
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sections.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <ReorderButtons
                        index={i}
                        count={sections.length}
                        disabled={!canReorder}
                        onMove={(d) => moveRow(i, d)}
                        label={s.title}
                      />
                    </td>
                    <td>
                      <div className="pm-project">
                        <span className="sol-thumb">
                          <SolutionIcon icon={s.icon} size={20} />
                        </span>
                        <div className="pm-project__text">
                          <strong>{s.title}</strong>
                          <small>{pickName(s.translations, "description")}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pm-badge">
                        {pickName(s.category?.translations, "name") || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="pm-badge">{s._count?.bundles ?? 0}</span>
                    </td>
                    <td>
                      <Toggle
                        label={`${s.title} active`}
                        checked={s.isActive}
                        onChange={() => toggleActive(s)}
                      />
                    </td>
                    <td>
                      <div className="pm-actions">
                        <button
                          type="button"
                          className="pm-icon-btn"
                          title="Edit"
                          aria-label={`Edit ${s.title}`}
                          onClick={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="pm-icon-btn pm-icon-btn--danger"
                          title="Delete"
                          aria-label={`Delete ${s.title}`}
                          onClick={() => setToDelete(s)}
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
        title={`Delete "${toDelete?.title ?? ""}"?`}
        description={
          (toDelete?._count?.bundles ?? 0) > 0
            ? `This also permanently deletes its ${toDelete?._count?.bundles} bundle(s) with all their items and features. Existing inquiries are kept. This cannot be undone. To hide it without deleting, disable the section instead.`
            : "This permanently deletes the section. This cannot be undone."
        }
        confirmText={(toDelete?._count?.bundles ?? 0) > 0 ? "Delete everything" : "Delete"}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <SectionFormDialog
        open={formOpen}
        section={editing}
        defaultCategoryId={categoryId ? Number(categoryId) : undefined}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
