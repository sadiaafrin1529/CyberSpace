import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export type SolutionLang = "EN" | "AZ" | "RU";
export const SOLUTION_LANGS: SolutionLang[] = ["EN", "AZ", "RU"];

export const BILLING_PERIODS = ["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

/** Built-in icon keys; an icon may also be an uploaded image URL. See components/solutions/SolutionIcon. */
export const SOLUTION_ICON_KEYS = [
  "server",
  "network",
  "shield",
  "video",
  "bolt",
  "fan",
  "cloud",
  "cpu",
  "gear",
  "box",
] as const;
export type SolutionIconKey = (typeof SOLUTION_ICON_KEYS)[number];

/* ── Public + admin shapes ─────────────────────────────────── */

export interface CategoryTranslation {
  lang: SolutionLang;
  name: string;
  description: string | null;
  instruction: string | null;
}

export interface BundleTranslation {
  lang: SolutionLang;
  title: string;
  description: string | null;
  badge: string | null;
}

export interface ItemTranslation {
  lang: SolutionLang;
  title: string;
  description: string | null;
}

export interface FeatureTranslation {
  lang: SolutionLang;
  title: string;
}

export interface BundleItem {
  id: number;
  productId: string | null;
  /** Decimal serialised as a string by the API. */
  price: string | null;
  sortOrder: number;
  translations: ItemTranslation[];
  product?: {
    id: string;
    sku: string;
    brand: string | null;
    imageUrl: string | null;
    /** Decimal serialised as a string; used when the line has no own price. */
    price: string | null;
    currency: string | null;
    translations: { lang: SolutionLang; name: string }[];
  } | null;
}

export interface BundleFeature {
  id: number;
  sortOrder: number;
  translations: FeatureTranslation[];
}

export interface SolutionBundle {
  id: number;
  sectionId: number;
  /** EN title (fallback: first language). */
  title: string;
  slug: string;
  icon: string | null;
  price: string | null;
  currency: string;
  billingPeriod: BillingPeriod;
  isActive: boolean;
  sortOrder: number;
  translations: BundleTranslation[];
  items: BundleItem[];
  features: BundleFeature[];
  _count?: { items: number; features: number };
  /** Present on admin responses. */
  section?: {
    id: number;
    categoryId: number;
    translations: { lang: SolutionLang; title: string }[];
    category: { id: number; translations: { lang: SolutionLang; name: string }[] };
  };
}

export interface SectionTranslation {
  lang: SolutionLang;
  title: string;
  description: string | null;
}

/** An accordion bar inside a solution category; holds bundles. */
export interface SolutionSection {
  id: number;
  categoryId: number;
  /** EN title (fallback: first language). */
  title: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  translations: SectionTranslation[];
  /** Present on admin responses. */
  _count?: { bundles: number };
  category?: { id: number; translations: { lang: SolutionLang; name: string }[] };
}

export interface SolutionCategory {
  id: number;
  /** EN name (fallback: first language). */
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  accentColor: string;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: CategoryTranslation[];
  /** Admin responses. */
  _count?: { sections: number };
  /** Public responses: published sections / distinct products across published bundles. */
  sectionCount?: number;
  productCount?: number;
}

export interface SolutionCategoryDetail extends SolutionCategory {
  sections: (SolutionSection & { bundles: SolutionBundle[] })[];
}

/* ── Inputs (translations are upserted per language; items/features replace the whole list) ── */

export interface CategoryInput {
  icon: string | null;
  image: string | null;
  accentColor: string;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;
  translations: CategoryTranslation[];
}

export interface SectionInput {
  categoryId: number;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  translations: SectionTranslation[];
}

export interface BundleInput {
  sectionId: number;
  icon: string | null;
  price: string | number | null;
  currency: string;
  billingPeriod: BillingPeriod;
  isActive: boolean;
  sortOrder: number;
  translations: BundleTranslation[];
  /** A line is a linked product (translations optional) or a free-text line (English title required). */
  items: { productId: string | null; price: string | number | null; translations: ItemTranslation[] }[];
  features: { translations: FeatureTranslation[] }[];
}

export interface Paged<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface CategoryListArgs {
  search?: string;
  status?: "active" | "inactive" | "";
  home?: boolean;
  page?: number;
  limit?: number;
}

export interface SectionListArgs {
  categoryId?: number;
  search?: string;
  status?: "active" | "inactive" | "";
  page?: number;
  limit?: number;
}

export interface BundleListArgs {
  categoryId?: number;
  sectionId?: number;
  search?: string;
  status?: "active" | "inactive" | "";
  page?: number;
  limit?: number;
}

const qs = (o: object) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};

const paged = <T>(res: { data?: T[]; meta?: Paged<T>["meta"] }): Paged<T> => ({
  data: res.data ?? [],
  meta: res.meta ?? { page: 1, limit: 50, total: 0 },
});

