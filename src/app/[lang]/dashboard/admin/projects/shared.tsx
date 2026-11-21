/** URL-safe slug from a name; Azerbaijani ə / ı do not decompose, so they are mapped by hand. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const errMsg = (e: unknown, fallback: string) => {
  const d = (e as { data?: { message?: string; error?: { message: string; path: string }[] } })
    ?.data;
  const first = d?.error?.[0];
  return first?.path ? `${first.path}: ${first.message}` : (d?.message ?? fallback);
};

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
