"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Pencil, Trash2 } from "lucide-react";
import {
  useGetProjectCategoriesQuery,
  useCreateProjectCategoryMutation,
  useUpdateProjectCategoryMutation,
  useDeleteProjectCategoryMutation,
  PROJECT_LANGS,
  type ProjectCategory,
  type ProjectCategoryInput,
  type ProjectLang,
} from "@/redux/fetchers/project/projectApi";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { Field, SLUG_RE, errMsg, slugify } from "./shared";

const emptyNames = (): Record<ProjectLang, string> => ({ EN: "", AZ: "", RU: "" });
const LANG_NAME: Record<ProjectLang, string> = { EN: "English", AZ: "Azerbaijani", RU: "Russian" };

export default function CategoriesManager({ createRequest }: { createRequest: number }) {
  const { data: categories = [], isLoading, isError } = useGetProjectCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateProjectCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateProjectCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteProjectCategoryMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectCategory | null>(null);
  const [names, setNames] = useState<Record<ProjectLang, string>>(emptyNames());
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [rowError, setRowError] = useState("");
  const [toDelete, setToDelete] = useState<ProjectCategory | null>(null);
  const busy = creating || updating;

  function openCreate() {
    setEditing(null);
    setNames(emptyNames());
    setSlug("");
    setSlugTouched(false);
    setError("");
    setOpen(true);
  }
  function openEdit(c: ProjectCategory) {
    setEditing(c);
    setNames({ ...emptyNames(), ...Object.fromEntries(c.translations.map((t) => [t.lang, t.name])) });
    setSlug(c.slug);
    setSlugTouched(true);
    setError("");
    setOpen(true);
  }

  // The header "New Category" button bumps createRequest.
  const lastRequest = useRef(createRequest);
  useEffect(() => {
    if (createRequest !== lastRequest.current) {
      lastRequest.current = createRequest;
      openCreate();
    }
  }, [createRequest]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const s = slug.trim();
    // English is the fallback language and is mandatory; AZ/RU are saved only when filled in.
    const translations: ProjectCategoryInput["translations"] = [];
    for (const l of PROJECT_LANGS) {
      const v = names[l].trim();
      if (!v && l !== "EN") continue;
      if (v.length < 2) return setError(`${LANG_NAME[l]}: category name is required.`);
      translations.push({ lang: l, name: v });
    }
    if (s && !SLUG_RE.test(s))
      return setError("Slug may contain only lowercase letters, numbers and hyphens.");
    try {
      if (editing) await updateCategory({ id: editing.id, body: { slug: s || undefined, translations } }).unwrap();
      else await createCategory({ slug: s || undefined, translations }).unwrap();
      toast.success(editing ? "Category updated" : "Category created", names.EN.trim());
      setOpen(false);
    } catch (err) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setRowError("");
    try {
      await deleteCategory(toDelete.id).unwrap();
      toast.success("Category deleted", toDelete.name);
    } catch (err) {
      setRowError(errMsg(err, "Delete failed."));
    }
    setToDelete(null);
  }

  return (
    <div>
      <p className="pm-hint">Categories become the filter tabs on the public Projects page.</p>

      {rowError && (
        <p className="pf-alert pf-alert--error" role="alert">
          {rowError}
        </p>
      )}

      {isLoading ? (
        <div className="pm-cats">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pm-card pm-cat">
              <span className="skel skel--md" />
              <span className="skel skel--sm" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="pm-notice" role="alert" style={{ color: "var(--red)" }}>
          Failed to load categories.
        </p>
      ) : categories.length === 0 ? (
        <div className="pm-card">
          <div className="pm-empty">
            <span className="pm-empty__icon">
              <Layers size={26} />
            </span>
            <h3>No categories yet</h3>
            <p>Create a category, then assign your projects to it.</p>
            <Button type="button" size="sm" onClick={openCreate}>
              Create your first category
            </Button>
          </div>
        </div>
      ) : (
        <div className="pm-cats">
          {categories.map((c) => {
            const count = c._count?.projects ?? 0;
            return (
              <div key={c.id} className="pm-card pm-cat">
                <div className="pm-cat__top">
                  <span className="pm-stat__icon pm-stat__icon--violet">
                    <Layers size={17} />
                  </span>
                  <div className="pm-actions">
                    <button
                      type="button"
                      className="pm-icon-btn"
                      title="Edit"
                      aria-label={`Edit ${c.name}`}
                      onClick={() => openEdit(c)}
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
                </div>
                <h3 className="pm-cat__name">{c.name}</h3>
                <small className="pm-cat__slug">
                  /{c.slug} · {c.translations.map((t) => t.lang).join(" · ")}
                </small>
                <span className="pm-badge pm-cat__count">
                  {count} {count === 1 ? "project" : "projects"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete "${toDelete?.name ?? ""}"?`}
        description={
          (toDelete?._count?.projects ?? 0) > 0
            ? "This category still has projects and cannot be deleted until they are moved to another category."
            : "This permanently deletes the category. This cannot be undone."
        }
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent size="sm" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <DialogForm id="project-category-form" onSubmit={submit} noValidate>
            <DialogBody>
              {error && (
                <p className="pf-alert pf-alert--error" role="alert">
                  {error}
                </p>
              )}
              {PROJECT_LANGS.map((l, i) => (
                <Field
                  key={l}
                  label={`Category Name (${l})${l === "EN" ? " *" : ""}`}
                  id={`pc-name-${l}`}
                  mt={i > 0}
                >
                  <Input
                    id={`pc-name-${l}`}
                    className="pf-input"
                    value={names[l]}
                    maxLength={60}
                    disabled={busy}
                    autoFocus={l === "EN"}
                    placeholder={LANG_NAME[l]}
                    onChange={(e) => {
                      setNames((n) => ({ ...n, [l]: e.target.value }));
                      if (l === "EN" && !slugTouched) setSlug(slugify(e.target.value));
                    }}
                  />
                </Field>
              ))}
              <Field label="Slug" id="pc-slug" mt>
                <Input
                  id="pc-slug"
                  className="pf-input"
                  value={slug}
                  maxLength={80}
                  disabled={busy}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                />
                <span className="pf-hint">Generated from the name. Must be unique.</span>
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="project-category-form" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
