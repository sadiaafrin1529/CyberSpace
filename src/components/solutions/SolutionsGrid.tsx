import type { Locale } from "@/lib/i18n";
import { SOLUTION_LABELS } from "@/lib/solutions-text";
import type { SolutionCategory } from "@/redux/fetchers/solution/solutionApi";
import { FadeUp } from "@/components/Motion";
import SolutionCategoryCard from "./SolutionCategoryCard";

/**
 * Category cards from the database. `categories === null` means the backend failed
 * (shown as an error), an empty array means nothing is published yet.
 */
export default function SolutionsGrid({
  categories,
  lang,
}: {
  categories: SolutionCategory[] | null;
  lang: Locale;
}) {
  const L = SOLUTION_LABELS[lang];
  if (categories === null)
    return (
      <p className="muted" role="alert">
        {L.loadFailed}
      </p>
    );
  if (categories.length === 0) return <p className="muted">{L.empty}</p>;
  return (
    <div className="solx-grid">
      {categories.map((c, i) => (
        <FadeUp key={c.id} delay={(i % 3) * 0.07}>
          <SolutionCategoryCard category={c} lang={lang} />
        </FadeUp>
      ))}
    </div>
  );
}
