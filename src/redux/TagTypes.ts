export const tagTypes = {
  user: "user",
  product: "product",
  inquiry: "inquiry",
  settings: "settings",
  partner: "partner",
  news: "news",
  category: "category",
  careerPage: "careerPage",
  careerBenefit: "careerBenefit",
  careerExpertise: "careerExpertise",
  careerGallery: "careerGallery",
  careerOpportunity: "careerOpportunity",
  careerApplication: "careerApplication",
} as const;

export type TagType = (typeof tagTypes)[keyof typeof tagTypes];
