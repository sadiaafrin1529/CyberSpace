import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { SOLUTION_LABELS } from "@/lib/solutions-text";
import type { SolutionCategory } from "@/redux/fetchers/solution/solutionApi";
import SolutionIcon from "./SolutionIcon";
import { accentStyle, categoryText } from "./types";

/** Overview card: tinted icon, title, description, divider, "View products" + product count. */
export default function SolutionCategoryCard({
  category,
  lang,
}: {
  category: SolutionCategory;
  lang: Locale;
}) {
  const L = SOLUTION_LABELS[lang];
  const c = categoryText(category, lang);
  const href = `/${lang}/solutions/${category.slug}`;
  return (
    <Link href={href} className="solx-card" style={accentStyle(category.accentColor)}>
      <span className="solx-card__icon">
        <SolutionIcon icon={category.icon ?? category.image} size={22} />
      </span>
      <h3 className="solx-card__title">{c.name}</h3>
      {c.description && <p className="solx-card__desc">{c.description}</p>}
      <span className="solx-card__foot">
        <span className="solx-card__link">
          {L.viewProducts} <ArrowRight size={14} aria-hidden="true" />
        </span>
        <span className="solx-card__count">{L.products(category.productCount ?? 0)}</span>
      </span>
    </Link>
  );
}