const A = "/solutions/admin";

export const solutionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    /* Categories */
    getSolutionCategories: b.query<Paged<SolutionCategory>, CategoryListArgs | void>({
      query: (a) => `${A}/categories${qs(a ?? {})}`,
      providesTags: [tagTypes.solution],
      transformResponse: paged<SolutionCategory>,
    }),
    createSolutionCategory: b.mutation<SolutionCategory, CategoryInput>({
      query: (body) => ({ url: `${A}/categories`, method: "POST", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: SolutionCategory }) => res.data,
    }),
    updateSolutionCategory: b.mutation<
      SolutionCategory,
      { id: number; body: Partial<CategoryInput> }
    >({
      query: ({ id, body }) => ({ url: `${A}/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: SolutionCategory }) => res.data,
    }),
    /** `cascade` also deletes the category's sections, bundles, items and features. */
    deleteSolutionCategory: b.mutation<void, { id: number; cascade?: boolean }>({
      query: ({ id, cascade }) => ({
        url: `${A}/categories/${id}${cascade ? "?cascade=true" : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.solution],
    }),
    reorderSolutionCategories: b.mutation<void, number[]>({
      query: (ids) => ({ url: `${A}/categories/reorder`, method: "PATCH", body: { ids } }),
      invalidatesTags: [tagTypes.solution],
    }),

    /* Sections */
    getSolutionSections: b.query<Paged<SolutionSection>, SectionListArgs | void>({
      query: (a) => `${A}/sections${qs(a ?? {})}`,
      providesTags: [tagTypes.solution],
      transformResponse: paged<SolutionSection>,
    }),
    createSolutionSection: b.mutation<SolutionSection, SectionInput>({
      query: (body) => ({ url: `${A}/sections`, method: "POST", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: SolutionSection }) => res.data,
    }),
    updateSolutionSection: b.mutation<SolutionSection, { id: number; body: Partial<SectionInput> }>({
      query: ({ id, body }) => ({ url: `${A}/sections/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: SolutionSection }) => res.data,
    }),
    /** `cascade` also deletes the section's bundles. */
    deleteSolutionSection: b.mutation<void, { id: number; cascade?: boolean }>({
      query: ({ id, cascade }) => ({
        url: `${A}/sections/${id}${cascade ? "?cascade=true" : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.solution],
    }),
    reorderSolutionSections: b.mutation<void, number[]>({
      query: (ids) => ({ url: `${A}/sections/reorder`, method: "PATCH", body: { ids } }),
      invalidatesTags: [tagTypes.solution],
    }),

    /* Bundles */
    getSolutionBundles: b.query<Paged<SolutionBundle>, BundleListArgs | void>({
      query: (a) => `${A}/bundles${qs(a ?? {})}`,
      providesTags: [tagTypes.solution],
      transformResponse: paged<SolutionBundle>,
    }),
    getSolutionBundle: b.query<SolutionBundle, number>({
      query: (id) => `${A}/bundles/${id}`,
      providesTags: [tagTypes.solution],
      transformResponse: (res: { data: SolutionBundle }) => res.data,
    }),
    createSolutionBundle: b.mutation<SolutionBundle, BundleInput>({
      query: (body) => ({ url: `${A}/bundles`, method: "POST", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: SolutionBundle }) => res.data,
    }),
    updateSolutionBundle: b.mutation<SolutionBundle, { id: number; body: Partial<BundleInput> }>({
      query: ({ id, body }) => ({ url: `${A}/bundles/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: SolutionBundle }) => res.data,
    }),
    deleteSolutionBundle: b.mutation<void, number>({
      query: (id) => ({ url: `${A}/bundles/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.solution],
    }),
    reorderSolutionBundles: b.mutation<void, number[]>({
      query: (ids) => ({ url: `${A}/bundles/reorder`, method: "PATCH", body: { ids } }),
      invalidatesTags: [tagTypes.solution],
    }),
  }),
});

export const {
  useGetSolutionCategoriesQuery,
  useCreateSolutionCategoryMutation,
  useUpdateSolutionCategoryMutation,
  useDeleteSolutionCategoryMutation,
  useReorderSolutionCategoriesMutation,
  useGetSolutionSectionsQuery,
  useCreateSolutionSectionMutation,
  useUpdateSolutionSectionMutation,
  useDeleteSolutionSectionMutation,
  useReorderSolutionSectionsMutation,
  useGetSolutionBundlesQuery,
  useGetSolutionBundleQuery,
  useCreateSolutionBundleMutation,
  useUpdateSolutionBundleMutation,
  useDeleteSolutionBundleMutation,
  useReorderSolutionBundlesMutation,
} = solutionApi;
