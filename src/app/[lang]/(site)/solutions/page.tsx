import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { SOLUTION_LABELS } from "@/lib/solutions-text";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import type { SolutionCategory } from "@/redux/fetchers/solution/solutionApi";
import SolutionsGrid from "@/components/solutions/SolutionsGrid";
import SolutionsHead from "@/components/solutions/SolutionsHead";

/** null (not []) on failure, so the page can tell "backend down" from "nothing published yet". */
const fetchCategories = () =>
  serverGet<SolutionCategory[] | null>("/solutions/categories", null, [CACHE_TAGS.solutions]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMeta(lang, "/solutions", getDict(lang).nav.solutions, SOLUTION_LABELS[lang].hint);
}

export default async function SolutionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const categories = await fetchCategories();

  return (
    <section className="solx-section solx-section--page" aria-labelledby="solutions-title">
      <div className="container">
        <SolutionsHead lang={lang} titleId="solutions-title" />
        <SolutionsGrid categories={categories} lang={lang} />
      </div>
    </section>
  );
}
