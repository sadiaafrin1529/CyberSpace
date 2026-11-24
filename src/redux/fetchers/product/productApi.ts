import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";
import type { PublicProduct, CategoryId } from "@/data/catalog";

interface ApiProductTranslation {
  id: number;
  lang: string;
  name: string;
  description: string | null;
}

interface ApiProduct {
  id: string;
  sku: string;
  brand: string | null;
  category: string;
  imageUrl: string | null;
  price: string | number | null;
  currency: string | null;
  stock: number | null;
  syncedAt: string;
  translations: ApiProductTranslation[];
}

function toPublicProduct(p: ApiProduct): PublicProduct {
  const names: Record<string, string> = {};
  const descriptions: Record<string, string> = {};
  for (const t of p.translations) {
    const lang = t.lang.toLowerCase();
    names[lang] = t.name;
    if (t.description) descriptions[lang] = t.description;
  }
  const name = names["en"] ?? names["az"] ?? names["ru"] ?? Object.values(names)[0] ?? p.sku;
  return {
    id: p.id,
    sku: p.sku,
    name,
    names,
    descriptions,
    brand: p.brand ?? "",
    imageUrl: p.imageUrl ?? null,
    category: p.category as CategoryId,
    price: p.price != null ? parseFloat(String(p.price)) : null,
    currency: (p.currency as "USD" | "AZN") ?? null,
    stock: p.stock ?? null,
    specs: [],
  };
}

export type ShopSort = "relevance" | "nameAsc" | "priceAsc" | "priceDesc";

export interface ShopQueryArgs {
  /** Category slugs; descendants of each are matched automatically (server-side). */
  category: string[];
  brand: string[];
  q: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: ShopSort;
  page: number;
  limit: number;
  lang: "EN" | "AZ" | "RU";
}

export interface ShopResult {
  items: PublicProduct[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  facets: {
    /** Matching products per category slug (other filters applied, category filter ignored). */
    categories: Record<string, number>;
    brands: Record<string, number>;
    price: { min: number; max: number } | null;
  };
}

interface ShopResponse {
  data?: ApiProduct[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    facets: ShopResult["facets"];
  };
}

export interface CreateProductInput {
  sku: string;
  brand?: string;
  category: string;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string | null;
  stock?: number | null;
  translations: { lang: "AZ" | "EN" | "RU"; name: string; description?: string }[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PublicProduct[], void>({
      query: () => "/products",
      providesTags: [tagTypes.product],
      transformResponse: (res: { data?: ApiProduct[] }) => (res.data ?? []).map(toPublicProduct),
    }),
    getShopProducts: builder.query<ShopResult, ShopQueryArgs>({
      query: (a) => {
        const p = new URLSearchParams();
        if (a.category.length) p.set("category", a.category.join(","));
        if (a.brand.length) p.set("brand", a.brand.join(","));
        if (a.q) p.set("q", a.q);
        if (a.minPrice !== null) p.set("minPrice", String(a.minPrice));
        if (a.maxPrice !== null) p.set("maxPrice", String(a.maxPrice));
        p.set("sort", a.sort);
        p.set("page", String(a.page));
        p.set("limit", String(a.limit));
        p.set("lang", a.lang);
        return `/products/shop?${p.toString()}`;
      },
      providesTags: [tagTypes.product, tagTypes.category],
      transformResponse: (res: ShopResponse): ShopResult => ({
        items: (res.data ?? []).map(toPublicProduct),
        page: res.meta?.page ?? 1,
        limit: res.meta?.limit ?? 12,
        total: res.meta?.total ?? 0,
        totalPages: res.meta?.totalPages ?? 1,
        facets: res.meta?.facets ?? { categories: {}, brands: {}, price: null },
      }),
    }),
    createProduct: builder.mutation<ApiProduct, CreateProductInput>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [tagTypes.product],
      transformResponse: (res: { data?: ApiProduct }) => res.data!,
    }),
    updateProduct: builder.mutation<ApiProduct, { id: string; body: UpdateProductInput }>({
      query: ({ id, body }) => ({
        url: `/products/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.product],
      transformResponse: (res: { data?: ApiProduct }) => res.data!,
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetShopProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
