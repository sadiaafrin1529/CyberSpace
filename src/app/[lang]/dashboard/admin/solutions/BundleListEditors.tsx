"use client";

import { Plus, Trash2 } from "lucide-react";
import { useGetProductsQuery } from "@/redux/fetchers/product/productApi";
import { type BundleInput, type SolutionLang } from "@/redux/fetchers/solution/solutionApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReorderButtons, move } from "./shared";

export type Lang3<T> = Record<SolutionLang, T>;

/** One "What's included" line: just a catalogue product. Name, description and price come from the product. */
export interface ItemForm {
  key: string;
  productId: string;
}

export interface FeatureForm {
  key: string;
  tr: Lang3<string>;
}

let seq = 0;
const nextKey = () => `k${++seq}`;

export const newItem = (): ItemForm => ({ key: nextKey(), productId: "" });

export const newFeature = (): FeatureForm => ({ key: nextKey(), tr: { EN: "", AZ: "", RU: "" } });

/** Builds the API payload. Rows without a product are ignored; each product is listed once. */
export function buildItems(items: ItemForm[]): { error: string } | { items: BundleInput["items"] } {
  const seen = new Set<string>();
  const out: BundleInput["items"] = [];
  for (const [i, it] of items.entries()) {
    if (!it.productId) continue;
    if (seen.has(it.productId))
      return { error: `Line ${i + 1}: this product is already in the bundle.` };
    seen.add(it.productId);
    out.push({ productId: it.productId, price: null, translations: [] });
  }
  return { items: out };
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  brand: string;
  price: number | null;
  currency: string | null;
}

const money = (p: ProductOption) =>
  p.price == null
    ? null
    : `${p.price.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${p.currency ?? ""}`.trim();

/** Select over all existing products (name · SKU). */
function ProductPicker({
  products,
  loading,
  value,
  disabled,
  onPick,
}: {
  products: ProductOption[];
  loading: boolean;
  value: string;
  disabled?: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <div className="sbf-picker">
      <Select value={value || undefined} disabled={disabled} onValueChange={(v) => onPick(v)}>
        <SelectTrigger aria-label="Product">
          <SelectValue placeholder={loading ? "Loading products…" : "Select a product"} />
        </SelectTrigger>
        <SelectContent>
          {products.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name} · {p.sku}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ItemRow({
  item,
  index,
  count,
  products,
  loading,
  disabled,
  onPatch,
  onMove,
  onRemove,
}: {
  item: ItemForm;
  index: number;
  count: number;
  products: ProductOption[];
  loading: boolean;
  disabled?: boolean;
  onPatch: (p: Partial<ItemForm>) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const product = item.productId ? products.find((p) => p.id === item.productId) : undefined;

  return (
    <div className="pm-card sbf-line">
      <div className="sbf-line__head">
        <strong>Product {index + 1}</strong>
        <div className="pm-actions">
          <ReorderButtons
            index={index}
            count={count}
            disabled={disabled}
            onMove={onMove}
            label={`product ${index + 1}`}
          />
          <button
            type="button"
            className="pm-icon-btn pm-icon-btn--danger"
            title="Remove product"
            aria-label={`Remove product ${index + 1}`}
            disabled={disabled}
            onClick={onRemove}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <ProductPicker
        products={products}
        loading={loading}
        value={item.productId}
        disabled={disabled}
        onPick={(id) => onPatch({ productId: id })}
      />

      {item.productId && (
        <div className="sbf-line__summary">
          <span>
            <strong>{product?.name ?? "Product not found"}</strong>
            <br />
            <small className="pm-muted">
              {product
                ? `${product.sku}${product.brand ? ` · ${product.brand}` : ""}`
                : item.productId}
            </small>
          </span>
          <span className="sbf-line__summary-price">
            <small className="pm-muted">Price from product</small>
            <br />
            <strong>{product ? (money(product) ?? "No price set") : "—"}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export function ItemsEditor({
  items,
  onChange,
  disabled,
}: {
  items: ItemForm[];
  onChange: (items: ItemForm[]) => void;
  disabled?: boolean;
}) {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const patch = (i: number, p: Partial<ItemForm>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.length === 0 && (
        <p className="pm-hint">
          No products yet. Add the products this bundle contains; name and price come from each
          product.
        </p>
      )}
      {items.map((it, i) => (
        <ItemRow
          key={it.key}
          item={it}
          index={i}
          count={items.length}
          products={products}
          loading={isLoading}
          disabled={disabled}
          onPatch={(p) => patch(i, p)}
          onMove={(d) => onChange(move(items, i, d))}
          onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
        />
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onChange([...items, newItem()])}
        >
          <Plus size={15} aria-hidden="true" />
          {items.length === 0 ? "Add product" : "Add another product"}
        </Button>
      </div>
    </div>
  );
}

export function FeaturesEditor({
  features,
  onChange,
  lang,
  disabled,
}: {
  features: FeatureForm[];
  onChange: (f: FeatureForm[]) => void;
  lang: SolutionLang;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {features.length === 0 && (
        <p className="pm-hint">
          No features yet. These are extra lines such as services or support.
        </p>
      )}
      {features.map((f, i) => (
        <div key={f.key} className="sbf-feature">
          <Input
            className="pf-input"
            placeholder={`Feature (${lang})${lang === "EN" ? " *" : ""}`}
            aria-label={`Feature ${i + 1} (${lang})`}
            value={f.tr[lang]}
            maxLength={300}
            disabled={disabled}
            onChange={(e) =>
              onChange(
                features.map((x, idx) =>
                  idx === i ? { ...x, tr: { ...x.tr, [lang]: e.target.value } } : x,
                ),
              )
            }
          />
          <ReorderButtons
            index={i}
            count={features.length}
            disabled={disabled}
            onMove={(d) => onChange(move(features, i, d))}
            label={`feature ${i + 1}`}
          />
          <button
            type="button"
            className="pm-icon-btn pm-icon-btn--danger"
            title="Remove feature"
            aria-label={`Remove feature ${i + 1}`}
            disabled={disabled}
            onClick={() => onChange(features.filter((_, idx) => idx !== i))}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onChange([...features, newFeature()])}
        >
          <Plus size={15} aria-hidden="true" /> Add feature
        </Button>
      </div>
    </div>
  );
}
