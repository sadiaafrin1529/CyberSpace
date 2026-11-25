/**
 * Single source for the in-app API documentation. Everything here mirrors the real implementation in
 * cyberspace-backend/src/app/modules/externalApi (routes, Zod schemas, error codes). Update both together.
 */

export interface Field {
  name: string;
  type: string;
  required: boolean | string; // true | false | "when …"
  description: string;
}

export interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string; // relative to the base URL, e.g. /categories/{id}
  title: string;
  permission: string;
  summary: string;
  pathParams?: Field[];
  queryParams?: Field[];
  bodyFields?: Field[];
  /** Example request body. */
  body?: unknown;
  /** Concrete example path used in code samples. */
  examplePath?: string;
  status: number;
  response: unknown;
  errors: { status: number; code: string; when: string }[];
}

export const GROUPS = [
  { id: "categories", title: "Categories" },
  { id: "products", title: "Products" },
] as const;

const categoryExample = {
  id: 42,
  slug: "gaming-laptops",
  parentId: 12,
  nameAZ: "Oyun noutbukları",
  nameEN: "Gaming laptops",
  nameRU: "Игровые ноутбуки",
  imageUrl: null,
  isActive: true,
  order: 0,
  createdAt: "2026-11-25T09:30:12.431Z",
  updatedAt: "2026-11-25T09:30:12.431Z",
};

const productExample = {
  id: "9f1c6a52-3b0e-4d57-8a3c-2f6f1b6d9a10",
  sku: "LEN-LOQ-15-001",
  brand: "Lenovo",
  category: "gaming-laptops",
  imageUrl: "https://cdn.example.com/loq-15.jpg",
  price: "1299.9",
  currency: "USD",
  stock: 14,
  syncedAt: "2026-11-25T09:35:44.120Z",
  translations: [
    { id: 311, productId: "9f1c6a52-3b0e-4d57-8a3c-2f6f1b6d9a10", lang: "EN", name: "Lenovo LOQ 15", description: "15.6\" gaming laptop, RTX 4050." },
    { id: 312, productId: "9f1c6a52-3b0e-4d57-8a3c-2f6f1b6d9a10", lang: "AZ", name: "Lenovo LOQ 15", description: null },
  ],
};

const idParam: Field = { name: "id", type: "integer", required: true, description: "Category id." };
const productIdParam: Field = { name: "id", type: "string (UUID)", required: true, description: "Product id (the `id` field, not the SKU)." };

const commonAuthErrors = [
  { status: 401, code: "MISSING_API_KEY / INVALID_API_KEY / API_KEY_REVOKED / API_KEY_EXPIRED", when: "Key missing, unknown, revoked or expired." },
  { status: 403, code: "INSUFFICIENT_PERMISSIONS / IP_NOT_ALLOWED", when: "Key lacks the permission, or the caller IP is not on the key’s allow-list." },
  { status: 429, code: "RATE_LIMITED", when: "Rate limit exceeded. Honour the Retry-After header." },
];

const productFields: Field[] = [
  { name: "sku", type: "string (1–64)", required: true, description: "Unique stock-keeping unit. Letters, digits, space and . _ - / # +. Duplicates → 409." },
  { name: "category", type: "string (slug)", required: true, description: "Slug of an existing category at ANY nesting depth. Products reference categories by slug." },
  { name: "translations", type: "array (1–3)", required: true, description: "Per-language content. Must contain an EN entry; each lang at most once." },
  { name: "translations[].lang", type: "\"EN\" | \"AZ\" | \"RU\"", required: true, description: "Language code." },
  { name: "translations[].name", type: "string (1–200)", required: true, description: "Display name. HTML tags are stripped." },
  { name: "translations[].description", type: "string (≤5000)", required: false, description: "Plain text. HTML tags are stripped." },
  { name: "brand", type: "string (1–100) | null", required: false, description: "Brand name. Brand filters on the shop match this value exactly." },
  { name: "imageUrl", type: "string (http/https URL, ≤500) | null", required: false, description: "A single product image URL. Upload the file elsewhere and pass its public URL." },
  { name: "price", type: "number (≥0, max 2 decimals) | null", required: false, description: "Unit price. Returned by the API as a decimal string, e.g. \"1299.9\"." },
  { name: "currency", type: "string (ISO 4217, 3 letters) | null", required: "when price is set", description: "e.g. USD, EUR, AZN. Upper-cased automatically." },
  { name: "stock", type: "integer (≥0) | null", required: false, description: "Units in stock." },
];

