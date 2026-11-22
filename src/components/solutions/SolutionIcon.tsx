import type { SolutionIconKey } from "@/redux/fetchers/solution/solutionApi";

const svg = (children: React.ReactNode, size: number) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const PATHS: Record<SolutionIconKey, React.ReactNode> = {
  server: (
    <>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="10" width="20" height="5" rx="1" />
      <rect x="2" y="17" width="20" height="5" rx="1" />
      <circle cx="19" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="19.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  network: (
    <>
      <rect x="9" y="2" width="6" height="5" rx="1" />
      <rect x="2" y="17" width="6" height="5" rx="1" />
      <rect x="16" y="17" width="6" height="5" rx="1" />
      <path d="M12 7v5M5 17v-5h14v5" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  video: (
    <>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </>
  ),
  bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  fan: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4-1 2-3 3-6 3z" />
      <path d="M14 12c4 0 7 1 7 4 0 2-2 3-4 2-2-1-3-3-3-6z" />
      <path d="M12 14c0 4-1 7-4 7-2 0-3-2-2-4 1-2 3-3 6-3z" />
      <path d="M10 12c-4 0-7-1-7-4 0-2 2-3 4-2 2 1 3 3 3 6z" />
    </>
  ),
  cloud: <path d="M18 10a6 6 0 0 0-11.7-1.5A4.5 4.5 0 0 0 7 18h11a4 4 0 0 0 0-8z" />,
  cpu: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  box: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
};

const FALLBACK = PATHS.box;

export const isIconKey = (v: string | null | undefined): v is SolutionIconKey =>
  !!v && Object.prototype.hasOwnProperty.call(PATHS, v);

/**
 * `icon` is either a preset key ("server", "shield", ...) or an uploaded image URL.
 * Anything else falls back to a neutral box icon.
 */
export default function SolutionIcon({
  icon,
  size = 28,
}: {
  icon: string | null | undefined;
  size?: number;
}) {
  if (icon && /^(https?:)?\/\//.test(icon)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" width={size} height={size} style={{ objectFit: "contain" }} />;
  }
  return svg(isIconKey(icon) ? PATHS[icon] : FALLBACK, size);
}
