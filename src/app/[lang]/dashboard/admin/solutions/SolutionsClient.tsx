"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import {
  useGetSolutionsQuery,
  useCreateSolutionMutation,
  useUpdateSolutionMutation,
  useSetSolutionStatusMutation,
  useSetSolutionOrderMutation,
  useDeleteSolutionMutation,
  SOLUTION_COLORS,
  SOLUTION_ICON_KEYS,
  SOLUTION_LANGS,
  type Solution,
  type SolutionColor,
  type SolutionIconKey,
  type SolutionInput,
  type SolutionLang,
  type SolutionTranslation,
} from "@/redux/fetchers/solution/solutionApi";
import ImageUpload from "@/components/dashboard/ImageUpload";
import Pagination from "@/components/dashboard/Pagination";
import SkeletonTableRows from "@/components/dashboard/SkeletonTableRows";
import SolutionIcon from "@/components/solutions/SolutionIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface TrForm {
  title: string;
  shortDescription: string;
  features: string; // one per line
  description: string;
  seoTitle: string;
  seoDescription: string;
}

interface Form {
  slug: string;
  color: SolutionColor;
  iconKey: SolutionIconKey | "none";
  iconUrl: string;
  isActive: boolean;
  order: string;
  tr: Record<SolutionLang, TrForm>;
}

const LANG_NAME: Record<SolutionLang, string> = { EN: "English", AZ: "Azerbaijani", RU: "Russian" };

const emptyTr = (): TrForm => ({
  title: "",
  shortDescription: "",
  features: "",
  description: "",
  seoTitle: "",
  seoDescription: "",
});

const emptyForm = (): Form => ({
  slug: "",
  color: "blue",
  iconKey: "none",
  iconUrl: "",
  isActive: true,
  order: "0",
  tr: { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() },
});

function solutionToForm(s: Solution): Form {
  const tr = { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() };
  for (const t of s.translations) {
    tr[t.lang] = {
      title: t.title,
      shortDescription: t.shortDescription,
      features: t.features.join("\n"),
      description: t.description ?? "",
      seoTitle: t.seoTitle ?? "",
      seoDescription: t.seoDescription ?? "",
    };
  }
  return {
    slug: s.slug,
    color: s.color,
    iconKey: s.iconKey ?? "none",
    iconUrl: s.iconUrl ?? "",
    isActive: s.isActive,
    order: String(s.order),
    tr,
  };
}

/** URL-safe slug from a title; Azerbaijani ə / ı do not decompose, so they are mapped by hand. */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errMsg = (e: unknown, fallback: string) => {
  const d = (e as { data?: { message?: string; error?: { message: string; path: string }[] } })
    ?.data;
  const first = d?.error?.[0];
  return first?.path ? `${first.path}: ${first.message}` : (d?.message ?? fallback);
};

/** Thumbnail shown in the list: the uploaded icon image, else the chosen icon preset. */
function Thumb({ s }: { s: Solution }) {
  const src = s.iconUrl;
  const box: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 8,
    flex: "none",
    background: "var(--blue-soft)",
    color: "var(--blue)",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
  };
  return (
    <div style={box}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ display: "grid", transform: "scale(0.7)" }}>
          <SolutionIcon solution={s} />
        </span>
      )}
    </div>
  );
}

/** Inline display-order editor: saves on blur / Enter when the number changed. */
function OrderCell({ s, onSave }: { s: Solution; onSave: (order: number) => void }) {
  const [v, setV] = useState(String(s.order));
  const commit = () => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 100000) return setV(String(s.order));
    if (n !== s.order) onSave(n);
  };
  return (
    <input
      type="number"
      min={0}
      className="pf-input"
      style={{ width: 76, padding: "6px 8px" }}
      value={v}
      aria-label={`Display order of ${s.title}`}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
    />
  );
}

