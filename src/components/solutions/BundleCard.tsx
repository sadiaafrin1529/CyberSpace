"use client";

import { Check, Send } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { openBundleInquiry } from "@/redux/inquirySlice";
import type { Locale } from "@/lib/i18n";
import { SOLUTION_LABELS, formatPrice } from "@/lib/solutions-text";
import type { SolutionBundle } from "@/redux/fetchers/solution/solutionApi";
import SolutionIcon from "./SolutionIcon";
import { bundlePrice, bundleText, featureTitle, itemLine } from "./types";

/** One bundle. Both buttons use the existing inquiry modal and submission flow. */
export default function BundleCard({ bundle, lang }: { bundle: SolutionBundle; lang: Locale }) {
  const dispatch = useAppDispatch();
  const L = SOLUTION_LABELS[lang];
  const b = bundleText(bundle, lang);
  const total = bundlePrice(bundle);
  const price = total ? formatPrice(total.amount, total.currency, lang) : null;
  const billing = bundle.billingPeriod === "ONE_TIME" ? "" : L.billing[bundle.billingPeriod];

  const lines = [
    ...bundle.items
      .map((i) => itemLine(i, bundle.currency, lang))
      .filter((l) => l.title)
      .map((l) => ({
        text: l.title,
        note: l.description,
        price: l.price !== null ? formatPrice(l.price, l.currency, lang) : null,
      })),
    ...bundle.features
      .map((f) => featureTitle(f, lang))
      .filter(Boolean)
      .map((text) => ({ text, note: null, price: null })),
  ];

  return (
    <article className="solx-bundle">
      <header className="solx-bundle__top">
        <span className="solx-bundle__icon">
          <SolutionIcon icon={bundle.icon} size={18} />
        </span>
        {b.badge && <span className="solx-badge">{b.badge}</span>}
        <span className="solx-bundle__price">
          {price ? (
            <>
              {price}
              {billing && <small> {billing}</small>}
            </>
          ) : (
            <small>{L.priceOnRequest}</small>
          )}
        </span>
      </header>

      <h3 className="solx-bundle__title">{b.title}</h3>
      {b.description && <p className="solx-bundle__desc">{b.description}</p>}

      {lines.length > 0 && (
        <div className="solx-included">
          <p className="solx-included__label">{L.included}</p>
          <ul>
            {lines.map((l, idx) => (
              <li key={idx}>
                <Check size={13} aria-hidden="true" />
                <span className="solx-included__text">
                  {l.text}
                  {l.note && <small>{l.note}</small>}
                </span>
                {l.price && <span className="solx-included__price">{l.price}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="solx-bundle__actions">
        <button
          type="button"
          className="solx-btn solx-btn--primary"
          onClick={() => dispatch(openBundleInquiry({ id: bundle.id, title: b.title }))}
        >
          <Send size={14} aria-hidden="true" />
          {L.requestInquiry}
        </button>
        <button
          type="button"
          className="solx-btn solx-btn--ghost"
          onClick={() =>
            dispatch(
              openBundleInquiry({ id: bundle.id, title: b.title, message: L.orderMessage(b.title) }),
            )
          }
        >
          {L.order}
        </button>
      </div>
    </article>
  );
}
