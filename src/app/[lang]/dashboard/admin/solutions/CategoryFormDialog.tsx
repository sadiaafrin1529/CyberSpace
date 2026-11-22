"use client";

import { useEffect, useState } from "react";
import {
  SOLUTION_LANGS,
  useCreateSolutionCategoryMutation,
  useUpdateSolutionCategoryMutation,
  type CategoryInput,
  type SolutionCategory,
  type SolutionLang,
} from "@/redux/fetchers/solution/solutionApi";
import ImageUpload from "@/components/dashboard/ImageUpload";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  name: string;
  description: string;
  instruction: string;
}

interface Form {
  icon: string;
  image: string;
  accentColor: string;
  sortOrder: string;
  isActive: boolean;
  showOnHome: boolean;
  tr: Record<SolutionLang, TrForm>;
}

const emptyTr = (): TrForm => ({ name: "", description: "", instruction: "" });

const emptyForm = (): Form => ({
  icon: "",
  image: "",
  accentColor: "#1457d9",
  sortOrder: "0",
  isActive: true,
  showOnHome: true,
  tr: { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() },
});

const fromCategory = (c: SolutionCategory): Form => {
  const tr = { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() };
  for (const t of c.translations) {
    tr[t.lang] = {
      name: t.name,
      description: t.description ?? "",
      instruction: t.instruction ?? "",
    };
  }
  return {
    icon: c.icon ?? "",
    image: c.image ?? "",
    accentColor: c.accentColor,
    sortOrder: String(c.sortOrder),
    isActive: c.isActive,
    showOnHome: c.showOnHome,
    tr,
  };
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Create / edit dialog. `category` null = create. */
export default function CategoryFormDialog({
  open,
  category,
  onOpenChange,
}: {
  open: boolean;
  category: SolutionCategory | null;
  onOpenChange: (v: boolean) => void;
}) {
  const [createCategory, { isLoading: creating }] = useCreateSolutionCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateSolutionCategoryMutation();
  const [form, setForm] = useState<Form>(emptyForm());
  const [activeLang, setActiveLang] = useState<SolutionLang>("EN");
  const [error, setError] = useState("");
  const busy = creating || updating;
  const set = <K extends Exclude<keyof Form, "tr">>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setTr = <K extends keyof TrForm>(l: SolutionLang, k: K, v: TrForm[K]) =>
    setForm((f) => ({ ...f, tr: { ...f.tr, [l]: { ...f.tr[l], [k]: v } } }));

  useEffect(() => {
    if (!open) return;
    setForm(category ? fromCategory(category) : emptyForm());
    setActiveLang("EN");
    setError("");
  }, [open, category]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!HEX.test(form.accentColor)) return setError("Accent colour must look like #1457d9.");
    const order = Number(form.sortOrder);
    if (!Number.isInteger(order) || order < 0) return setError("Display order must be 0 or more.");

    // English is the fallback language and is mandatory; AZ/RU are validated only when started.
    const translations: CategoryInput["translations"] = [];
    for (const l of SOLUTION_LANGS) {
      const f = form.tr[l];
      const started = Object.values(f).some((v) => v.trim());
      if (l !== "EN" && !started) continue;
      if (f.name.trim().length < 2) {
        setActiveLang(l);
        return setError(`${LANG_NAME[l]}: category name is required.`);
      }
      translations.push({
        lang: l,
        name: f.name.trim(),
        description: f.description.trim() || null,
        instruction: f.instruction.trim() || null,
      });
    }

    const body: CategoryInput = {
      icon: form.icon || null,
      image: form.image || null,
      accentColor: form.accentColor,
      isActive: form.isActive,
      showOnHome: form.showOnHome,
      sortOrder: order,
      translations,
    };
    try {
      if (category) await updateCategory({ id: category.id, body }).unwrap();
      else await createCategory(body).unwrap();
      toast.success(category ? "Category updated" : "Category created", form.tr.EN.name.trim());
      onOpenChange(false);
    } catch (err) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent size="xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>
            Categories appear on the homepage and the public Solutions page. Fields marked * are
            required.
          </DialogDescription>
        </DialogHeader>
        <DialogForm id="solution-category-form" onSubmit={submit} noValidate>
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
                  <LangTabs
                    active={activeLang}
                    onChange={setActiveLang}
                    filled={(l) => !!form.tr[l].name.trim()}
                  />
                  {SOLUTION_LANGS.map((l) => {
                    const f = form.tr[l];
                    return (
                      <div key={l} role="tabpanel" hidden={activeLang !== l}>
                        <Field
                          label={`Category Name (${l})${l === "EN" ? " *" : ""}`}
                          id={`sc-name-${l}`}
                        >
                          <Input
                            id={`sc-name-${l}`}
                            className="pf-input"
                            value={f.name}
                            maxLength={120}
                            disabled={busy}
                            placeholder={LANG_NAME[l]}
                            onChange={(e) => setTr(l, "name", e.target.value)}
                          />
                        </Field>
                        <Field label={`Description (${l})`} id={`sc-desc-${l}`} mt>
                          <textarea
                            id={`sc-desc-${l}`}
                            rows={4}
                            maxLength={2000}
                            className="pf-textarea"
                            value={f.description}
                            disabled={busy}
                            placeholder="Short description shown on the category card and page header."
                            onChange={(e) => setTr(l, "description", e.target.value)}
                          />
                        </Field>
                        <Field label={`Instruction text (${l})`} id={`sc-ins-${l}`} mt>
                          <Input
                            id={`sc-ins-${l}`}
                            className="pf-input"
                            value={f.instruction}
                            maxLength={300}
                            disabled={busy}
                            placeholder="e.g. Choose a bundle below and send an inquiry."
                            onChange={(e) => setTr(l, "instruction", e.target.value)}
                          />
                        </Field>
                      </div>
                    );
                  })}
                </Section>

                <Section n={2} title="Visibility & order">
                  <div style={{ display: "grid", gap: 10 }}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        disabled={busy}
                        onChange={(e) => set("isActive", e.target.checked)}
                      />
                      <span>Active (visible on the public website)</span>
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={form.showOnHome}
                        disabled={busy}
                        onChange={(e) => set("showOnHome", e.target.checked)}
                      />
                      <span>Show on the homepage</span>
                    </label>
                  </div>
                  <Field label="Display order" id="sc-order" mt>
                    <Input
                      id="sc-order"
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
                </Section>
              </div>

              <div className="pm-form__col">
                <Section n={3} title="Look" hint="Shared by all languages.">
                  <IconPicker value={form.icon} onChange={(v) => set("icon", v)} disabled={busy} />
                  <Field label="Accent colour" id="sc-color" mt>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        id="sc-color"
                        type="color"
                        aria-label="Accent colour"
                        value={HEX.test(form.accentColor) ? form.accentColor : "#1457d9"}
                        disabled={busy}
                        onChange={(e) => set("accentColor", e.target.value)}
                        style={{ width: 44, height: 36, padding: 0, border: 0, background: "none" }}
                      />
                      <Input
                        className="pf-input"
                        value={form.accentColor}
                        maxLength={7}
                        disabled={busy}
                        onChange={(e) => set("accentColor", e.target.value)}
                        aria-label="Accent colour hex"
                      />
                    </div>
                  </Field>
                  <div style={{ marginTop: 20 }}>
                    <ImageUpload
                      value={form.image}
                      onChange={(u) => set("image", u)}
                      disabled={busy}
                      label="Category image (optional)"
                      showUrlInput={false}
                    />
                  </div>
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
            <Button type="submit" form="solution-category-form" disabled={busy}>
              {busy ? "Saving…" : category ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}
