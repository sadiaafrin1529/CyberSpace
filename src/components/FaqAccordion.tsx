"use client";

import { useState } from "react";
import { FadeUp } from "@/components/Motion";

interface Item {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {items.map((faq, i) => {
        const isOpen = open === i;
        return (
          <FadeUp key={i} delay={i * 0.05} className={`faq-item${isOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{faq.q}</span>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
                <path
                  d="M5 7l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div id={`faq-a-${i}`} className="faq-a-wrap" role="region">
              <div className="faq-a">{faq.a}</div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}
