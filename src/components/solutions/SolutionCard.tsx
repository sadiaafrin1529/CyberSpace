"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { Solution } from "@/redux/fetchers/solution/solutionApi";
import { useLang } from "@/lib/useLang";
import { FadeUp } from "@/components/Motion";
import SolutionIcon from "./SolutionIcon";
import { pickTranslation, safeColor } from "./types";

/** Key points shown before "See more". */
export const VISIBLE_POINTS = 5;

/**
 * One card on the Solutions page. Every card shows its first 5 key points; a card with more
 * gets its own See more / See less toggle (independent state per card).
 * Collapsed cards have a fixed structure (see .sol-grid styles), so they are all the same height.
 */
export default function SolutionCard({
  solution,
  delay = 0,
}: {
  solution: Solution;
  delay?: number;
}) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const moreId = useId();

  const tr = pickTranslation(solution, lang);
  const first = tr.features.slice(0, VISIBLE_POINTS);
  const rest = tr.features.slice(VISIBLE_POINTS);

  return (
    <FadeUp
      delay={delay}
      className={`sol-card sol-card--${safeColor(solution.color)}${open ? " is-open" : ""}`}
    >
      <div className="sol-card__icon">
        <SolutionIcon solution={solution} />
      </div>
      <h3 className="sol-card__title">
        <Link href={`/${lang}/solutions/${solution.slug}`}>{tr.title}</Link>
      </h3>
      <p className="sol-card__desc">{tr.shortDescription}</p>

      <ul className="sol-card__list">
        {first.map((f) => (
          <li key={f} title={f}>
            {f}
          </li>
        ))}
      </ul>

      {/* Remaining points: always in the layout (zero height when collapsed) so all cards stay identical. */}
      <div className="sol-card__more" id={moreId} aria-hidden={!open || rest.length === 0}>
        <div className="sol-card__more-inner">
          <ul className="sol-card__list">
            {rest.map((f) => (
              <li key={f} title={f}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fixed-height slot: the toggle sits in the same place on every card, shown only when needed. */}
      <div className="sol-card__toggle-slot">
        {rest.length > 0 && (
          <button
            type="button"
            className="sol-card__toggle"
            aria-expanded={open}
            aria-controls={moreId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t.common.seeLess : t.common.seeMore}
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
              <path
                d="m5 8 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <Link href={`/${lang}/shop`} className="sol-card__link">
        {{ en: "Browse products →", az: "Məhsullara bax →", ru: "Смотреть продукты →" }[lang]}
      </Link>
    </FadeUp>
  );
}
