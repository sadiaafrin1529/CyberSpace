import type { IndustryId } from "@/lib/industries-text";

/**
 * Animated illustrations for the "Industries We Serve" bento cards.
 * Pure SVG + CSS (see `.ib-*` rules in globals.css): colours come from the card's --c1..--c4 custom
 * properties and every animation runs only while the card is hovered / focused / tapped.
 */

const stroke = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Banking() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <g className="ib-bank-card">
        <rect x="36" y="58" width="74" height="30" rx="7" className="f3 s2" strokeWidth="4" />
        <path d="M46 73h54" className="s2" strokeWidth="3" {...stroke} />
      </g>
      <g className="ib-bank-coin ib-bank-coin--a">
        <circle cx="54" cy="36" r="13" className="f1 s2" strokeWidth="4" />
        <path d="M48 42v-8l6-5 6 5v8M51 42v-6m3 6v-8m3 8v-6" className="s-white" strokeWidth="2" fill="none" {...stroke} />
      </g>
      <g className="ib-bank-coin ib-bank-coin--b">
        <circle cx="84" cy="32" r="13" className="f2 s4" strokeWidth="4" />
        <text x="84" y="38.5" textAnchor="middle" className="ib-bank-sign">
          $
        </text>
      </g>
    </svg>
  );
}

function OilGas() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <g className="ib-oil-arm">
        <path d="M34 42l20-14h24" className="s3" strokeWidth="7" fill="none" {...stroke} />
        <rect x="74" y="14" width="24" height="17" rx="6" className="f4" />
        <circle cx="34" cy="42" r="6.5" className="f4" />
      </g>
      <path className="ib-oil-drip f2" d="M96 33c-3 5-4.5 7.5-4.5 9.5a4.5 4.5 0 0 0 9 0c0-2-1.5-4.5-4.5-9.5z" />
      <rect x="24" y="48" width="42" height="46" rx="10" className="s1" strokeWidth="6" fill="none" />
      <g className="ib-oil-fill">
        <rect x="31" y="62" width="28" height="25" rx="3" className="f2" />
      </g>
    </svg>
  );
}

function Health() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <path
        className="ib-health-ecg s2"
        d="M2 52h26l8-24 9 46 8-32 5 10h62"
        pathLength={100}
        fill="none"
        strokeWidth="5"
        {...stroke}
      />
      <g className="ib-health-cross">
        <rect x="64" y="18" width="20" height="58" rx="6" className="f1" />
        <rect x="45" y="37" width="58" height="20" rx="6" className="f1" />
      </g>
    </svg>
  );
}

function Gov() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <g className="ib-gov">
        <path d="M60 3v14" className="s2" strokeWidth="3" {...stroke} />
        <path className="ib-gov-flag f4" d="M60 3l17 3-17 7z" />
        <path d="M18 38L60 17l42 21z" className="f1 s2" strokeWidth="4" strokeLinejoin="round" />
        <rect x="26" y="45" width="13" height="36" rx="3" className="ib-gov-col f3" style={{ "--i": 0 } as React.CSSProperties} />
        <rect x="53.5" y="45" width="13" height="36" rx="3" className="ib-gov-col f3" style={{ "--i": 1 } as React.CSSProperties} />
        <rect x="81" y="45" width="13" height="36" rx="3" className="ib-gov-col f3" style={{ "--i": 2 } as React.CSSProperties} />
        <rect x="16" y="84" width="88" height="9" rx="4.5" className="f2" />
      </g>
    </svg>
  );
}

function Transport() {
  return (
    <svg viewBox="0 0 170 100" aria-hidden="true">
      <ellipse className="ib-cloud ib-cloud--a" cx="46" cy="22" rx="14" ry="7" />
      <ellipse className="ib-cloud ib-cloud--b" cx="140" cy="62" rx="15" ry="7.5" />
      <path
        className="ib-dash s3"
        d="M10 90C46 82 86 58 126 14"
        fill="none"
        strokeWidth="3.5"
        strokeDasharray="7 7"
        {...stroke}
      />
      <g className="ib-plane">
        <g transform="translate(84 46) rotate(-8)">
          <path d="M-20 4L20 -14L-4 16Z" className="f1" />
          <path d="M-4 16L20 -14L-6 0Z" className="f2" />
          <path d="M-20 4L-6 0L-8 -10Z" className="f1" opacity=".85" />
        </g>
      </g>
    </svg>
  );
}

function Education() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <circle className="ib-spark ib-spark--a" cx="18" cy="16" r="5" />
      <circle className="ib-spark ib-spark--b" cx="108" cy="10" r="6" />
      <circle className="ib-spark ib-spark--c" cx="100" cy="46" r="3" />
      <g className="ib-edu">
        <path d="M30 56v14c0 9 14 12 32 12s32-3 32-12V56L62 68z" className="f2 s1" strokeWidth="4" strokeLinejoin="round" />
        <path d="M10 40L62 14l52 26-52 26z" className="f1" />
        <g className="ib-edu-tassel">
          <path d="M106 44v26" className="s4" strokeWidth="4" {...stroke} />
          <circle cx="106" cy="73" r="3.5" className="f4" />
        </g>
      </g>
    </svg>
  );
}

