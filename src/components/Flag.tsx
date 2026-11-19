import type { Locale } from "@/lib/i18n";

/**
 * Inline SVG country flags for the language switcher.
 * Flag emoji are not drawn by Windows fonts (they fall back to letters like "AZ"),
 * so the flags are shipped as SVG and render identically on every OS and browser.
 * All three share one 3:2 viewBox so they line up at any size.
 */
function FlagArt({ locale }: { locale: Locale }) {
  switch (locale) {
    case "az":
      return (
        <>
          <rect width="60" height="40" fill="#509e2f" />
          <rect width="60" height="26.67" fill="#ef3340" />
          <rect width="60" height="13.34" fill="#00b5e2" />
          <circle cx="27" cy="20" r="5.8" fill="#fff" />
          <circle cx="29" cy="20" r="4.7" fill="#ef3340" />
          <rect x="32.3" y="17.8" width="4.4" height="4.4" fill="#fff" />
          <rect
            x="32.3"
            y="17.8"
            width="4.4"
            height="4.4"
            fill="#fff"
            transform="rotate(45 34.5 20)"
          />
        </>
      );
    case "en":
      return (
        <>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" strokeWidth="3.4" />
          <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
          <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="8" />
        </>
      );
    case "ru":
      return (
        <>
          <rect width="60" height="40" fill="#d52b1e" />
          <rect width="60" height="26.67" fill="#0039a6" />
          <rect width="60" height="13.34" fill="#fff" />
        </>
      );
  }
}

export default function Flag({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <svg
      className={className ? `flag ${className}` : "flag"}
      viewBox="0 0 60 40"
      width="20"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <FlagArt locale={locale} />
    </svg>
  );
}
