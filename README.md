# Cyberspace Web

Next.js frontend for Cyberspace, a multi-language (AZ / EN / RU) IT products and services website with a full admin dashboard. All data comes from [`cyberspace-backend`](https://github.com/mohammodrubel/cyberspace-backend) (Express + Prisma + PostgreSQL).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4 (plus a hand-written design system in `src/app/globals.css`), Radix UI, lucide-react, framer-motion
- **State / data:** Redux Toolkit + RTK Query (client), `fetch` with ISR + cache tags (server components), redux-persist
- **Auth:** JWT in an HTTP cookie; the role is read in `src/middleware.ts` to protect the dashboards
- **i18n:** dictionary-based (`src/lib/i18n.ts`), URL prefix `/{az|en|ru}`
- **Tooling:** TypeScript, Prettier

## Features

### Public website

| Area | Route | Notes |
|---|---|---|
| Home | `/[lang]` | Hero, categories, partners carousel, latest news |
| Products | `/[lang]/shop`, `/[lang]/shop/[id]` | Filters, sorting, grid/list view, product details, inquiry form |
| News | `/[lang]/news`, `/[lang]/news/[slug]` | Published articles |
| Careers | `/[lang]/careers`, `/[lang]/careers/[slug]` | Open vacancies and application form with CV upload |
| Solutions | `/[lang]/solutions`, `/[lang]/solutions/[slug]` | 100% database-driven: categories, bundles, items, features; homepage section. Inquiry buttons reuse the product inquiry modal |
| About, Contact | `/[lang]/about`, `/[lang]/contact` | Office map (Mapbox), FAQ |
| Search | header search icon | Live product search modal (see below) |

**Search modal.** Opens from the header search icon. Debounced live search over product names (all languages), part number, brand, category and description; matches are highlighted, results are a compact scrollable list, and each row links to the product details page. Keyboard: arrow keys, Enter, Esc. Full-screen on phones. Before typing it shows real brands and categories, never products.

**Cards.** News, product and category cards use reserved, line-clamped text areas so every card in a row has the same height.

### Admin dashboard (`/[lang]/dashboard/admin`, role `ADMIN`)

Overview, Products, Categories, Inquiries, Users, Partners, News, **Solutions** (categories and bundles), Jobs, Applications, Settings, Change password.

### Sales dashboard (`/[lang]/dashboard/sales`, role `SALES`)

Inquiries assigned to or submitted by the sales user, change password.

## How data flows

- **Server components** (public pages) call the backend with `serverGet` (`src/lib/server-api.ts`): cached for 60 seconds and tagged (`news`, `partners`, `categories`, `products`).
- **Admin mutations** go through the Next.js API routes in `src/app/api/*`, which attach the auth cookie as a Bearer token, forward the request to the backend and, when it succeeds, revalidate the matching cache tag. A change saved in the dashboard therefore shows up on the public site immediately.
- **Client components** (dashboard, search, forms) use RTK Query (`src/redux/fetchers/*`) against the same `/api/*` routes.

## Project structure

```
src/
  app/
    [lang]/(site)/        public pages (home, shop, news, careers, about, contact)
    [lang]/dashboard/     admin and sales dashboards
    [lang]/login|register auth pages
    api/                  proxy routes to the backend
    globals.css           design system and component styles
  components/             shared UI (Header, SearchModal, ProductCard, dashboard/*, ui/*)
  lib/                    i18n, API helpers, search logic, formatting, SEO
  redux/                  store and RTK Query endpoints (fetchers/*)
  data/                   catalog types and fallback category list
  middleware.ts           locale redirect + dashboard role protection
```

## Getting started

### Prerequisites

- Node.js (LTS) and npm
- A running instance of [`cyberspace-backend`](https://github.com/mohammodrubel/cyberspace-backend)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
# Base URL of the backend API
BACKEND_URL="http://localhost:9000/api"

# Mapbox public token for the office map on the Contact page
NEXT_PUBLIC_MAPBOX_TOKEN="<your-mapbox-public-token>"
```

`.env.local` must never be committed.

### 3. Run the dev server

```bash
npm run dev
```

The app runs at `http://localhost:3000` (the root redirects to the default language).

### 4. Build for production

```bash
npm run build
npm start
```

## Scripts

| Script | Description |
|---|---|
| `dev` | Start the Next.js dev server |
| `build` | Production build |
| `start` | Run the production build |
| `lint` | Type check (`tsc --noEmit`) |
| `format` / `format:check` | Prettier write / check |

## Adding or changing translations

All UI text lives in `src/lib/i18n.ts` as three dictionaries (`az`, `en`, `ru`). Add a key to all three. Content that admins manage (products, news, jobs, categories) is stored per language in the database instead.
