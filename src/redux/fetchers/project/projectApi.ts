import { baseApi } from "../api/baseApi";
import { tagTypes } from "@/redux/TagTypes";

export type ProjectLang = "EN" | "AZ" | "RU";
export const PROJECT_LANGS: ProjectLang[] = ["EN", "AZ", "RU"];

export interface ProjectCategoryTranslation {
  lang: ProjectLang;
  name: string;
}

export interface ProjectCategory {
  id: number;
  /** EN name (fallback: first language); stable across dashboard languages. */
  name: string;
  slug: string;
  createdAt: string;
  translations: ProjectCategoryTranslation[];
  _count?: { projects: number };
}

export interface ProjectCategoryInput {
  slug?: string;
  translations: ProjectCategoryTranslation[];
}

export interface ProjectTranslation {
  lang: ProjectLang;
  title: string;
  shortDescription: string | null;
  description: string | null;
}

/** Listing item (no long description or gallery). */
export interface ProjectSummary {
  id: number;
  slug: string;
  /** EN title (fallback: first language). */
  title: string;
  coverImage: string;
  createdAt: string;
  translations: Pick<ProjectTranslation, "lang" | "title" | "shortDescription">[];
  category: {
    id: number;
    slug: string;
    name: string;
    translations: ProjectCategoryTranslation[];
  };
}

export interface Project extends Omit<ProjectSummary, "translations"> {
  images: string[];
  categoryId: number;
  translations: ProjectTranslation[];
}

export interface ProjectInput {
  categoryId: number;
  coverImage: string;
  images: string[];
  translations: ProjectTranslation[];
}

export interface Paged<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface ProjectListArgs {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

const qs = (o: object) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const projectApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getProjects: b.query<Paged<ProjectSummary>, ProjectListArgs | void>({
      query: (a) => `/projects${qs(a ?? {})}`,
      providesTags: [tagTypes.project],
      transformResponse: (res: {
        data?: ProjectSummary[];
        meta?: Paged<ProjectSummary>["meta"];
      }): Paged<ProjectSummary> => ({
        data: res.data ?? [],
        meta: res.meta ?? { page: 1, limit: 10, total: 0 },
      }),
    }),
    getProject: b.query<Project, number>({
      query: (id) => `/projects/${id}`,
      providesTags: [tagTypes.project],
      transformResponse: (res: { data: Project }) => res.data,
    }),
    createProject: b.mutation<Project, ProjectInput>({
      query: (body) => ({ url: "/projects", method: "POST", body }),
      invalidatesTags: [tagTypes.project, tagTypes.projectCategory],
      transformResponse: (res: { data: Project }) => res.data,
    }),
    updateProject: b.mutation<Project, { id: number; body: Partial<ProjectInput> }>({
      query: ({ id, body }) => ({ url: `/projects/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.project, tagTypes.projectCategory],
      transformResponse: (res: { data: Project }) => res.data,
    }),
    deleteProject: b.mutation<void, number>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.project, tagTypes.projectCategory],
    }),

    getProjectCategories: b.query<ProjectCategory[], void>({
      query: () => "/project-categories",
      providesTags: [tagTypes.projectCategory],
      transformResponse: (res: { data?: ProjectCategory[] }) => res.data ?? [],
    }),
    createProjectCategory: b.mutation<ProjectCategory, ProjectCategoryInput>({
      query: (body) => ({ url: "/project-categories", method: "POST", body }),
      invalidatesTags: [tagTypes.projectCategory],
      transformResponse: (res: { data: ProjectCategory }) => res.data,
    }),
    updateProjectCategory: b.mutation<
      ProjectCategory,
      { id: number; body: Partial<ProjectCategoryInput> }
    >({
      query: ({ id, body }) => ({ url: `/project-categories/${id}`, method: "PATCH", body }),
      invalidatesTags: [tagTypes.projectCategory, tagTypes.project],
      transformResponse: (res: { data: ProjectCategory }) => res.data,
    }),
    deleteProjectCategory: b.mutation<void, number>({
      query: (id) => ({ url: `/project-categories/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.projectCategory],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectCategoriesQuery,
  useCreateProjectCategoryMutation,
  useUpdateProjectCategoryMutation,
  useDeleteProjectCategoryMutation,
} = projectApi;
