"use client";

import ImageUpload from "@/components/dashboard/ImageUpload";
import SolutionIcon, { isIconKey } from "@/components/solutions/SolutionIcon";
import { SOLUTION_ICON_KEYS } from "@/redux/fetchers/solution/solutionApi";

/**
 * Value is a preset key ("server", ...) or an uploaded image URL; empty string = none.
 * Picking a preset clears an uploaded icon and the other way round.
 */
export default function IconPicker({
  value,
  onChange,
  disabled,
  label = "Icon",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const uploaded = value && !isIconKey(value) ? value : "";
  return (
    <div>
      <span className="pf-label">{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "6px 0 14px" }}>
        {SOLUTION_ICON_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className={`pm-icon-btn${value === k ? " is-active" : ""}`}
            style={value === k ? { outline: "2px solid var(--blue)", outlineOffset: 1 } : undefined}
            title={k}
            aria-label={`Use ${k} icon`}
            aria-pressed={value === k}
            disabled={disabled}
            onClick={() => onChange(value === k ? "" : k)}
          >
            <SolutionIcon icon={k} size={18} />
          </button>
        ))}
      </div>
      <ImageUpload
        value={uploaded}
        onChange={onChange}
        disabled={disabled}
        label="Or upload a custom icon"
        hint="Square PNG, WebP or JPG · max 5 MB"
        showUrlInput={false}
      />
    </div>
  );
}
