import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export type SolutionLang = "EN" | "AZ" | "RU";
export const SOLUTION_LANGS: SolutionLang[] = ["EN", "AZ", "RU"];

/** Accent colours and icon presets of the public Solutions cards (sol-card--* styles). */
export const SOLUTION_COLORS = ["blue", "orange", "cyan", "red", "violet", "green"] as const;
export type SolutionColor = (typeof SOLUTION_COLORS)[number];
export const SOLUTION_ICON_KEYS = ["server", "bolt", "fan", "video", "shield", "gear"] as const;
export type SolutionIconKey = (typeof SOLUTION_ICON_KEYS)[number];

export interface SolutionTranslation {
  lang: SolutionLang;
  title: string;
  shortDescription: string;
  description: string | null;
  features: string[];
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface Solution {
  id: number;
  /** EN title (fallback: first language); stable across dashboard languages. */
  title: string;
  slug: string;
  color: SolutionColor;
  iconKey: SolutionIconKey | null;
  iconUrl: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  images: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  translations: SolutionTranslation[];
}

export interface SolutionInput {
  slug?: string;
  color: SolutionColor;
  iconKey: SolutionIconKey | null;
  iconUrl: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  images?: string[];
  isActive: boolean;
  order: number;
  translations: SolutionTranslation[];
}

export interface Paged<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface SolutionListArgs {
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

export const solutionApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getSolutions: b.query<Paged<Solution>, SolutionListArgs | void>({
      query: (a) => `/solutions${qs(a ?? {})}`,
      providesTags: [tagTypes.solution],
      transformResponse: (res: {
        data?: Solution[];
        meta?: Paged<Solution>["meta"];
      }): Paged<Solution> => ({
        data: res.data ?? [],
        meta: res.meta ?? { page: 1, limit: 10, total: 0 },
      }),
    }),
    createSolution: b.mutation<Solution, SolutionInput>({
      query: (body) => ({ url: "/solutions", method: "POST", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: Solution }) => res.data,
    }),
    updateSolution: b.mutation<Solution, { id: number; body: Partial<SolutionInput> }>({
      query: ({ id, body }) => ({ url: `/solutions/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: Solution }) => res.data,
    }),
    setSolutionStatus: b.mutation<Solution, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/solutions/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: Solution }) => res.data,
    }),
    setSolutionOrder: b.mutation<Solution, { id: number; order: number }>({
      query: ({ id, order }) => ({
        url: `/solutions/${id}/order`,
        method: "PATCH",
        body: { order },
      }),
      invalidatesTags: [tagTypes.solution],
      transformResponse: (res: { data: Solution }) => res.data,
    }),
    deleteSolution: b.mutation<void, number>({
      query: (id) => ({ url: `/solutions/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.solution],
    }),
  }),
});

export const {
  useGetSolutionsQuery,
  useCreateSolutionMutation,
  useUpdateSolutionMutation,
  useSetSolutionStatusMutation,
  useSetSolutionOrderMutation,
  useDeleteSolutionMutation,
} = solutionApi;
