import type { Locale } from "@/lib/i18n";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import type { SolutionCategory } from "@/redux/fetchers/solution/solutionApi";
import SolutionsGrid from "./SolutionsGrid";
import SolutionsHead from "./SolutionsHead";

/** Homepage section: active categories with "show on homepage" switched on, in admin order. */
export default async function HomeSolutions({ lang }: { lang: Locale }) {
  const categories = await serverGet<SolutionCategory[] | null>(
    "/solutions/categories?home=true",
    null,
    [CACHE_TAGS.solutions],
  );
  // Nothing published for the homepage: hide the section instead of showing an empty block.
  if (categories && categories.length === 0) return null;
  return (
    <section className="solx-section" aria-labelledby="home-solutions-title">
      <div className="container">
        <SolutionsHead lang={lang} titleId="home-solutions-title" />
        <SolutionsGrid categories={categories} lang={lang} />
      </div>
    </section>
  );
}
