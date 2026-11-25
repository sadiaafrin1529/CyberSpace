"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies text; falls back to a hidden textarea where the async Clipboard API is unavailable (http, old browsers). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function onCopy() {
    setState((await copyText(text)) ? "copied" : "failed");
    setTimeout(() => setState("idle"), 1800);
  }
  return (
    <button type="button" className={`dev-copy ${className}`} onClick={onCopy} aria-live="polite">
      {state === "copied" ? <Check size={14} /> : <Copy size={14} />}
      <span>{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span>
    </button>
  );
}

export interface CodeTab {
  label: string;
  code: string;
}

/** Code sample with a Copy Code button; several tabs (e.g. cURL / JavaScript) share one frame. */
export function CodeBlock({ tabs, title }: { tabs: CodeTab[]; title?: string }) {
  const [active, setActive] = useState(0);
  const current = tabs[Math.min(active, tabs.length - 1)];
  return (
    <div className="dev-code">
      <div className="dev-code__bar">
        {tabs.length > 1 ? (
          <div className="dev-code__tabs" role="tablist">
            {tabs.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={`dev-code__tab${i === active ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="dev-code__title">{title ?? current.label}</span>
        )}
        <CopyButton text={current.code} label="Copy code" />
      </div>
      <pre className="dev-code__pre">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