export const ENDPOINTS: (Endpoint & { group: (typeof GROUPS)[number]["id"] })[] = [
  {
    id: "list-categories",
    group: "categories",
    method: "GET",
    path: "/categories",
    title: "List categories",
    permission: "categories:read",
    summary:
      "Returns every category. Use tree=true to get the full hierarchy as nested `children` arrays (any depth). Sorted by `order`, then `id`.",
    queryParams: [
      { name: "tree", type: "\"true\" | \"false\"", required: false, description: "Default false = flat list. true = nested tree; roots are categories with parentId null." },
      { name: "activeOnly", type: "\"true\" | \"false\"", required: false, description: "Default false. true omits inactive categories; in tree mode an inactive category hides its whole subtree." },
    ],
    examplePath: "/categories?tree=true",
    status: 200,
    response: {
      statusCode: 200,
      success: true,
      message: "Categories retrieved",
      data: [{ ...categoryExample, id: 12, slug: "laptops", parentId: null, nameEN: "Laptops", children: [{ ...categoryExample, children: [] }] }],
    },
    errors: [{ status: 400, code: "VALIDATION_ERROR", when: "tree / activeOnly is not \"true\" or \"false\"." }, ...commonAuthErrors],
  },
  {
    id: "get-category",
    group: "categories",
    method: "GET",
    path: "/categories/{id}",
    title: "Get a category",
    permission: "categories:read",
    summary: "Returns one category (flat, without children).",
    pathParams: [idParam],
    examplePath: "/categories/42",
    status: 200,
    response: { statusCode: 200, success: true, message: "Category retrieved", data: categoryExample },
    errors: [{ status: 400, code: "VALIDATION_ERROR", when: "id is not a positive integer." }, { status: 404, code: "NOT_FOUND", when: "No category with this id." }, ...commonAuthErrors],
  },
  {
    id: "create-category",
    group: "categories",
    method: "POST",
    path: "/categories",
    title: "Create a category or sub-category",
    permission: "categories:create",
    summary:
      "Creates a root category (omit the parent) or a sub-category at any depth (set parentId or parentSlug to an existing category). The parent must exist; slugs are globally unique.",
    bodyFields: [
      { name: "nameEN", type: "string (1–100)", required: true, description: "English name. English is the fallback language, so it is mandatory." },
      { name: "slug", type: "string (2–80)", required: false, description: "Lowercase letters, digits and single hyphens. Generated from nameEN when omitted. Must be unique across ALL categories → 409." },
      { name: "parentId", type: "integer | null", required: false, description: "Id of the parent. null or omitted = root category." },
      { name: "parentSlug", type: "string", required: false, description: "Alternative to parentId. If both are sent they must refer to the same category." },
      { name: "nameAZ", type: "string (≤100)", required: false, description: "Azerbaijani name. Defaults to an empty string." },
      { name: "nameRU", type: "string (≤100)", required: false, description: "Russian name. Defaults to an empty string." },
      { name: "imageUrl", type: "string (≤500) | null", required: false, description: "Category image URL." },
      { name: "isActive", type: "boolean", required: false, description: "Defaults to true." },
      { name: "order", type: "integer (0–100000)", required: false, description: "Sort position among siblings. Defaults to 0." },
    ],
    body: { slug: "gaming-laptops", parentSlug: "laptops", nameEN: "Gaming laptops", nameAZ: "Oyun noutbukları", nameRU: "Игровые ноутбуки" },
    status: 201,
    response: { statusCode: 201, success: true, message: "Category created", data: categoryExample },
    errors: [
      { status: 400, code: "VALIDATION_ERROR", when: "Invalid or unknown fields (the body is strict), or parentId/parentSlug mismatch." },
      { status: 404, code: "NOT_FOUND / PARENT_NOT_FOUND", when: "The parent category does not exist." },
      { status: 409, code: "CONFLICT", when: "A category with this slug already exists." },
      ...commonAuthErrors,
    ],
  },
  {
    id: "update-category",
    group: "categories",
    method: "PATCH",
    path: "/categories/{id}",
    title: "Update or move a category",
    permission: "categories:update",
    summary:
      "Partial update: send only the fields to change (at least one). Set parentId to move the category (with its whole subtree) under another parent, or null to make it a root. A category cannot become its own parent or move under one of its own descendants.",
    pathParams: [idParam],
    bodyFields: [
      { name: "slug", type: "string (2–80)", required: false, description: "Cannot be changed while products use the current slug (409 CATEGORY_IN_USE)." },
      { name: "parentId", type: "integer | null", required: false, description: "New parent, or null for root." },
      { name: "nameEN / nameAZ / nameRU", type: "string (≤100)", required: false, description: "Names. nameEN cannot be empty." },
      { name: "imageUrl", type: "string | null", required: false, description: "Image URL." },
      { name: "isActive", type: "boolean", required: false, description: "Show/hide the category (and, in tree mode, its subtree)." },
      { name: "order", type: "integer (0–100000)", required: false, description: "Sort position." },
    ],
    body: { nameEN: "Gaming notebooks", order: 2 },
    examplePath: "/categories/42",
    status: 200,
    response: { statusCode: 200, success: true, message: "Category updated", data: { ...categoryExample, nameEN: "Gaming notebooks", order: 2 } },
    errors: [
      { status: 400, code: "VALIDATION_ERROR / BAD_REQUEST", when: "Empty body, unknown field, own parent, or move under a descendant (cycle)." },
      { status: 404, code: "NOT_FOUND", when: "Category or new parent not found." },
      { status: 409, code: "CONFLICT / CATEGORY_IN_USE", when: "Slug already taken, or slug change blocked by products." },
      ...commonAuthErrors,
    ],
  },
  {
    id: "delete-category",
    group: "categories",
    method: "DELETE",
    path: "/categories/{id}",
    title: "Delete a category",
    permission: "categories:delete",
    summary: "Deletes a leaf category. Refused while it has sub-categories or while any product uses it, so nothing is ever orphaned.",
    pathParams: [idParam],
    examplePath: "/categories/42",
    status: 200,
    response: { statusCode: 200, success: true, message: "Category deleted" },
    errors: [
      { status: 404, code: "NOT_FOUND", when: "No category with this id." },
      { status: 409, code: "CONFLICT / CATEGORY_IN_USE", when: "Has sub-categories, or products still reference it." },
      ...commonAuthErrors,
    ],
  },
  {
    id: "list-products",
    group: "products",
    method: "GET",
    path: "/products",
    title: "List products",
    permission: "products:read",
    summary:
      "Paginated product list, newest first. Unlike the public shop, prices and stock are always included (the website’s ‘show prices/stock’ visibility settings do not apply to authorised API keys). Filtering by a category includes all of its descendants.",
    queryParams: [
      { name: "category", type: "string (comma-separated slugs)", required: false, description: "Category slug(s). Sub-categories at every depth are included automatically." },
      { name: "categoryId", type: "string (comma-separated ids)", required: false, description: "Same as category, by id." },
      { name: "brand", type: "string (comma-separated)", required: false, description: "Exact brand match." },
      { name: "q", type: "string (≤100)", required: false, description: "Case-insensitive search in SKU, brand and product names." },
      { name: "minPrice / maxPrice", type: "number ≥ 0", required: false, description: "Price range." },
      { name: "page", type: "integer ≥ 1", required: false, description: "Default 1." },
      { name: "limit", type: "integer 1–100", required: false, description: "Default 20." },
    ],
    examplePath: "/products?category=laptops&limit=20",
    status: 200,
    response: {
      statusCode: 200,
      success: true,
      message: "Products retrieved",
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      data: [productExample],
    },
    errors: [{ status: 400, code: "VALIDATION_ERROR", when: "Invalid query parameter." }, ...commonAuthErrors],
  },
  {
    id: "get-product",
    group: "products",
    method: "GET",
    path: "/products/{id}",
    title: "Get a product",
    permission: "products:read",
    summary: "Returns one product with all of its translations.",
    pathParams: [productIdParam],
    examplePath: "/products/9f1c6a52-3b0e-4d57-8a3c-2f6f1b6d9a10",
    status: 200,
    response: { statusCode: 200, success: true, message: "Product retrieved", data: productExample },
    errors: [{ status: 404, code: "NOT_FOUND", when: "No product with this id." }, ...commonAuthErrors],
  },
  {
    id: "get-product-by-sku",
    group: "products",
    method: "GET",
    path: "/products/sku/{sku}",
    title: "Get a product by SKU",
    permission: "products:read",
    summary: "Exact SKU lookup (URL-encode the SKU). Handy for idempotent syncs from an ERP.",
    pathParams: [{ name: "sku", type: "string", required: true, description: "The product SKU (URL-encoded)." }],
    examplePath: "/products/sku/LEN-LOQ-15-001",
    status: 200,
    response: { statusCode: 200, success: true, message: "Product retrieved", data: productExample },
    errors: [{ status: 404, code: "NOT_FOUND", when: "No product with this SKU." }, ...commonAuthErrors],
  },
  {
    id: "create-product",
    group: "products",
    method: "POST",
    path: "/products",
    title: "Create a product",
    permission: "products:create",
    summary:
      "Creates a product through the same service the admin panel uses. The category must already exist (create it first with POST /categories). Unknown fields are rejected, so id and syncedAt cannot be set.",
    bodyFields: productFields,
    body: {
      sku: "LEN-LOQ-15-001",
      brand: "Lenovo",
      category: "gaming-laptops",
      imageUrl: "https://cdn.example.com/loq-15.jpg",
      price: 1299.9,
      currency: "USD",
      stock: 14,
      translations: [
        { lang: "EN", name: "Lenovo LOQ 15", description: "15.6\" gaming laptop, RTX 4050." },
        { lang: "AZ", name: "Lenovo LOQ 15" },
      ],
    },
    status: 201,
    response: { statusCode: 201, success: true, message: "Product created", data: productExample },
    errors: [
      { status: 400, code: "VALIDATION_ERROR / BAD_REQUEST", when: "Missing EN translation, invalid price/currency/URL, unknown field, or the category does not exist." },
      { status: 409, code: "CONFLICT", when: "SKU already exists." },
      { status: 422, code: "IDEMPOTENCY_KEY_REUSED", when: "Idempotency-Key reused with a different request." },
      ...commonAuthErrors,
    ],
  },
  {
    id: "update-product",
    group: "products",
    method: "PATCH",
    path: "/products/{id}",
    title: "Update a product",
    permission: "products:update",
    summary:
      "Partial update (at least one field). If `translations` is sent it REPLACES the whole set of translations, so include every language you want to keep. Send null to clear brand, imageUrl, price, currency or stock.",
    pathParams: [productIdParam],
    bodyFields: productFields.filter((f) => !f.name.startsWith("translations[")).map((f) => ({ ...f, required: false })),
    body: { price: 1199, currency: "USD", stock: 9 },
    examplePath: "/products/9f1c6a52-3b0e-4d57-8a3c-2f6f1b6d9a10",
    status: 200,
    response: { statusCode: 200, success: true, message: "Product updated", data: { ...productExample, price: "1199", stock: 9 } },
    errors: [
      { status: 400, code: "VALIDATION_ERROR / BAD_REQUEST", when: "Empty body, invalid value, or unknown category." },
      { status: 404, code: "NOT_FOUND", when: "No product with this id." },
      { status: 409, code: "CONFLICT", when: "New SKU already used by another product." },
      ...commonAuthErrors,
    ],
  },
  {
    id: "delete-product",
    group: "products",
    method: "DELETE",
    path: "/products/{id}",
    title: "Delete a product",
    permission: "products:delete",
    summary: "Permanently deletes a product and its translations. Refused while customer inquiries reference it (solution-bundle links are detached automatically).",
    pathParams: [productIdParam],
    examplePath: "/products/9f1c6a52-3b0e-4d57-8a3c-2f6f1b6d9a10",
    status: 200,
    response: { statusCode: 200, success: true, message: "Product deleted" },
    errors: [
      { status: 404, code: "NOT_FOUND", when: "No product with this id." },
      { status: 409, code: "IN_USE", when: "Customer inquiries still reference the product." },
      ...commonAuthErrors,
    ],
  },
];

