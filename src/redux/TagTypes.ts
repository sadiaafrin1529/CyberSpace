export const tagTypes = {
  user: "user",
  product: "product",
  inquiry: "inquiry",
  settings: "settings",
  partner: "partner",
  news: "news",
  category: "category",
  job: "job",
  jobApplication: "jobApplication",
  solution: "solution",
  project: "project",
  projectCategory: "projectCategory",
} as const;

export type TagType = (typeof tagTypes)[keyof typeof tagTypes];
