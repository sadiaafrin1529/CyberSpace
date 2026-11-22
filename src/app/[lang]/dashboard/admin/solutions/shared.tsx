import { SOLUTION_LANGS, type SolutionLang } from "@/redux/fetchers/solution/solutionApi";

export const LANG_NAME: Record<SolutionLang, string> = {
  EN: "English",
  AZ: "Azerbaijani",
  RU: "Russian",
};

export const errMsg = (e: unknown, fallback: string) => {
  const d = (e as { data?: { message?: string; error?: { message: string; path: string }[] } })
    ?.data;
  const first = d?.error?.[0];
  return first?.path ? `${first.path}: ${first.message}` : (d?.message ?? fallback);
};

/** Returns a new array with the item at `index` moved by `dir` (-1 up, +1 down). */
export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const to = index + dir;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

export function Field({
  label,
  id,
  children,
  mt,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  mt?: boolean;
}) {
  return (
    <div className="pf-field" style={mt ? { marginTop: 16 } : undefined}>
      <label htmlFor={id} className="pf-label">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Section({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pm-section">
      <header className="pm-section__head">
        <span className="pm-section__n">{n}</span>
        <div>
          <h3>{title}</h3>
          {hint && <p>{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

/** EN / AZ / RU tab bar. `filled` marks languages that already have content. */
export function LangTabs({
  active,
  onChange,
  filled,
}: {
  active: SolutionLang;
  onChange: (l: SolutionLang) => void;
  filled: (l: SolutionLang) => boolean;
}) {
  return (
    <div className="pf-lang-tabs" role="tablist" style={{ marginBottom: 14 }}>
      {SOLUTION_LANGS.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={active === l}
          className={`pf-lang-tab${active === l ? " is-active" : ""}`}
          onClick={() => onChange(l)}
        >
          {LANG_NAME[l]}
          {l === "EN" ? " *" : ""}
          {filled(l) && <span className="job-tab-dot" aria-label="has content" />}
        </button>
      ))}
    </div>
  );
}

/** Up / down arrows used by every reorderable list. */
export function ReorderButtons({
  index,
  count,
  disabled,
  onMove,
  label,
}: {
  index: number;
  count: number;
  disabled?: boolean;
  onMove: (dir: -1 | 1) => void;
  label: string;
}) {
  return (
    <div className="pm-actions">
      <button
        type="button"
        className="pm-icon-btn"
        title="Move up"
        aria-label={`Move ${label} up`}
        disabled={disabled || index === 0}
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        className="pm-icon-btn"
        title="Move down"
        aria-label={`Move ${label} down`}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(1)}
      >
        ↓
      </button>
    </div>
  );
}

/** EN first, else the first translation: the name admins see in lists and selects. */
export function pickName<T extends { lang: string }>(
  translations: T[] | undefined,
  key: keyof T,
): string {
  const t = translations?.find((x) => x.lang === "EN") ?? translations?.[0];
  return t ? String(t[key] ?? "") : "";
}

/** "Category / Section" label used by selects and list columns. */
export const sectionLabel = (s: {
  title: string;
  category?: { translations: { lang: string; name: string }[] };
}) => {
  const cat = pickName(s.category?.translations, "name");
  return cat ? `${cat} / ${s.title}` : s.title;
};

/** Compact on/off switch used for the Active / Homepage columns. */
export function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`sol-toggle${checked ? " is-on" : ""}`}
      onClick={onChange}
    >
      <span />
    </button>
  );
}