// ------------------------------------------------------------- code samples

const KEY_PLACEHOLDER = "YOUR_API_KEY";

export function curlSample(baseUrl: string, e: Pick<Endpoint, "method" | "path" | "examplePath" | "body">, opts: { idempotency?: boolean } = {}) {
  const url = `${baseUrl}${e.examplePath ?? e.path}`;
  const parts = [`curl -X ${e.method} "${url}"`, `  -H "X-API-Key: ${KEY_PLACEHOLDER}"`];
  if (opts.idempotency) parts.push(`  -H "Idempotency-Key: $(uuidgen)"`);
  if (e.body !== undefined) {
    parts.push(`  -H "Content-Type: application/json"`);
    parts.push(`  -d '${JSON.stringify(e.body, null, 2).replace(/'/g, "'\\''")}'`);
  }
  return parts.join(" \\\n");
}

export function fetchSample(baseUrl: string, e: Pick<Endpoint, "method" | "path" | "examplePath" | "body">, opts: { idempotency?: boolean } = {}) {
  const url = `${baseUrl}${e.examplePath ?? e.path}`;
  const headers = [`    "X-API-Key": process.env.CYBERSPACE_API_KEY, // never hard-code or expose the key`];
  if (opts.idempotency) headers.push(`    "Idempotency-Key": crypto.randomUUID(),`);
  if (e.body !== undefined) headers.push(`    "Content-Type": "application/json",`);
  const lines = [`const res = await fetch("${url}", {`, `  method: "${e.method}",`, `  headers: {`, ...headers, `  },`];
  if (e.body !== undefined) lines.push(`  body: JSON.stringify(${JSON.stringify(e.body, null, 2).replace(/\n/g, "\n  ")}),`);
  lines.push(`});`, `const json = await res.json();`, `if (!res.ok) throw new Error(\`\${json.code}: \${json.message}\`);`, `console.log(json.data);`);
  return lines.join("\n");
}