export default function SolutionsClient({ lang }: { lang: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetSolutionsQuery({ search, status, page, limit });
  const [createSolution, { isLoading: creating }] = useCreateSolutionMutation();
  const [updateSolution, { isLoading: updating }] = useUpdateSolutionMutation();
  const [setSolutionStatus, { isLoading: toggling }] = useSetSolutionStatusMutation();
  const [setSolutionOrder] = useSetSolutionOrderMutation();
  const [deleteSolution, { isLoading: deleting }] = useDeleteSolutionMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Solution | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [activeLang, setActiveLang] = useState<SolutionLang>("EN");
  const [error, setError] = useState("");
  const [rowError, setRowError] = useState("");
  const [toDelete, setToDelete] = useState<Solution | null>(null);

  const solutions = data?.data ?? [];
  const busy = creating || updating;
  const set = <K extends Exclude<keyof Form, "tr">>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setTr = <K extends keyof TrForm>(l: SolutionLang, k: K, v: TrForm[K]) =>
    setForm((f) => {
      const next = { ...f, tr: { ...f.tr, [l]: { ...f.tr[l], [k]: v } } };
      // Slug follows the English title until the admin edits the slug by hand.
      if (l === "EN" && k === "title" && !slugTouched) next.slug = slugify(String(v));
      return next;
    });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSlugTouched(false);
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }
  function openEdit(s: Solution) {
    setEditing(s);
    setForm(solutionToForm(s));
    setSlugTouched(true);
    setError("");
    setActiveLang("EN");
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const slug = form.slug.trim();
    if (slug && !SLUG_RE.test(slug))
      return setError("Slug may contain only lowercase letters, numbers and hyphens.");
    const order = Number(form.order);
    if (!Number.isInteger(order) || order < 0)
      return setError("Display order must be 0 or greater.");

    // English is the fallback language and is mandatory; AZ/RU are validated only when started.
    const translations: SolutionTranslation[] = [];
    for (const l of SOLUTION_LANGS) {
      const f = form.tr[l];
      const started = Object.values(f).some((v) => v.trim());
      if (l !== "EN" && !started) continue;
      const fail = (msg: string) => {
        setActiveLang(l);
        setError(`${LANG_NAME[l]}: ${msg}`);
      };
      if (f.title.trim().length < 2) return fail("title is required.");
      if (f.shortDescription.trim().length < 2) return fail("short description is required.");
      translations.push({
        lang: l,
        title: f.title.trim(),
        shortDescription: f.shortDescription.trim(),
        description: f.description.trim() || null,
        features: f.features
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
        seoTitle: f.seoTitle.trim() || null,
        seoDescription: f.seoDescription.trim() || null,
      });
    }

    const body: SolutionInput = {
      ...(slug && { slug }),
      color: form.color,
      iconKey: form.iconKey === "none" ? null : form.iconKey,
      iconUrl: form.iconUrl.trim() || null,
      isActive: form.isActive,
      order,
      translations,
    };
    try {
      if (editing) await updateSolution({ id: editing.id, body }).unwrap();
      else await createSolution(body).unwrap();
      setOpen(false);
    } catch (err) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  async function toggle(s: Solution) {
    setRowError("");
    try {
      await setSolutionStatus({ id: s.id, isActive: !s.isActive }).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Could not change status."));
    }
  }

  async function saveOrder(s: Solution, order: number) {
    setRowError("");
    try {
      await setSolutionOrder({ id: s.id, order }).unwrap();
    } catch (err) {
      setRowError(errMsg(err, "Could not change display order."));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteSolution(toDelete.id).unwrap();
      if (solutions.length === 1 && page > 1) setPage(page - 1);
    } catch (err) {
      setRowError(errMsg(err, "Delete failed."));
    }
    setToDelete(null);
  }

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Solutions</h1>
          <p className="dash-page-sub">Manage everything shown on the public Solutions page.</p>
        </div>
        <Button type="button" size="sm" onClick={openCreate} style={{ flexShrink: 0 }}>
          + New Solution
        </Button>
      </div>

      <div className="dash-toolbar">
        <input
          className="dash-search"
          placeholder="Search title or slug…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div className="dash-filters">
          {(["", "active", "inactive"] as const).map((s) => (
            <button
              key={s || "all"}
              type="button"
              className={`dash-filter-btn${status === s ? " is-active" : ""}`}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      {rowError && (
        <p className="pf-alert pf-alert--error" role="alert">
          {rowError}
        </p>
      )}

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Solution</th>
              <th>Slug</th>
              <th>Order</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonTableRows columns={["text", "text", "sm", "badge", "text", "badge"]} />
            ) : isError ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--red)" }}>
                  Failed to load solutions.
                </td>
              </tr>
            ) : solutions.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="dash-empty">
                    <Lightbulb size={34} style={{ opacity: 0.3 }} />
                    <p>
                      {search || status ? "No solutions match your filters." : "No solutions yet."}
                    </p>
                    {!search && !status && (
                      <Button type="button" size="sm" variant="outline" onClick={openCreate}>
                        Create your first solution
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              solutions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Thumb s={s} />
                      <strong>{s.title}</strong>
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: ".85rem" }}>{s.slug}</td>
                  <td>
                    <OrderCell key={`${s.id}-${s.order}`} s={s} onSave={(o) => saveOrder(s, o)} />
                  </td>
                  <td>
                    <span
                      className={`status-badge ${s.isActive ? "status-badge--published" : "status-badge--draft"}`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="dash-actions">
                      {s.isActive ? (
                        <a
                          className="btn btn--ghost btn--sm"
                          href={`/${lang}/solutions/${s.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled
                          title="Inactive solutions are not visible on the website"
                        >
                          View
                        </Button>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(s)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={toggling}
                        onClick={() => toggle(s)}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setToDelete(s)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} limit={limit} total={data?.meta.total ?? 0} onPage={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete "${toDelete?.title ?? ""}"?`}
        description="This permanently deletes the solution and all its translations. This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent size="xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Solution" : "New Solution"}</DialogTitle>
            <DialogDescription>Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <DialogForm id="solution-form" onSubmit={submit} noValidate>
            <DialogBody>
              {error && (
                <p className="pf-alert pf-alert--error" role="alert">
                  {error}
                </p>
              )}

              <div className="pf-grid-2">
                <Field label="Slug" id="s-slug">
                  <Input
                    id="s-slug"
                    className="pf-input"
                    value={form.slug}
                    maxLength={120}
                    disabled={busy}
                    placeholder="generated from the English title"
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value);
                    }}
                  />
                  <span className="pf-hint">
                    Used in the URL: /solutions/{form.slug || "…"}.
                    {editing ? " Changing it breaks old links." : ""}
                  </span>
                </Field>
                <Field label="Display Order" id="s-order">
                  <Input
                    id="s-order"
                    type="number"
                    min={0}
                    className="pf-input"
                    value={form.order}
                    disabled={busy}
                    onChange={(e) => set("order", e.target.value)}
                  />
                  <span className="pf-hint">Lower numbers appear first.</span>
                </Field>
                <Field label="Status" id="s-status">
                  <Select
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={(v) => set("isActive", v === "active")}
                    disabled={busy}
                  >
                    <SelectTrigger id="s-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Card Colour" id="s-color">
                  <Select
                    value={form.color}
                    onValueChange={(v) => set("color", v as SolutionColor)}
                    disabled={busy}
                  >
                    <SelectTrigger id="s-color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOLUTION_COLORS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Icon (optional)" id="s-icon">
                  <Select
                    value={form.iconKey}
                    onValueChange={(v) => set("iconKey", v as Form["iconKey"])}
                    disabled={busy}
                  >
                    <SelectTrigger id="s-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Default</SelectItem>
                      {SOLUTION_ICON_KEYS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="pf-hint">
                    An uploaded icon image below replaces this preset.
                  </span>
                </Field>
              </div>

              <div style={{ marginTop: 18 }}>
                <ImageUpload
                  value={form.iconUrl}
                  onChange={(u) => set("iconUrl", u)}
                  disabled={busy}
                  label="Icon Image (optional)"
                  hint="Small square image shown on the card. Replaces the icon preset."
                />
                <span className="pf-hint">
                  Find free icons at{" "}
                  <a
                    href="https://www.flaticon.com/free-icons"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--blue)", textDecoration: "underline" }}
                  >
                    https://www.flaticon.com/free-icons
                  </a>{" "}
                  and download them as PNG, then upload the PNG here.
                </span>
              </div>

              <div className="pf-lang-tabs" style={{ marginTop: 18 }} role="tablist">
                {SOLUTION_LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="tab"
                    aria-selected={activeLang === l}
                    className={`pf-lang-tab${activeLang === l ? " is-active" : ""}`}
                    onClick={() => setActiveLang(l)}
                  >
                    {LANG_NAME[l]}
                    {l === "EN" ? " *" : ""}
                    {!!form.tr[l].title.trim() && (
                      <span className="job-tab-dot" aria-label="has content" />
                    )}
                  </button>
                ))}
              </div>

              {SOLUTION_LANGS.map((l) => {
                const f = form.tr[l];
                return (
                  <div key={l} role="tabpanel" hidden={activeLang !== l} style={{ marginTop: 14 }}>
                    <Field
                      label={`Solution Title (${l}) ${l === "EN" ? "*" : ""}`}
                      id={`s-title-${l}`}
                    >
                      <Input
                        id={`s-title-${l}`}
                        className="pf-input"
                        value={f.title}
                        maxLength={200}
                        disabled={busy}
                        onChange={(e) => setTr(l, "title", e.target.value)}
                      />
                    </Field>
                    <Field
                      label={`Short Description (${l}) ${l === "EN" ? "*" : ""}`}
                      id={`s-short-${l}`}
                      mt
                    >
                      <textarea
                        id={`s-short-${l}`}
                        rows={2}
                        maxLength={300}
                        className="pf-textarea"
                        value={f.shortDescription}
                        disabled={busy}
                        onChange={(e) => setTr(l, "shortDescription", e.target.value)}
                        placeholder="Shown on the Solutions card."
                      />
                    </Field>
                    <Field label={`Key Points (${l})`} id={`s-feat-${l}`} mt>
                      <textarea
                        id={`s-feat-${l}`}
                        rows={4}
                        className="pf-textarea"
                        value={f.features}
                        disabled={busy}
                        onChange={(e) => setTr(l, "features", e.target.value)}
                        placeholder={"One per line, e.g.\nCorporate networks\nCybersecurity"}
                      />
                      <span className="pf-hint">
                        One per line (max 12). Shown as the bullet list on the card.
                      </span>
                    </Field>
                    <Field label={`Full Description (${l})`} id={`s-desc-${l}`} mt>
                      <textarea
                        id={`s-desc-${l}`}
                        rows={7}
                        maxLength={20000}
                        className="pf-textarea"
                        value={f.description}
                        disabled={busy}
                        onChange={(e) => setTr(l, "description", e.target.value)}
                        placeholder="Shown on the detail page. Leave a blank line between paragraphs."
                      />
                    </Field>
                    <div className="pf-grid-2" style={{ marginTop: 16 }}>
                      <Field label={`SEO Title (${l})`} id={`s-seot-${l}`}>
                        <Input
                          id={`s-seot-${l}`}
                          className="pf-input"
                          value={f.seoTitle}
                          maxLength={70}
                          disabled={busy}
                          onChange={(e) => setTr(l, "seoTitle", e.target.value)}
                        />
                        <span className="pf-hint">Leave empty to use the title.</span>
                      </Field>
                      <Field label={`SEO Description (${l})`} id={`s-seod-${l}`}>
                        <textarea
                          id={`s-seod-${l}`}
                          rows={2}
                          maxLength={200}
                          className="pf-textarea"
                          value={f.seoDescription}
                          disabled={busy}
                          onChange={(e) => setTr(l, "seoDescription", e.target.value)}
                        />
                        <span className="pf-hint">Leave empty to use the short description.</span>
                      </Field>
                    </div>
                  </div>
                );
              })}
              <p className="pf-hint" style={{ marginTop: 12 }}>
                English is required and is shown when a visitor&apos;s language has no translation.
                Saving only updates the languages that have a title; other languages are never
                overwritten.
              </p>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" form="solution-form" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save Changes" : "Create Solution"}
              </Button>
            </DialogFooter>
          </DialogForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  id,
  children,
  mt,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  mt?: boolean;
}) {
  return (
    <div className="pf-field" style={mt ? { marginTop: 16 } : undefined}>
      <label htmlFor={id} className="pf-label">
        {label}
      </label>
      {children}
    </div>
  );
}
