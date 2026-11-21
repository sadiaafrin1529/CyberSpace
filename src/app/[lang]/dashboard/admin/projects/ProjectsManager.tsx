"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FolderKanban, Pencil, Search, Trash2 } from "lucide-react";
import {
  useGetProjectsQuery,
  useGetProjectCategoriesQuery,
  useDeleteProjectMutation,
  projectApi,
  type Project,
  type ProjectSummary,
} from "@/redux/fetchers/project/projectApi";
import { useAppDispatch } from "@/redux/store";
import Pagination from "@/components/dashboard/Pagination";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import ProjectFormDialog from "./ProjectFormDialog";
import { errMsg } from "./shared";

const ALL = "__all__";
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function ProjectsManager({
  lang,
  createRequest,
  onManageCategories,
}: {
  lang: string;
  createRequest: number;
  onManageCategories: () => void;
}) {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching, isError } = useGetProjectsQuery({
    search,
    category,
    page,
    limit,
  });
  const { data: categories = [] } = useGetProjectCategoriesQuery();
  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState("");
  const [toDelete, setToDelete] = useState<ProjectSummary | null>(null);

  const projects = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const filtered = !!search || !!category;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  // The header "New Project" button bumps createRequest.
  const lastRequest = useRef(createRequest);
  useEffect(() => {
    if (createRequest !== lastRequest.current) {
      lastRequest.current = createRequest;
      openCreate();
    }
  }, [createRequest]);

  /** The list payload has no gallery or long description, so the full project is fetched first. */
  async function openEdit(p: ProjectSummary) {
    setRowError("");
    setLoadingId(p.id);
    try {
      const full = await dispatch(
        projectApi.endpoints.getProject.initiate(p.id, { forceRefetch: true }),
      ).unwrap();
      setEditing(full);
      setFormOpen(true);
    } catch (err) {
      setRowError(errMsg(err, "Could not load the project."));
    } finally {
      setLoadingId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setRowError("");
    try {
      await deleteProject(toDelete.id).unwrap();
      toast.success("Project deleted", toDelete.title);
      if (projects.length === 1 && page > 1) setPage(page - 1);
    } catch (err) {
      setRowError(errMsg(err, "Delete failed."));
    }
    setToDelete(null);
  }

  return (
    <div>
      {categories.length === 0 && (
        <p className="pm-notice" role="status">
          Create at least one category before adding projects.{" "}
          <Button type="button" size="sm" variant="outline" onClick={onManageCategories}>
            Manage categories
          </Button>
        </p>
      )}

      <div className="pm-card pm-listing">
        <div className="pm-toolbar">
          <label className="pm-search">
            <Search size={16} aria-hidden="true" />
            <input
              placeholder="Search by title or category…"
              value={search}
              aria-label="Search projects"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className="pm-toolbar__filter">
            <Select
              value={category || ALL}
              onValueChange={(v) => {
                setCategory(v === ALL ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="pm-toolbar__meta" aria-live="polite">
            {isFetching && !isLoading ? "Updating…" : `${total} ${total === 1 ? "project" : "projects"}`}
          </span>
        </div>

        {rowError && (
          <p className="pf-alert pf-alert--error" role="alert" style={{ margin: "0 20px 12px" }}>
            {rowError}
          </p>
        )}

        <table className="pm-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Category</th>
              <th>Created</th>
              <th className="pm-table__actions-h">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="pm-project">
                      <span className="skel pm-thumb" />
                      <span className="skel skel--md" />
                    </div>
                  </td>
                  <td>
                    <span className="skel skel--badge" />
                  </td>
                  <td>
                    <span className="skel skel--sm" />
                  </td>
                  <td>
                    <span className="skel skel--badge" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={4} className="pm-table__msg" style={{ color: "var(--red)" }}>
                  Failed to load projects.
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="pm-empty">
                    <span className="pm-empty__icon">
                      <FolderKanban size={26} />
                    </span>
                    <h3>{filtered ? "No projects match your filters" : "No projects yet"}</h3>
                    <p>
                      {filtered
                        ? "Try a different search term or category."
                        : "Create your first project and it will appear on the public Projects page."}
                    </p>
                    {!filtered && categories.length > 0 && (
                      <Button type="button" size="sm" onClick={openCreate}>
                        Create your first project
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="pm-project">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="pm-thumb" src={p.coverImage} alt="" loading="lazy" />
                      <div className="pm-project__text">
                        <strong>{p.title}</strong>
                        <small>/{p.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="pm-badge">{p.category.name}</span>
                  </td>
                  <td className="pm-muted">{fmtDate(p.createdAt)}</td>
                  <td>
                    <div className="pm-actions">
                      <a
                        className="pm-icon-btn"
                        href={`/${lang}/projects/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on website"
                        aria-label={`View ${p.title} on website`}
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        type="button"
                        className="pm-icon-btn"
                        title="Edit"
                        aria-label={`Edit ${p.title}`}
                        disabled={loadingId !== null}
                        onClick={() => openEdit(p)}
                      >
                        {loadingId === p.id ? (
                          <span className="img-upload__spinner" aria-hidden="true" />
                        ) : (
                          <Pencil size={16} />
                        )}
                      </button>
                      <button
                        type="button"
                        className="pm-icon-btn pm-icon-btn--danger"
                        title="Delete"
                        aria-label={`Delete ${p.title}`}
                        onClick={() => setToDelete(p)}
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
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete "${toDelete?.title ?? ""}"?`}
        description="This permanently deletes the project and its gallery list. This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <ProjectFormDialog open={formOpen} project={editing} onOpenChange={setFormOpen} />
    </div>
  );
}
