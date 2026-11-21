import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { ABOUT } from "@/lib/about-content";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import type { ProjectSummary } from "@/redux/fetchers/project/projectApi";
import { FadeDown, FadeUp } from "@/components/Motion";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { PROJECT_LABELS } from "@/components/projects/labels";
import type { PublicCategory } from "@/components/projects/types";

/** Third About Us section is the project experience paragraph set; its first paragraph is the intro. */
const introText = (lang: "en" | "az" | "ru") => ABOUT[lang].sections[2]?.paras[0] ?? ABOUT[lang].intro.text;

/** null (not []) on failure, so the page can tell "backend down" from "no projects yet". */
const fetchProjects = () =>
  serverGet<ProjectSummary[] | null>("/projects?limit=100", null, [CACHE_TAGS.projects]);
const fetchCategories = () =>
  serverGet<PublicCategory[] | null>("/project-categories", null, [CACHE_TAGS.projectCategories]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMeta(lang, "/projects", getDict(lang).nav.projects, introText(lang));
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const L = PROJECT_LABELS[lang];
  const [projects, categories] = await Promise.all([fetchProjects(), fetchCategories()]);

  return (
    <>
      <section className="pagehero">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <a href={`/${lang}`}>{t.nav.home}</a>
            <span>/</span>
            <span>{t.nav.projects}</span>
          </nav>
          <FadeDown>
            <h1>{t.nav.projects}</h1>
            <p>{introText(lang)}</p>
          </FadeDown>
        </div>
      </section>

      <div className="info-body">
        <section className="container section">
          {projects === null || categories === null ? (
            <FadeUp>
              <p className="muted proj-empty" role="alert">
                {L.error}
              </p>
            </FadeUp>
          ) : (
            <ProjectsGrid projects={projects} categories={categories} />
          )}
        </section>
      </div>
    </>
  );
}
