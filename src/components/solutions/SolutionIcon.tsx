import type { Solution, SolutionIconKey } from "@/redux/fetchers/solution/solutionApi";

const svg = (children: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="30"
    height="30"
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

/** Icon presets an admin can pick; same drawings the Solutions cards always used. */
export const SOLUTION_ICONS: Record<SolutionIconKey, React.ReactNode> = {
  server: svg(
    <>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="10" width="20" height="5" rx="1" />
      <rect x="2" y="17" width="20" height="5" rx="1" />
      <circle cx="19" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="19.5" r="1" fill="currentColor" stroke="none" />
    </>,
  ),
  bolt: svg(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />),
  fan: svg(
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4-1 2-3 3-6 3z" />
      <path d="M14 12c4 0 7 1 7 4 0 2-2 3-4 2-2-1-3-3-3-6z" />
      <path d="M12 14c0 4-1 7-4 7-2 0-3-2-2-4 1-2 3-3 6-3z" />
      <path d="M10 12c-4 0-7-1-7-4 0-2 2-3 4-2 2 1 3 3 3 6z" />
    </>,
  ),
  video: svg(
    <>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </>,
  ),
  shield: svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />),
  gear: svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>,
  ),
};

const FALLBACK_ICON = svg(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h6M9 12h6M9 15h4" />
  </>,
);

/** Uploaded icon wins, then the chosen preset, then a neutral default. */
export default function SolutionIcon({
  solution,
}: {
  solution: Pick<Solution, "iconUrl" | "iconKey">;
}) {
  if (solution.iconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={solution.iconUrl} alt="" width={30} height={30} style={{ objectFit: "contain" }} />
    );
  }
  return <>{(solution.iconKey && SOLUTION_ICONS[solution.iconKey]) || FALLBACK_ICON}</>;
}
