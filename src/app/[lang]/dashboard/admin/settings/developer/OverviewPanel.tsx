"use client";

import { Activity, AlertTriangle, Gauge, KeyRound } from "lucide-react";
import { useGetApiMetaQuery } from "@/redux/fetchers/apiKey/apiKeyApi";
import { CopyButton } from "./CodeBlock";

export default function OverviewPanel({ onNavigate }: { onNavigate: (tab: "keys" | "logs" | "docs") => void }) {
  const { data: meta, isLoading, isError } = useGetApiMetaQuery();

  if (isLoading) {
    return (
      <div className="settings-card dev-card">
        <span className="skel skel--md" style={{ width: "100%", height: 90 }} />
      </div>
    );
  }
  if (isError || !meta) return <p className="pf-alert pf-alert--error">Could not load API overview.</p>;

  const { overview: o } = meta;
  const stats = [
    { icon: <KeyRound size={18} />, label: "Active keys", value: o.keys.active, sub: `${o.keys.revoked} revoked · ${o.keys.expired} expired` },
    { icon: <Activity size={18} />, label: "Requests (24h)", value: o.last24h.requests, sub: `avg ${o.last24h.avgDurationMs} ms` },
    {
      icon: <AlertTriangle size={18} />,
      label: "Failed (24h)",
      value: o.last24h.errors,
      sub: o.last24h.requests ? `${Math.round((o.last24h.errors / o.last24h.requests) * 100)}% of requests` : "no traffic yet",
    },
    { icon: <Gauge size={18} />, label: "Rate limit", value: meta.rateLimitPerMinute, sub: "requests / minute / key" },
  ];

  return (
    <div className="dev-stack">
      <div className="settings-card dev-card">
        <h2 className="settings-card__title">Developer API</h2>
        <p className="settings-card__note dev-card__note">
          Let trusted external applications create and manage categories, nested sub-categories and products using API keys. Keys are separate from website
          logins: they cannot open this dashboard, and only administrators can create or revoke them.
        </p>
        <div className="dev-field-label">Base URL</div>
        <div className="dev-secret">
          <code className="dev-secret__value">{meta.baseUrl}</code>
          <CopyButton text={meta.baseUrl} label="Copy URL" />
        </div>
        <div className="dev-field-label">Authentication header</div>
        <div className="dev-secret">
          <code className="dev-secret__value">X-API-Key: &lt;your key&gt;</code>
          <CopyButton text="X-API-Key: " label="Copy header" />
        </div>
      </div>

      <div className="dev-stats">
        {stats.map((s) => (
          <div key={s.label} className="dev-stat">
            <span className="dev-stat__icon">{s.icon}</span>
            <div>
              <div className="dev-stat__value">{s.value}</div>
              <div className="dev-stat__label">{s.label}</div>
              <div className="dev-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-card dev-card">
        <h3 className="settings-card__title">Get started</h3>
        <ol className="dev-steps">
          <li>
            <button type="button" className="dev-link" onClick={() => onNavigate("keys")}>
              Generate an API key
            </button>{" "}
            with only the permissions your integration needs, and copy it — it is shown once.
          </li>
          <li>
            Send it in the <code>X-API-Key</code> header from your <strong>server</strong>.
          </li>
          <li>
            Follow the{" "}
            <button type="button" className="dev-link" onClick={() => onNavigate("docs")}>
              documentation
            </button>{" "}
            to create categories and products.
          </li>
          <li>
            Watch traffic and troubleshoot in the{" "}
            <button type="button" className="dev-link" onClick={() => onNavigate("logs")}>
              request logs
            </button>
            .
          </li>
        </ol>
      </div>
    </div>
  );
}
