import type { Locale } from "@/lib/i18n";
import { SOLUTION_LABELS } from "@/lib/solutions-text";
import { FadeUp } from "@/components/Motion";

/** Eyebrow + big title on the left, small hint on the right (home section and /solutions). */
export default function SolutionsHead({ lang, titleId }: { lang: Locale; titleId?: string }) {
  const L = SOLUTION_LABELS[lang];
  return (
    <FadeUp className="solx-head">
      <div>
        <p className="solx-head__eyebrow">{L.eyebrow}</p>
        <h2 id={titleId} className="solx-head__title">
          {L.title}
        </h2>
      </div>
      <p className="solx-head__hint">{L.hint}</p>
    </FadeUp>
  );
}
