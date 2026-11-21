"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProjectSummary } from "@/redux/fetchers/project/projectApi";
import { useLang } from "@/lib/useLang";
import { FadeUp } from "@/components/Motion";
import { PROJECT_LABELS } from "./labels";
import { categoryName, projectCardText, type PublicCategory } from "./types";

/** Category tabs are built from the categories the backend returns; "All Projects" is always first. */
export default function ProjectsGrid({
  projects,
  categories,
}: {
  projects: ProjectSummary[];
  categories: PublicCategory[];
}) {
  const { lang } = useLang();
  const L = PROJECT_LABELS[lang];
  const [active, setActive] = useState("");

  const tabs = categories;
  const shown = active ? projects.filter((p) => p.category.slug === active) : projects;

  return (
    <>
      {(
        <div className="proj-tabs" role="tablist" aria-label={L.categoriesNav}>
          {[{ id: 0, name: L.all, slug: "" }, ...tabs.map((c) => ({ ...c, name: categoryName(c, lang) }))].map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active === c.slug}
              className={`proj-tab${active === c.slug ? " is-active" : ""}`}
              onClick={() => setActive(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="muted proj-empty">{active ? L.emptyCategory : L.empty}</p>
      ) : (
        <div className="proj-grid">
          {shown.map((p, i) => {
            const x = projectCardText(p, lang);
            return (
              <FadeUp key={p.id} delay={(i % 3) * 0.07}>
                <Link href={`/${lang}/projects/${p.slug}`} className="proj-card">
                  <div className="proj-card__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.coverImage} alt={x.title} loading="lazy" />
                    <span className="proj-card__chip">{x.category}</span>
                  </div>
                  <div className="proj-card__body">
                    <h3>{x.title}</h3>
                    {x.shortDescription && <p>{x.shortDescription}</p>}
                    <span className="proj-card__more">
                      {L.view} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      )}
    </>
  );
}
