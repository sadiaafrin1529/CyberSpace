"use client";

import { useState } from "react";
import ApiKeysPanel from "./ApiKeysPanel";
import ApiLogsPanel from "./ApiLogsPanel";
import ApiDocsPanel from "./ApiDocsPanel";
import OverviewPanel from "./OverviewPanel";

type Tab = "overview" | "keys" | "logs" | "docs";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "keys", label: "API keys" },
  { id: "logs", label: "Request logs" },
  { id: "docs", label: "Documentation" },
];

export default function DeveloperApiSection() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <div className="dev-section">
      <nav className="dev-subnav" aria-label="Developer API">
        {TABS.map((x) => (
          <button key={x.id} type="button" className={`dev-subnav__btn${tab === x.id ? " is-active" : ""}`} onClick={() => setTab(x.id)}>
            {x.label}
          </button>
        ))}
      </nav>
      {tab === "overview" && <OverviewPanel onNavigate={setTab} />}
      {tab === "keys" && <ApiKeysPanel />}
      {tab === "logs" && <ApiLogsPanel />}
      {tab === "docs" && <ApiDocsPanel />}
    </div>
  );
}
