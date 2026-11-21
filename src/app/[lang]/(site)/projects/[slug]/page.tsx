import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import type { Project } from "@/redux/fetchers/project/projectApi";
import { FadeDown, FadeUp } from "@/components/Motion";
import ProjectGallery from "@/components/projects/ProjectGallery";
import { PROJECT_LABELS } from "@/components/projects/labels";
import { projectDetailText } from "@/components/projects/types";

/** Backend answers 404 for an unknown slug, which serverGet turns into null. */
const fetchProject = (slug: string) =>
  serverGet<Project | null>(`/projects/${encodeURIComponent(slug)}`, null, [
    CACHE_TAGS.projects,
  ]);

const paragraphs = (text: string | null) =>
  (text ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const project = await fetchProject(slug);
  if (!project) return {};
  const x = projectDetailText(project, lang);
  return pageMeta(
    lang,
    `/projects/${project.slug}`,
    x.title,
    x.shortDescription || x.description?.slice(0, 160) || x.title,
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = await fetchProject(slug);
  if (!project) notFound();

  const t = getDict(lang);
  const L = PROJECT_LABELS[lang];
  const x = projectDetailText(project, lang);
  const body = paragraphs(x.description);

  return (
    <>
      <section className="pagehero">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <Link href={`/${lang}`}>{t.nav.home}</Link>
            <span>/</span>
            <Link href={`/${lang}/projects`}>{t.nav.projects}</Link>
            <span>/</span>
            <span>{x.title}</span>
          </nav>
          <FadeDown>
            <span className="proj-hero-chip">{x.category}</span>
            <h1>{x.title}</h1>
            {x.shortDescription && <p>{x.shortDescription}</p>}
          </FadeDown>
        </div>
      </section>

      <div className="info-body">
        <section className="container section">
          <FadeUp className="proj-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.coverImage} alt={x.title} />
          </FadeUp>

          {body.length > 0 && (
            <FadeUp className="proj-detail">
              <h2>{L.details}</h2>
              {body.map((p, i) => (
                <p key={i} className="prose">
                  {p}
                </p>
              ))}
            </FadeUp>
          )}

          {project.images.length > 0 && (
            <FadeUp className="proj-detail">
              <h2>{L.gallery}</h2>
              <ProjectGallery images={project.images} title={x.title} />
            </FadeUp>
          )}

          <Link href={`/${lang}/projects`} className="btn btn--ghost proj-back">
            ← {L.back}
          </Link>
        </section>
      </div>
    </>
  );
}
