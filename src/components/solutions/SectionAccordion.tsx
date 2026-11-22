"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { SOLUTION_LABELS } from "@/lib/solutions-text";
import type { SolutionCategoryDetail } from "@/redux/fetchers/solution/solutionApi";
import BundleCard from "./BundleCard";
import SolutionIcon from "./SolutionIcon";
import { sectionText } from "./types";

/** The category's sections as accordion bars; the first one starts open. Bundles show as cards inside. */
export default function SectionAccordion({
  sections,
  lang,
}: {
  sections: SolutionCategoryDetail["sections"];
  lang: Locale;
}) {
  const L = SOLUTION_LABELS[lang];
  const [open, setOpen] = useState<Set<number>>(() => new Set(sections[0] ? [sections[0].id] : []));

  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <div className="solx-sections">
      {sections.map((s) => {
        const isOpen = open.has(s.id);
        const x = sectionText(s, lang);
        const panelId = `solx-section-${s.id}`;
        return (
          <section key={s.id} className={`solx-section-card${isOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="solx-section-card__bar"
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-label={`${x.title} — ${L.toggleSection}`}
              onClick={() => toggle(s.id)}
            >
              <span className="solx-section-card__icon">
                <SolutionIcon icon={s.icon} size={20} />
              </span>
              <span className="solx-section-card__text">
                <span className="solx-section-card__title">
                  {x.title}
                  <span className="solx-pill">{L.bundleCount(s.bundles.length)}</span>
                </span>
                {x.description && <span className="solx-section-card__desc">{x.description}</span>}
              </span>
              <span className="solx-section-card__chev" aria-hidden="true">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>
            {isOpen && (
              <div id={panelId} className="solx-section-card__body">
                <div className="solx-bundles">
                  {s.bundles.map((b) => (
                    <BundleCard key={b.id} bundle={b} lang={lang} />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
