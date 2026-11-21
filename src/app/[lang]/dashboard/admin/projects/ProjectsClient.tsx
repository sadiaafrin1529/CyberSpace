"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Layers, Plus } from "lucide-react";
import {
  useGetProjectCategoriesQuery,
  useGetProjectsQuery,
} from "@/redux/fetchers/project/projectApi";
import { Button } from "@/components/ui/button";
import ProjectsManager from "./ProjectsManager";
import CategoriesManager from "./CategoriesManager";
import ProjectStats from "./ProjectStats";

type Tab = "projects" | "categories";

export default function ProjectsClient({ lang }: { lang: string }) {
  const [tab, setTab] = useState<Tab>("projects");
  // Bumped by the header button; each manager opens its own create dialog when it changes.
  const [createRequest, setCreateRequest] = useState(0);
  const { data: categories = [] } = useGetProjectCategoriesQuery();
  const { data: projectsData } = useGetProjectsQuery({ limit: 1 });

  const isProjects = tab === "projects";
  const needsCategory = isProjects && categories.length === 0;

  return (
    <div className="pm">
      <header className="pm-header">
        <div>
          <nav className="pm-crumbs" aria-label="Breadcrumb">
            <Link href={`/${lang}/dashboard/admin`}>Dashboard</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Projects</span>
          </nav>
          <h1 className="pm-title">Projects</h1>
          <p className="pm-sub">
            Publish and organise the work shown on your public Projects page.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateRequest((n) => n + 1)}
          disabled={needsCategory}
          title={needsCategory ? "Create a category first" : undefined}
          className="pm-cta"
        >
          <Plus size={16} aria-hidden="true" />
          {isProjects ? "New Project" : "New Category"}
        </Button>
      </header>

      <ProjectStats lang={lang} />

      <div className="pm-tabs" role="tablist">
        {(
          [
            ["projects", "Manage Projects", FolderKanban, projectsData?.meta.total],
            ["categories", "Manage Categories", Layers, categories.length],
          ] as const
        ).map(([key, label, Icon, count]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`pm-tab${tab === key ? " is-active" : ""}`}
            onClick={() => setTab(key)}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
            {count !== undefined && <span className="pm-tab__count">{count}</span>}
          </button>
        ))}
      </div>

      {isProjects ? (
        <ProjectsManager
          lang={lang}
          createRequest={createRequest}
          onManageCategories={() => setTab("categories")}
        />
      ) : (
        <CategoriesManager createRequest={createRequest} />
      )}
    </div>
  );
}