function Telecom() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <g className="ib-tel-rings">
        <circle className="s1" cx="82" cy="30" r="24" fill="none" strokeWidth="5" />
        <circle className="ib-tel-ring ib-tel-ring--a s1" cx="82" cy="30" r="24" fill="none" strokeWidth="3" />
        <circle className="ib-tel-ring ib-tel-ring--b s1" cx="82" cy="30" r="24" fill="none" strokeWidth="3" />
        <circle className="s2" cx="82" cy="30" r="14" fill="none" strokeWidth="5" opacity=".9" />
        <circle className="ib-tel-dot f2" cx="82" cy="30" r="7" />
      </g>
      <path d="M14 22C12 62 44 76 88 66" className="s1" strokeWidth="7" fill="none" {...stroke} />
      <path d="M62 40l16-12" className="s1" strokeWidth="5" {...stroke} />
      <path d="M60 70L44 96M60 70l16 26" className="s1" strokeWidth="6" fill="none" {...stroke} />
    </svg>
  );
}

function Construction() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <rect x="24" y="86" width="30" height="7" rx="3.5" className="f1" />
      <rect x="36" y="20" width="6" height="68" rx="3" className="f1" />
      <g className="ib-crane-arm">
        <path d="M12 23L100 14" className="s2" strokeWidth="6" {...stroke} />
        <g className="ib-crane-load">
          <path d="M92 16v26" className="s1" strokeWidth="3" {...stroke} />
          <rect x="82" y="40" width="20" height="13" rx="3" className="f3" />
        </g>
      </g>
      <rect x="82" y="56" width="26" height="12" rx="3" className="f4 s2" strokeWidth="2.5" />
      <rect x="79" y="70" width="32" height="14" rx="3" className="f4 s2" strokeWidth="2.5" />
    </svg>
  );
}

const ART: Record<IndustryId, () => React.JSX.Element> = {
  banking: Banking,
  oilgas: OilGas,
  health: Health,
  gov: Gov,
  transport: Transport,
  education: Education,
  telecom: Telecom,
  construction: Construction,
};

export function IndustryArt({ id }: { id: IndustryId }) {
  const Art = ART[id];
  return <Art />;
}

/** Tiny glyph shown in the white chip at the top-left of every card. */
export function IndustryIcon({ id }: { id: IndustryId }) {
  const p = { fill: "none", strokeWidth: 1.8, ...stroke } as const;
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="ib-chip__svg">
      {id === "banking" && (
        <>
          <rect x="3" y="14" width="18" height="6" rx="2" className="s2" {...p} />
          <circle cx="8" cy="9" r="3" className="s2" {...p} />
          <circle cx="15" cy="8" r="3" className="s4" {...p} />
        </>
      )}
      {id === "oilgas" && (
        <>
          <rect x="4" y="11" width="11" height="10" rx="3" className="s2" {...p} />
          <path d="M9.5 11V8l4-3h5" className="s3" {...p} />
          <path d="M18.5 8v2" className="s4" {...p} />
        </>
      )}
      {id === "health" && (
        <>
          <path d="M9 12v-3h-3M15 12v3h3M12 9v6" className="s1" {...p} />
          <path d="M2 12h4l2-4 3 8 2-4h2" className="s2" {...p} opacity=".8" />
        </>
      )}
      {id === "gov" && (
        <>
          <path d="M3 10l9-5 9 5z" className="s2" {...p} />
          <path d="M6 12v6M10 12v6M14 12v6M18 12v6M3 20h18" className="s2" {...p} />
        </>
      )}
      {id === "transport" && (
        <path d="M3 14l18-9-7 15-2-6zM12 14l9-9" className="s2" {...p} />
      )}
      {id === "education" && (
        <>
          <path d="M2 9l10-5 10 5-10 5z" className="s1" {...p} />
          <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" className="s1" {...p} />
        </>
      )}
      {id === "telecom" && (
        <>
          <circle cx="15" cy="9" r="3" className="s2" {...p} />
          <path d="M5 6c0 7 4 10 10 10M10 16l-2 4M10 16l3 4" className="s1" {...p} />
        </>
      )}
      {id === "construction" && (
        <>
          <path d="M5 4v16M3 20h6M3 6l17-2" className="s1" {...p} />
          <rect x="15" y="10" width="5" height="4" rx="1" className="s3" {...p} />
          <path d="M17.5 4v6" className="s1" {...p} />
        </>
      )}
    </svg>
  );
}
