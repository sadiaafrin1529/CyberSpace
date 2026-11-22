import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { SOLUTION_LABELS } from "@/lib/solutions-text";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import type {
  SolutionCategory,
  SolutionCategoryDetail,
} from "@/redux/fetchers/solution/solutionApi";
import { FadeUp } from "@/components/Motion";
import SectionAccordion from "@/components/solutions/SectionAccordion";
import SolutionIcon from "@/components/solutions/SolutionIcon";
import { accentStyle, categoryText } from "@/components/solutions/types";

/** Backend answers 404 for an unknown or disabled category, which serverGet turns into null. */
const fetchCategory = (slug: string) =>
  serverGet<SolutionCategoryDetail | null>(
    `/solutions/categories/${encodeURIComponent(slug)}`,
    null,
    [CACHE_TAGS.solutions],
  );
const fetchTabs = () =>
  serverGet<SolutionCategory[] | null>("/solutions/categories", null, [CACHE_TAGS.solutions]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const category = await fetchCategory(slug);
  if (!category) return {};
  const c = categoryText(category, lang);
  return pageMeta(lang, `/solutions/${category.slug}`, c.name, c.description || c.name);
}

export default async function SolutionCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [category, tabs] = await Promise.all([fetchCategory(slug), fetchTabs()]);
  if (!category) notFound();

  const L = SOLUTION_LABELS[lang];
  const c = categoryText(category, lang);

  return (
    <section className="solx-section solx-section--page" style={accentStyle(category.accentColor)}>
      <div className="container">
        <div className="solx-topbar">
          <Link href={`/${lang}/solutions`} className="solx-back">
            <span aria-hidden="true">←</span> {L.allSolutions}
          </Link>
          {tabs && tabs.length > 0 && (
            <nav className="solx-tabs" aria-label={L.allCategories}>
              {tabs.map((tab) => {
                const active = tab.slug === category.slug;
                return (
                  <Link
                    key={tab.id}
                    href={`/${lang}/solutions/${tab.slug}`}
                    className={`solx-tab${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    style={accentStyle(tab.accentColor)}
                  >
                    {categoryText(tab, lang).name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <FadeUp className="solx-header">
          <span className="solx-header__icon">
            <SolutionIcon icon={category.icon ?? category.image} size={28} />
          </span>
          <div>
            <h1 className="solx-header__title">{c.name}</h1>
            {c.description && <p className="solx-header__desc">{c.description}</p>}
            <p className="solx-header__hint">{c.instruction ?? L.sectionHint}</p>
          </div>
        </FadeUp>

        {category.sections.length === 0 ? (
          <p className="muted">{L.noBundles}</p>
        ) : (
          <SectionAccordion sections={category.sections} lang={lang} />
        )}
      </div>
    </section>
  );
}
