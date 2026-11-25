"use client";

import { useState, useEffect } from "react";
import { Boxes, Check, Eye, Tag } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import DeveloperApiSection from "./developer/DeveloperApiSection";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/redux/fetchers/settings/settingsApi";

function GeneralSettings({ t }: { t: Dict }) {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  const [showPrices, setShowPrices] = useState(true);
  const [showStock, setShowStock] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setShowPrices(settings.showPrices);
      setShowStock(settings.showStock);
    }
  }, [settings]);

  async function updateSetting(key: string, value: boolean) {
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings({ key, value }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function handlePrices(v: boolean) {
    setShowPrices(v);
    updateSetting("showPrices", v);
  }

  function handleStock(v: boolean) {
    setShowStock(v);
    updateSetting("showStock", v);
  }

  if (isLoading) {
    return (
      <div className="dash-settings">
        <div className="settings-card">
          <span className="skel skel--md" style={{ width: 160, height: 20 }} />
        </div>
      </div>
    );
  }

  const rows = [
    {
      key: "prices",
      icon: <Tag size={20} />,
      label: t.dash.showPrices,
      desc: "Product prices and currency appear on the shop, product pages and search results.",
      value: showPrices,
      onChange: handlePrices,
    },
    {
      key: "stock",
      icon: <Boxes size={20} />,
      label: t.dash.showStock,
      desc: "Visitors can see how many units are available for each product.",
      value: showStock,
      onChange: handleStock,
    },
  ];

  return (
    <div className="gen-settings">
      <div className="settings-card gen-card">
        <div className="gen-card__head">
          <span className="gen-card__icon">
            <Eye size={20} />
          </span>
          <div>
            <h2 className="settings-card__title">{t.dash.visibilitySettings}</h2>
            <p className="settings-card__note gen-card__note">{t.admin.hiddenNote}</p>
          </div>
          <span className={`gen-saved${saved ? " is-visible" : ""}`} aria-live="polite">
            <Check size={14} /> {t.dash.saved}
          </span>
        </div>

        <div className="gen-list">
          {rows.map((r) => (
            <div key={r.key} className="gen-row">
              <span className={`gen-row__icon${r.value ? " is-on" : ""}`}>{r.icon}</span>
              <div className="gen-row__info">
                <p className="gen-row__label">{r.label}</p>
                <p className="gen-row__desc">{r.desc}</p>
              </div>
              <span className={`gen-pill ${r.value ? "gen-pill--on" : "gen-pill--off"}`}>{r.value ? "Visible" : "Hidden"}</span>
              <button
                type="button"
                className={`toggle-switch ${r.value ? "toggle-switch--on" : ""}`}
                disabled={saving}
                onClick={() => r.onChange(!r.value)}
                aria-pressed={r.value}
                aria-label={r.label}
              >
                <span className="toggle-switch__knob" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Tab = "general" | "developer";

export default function SettingsClient({ t }: { t: Dict }) {
  const [tab, setTab] = useState<Tab>("general");
  return (
    <div>
      <nav className="dev-subnav dev-subnav--top" aria-label="Settings sections">
        <button type="button" className={`dev-subnav__btn${tab === "general" ? " is-active" : ""}`} onClick={() => setTab("general")}>
          General
        </button>
        <button type="button" className={`dev-subnav__btn${tab === "developer" ? " is-active" : ""}`} onClick={() => setTab("developer")}>
          Developer API
        </button>
      </nav>
      {tab === "general" ? <GeneralSettings t={t} /> : <DeveloperApiSection />}
    </div>
  );
}
