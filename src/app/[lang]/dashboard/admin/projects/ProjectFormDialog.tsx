"use client";

import { useEffect, useState } from "react";
import {
  useGetProjectCategoriesQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  PROJECT_LANGS,
  type Project,
  type ProjectInput,
  type ProjectLang,
} from "@/redux/fetchers/project/projectApi";
import ImageUpload from "@/components/dashboard/ImageUpload";
import GalleryUpload from "@/components/dashboard/GalleryUpload";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Field, errMsg } from "./shared";

interface TrForm {
  title: string;
  shortDescription: string;
  description: string;
}

interface Form {
  categoryId: string;
  coverImage: string;
  images: string[];
  tr: Record<ProjectLang, TrForm>;
}

const LANG_NAME: Record<ProjectLang, string> = { EN: "English", AZ: "Azerbaijani", RU: "Russian" };

const emptyTr = (): TrForm => ({ title: "", shortDescription: "", description: "" });

const emptyForm = (): Form => ({
  categoryId: "",
  coverImage: "",
  images: [],
  tr: { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() },
});

const fromProject = (p: Project): Form => {
  const tr = { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() };
  for (const t of p.translations) {
    tr[t.lang] = {
      title: t.title,
      shortDescription: t.shortDescription ?? "",
      description: t.description ?? "",
    };
  }
  return { categoryId: String(p.categoryId), coverImage: p.coverImage, images: p.images, tr };
};

function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="pm-section">
      <header className="pm-section__head">
        <span className="pm-section__n">{n}</span>
        <div>
          <h3>{title}</h3>
          {hint && <p>{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

/** Create / edit dialog. `project` null = create. */
export default function ProjectFormDialog({
  open,
  project,
  onOpenChange,
}: {
  open: boolean;
  project: Project | null;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: categories = [] } = useGetProjectCategoriesQuery();
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const [form, setForm] = useState<Form>(emptyForm());
  const [activeLang, setActiveLang] = useState<ProjectLang>("EN");
  const [error, setError] = useState("");
  const busy = creating || updating;
  const set = <K extends Exclude<keyof Form, "tr">>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setTr = <K extends keyof TrForm>(l: ProjectLang, k: K, v: TrForm[K]) =>
    setForm((f) => ({ ...f, tr: { ...f.tr, [l]: { ...f.tr[l], [k]: v } } }));

  useEffect(() => {
    if (!open) return;
    setForm(project ? fromProject(project) : emptyForm());
    setActiveLang("EN");
    setError("");
  }, [open, project]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.categoryId) return setError("Please select a category.");
    if (!form.coverImage.trim()) return setError("Cover image is required.");

    // English is the fallback language and is mandatory; AZ/RU are validated only when started.
    const translations: ProjectInput["translations"] = [];
    for (const l of PROJECT_LANGS) {
      const f = form.tr[l];
      const started = Object.values(f).some((v) => v.trim());
      if (l !== "EN" && !started) continue;
      if (f.title.trim().length < 2) {
        setActiveLang(l);
        return setError(`${LANG_NAME[l]}: project title is required.`);
      }
      translations.push({
        lang: l,
        title: f.title.trim(),
        shortDescription: f.shortDescription.trim() || null,
        description: f.description.trim() || null,
      });
    }

    const body: ProjectInput = {
      categoryId: Number(form.categoryId),
      coverImage: form.coverImage.trim(),
      images: form.images,
      translations,
    };
    try {
      if (project) await updateProject({ id: project.id, body }).unwrap();
      else await createProject(body).unwrap();
      toast.success(project ? "Project updated" : "Project created", form.tr.EN.title.trim());
      onOpenChange(false);
    } catch (err) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent size="xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update the details and media of this project." : "Add a project to the public Projects page."}{" "}
            Fields marked * are required.
          </DialogDescription>
        </DialogHeader>
        <DialogForm id="project-form" onSubmit={submit} noValidate>
          <DialogBody>
            {error && (
              <p className="pf-alert pf-alert--error" role="alert">
                {error}
              </p>
            )}
            <div className="pm-form">
              <div className="pm-form__col">
                <Section n={1} title="Category">
                  <Field label="Category *" id="p-category">
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => set("categoryId", v)}
                      disabled={busy}
                    >
                      <SelectTrigger id="p-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </Section>

                <Section
                  n={2}
                  title="Content"
                  hint="English is required and is shown when a visitor's language has no translation."
                >
                  <div className="pf-lang-tabs" role="tablist" style={{ marginBottom: 14 }}>
                    {PROJECT_LANGS.map((l) => (
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

                  {PROJECT_LANGS.map((l) => {
                    const f = form.tr[l];
                    return (
                      <div key={l} role="tabpanel" hidden={activeLang !== l}>
                        <Field label={`Project Title (${l})${l === "EN" ? " *" : ""}`} id={`p-title-${l}`}>
                          <Input
                            id={`p-title-${l}`}
                            className="pf-input"
                            value={f.title}
                            maxLength={200}
                            disabled={busy}
                            placeholder={LANG_NAME[l]}
                            onChange={(e) => setTr(l, "title", e.target.value)}
                          />
                        </Field>
                        <Field label={`Short Description (${l})`} id={`p-short-${l}`} mt>
                          <textarea
                            id={`p-short-${l}`}
                            rows={3}
                            maxLength={300}
                            className="pf-textarea"
                            value={f.shortDescription}
                            disabled={busy}
                            onChange={(e) => setTr(l, "shortDescription", e.target.value)}
                            placeholder="One or two sentences shown on the project card."
                          />
                          <span className="pm-counter">{f.shortDescription.length} / 300</span>
                        </Field>
                        <Field label={`Project Description / Details (${l})`} id={`p-desc-${l}`} mt>
                          <textarea
                            id={`p-desc-${l}`}
                            rows={8}
                            maxLength={20000}
                            className="pf-textarea"
                            value={f.description}
                            disabled={busy}
                            onChange={(e) => setTr(l, "description", e.target.value)}
                            placeholder="Full details. Leave a blank line between paragraphs."
                          />
                        </Field>
                      </div>
                    );
                  })}
                </Section>
              </div>

              <div className="pm-form__col">
                <Section n={3} title="Media" hint="Shared by all languages. The cover is the card image; the gallery opens in a lightbox.">
                  <ImageUpload
                    value={form.coverImage}
                    onChange={(u) => set("coverImage", u)}
                    disabled={busy}
                    label="Cover Image *"
                    showUrlInput={false}
                  />
                  <div style={{ marginTop: 20 }}>
                    <GalleryUpload
                      value={form.images}
                      onChange={(urls) => set("images", urls)}
                      disabled={busy}
                    />
                  </div>
                </Section>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="project-form" disabled={busy}>
              {busy ? "Saving…" : project ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}