export const pretty = (v: unknown) => JSON.stringify(v, null, 2);

export const ERROR_EXAMPLE = {
  statusCode: 400,
  success: false,
  message: "Request validation failed",
  code: "VALIDATION_ERROR",
  error: [{ path: "translations", message: "An EN (English) translation is required" }],
};

export const ERROR_CODES: { status: number; code: string; meaning: string }[] = [
  { status: 400, code: "VALIDATION_ERROR", meaning: "Body or query failed validation. `error[]` lists each field `path` and message." },
  { status: 400, code: "INVALID_JSON / INVALID_BODY", meaning: "Body is not valid JSON, or is not a JSON object." },
  { status: 401, code: "MISSING_API_KEY", meaning: "No X-API-Key header." },
  { status: 401, code: "INVALID_API_KEY", meaning: "Key is malformed or unknown." },
  { status: 401, code: "API_KEY_REVOKED", meaning: "The key was revoked in Settings." },
  { status: 401, code: "API_KEY_EXPIRED", meaning: "The key passed its expiration date." },
  { status: 401, code: "API_KEY_OWNER_INACTIVE", meaning: "The admin who issued the key was deactivated or demoted." },
  { status: 403, code: "INSUFFICIENT_PERMISSIONS", meaning: "The key does not include the permission the endpoint needs." },
  { status: 403, code: "IP_NOT_ALLOWED", meaning: "The caller IP is not on the key’s allow-list." },
  { status: 404, code: "NOT_FOUND / ENDPOINT_NOT_FOUND / PARENT_NOT_FOUND", meaning: "Resource or endpoint does not exist." },
  { status: 409, code: "CONFLICT / CATEGORY_IN_USE / IN_USE", meaning: "Duplicate slug or SKU, or the record is still referenced." },
  { status: 413, code: "PAYLOAD_TOO_LARGE", meaning: "Body exceeds 256 KB." },
  { status: 422, code: "IDEMPOTENCY_KEY_REUSED", meaning: "Same Idempotency-Key used with a different request." },
  { status: 429, code: "RATE_LIMITED", meaning: "Too many requests; see Retry-After." },
  { status: 500, code: "INTERNAL_ERROR", meaning: "Unexpected server error. Details are logged server-side only." },
];
