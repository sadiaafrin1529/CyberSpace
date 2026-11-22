"use client";

import { useEffect, useState } from "react";
import {
  SOLUTION_LANGS,
  useCreateSolutionSectionMutation,
  useGetSolutionCategoriesQuery,
  useUpdateSolutionSectionMutation,
  type SectionInput,
  type SolutionLang,
  type SolutionSection,
} from "@/redux/fetchers/solution/solutionApi";
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
import IconPicker from "./IconPicker";
import { Field, LANG_NAME, LangTabs, Section, errMsg } from "./shared";

interface TrForm {
  title: string;
  description: string;
}

interface Form {
  categoryId: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
  tr: Record<SolutionLang, TrForm>;
}

const emptyTr = (): TrForm => ({ title: "", description: "" });

const emptyForm = (categoryId: string): Form => ({
  categoryId,
  icon: "",
  sortOrder: "0",
  isActive: true,
  tr: { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() },
});

const fromSection = (s: SolutionSection): Form => {
  const tr = { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() };
  for (const t of s.translations) tr[t.lang] = { title: t.title, description: t.description ?? "" };
  return {
    categoryId: String(s.categoryId),
    icon: s.icon ?? "",
    sortOrder: String(s.sortOrder),
    isActive: s.isActive,
    tr,
  };
};

/** Create / edit dialog for an accordion section. `section` null = create. */
export default function SectionFormDialog({
  open,
  section,
  defaultCategoryId,
  onOpenChange,
}: {
  open: boolean;
  section: SolutionSection | null;
  defaultCategoryId?: number;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: catData } = useGetSolutionCategoriesQuery({ limit: 100 });
  const categories = catData?.data ?? [];
  const [createSection, { isLoading: creating }] = useCreateSolutionSectionMutation();
  const [updateSection, { isLoading: updating }] = useUpdateSolutionSectionMutation();
  const [form, setForm] = useState<Form>(emptyForm(""));
  const [activeLang, setActiveLang] = useState<SolutionLang>("EN");
  const [error, setError] = useState("");
  const busy = creating || updating;
  const set = <K extends Exclude<keyof Form, "tr">>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setTr = <K extends keyof TrForm>(l: SolutionLang, k: K, v: TrForm[K]) =>
    setForm((f) => ({ ...f, tr: { ...f.tr, [l]: { ...f.tr[l], [k]: v } } }));

  useEffect(() => {
    if (!open) return;
    setForm(
      section
        ? fromSection(section)
        : emptyForm(defaultCategoryId ? String(defaultCategoryId) : ""),
    );
    setActiveLang("EN");
    setError("");
  }, [open, section, defaultCategoryId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.categoryId) return setError("Please select a solution category.");
    const order = Number(form.sortOrder);
    if (!Number.isInteger(order) || order < 0) return setError("Display order must be 0 or more.");

    // English is the fallback language and is mandatory; AZ/RU are validated only when started.
    const translations: SectionInput["translations"] = [];
    for (const l of SOLUTION_LANGS) {
      const f = form.tr[l];
      const started = Object.values(f).some((v) => v.trim());
      if (l !== "EN" && !started) continue;
      if (f.title.trim().length < 2) {
        setActiveLang(l);
        return setError(`${LANG_NAME[l]}: section title is required.`);
      }
      translations.push({
        lang: l,
        title: f.title.trim(),
        description: f.description.trim() || null,
      });
    }

    const body: SectionInput = {
      categoryId: Number(form.categoryId),
      icon: form.icon || null,
      isActive: form.isActive,
      sortOrder: order,
      translations,
    };
    try {
      if (section) await updateSection({ id: section.id, body }).unwrap();
      else await createSection(body).unwrap();
      toast.success(section ? "Section updated" : "Section created", form.tr.EN.title.trim());
      onOpenChange(false);
    } catch (err) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  const tr = form.tr[activeLang];

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent size="xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{section ? "Edit Section" : "New Section"}</DialogTitle>
          <DialogDescription>
            A section is an expandable bar on a category page (for example “Turnkey Infrastructure
            Bundles”) that holds bundles. Fields marked * are required.
          </DialogDescription>
        </DialogHeader>
        <DialogForm id="solution-section-form" onSubmit={submit} noValidate>
          <DialogBody>
            {error && (
              <p className="pf-alert pf-alert--error" role="alert">
                {error}
              </p>
            )}
            <div className="pm-form">
              <div className="pm-form__col">
                <Section
                  n={1}
                  title="Content"
                  hint="English is required and is shown when a visitor's language has no translation."
                >
                  <Field label="Solution category *" id="ss-category">
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => set("categoryId", v)}
                      disabled={busy}
                    >
                      <SelectTrigger id="ss-category">
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
                  <div style={{ marginTop: 16 }}>
                    <LangTabs
                      active={activeLang}
                      onChange={setActiveLang}
                      filled={(l) => !!form.tr[l].title.trim()}
                    />
                  </div>
                  <Field
                    label={`Section Title (${activeLang})${activeLang === "EN" ? " *" : ""}`}
                    id="ss-title"
                  >
                    <Input
                      id="ss-title"
                      className="pf-input"
                      value={tr.title}
                      maxLength={160}
                      disabled={busy}
                      placeholder={LANG_NAME[activeLang]}
                      onChange={(e) => setTr(activeLang, "title", e.target.value)}
                    />
                  </Field>
                  <Field label={`Description (${activeLang})`} id="ss-desc" mt>
                    <textarea
                      id="ss-desc"
                      rows={3}
                      maxLength={500}
                      className="pf-textarea"
                      value={tr.description}
                      disabled={busy}
                      placeholder="One line shown under the section title."
                      onChange={(e) => setTr(activeLang, "description", e.target.value)}
                    />
                  </Field>
                </Section>
              </div>

              <div className="pm-form__col">
                <Section n={2} title="Look & status">
                  <IconPicker
                    value={form.icon}
                    onChange={(v) => set("icon", v)}
                    disabled={busy}
                    label="Section icon"
                  />
                  <Field label="Display order" id="ss-order" mt>
                    <Input
                      id="ss-order"
                      className="pf-input"
                      type="number"
                      min={0}
                      value={form.sortOrder}
                      disabled={busy}
                      onChange={(e) => set("sortOrder", e.target.value)}
                    />
                    <span className="pf-hint">
                      Lower numbers come first. You can also reorder in the list.
                    </span>
                  </Field>
                  <label className="check" style={{ marginTop: 16 }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      disabled={busy}
                      onChange={(e) => set("isActive", e.target.checked)}
                    />
                    <span>Active (visible on the public website)</span>
                  </label>
                </Section>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="solution-section-form" disabled={busy}>
              {busy ? "Saving…" : section ? "Save Changes" : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}
