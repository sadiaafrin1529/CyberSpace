"use client";

import { useEffect, useState } from "react";
import {
  BILLING_PERIODS,
  SOLUTION_LANGS,
  useCreateSolutionBundleMutation,
  useGetSolutionSectionsQuery,
  useUpdateSolutionBundleMutation,
  type BillingPeriod,
  type BundleInput,
  type SolutionBundle,
  type SolutionLang,
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
import {
  FeaturesEditor,
  ItemsEditor,
  buildItems,
  newFeature,
  newItem,
  type FeatureForm,
  type ItemForm,
  type Lang3,
} from "./BundleListEditors";
import { Field, LANG_NAME, LangTabs, Section, errMsg, sectionLabel } from "./shared";

export const BILLING_LABEL: Record<BillingPeriod, string> = {
  ONE_TIME: "One-time",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

interface TrForm {
  title: string;
  description: string;
  badge: string;
}

interface Form {
  sectionId: string;
  icon: string;
  price: string;
  currency: string;
  billingPeriod: BillingPeriod;
  sortOrder: string;
  isActive: boolean;
  tr: Lang3<TrForm>;
  items: ItemForm[];
  features: FeatureForm[];
}

const emptyTr = (): TrForm => ({ title: "", description: "", badge: "" });

const emptyForm = (sectionId: string): Form => ({
  sectionId,
  icon: "",
  price: "",
  currency: "AZN",
  billingPeriod: "ONE_TIME",
  sortOrder: "0",
  isActive: true,
  tr: { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() },
  items: [],
  features: [],
});

const fromBundle = (b: SolutionBundle): Form => {
  const tr = { EN: emptyTr(), AZ: emptyTr(), RU: emptyTr() };
  for (const t of b.translations) {
    tr[t.lang] = { title: t.title, description: t.description ?? "", badge: t.badge ?? "" };
  }
  // Lines without a product (its product was deleted) have nothing to show and are dropped.
  const items = b.items
    .filter((it) => it.productId)
    .map((it) => ({ ...newItem(), productId: it.productId ?? "" }));
  const features = b.features.map((ft) => {
    const f = newFeature();
    for (const t of ft.translations) f.tr[t.lang] = t.title;
    return f;
  });
  return {
    sectionId: String(b.sectionId),
    icon: b.icon ?? "",
    price: b.price ?? "",
    currency: b.currency,
    billingPeriod: b.billingPeriod,
    sortOrder: String(b.sortOrder),
    isActive: b.isActive,
    tr,
    items,
    features,
  };
};

/** Create / edit dialog. `bundle` null = create (in `defaultSectionId` when given). */
export default function BundleFormDialog({
  open,
  bundle,
  defaultSectionId,
  onOpenChange,
}: {
  open: boolean;
  bundle: SolutionBundle | null;
  defaultSectionId?: number;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: sectionData } = useGetSolutionSectionsQuery({ limit: 100 });
  const sections = sectionData?.data ?? [];
  const [createBundle, { isLoading: creating }] = useCreateSolutionBundleMutation();
  const [updateBundle, { isLoading: updating }] = useUpdateSolutionBundleMutation();
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
      bundle ? fromBundle(bundle) : emptyForm(defaultSectionId ? String(defaultSectionId) : ""),
    );
    setActiveLang("EN");
    setError("");
  }, [open, bundle, defaultSectionId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.sectionId) return setError("Please select a section.");
    const order = Number(form.sortOrder);
    if (!Number.isInteger(order) || order < 0) return setError("Display order must be 0 or more.");
    const price = form.price.trim();
    if (price && (!Number.isFinite(Number(price)) || Number(price) < 0))
      return setError("Price must be a positive number.");
    const currency = form.currency.trim().toUpperCase();
    if (currency.length !== 3) return setError("Currency must be a 3-letter code, e.g. AZN.");

    // English is the fallback language and is mandatory; AZ/RU are validated only when started.
    const translations: BundleInput["translations"] = [];
    for (const l of SOLUTION_LANGS) {
      const f = form.tr[l];
      const started = Object.values(f).some((v) => v.trim());
      if (l !== "EN" && !started) continue;
      if (f.title.trim().length < 2) {
        setActiveLang(l);
        return setError(`${LANG_NAME[l]}: bundle title is required.`);
      }
      translations.push({
        lang: l,
        title: f.title.trim(),
        description: f.description.trim() || null,
        badge: f.badge.trim() || null,
      });
    }

    const built = buildItems(form.items);
    if ("error" in built) return setError(built.error);
    const items = built.items;

    const features: BundleInput["features"] = [];
    for (const [i, ft] of form.features.entries()) {
      if (!ft.tr.EN.trim()) {
        setActiveLang("EN");
        return setError(`Feature ${i + 1}: English text is required.`);
      }
      features.push({
        translations: SOLUTION_LANGS.filter((l) => ft.tr[l].trim()).map((l) => ({
          lang: l,
          title: ft.tr[l].trim(),
        })),
      });
    }

    const body: BundleInput = {
      sectionId: Number(form.sectionId),
      icon: form.icon || null,
      price: price || null,
      currency,
      billingPeriod: form.billingPeriod,
      isActive: form.isActive,
      sortOrder: order,
      translations,
      items,
      features,
    };
    try {
      if (bundle) await updateBundle({ id: bundle.id, body }).unwrap();
      else await createBundle(body).unwrap();
      toast.success(bundle ? "Bundle updated" : "Bundle created", form.tr.EN.title.trim());
      onOpenChange(false);
    } catch (err) {
      setError(errMsg(err, "Save failed. Please try again."));
    }
  }

  const tr = form.tr[activeLang];

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent size="xl" className="sbf-dialog" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{bundle ? "Edit Bundle" : "New Bundle"}</DialogTitle>
          <DialogDescription>
            A bundle is a priced package shown inside a section of a category page. Fields marked *
            are required.
          </DialogDescription>
        </DialogHeader>
        <DialogForm id="solution-bundle-form" onSubmit={submit} noValidate>
          <DialogBody className="sbf-body">
            {error && (
              <p className="pf-alert pf-alert--error" role="alert">
                {error}
              </p>
            )}
            <div className="sbf">
              <div className="sbf__top">
                <div className="sbf__col">
                  <Section
                    n={1}
                    title="Content"
                    hint="The language tabs also switch the items and features below."
                  >
                    <Field label="Section *" id="sb-section">
                      <Select
                        value={form.sectionId}
                        onValueChange={(v) => set("sectionId", v)}
                        disabled={busy}
                      >
                        <SelectTrigger id="sb-section">
                          <SelectValue placeholder="Select a section (Category / Section)" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((sec) => (
                            <SelectItem key={sec.id} value={String(sec.id)}>
                              {sectionLabel(sec)}
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
                      label={`Bundle Title (${activeLang})${activeLang === "EN" ? " *" : ""}`}
                      id="sb-title"
                    >
                      <Input
                        id="sb-title"
                        className="pf-input"
                        value={tr.title}
                        maxLength={160}
                        disabled={busy}
                        placeholder={LANG_NAME[activeLang]}
                        onChange={(e) => setTr(activeLang, "title", e.target.value)}
                      />
                    </Field>
                    <Field label={`Badge (${activeLang})`} id="sb-badge" mt>
                      <Input
                        id="sb-badge"
                        className="pf-input"
                        value={tr.badge}
                        maxLength={60}
                        disabled={busy}
                        placeholder="e.g. Turnkey Bundle"
                        onChange={(e) => setTr(activeLang, "badge", e.target.value)}
                      />
                    </Field>
                    <Field label={`Description (${activeLang})`} id="sb-desc" mt>
                      <textarea
                        id="sb-desc"
                        rows={4}
                        maxLength={2000}
                        className="pf-textarea"
                        value={tr.description}
                        disabled={busy}
                        onChange={(e) => setTr(activeLang, "description", e.target.value)}
                      />
                    </Field>
                  </Section>
                </div>
                <div className="sbf__col">
                  <Section n={2} title="Pricing & status">
                    <div className="sbf-price-row">
                      <Field label="Price" id="sb-price">
                        <Input
                          id="sb-price"
                          className="pf-input"
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.price}
                          disabled={busy}
                          placeholder="Leave empty for “on request”"
                          onChange={(e) => set("price", e.target.value)}
                        />
                      </Field>
                      <Field label="Currency" id="sb-currency">
                        <Input
                          id="sb-currency"
                          className="pf-input"
                          value={form.currency}
                          maxLength={3}
                          disabled={busy}
                          onChange={(e) => set("currency", e.target.value.toUpperCase())}
                        />
                      </Field>
                    </div>
                    <Field label="Billing period" id="sb-billing" mt>
                      <Select
                        value={form.billingPeriod}
                        onValueChange={(v) => set("billingPeriod", v as BillingPeriod)}
                        disabled={busy}
                      >
                        <SelectTrigger id="sb-billing">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BILLING_PERIODS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {BILLING_LABEL[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Display order" id="sb-order" mt>
                      <Input
                        id="sb-order"
                        className="pf-input"
                        type="number"
                        min={0}
                        value={form.sortOrder}
                        disabled={busy}
                        onChange={(e) => set("sortOrder", e.target.value)}
                      />
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
                    <div style={{ marginTop: 20 }}>
                      <IconPicker
                        value={form.icon}
                        onChange={(v) => set("icon", v)}
                        disabled={busy}
                        label="Bundle icon"
                      />
                    </div>
                  </Section>
                </div>
              </div>
              <Section
                n={3}
                title="What's included"
                hint="Pick products from the catalogue. Name and price come from each product."
              >
                <ItemsEditor items={form.items} onChange={(v) => set("items", v)} disabled={busy} />
              </Section>
              <Section
                n={4}
                title="Extra features"
                hint="Optional free-text lines (services, support, SLA) shown after the products."
              >
                <FeaturesEditor
                  features={form.features}
                  onChange={(v) => set("features", v)}
                  lang={activeLang}
                  disabled={busy}
                />
              </Section>
            </div>
          </DialogBody>
          <DialogFooter className="sbf-footer">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="solution-bundle-form" disabled={busy}>
              {busy ? "Saving…" : bundle ? "Save Changes" : "Create Bundle"}
            </Button>
          </DialogFooter>
        </DialogForm>
      </DialogContent>
    </Dialog>
  );
}
