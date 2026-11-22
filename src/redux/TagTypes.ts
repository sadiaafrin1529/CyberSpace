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
  project: "project",
  projectCategory: "projectCategory",
  solution: "solution",
} as const;

export type TagType = (typeof tagTypes)[keyof typeof tagTypes];
