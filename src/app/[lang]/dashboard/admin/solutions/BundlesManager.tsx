"use client";

import { useEffect, useRef, useState } from "react";
import { Package, Pencil, Trash2 } from "lucide-react";
import {
  solutionApi,
  useGetSolutionBundlesQuery,
  useGetSolutionCategoriesQuery,
  useGetSolutionSectionsQuery,
  useUpdateSolutionBundleMutation,
  useDeleteSolutionBundleMutation,
  useReorderSolutionBundlesMutation,
  type SolutionBundle,
} from "@/redux/fetchers/solution/solutionApi";
import SolutionIcon from "@/components/solutions/SolutionIcon";
import Pagination from "@/components/dashboard/Pagination";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import BundleFormDialog, { BILLING_LABEL } from "./BundleFormDialog";
import { ReorderButtons, errMsg, move, pickName, Toggle } from "./shared";

const LIMIT = 100;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const priceLabel = (b: SolutionBundle) =>
  b.price == null
    ? "On request"
    : `${Number(b.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${b.currency}${
        b.billingPeriod === "ONE_TIME" ? "" : ` / ${BILLING_LABEL[b.billingPeriod].toLowerCase()}`
      }`;

export default function BundlesManager({ createRequest }: { createRequest: number }) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [page, setPage] = useState(1);

  const { data: catData } = useGetSolutionCategoriesQuery({ limit: 100 });
  const categories = catData?.data ?? [];
  // The section filter only offers the sections of the selected category.
  const { data: sectionData } = useGetSolutionSectionsQuery({
    categoryId: categoryId ? Number(categoryId) : undefined,
    limit: 100,
  });
  const sections = sectionData?.data ?? [];
  const { data, isLoading, isFetching, isError } = useGetSolutionBundlesQuery({
    search: search.trim(),
    categoryId: categoryId ? Number(categoryId) : undefined,
    sectionId: sectionId ? Number(sectionId) : undefined,
    status,
    page,
    limit: LIMIT,
  });
  const [loadBundle] = solutionApi.useLazyGetSolutionBundleQuery();
  const [updateBundle] = useUpdateSolutionBundleMutation();
  const [deleteBundle, { isLoading: deleting }] = useDeleteSolutionBundleMutation();
  const [reorder, { isLoading: reordering }] = useReorderSolutionBundlesMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SolutionBundle | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<SolutionBundle | null>(null);
  const [rowError, setRowError] = useState("");

  const bundles = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const filtered = !!search.trim() || !!status || !!categoryId || !!sectionId;
  // Order is per section: reordering needs exactly one section, unfiltered and on one page.
  const canReorder = !!sectionId && !search.trim() && !status && total <= LIMIT && !reordering;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  // The header "New Bundle" button bumps createRequest.
  const lastRequest = useRef(createRequest);
  useEffect(() => {
    if (createRequest !== lastRequest.current) {
      lastRequest.current = createRequest;
      openCreate();
    }
  }, [createRequest]);

  async function openEdit(b: SolutionBundle) {
    setRowError("");
    setLoadingId(b.id);
    try {
      // The list has no items/features, so fetch the full bundle for the form.
      setEditing(await loadBundle(b.id, false).unwrap());
      setFormOpen(true);
    } catch (err) {
      setRowError(errMsg(err, "Could not load this bundle."));
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleActive(b: SolutionBundle) {
    setRowError("");
    try {
      await updateBundle({ id: b.id, body: { isActive: !b.isActive } }).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Update failed."));
    }
  }

  async function moveRow(index: number, dir: -1 | 1) {
    setRowError("");
    try {
      await reorder(move(bundles, index, dir).map((b) => b.id)).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Reorder failed."));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setRowError("");
    try {
      await deleteBundle(toDelete.id).unwrap();
      toast.success("Bundle deleted", toDelete.title);
    } catch (err) {
      setRowError(errMsg(err, "Delete failed."));
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
            placeholder="Search bundles…"
            aria-label="Search bundles"
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
              setSectionId("");
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
            aria-label="Filter by section"
            value={sectionId}
            onChange={(e) => {
              setSectionId(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 240 }}
          >
            <option value="">All sections</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.title}
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
              : `${total} ${total === 1 ? "bundle" : "bundles"}`}
          </span>
        </div>

        {!canReorder && bundles.length > 1 && !isLoading && (
          <p className="pm-hint" style={{ margin: "0 20px 12px" }}>
            Select a single section (no other filters) to reorder its bundles.
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
                <th>Bundle</th>
                <th>Section</th>
                <th>Price</th>
                <th>Items</th>
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
                    Failed to load bundles.
                  </td>
                </tr>
              ) : bundles.length === 0 ? (
                <tr>
                  <td colSpan={cols}>
                    <div className="pm-empty">
                      <span className="pm-empty__icon">
                        <Package size={26} />
                      </span>
                      <h3>{filtered ? "No bundles match your filters" : "No bundles yet"}</h3>
                      <p>
                        {filtered
                          ? "Try a different search term, category, section or status."
                          : categories.length === 0
                            ? "Create a category and a section first, then add bundles to it."
                            : "Create a bundle and it will appear inside its section on the category page."}
                      </p>
                      {!filtered && categories.length > 0 && (
                        <Button type="button" size="sm" onClick={openCreate}>
                          Create your first bundle
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                bundles.map((b, i) => (
                  <tr key={b.id}>
                    <td>
                      <ReorderButtons
                        index={i}
                        count={bundles.length}
                        disabled={!canReorder}
                        onMove={(d) => moveRow(i, d)}
                        label={b.title}
                      />
                    </td>
                    <td>
                      <div className="pm-project">
                        <span className="sol-thumb">
                          <SolutionIcon icon={b.icon} size={20} />
                        </span>
                        <div className="pm-project__text">
                          <strong>{b.title}</strong>
                          <small>
                            /{b.slug}
                            {b.translations.find((t) => t.lang === "EN")?.badge
                              ? ` · ${b.translations.find((t) => t.lang === "EN")?.badge}`
                              : ""}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="sol-cell-section">
                      <span className="pm-badge">
                        {pickName(b.section?.category.translations, "name") || "—"} /{" "}
                        {pickName(b.section?.translations, "title") || "—"}
                      </span>
                    </td>
                    <td className="pm-muted">{priceLabel(b)}</td>
                    <td className="pm-muted">
                      {plural(b._count?.items ?? 0, "product")} ·{" "}
                      {plural(b._count?.features ?? 0, "feature")}
                    </td>
                    <td>
                      <Toggle
                        label={`${b.title} active`}
                        checked={b.isActive}
                        onChange={() => toggleActive(b)}
                      />
                    </td>
                    <td>
                      <div className="pm-actions">
                        <button
                          type="button"
                          className="pm-icon-btn"
                          title="Edit"
                          aria-label={`Edit ${b.title}`}
                          disabled={loadingId !== null}
                          onClick={() => openEdit(b)}
                        >
                          {loadingId === b.id ? (
                            <span className="img-upload__spinner" aria-hidden="true" />
                          ) : (
                            <Pencil size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="pm-icon-btn pm-icon-btn--danger"
                          title="Delete"
                          aria-label={`Delete ${b.title}`}
                          onClick={() => setToDelete(b)}
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
        description="This permanently deletes the bundle with its items and features. Existing inquiries are kept. This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <BundleFormDialog
        open={formOpen}
        bundle={editing}
        defaultSectionId={sectionId ? Number(sectionId) : undefined}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
