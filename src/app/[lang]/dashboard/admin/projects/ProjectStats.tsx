"use client";

import { FolderKanban, Layers } from "lucide-react";
import {
  useGetProjectsQuery,
  useGetProjectCategoriesQuery,
} from "@/redux/fetchers/project/projectApi";

const shortDate = (s: string) =>
  new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Overview cards computed from the real project / category data (nothing hard-coded). */
export default function ProjectStats({ lang }: { lang: string }) {
  const { data: projectsData, isLoading: l1 } = useGetProjectsQuery({ limit: 100 });
  const { data: categories = [], isLoading: l2 } = useGetProjectCategoriesQuery();
  const loading = l1 || l2;

  const total = projectsData?.meta.total ?? 0;
  const recent = (projectsData?.data ?? []).slice(0, 3); // API returns newest first
  const byCategory = [...categories]
    .map((c) => ({ id: c.id, name: c.name, count: c._count?.projects ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);
  const max = Math.max(1, ...byCategory.map((c) => c.count));

  return (
    <div className="pm-stats">
      <div className="pm-card pm-stat">
        <span className="pm-stat__icon">
          <FolderKanban size={18} />
        </span>
        <span className="pm-stat__label">Total Projects</span>
        {loading ? <span className="skel skel--md" /> : <strong className="pm-stat__value">{total}</strong>}
      </div>

      <div className="pm-card pm-stat">
        <span className="pm-stat__icon pm-stat__icon--violet">
          <Layers size={18} />
        </span>
        <span className="pm-stat__label">Categories</span>
        {loading ? (
          <span className="skel skel--md" />
        ) : (
          <strong className="pm-stat__value">{categories.length}</strong>
        )}
      </div>

      <div className="pm-card pm-panel">
        <h3 className="pm-panel__title">Projects by category</h3>
        {loading ? (
          <span className="skel skel--full" style={{ height: 70 }} />
        ) : byCategory.length === 0 ? (
          <p className="pm-panel__empty">No categories yet.</p>
        ) : (
          <ul className="pm-bars">
            {byCategory.map((c) => (
              <li key={c.id}>
                <span className="pm-bars__name">{c.name}</span>
                <span className="pm-bars__track">
                  <span className="pm-bars__fill" style={{ width: `${(c.count / max) * 100}%` }} />
                </span>
                <span className="pm-bars__count">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pm-card pm-panel">
        <h3 className="pm-panel__title">Recently added</h3>
        {loading ? (
          <span className="skel skel--full" style={{ height: 70 }} />
        ) : recent.length === 0 ? (
          <p className="pm-panel__empty">No projects yet.</p>
        ) : (
          <ul className="pm-recent">
            {recent.map((p) => (
              <li key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.coverImage} alt="" />
                <a href={`/${lang}/projects/${p.slug}`} target="_blank" rel="noopener noreferrer">
                  <strong>{p.title}</strong>
                  <small>
                    {p.category.name} · {shortDate(p.createdAt)}
                  </small>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
