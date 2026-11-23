"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { FadeUp } from "@/components/Motion";
import type { Locale } from "@/lib/i18n";
import { INDUSTRY_LABELS, INDUSTRY_ORDER, type IndustryId } from "@/lib/industries-text";
import { IndustryArt, IndustryIcon } from "./IndustryArt";

/** Homepage "Industries We Serve" bento: animated SVG scenes, hover/tap to reveal the scenario. */
export default function HomeIndustries({ lang }: { lang: Locale }) {
  const L = INDUSTRY_LABELS[lang];
  const [active, setActive] = useState<IndustryId | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Touch devices have no hover: a tap opens a card, a tap elsewhere closes it.
  useEffect(() => {
    if (!active) return;
    const close = (e: globalThis.PointerEvent) => {
      if (!gridRef.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

  // Spotlight that follows the cursor inside the hovered card.
  const track = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section className="ib-section" aria-labelledby="home-industries-title">
      <div className="container">
        <FadeUp className="solx-head">
          <div>
            <p className="solx-head__eyebrow">{L.eyebrow}</p>
            <h2 id="home-industries-title" className="solx-head__title">
              {L.title}
            </h2>
          </div>
          <p className="solx-head__hint">{L.hint}</p>
        </FadeUp>

        <div className="ib-grid" ref={gridRef}>
          {INDUSTRY_ORDER.map(({ id, wide }, i) => {
            const item = L.items[id];
            return (
              <FadeUp
                key={id}
                delay={(i % 4) * 0.06}
                className={`ib-cell${wide ? " ib-cell--wide" : ""}`}
              >
                <article
                  className={`ib-card ib-card--${id}${active === id ? " is-active" : ""}`}
                  onPointerMove={track}
                  onClick={() => setActive((cur) => (cur === id ? null : id))}
                >
                  <span className="ib-chip" aria-hidden="true">
                    <IndustryIcon id={id} />
                  </span>
                  <div className="ib-art" aria-hidden="true">
                    <IndustryArt id={id} />
                  </div>
                  <div className="ib-body">
                    <h3 className="ib-title">{item.name}</h3>
                    <div className="ib-reveal">
                      <div className="ib-reveal__in">
                        <p className="ib-desc">{item.desc}</p>
                        <Link href={`/${lang}/solutions`} className="ib-more">
                          {L.more}
                          <svg viewBox="0 0 20 20" width="12" height="12" fill="none" aria-hidden="true">
                            <path
                              d="M4 10h12M11 5l5 5-5 5"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
