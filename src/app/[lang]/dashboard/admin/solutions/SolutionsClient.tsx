"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, ListTree, Package, Plus } from "lucide-react";
import {
  useGetSolutionBundlesQuery,
  useGetSolutionCategoriesQuery,
  useGetSolutionSectionsQuery,
} from "@/redux/fetchers/solution/solutionApi";
import { Button } from "@/components/ui/button";
import CategoriesManager from "./CategoriesManager";
import SectionsManager from "./SectionsManager";
import BundlesManager from "./BundlesManager";

type Tab = "categories" | "sections" | "bundles";

const NEW_LABEL: Record<Tab, string> = {
  categories: "New Category",
  sections: "New Section",
  bundles: "New Bundle",
};

export default function SolutionsClient({ lang }: { lang: string }) {
  const [tab, setTab] = useState<Tab>("categories");
  // Bumped by the header button; each manager opens its own create dialog when it changes.
  const [createRequest, setCreateRequest] = useState(0);
  const { data: catData } = useGetSolutionCategoriesQuery({ limit: 1 });
  const { data: sectionData } = useGetSolutionSectionsQuery({ limit: 1 });
  const { data: bundleData } = useGetSolutionBundlesQuery({ limit: 1 });

  // Each level needs its parent: sections need a category, bundles need a section.
  const blocked =
    (tab === "sections" && (catData?.meta.total ?? 0) === 0) ||
    (tab === "bundles" && (sectionData?.meta.total ?? 0) === 0);
  const blockedHint = tab === "sections" ? "Create a category first" : "Create a section first";

  return (
    <div className="pm">
      <header className="pm-header">
        <div>
          <nav className="pm-crumbs" aria-label="Breadcrumb">
            <Link href={`/${lang}/dashboard/admin`}>Dashboard</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Solutions</span>
          </nav>
          <h1 className="pm-title">Solutions</h1>
          <p className="pm-sub">
            Organise solution categories, their sections and the bundles inside them. Changes appear
            on the website straight away.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateRequest((n) => n + 1)}
          disabled={blocked}
          title={blocked ? blockedHint : undefined}
          className="pm-cta"
        >
          <Plus size={16} aria-hidden="true" />
          {NEW_LABEL[tab]}
        </Button>
      </header>

      <div className="pm-tabs" role="tablist">
        {(
          [
            ["categories", "Categories", Layers, catData?.meta.total],
            ["sections", "Sections", ListTree, sectionData?.meta.total],
            ["bundles", "Bundles", Package, bundleData?.meta.total],
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

      {tab === "categories" && <CategoriesManager lang={lang} createRequest={createRequest} />}
      {tab === "sections" && <SectionsManager createRequest={createRequest} />}
      {tab === "bundles" && <BundlesManager createRequest={createRequest} />}
    </div>
  );
}
