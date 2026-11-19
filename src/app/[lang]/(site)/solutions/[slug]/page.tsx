import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import { FadeDown, FadeUp } from "@/components/Motion";
import SolutionIcon from "@/components/solutions/SolutionIcon";
import { paragraphs, pickTranslation, safeColor } from "@/components/solutions/types";
import type { Solution } from "@/redux/fetchers/solution/solutionApi";

/** Backend answers 404 for unknown and for inactive slugs, so both end up as notFound(). */
const fetchSolution = (slug: string) =>
  serverGet<Solution | null>(`/solutions/active/${encodeURIComponent(slug)}`, null, [
    CACHE_TAGS.solutions,
  ]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const solution = await fetchSolution(slug);
  if (!solution) return {};
  const tr = pickTranslation(solution, lang);
  return pageMeta(
    lang,
    `/solutions/${solution.slug}`,
    tr.seoTitle || tr.title,
    tr.seoDescription || tr.shortDescription,
  );
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const solution = await fetchSolution(slug);
  if (!solution) notFound();

  const t = getDict(lang);
  const L = lang as Locale;
  const tr = pickTranslation(solution, L);
  const body = paragraphs(tr.description);

  return (
    <>
      <section className="pagehero">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <Link href={`/${lang}`}>{t.nav.home}</Link>
            <span>/</span>
            <Link href={`/${lang}/solutions`}>{t.nav.solutions}</Link>
            <span>/</span>
            <span>{tr.title}</span>
          </nav>
          <FadeDown>
            <h1>{tr.title}</h1>
            <p>{tr.shortDescription}</p>
          </FadeDown>
        </div>
      </section>

      <div className="info-body">
        <section className="container section">
          <div className="sol-detail">
            <FadeUp className="sol-detail__main">
              {body.length > 0 ? (
                body.map((p, i) => (
                  <p key={i} className="prose">
                    {p}
                  </p>
                ))
              ) : (
                <p className="prose">{tr.shortDescription}</p>
              )}
            </FadeUp>

            <FadeUp
              delay={0.08}
              className={`sol-card sol-card--${safeColor(solution.color)} sol-detail__aside`}
            >
              <div className="sol-card__icon">
                <SolutionIcon solution={solution} />
              </div>
              {tr.features.length > 0 && (
                <ul className="sol-card__list">
                  {tr.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
              <Link href={`/${lang}/contact`} className="btn btn--primary">
                {{ en: "Contact us", az: "Bizimlə əlaqə", ru: "Связаться с нами" }[L]}
              </Link>
              <Link href={`/${lang}/shop`} className="sol-card__link">
                {
                  {
                    en: "Browse products →",
                    az: "Məhsullara bax →",
                    ru: "Смотреть продукты →",
                  }[L]
                }
              </Link>
            </FadeUp>
          </div>
        </section>
      </div>
    </>
  );
}
