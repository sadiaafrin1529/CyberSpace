"use client";

import { useState } from "react";
import { useGetApiMetaQuery } from "@/redux/fetchers/apiKey/apiKeyApi";
import { CodeBlock, CopyButton } from "./CodeBlock";
import {
  ENDPOINTS,
  ERROR_CODES,
  ERROR_EXAMPLE,
  curlSample,
  fetchSample,
  pretty,
  type Endpoint,
  type Field,
} from "./apiDocs";

type Section = "start" | "auth" | "categories" | "products" | "workflow" | "errors";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "start", label: "Introduction" },
  { id: "auth", label: "Authentication" },
  { id: "categories", label: "Categories API" },
  { id: "products", label: "Products API" },
  { id: "workflow", label: "Examples" },
  { id: "errors", label: "Errors & limits" },
];

function FieldTable({ fields, caption }: { fields: Field[]; caption: string }) {
  return (
    <div className="dev-doc__block">
      <h4 className="dev-doc__h4">{caption}</h4>
      <div className="dash-table-wrap">
        <table className="dash-table dev-table dev-fields">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.name}>
                <td>
                  <code className="dash-code">{f.name}</code>
                </td>
                <td className="dev-type">{f.type}</td>
                <td>{f.required === true ? <strong>Yes</strong> : f.required === false ? "No" : `Yes, ${f.required}`}</td>
                <td>{f.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EndpointCard({ e, baseUrl }: { e: Endpoint; baseUrl: string }) {
  const hasWrite = e.method === "POST";
  return (
    <details className="dev-endpoint" id={`ep-${e.id}`}>
      <summary className="dev-endpoint__sum">
        <span className={`dev-method dev-method--${e.method.toLowerCase()}`}>{e.method}</span>
        <code className="dev-endpoint__path">{e.path}</code>
        <span className="dev-endpoint__title">{e.title}</span>
      </summary>
      <div className="dev-endpoint__body">
        <p>{e.summary}</p>
        <p className="dev-doc__perm">
          Required permission: <code className="dash-code">{e.permission}</code>
        </p>
        {e.pathParams && <FieldTable caption="Path parameters" fields={e.pathParams} />}
        {e.queryParams && <FieldTable caption="Query parameters" fields={e.queryParams} />}
        {e.bodyFields && <FieldTable caption="Request body (JSON)" fields={e.bodyFields} />}
        <div className="dev-doc__block">
          <h4 className="dev-doc__h4">Request example</h4>
          <CodeBlock
            tabs={[
              { label: "cURL", code: curlSample(baseUrl, e, { idempotency: hasWrite }) },
              { label: "JavaScript (fetch)", code: fetchSample(baseUrl, e, { idempotency: hasWrite }) },
            ]}
          />
        </div>
        <div className="dev-doc__block">
          <h4 className="dev-doc__h4">
            Success response <span className="dev-http dev-http--ok">{e.status}</span>
          </h4>
          <CodeBlock tabs={[{ label: "JSON", code: pretty(e.response) }]} />
        </div>
        <div className="dev-doc__block">
          <h4 className="dev-doc__h4">Error responses</h4>
          <ul className="dev-errlist">
            {e.errors.map((er) => (
              <li key={er.status + er.code}>
                <span className="dev-http dev-http--err">{er.status}</span> <code className="dash-code">{er.code}</code> — {er.when}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

export default function ApiDocsPanel() {
  const { data: meta } = useGetApiMetaQuery();
  const [section, setSection] = useState<Section>("start");
  const baseUrl = meta?.baseUrl ?? "https://YOUR-API-HOST/api/v1";

  const first = { method: "GET" as const, path: "/categories", examplePath: "/categories?tree=true" };

  const workflowCat = (n: string, body: unknown) => ({ method: "POST" as const, path: "/categories", body, examplePath: "/categories", n });
  const wf = [
    workflowCat("1", { slug: "laptops", nameEN: "Laptops", nameAZ: "Noutbuklar", nameRU: "Ноутбуки" }),
    workflowCat("2", { slug: "gaming-laptops", parentSlug: "laptops", nameEN: "Gaming laptops" }),
    workflowCat("3", { slug: "rtx-gaming-laptops", parentSlug: "gaming-laptops", nameEN: "RTX gaming laptops" }),
  ];
  const productStep = ENDPOINTS.find((e) => e.id === "create-product")!;
  const productInDeepCat = { ...productStep, body: { ...(productStep.body as object), category: "rtx-gaming-laptops" } };

  return (
    <div className="settings-card dev-card">
      <div className="dev-card__head">
        <div>
          <h2 className="settings-card__title">API documentation</h2>
          <p className="settings-card__note dev-card__note">
            Everything an external developer needs to integrate: authentication, endpoints, schemas, examples and errors.
          </p>
        </div>
      </div>

      <nav className="dev-subnav dev-subnav--pill" aria-label="Documentation sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`dev-subnav__btn${section === s.id ? " is-active" : ""}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="dev-doc">
        {section === "start" && (
          <>
            <h3 className="dev-doc__h3">Introduction</h3>
            <p>
              The Developer API lets your own systems (ERP, PIM, import scripts) read and manage the Cyberspace
              <strong> category tree</strong> and <strong>product catalogue</strong> over HTTPS and JSON. It uses the same business rules as this
              admin panel: unique slugs and SKUs, valid parents, no circular categories, and products that always point at an existing category.
            </p>
            <h4 className="dev-doc__h4">Base URL</h4>
            <div className="dev-secret">
              <code className="dev-secret__value">{baseUrl}</code>
              <CopyButton text={baseUrl} label="Copy URL" />
            </div>
            <p className="dev-hint">
              Set <code>API_PUBLIC_URL</code> on the backend if this is not the public address your integrators should use.
            </p>
            <h4 className="dev-doc__h4">Conventions</h4>
            <ul className="dev-list">
              <li>
                All bodies are JSON (<code>Content-Type: application/json</code>), max {meta ? Math.round(meta.maxRequestBytes / 1024) : 256} KB.
              </li>
              <li>
                Successful responses: <code>{`{ statusCode, success: true, message, data, meta? }`}</code>. Lists add pagination in <code>meta</code>.
              </li>
              <li>
                Failures: <code>{`{ statusCode, success: false, message, code, error: [{ path, message }] }`}</code> — switch on <code>code</code>.
              </li>
              <li>
                Timestamps are ISO 8601 UTC. Decimal prices are returned as strings (e.g. <code>&quot;1299.9&quot;</code>).
              </li>
              <li>The API is server-to-server only. It sends no CORS headers, so browsers cannot call it; keep keys on your backend.</li>
            </ul>
            <h4 className="dev-doc__h4">Quick check</h4>
            <CodeBlock
              tabs={[
                { label: "cURL", code: curlSample(baseUrl, first) },
                { label: "JavaScript (fetch)", code: fetchSample(baseUrl, first) },
              ]}
            />
            <h4 className="dev-doc__h4">Endpoint overview</h4>
            <div className="dash-table-wrap">
              <table className="dash-table dev-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Permission</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span className={`dev-method dev-method--${e.method.toLowerCase()}`}>{e.method}</span>
                      </td>
                      <td>
                        <code className="dash-code">{e.path}</code>
                      </td>
                      <td>
                        <code className="dash-code">{e.permission}</code>
                      </td>
                      <td>{e.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === "auth" && (
          <>
            <h3 className="dev-doc__h3">Authentication guide</h3>
            <p>
              API keys are created by an administrator in <strong>Settings → Developer API → API keys</strong>. A key is shown once at creation
              and looks like <code>cs_live_&lt;43 characters&gt;</code> (<code>cs_test_…</code> on non-production servers).
            </p>
            <h4 className="dev-doc__h4">Required headers</h4>
            <div className="dash-table-wrap">
              <table className="dash-table dev-table">
                <thead>
                  <tr>
                    <th>Header</th>
                    <th>When</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code className="dash-code">X-API-Key</code>
                    </td>
                    <td>Every request</td>
                    <td>
                      Your key. <code>Authorization: Bearer cs_…</code> is accepted as an alternative (handy for Postman).
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="dash-code">Content-Type</code>
                    </td>
                    <td>POST / PATCH</td>
                    <td>
                      <code>application/json</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code className="dash-code">Idempotency-Key</code>
                    </td>
                    <td>Optional, POST</td>
                    <td>
                      A unique string (1–128 of <code>A-Z a-z 0-9 _ . : -</code>). A retry with the same key and body returns the original response
                      (header <code>Idempotent-Replayed: true</code>) instead of creating a second record; a different body returns 422. Kept 24 h.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h4 className="dev-doc__h4">Permissions</h4>
            <p>A key can do only what its permissions list. Calls without the right permission return 403 <code>INSUFFICIENT_PERMISSIONS</code>.</p>
            <div className="dash-table-wrap">
              <table className="dash-table dev-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    <th>Allows</th>
                  </tr>
                </thead>
                <tbody>
                  {(meta?.permissions ?? []).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <code className="dash-code">{p.id}</code>
                      </td>
                      <td>{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h4 className="dev-doc__h4">Key lifecycle</h4>
            <ul className="dev-list">
              <li>
                <strong>Expiry</strong> — optional. After it, requests return 401 <code>API_KEY_EXPIRED</code>.
              </li>
              <li>
                <strong>Revocation</strong> — immediate and per key (401 <code>API_KEY_REVOKED</code>); other keys keep working.
              </li>
              <li>
                <strong>IP allow-list</strong> — optional single IPs or CIDR ranges. Others get 403 <code>IP_NOT_ALLOWED</code>. Behind a reverse proxy the
                backend needs <code>TRUST_PROXY</code> set so it sees the real client IP.
              </li>
              <li>
                A key never grants access to this website’s dashboards or its JWT-protected routes, and a website login token is not accepted by the API.
              </li>
              <li>
                Keys stop working if the administrator who issued them is deactivated or no longer an admin.
              </li>
            </ul>
          </>
        )}

        {section === "categories" && (
          <>
            <h3 className="dev-doc__h3">Categories API</h3>
            <p>
              Categories form a tree of unlimited depth: a category with <code>parentId: null</code> is a root, any other category is a sub-category of
              its parent. Slugs are unique across the <em>whole</em> tree because products reference categories by slug. To nest, create the parent first,
              then pass its <code>id</code> as <code>parentId</code> (or its slug as <code>parentSlug</code>).
            </p>
            {ENDPOINTS.filter((e) => e.group === "categories").map((e) => (
              <EndpointCard key={e.id} e={e} baseUrl={baseUrl} />
            ))}
          </>
        )}

        {section === "products" && (
          <>
            <h3 className="dev-doc__h3">Products API</h3>
            <p>
              A product has one SKU, one category (by slug, any depth), optional brand, image URL, price + currency and stock, and 1–3 language
              translations (name and description). The data model has no variants, specification tables or multi-image galleries, so the API does not
              expose them.
            </p>
            {ENDPOINTS.filter((e) => e.group === "products").map((e) => (
              <EndpointCard key={e.id} e={e} baseUrl={baseUrl} />
            ))}
          </>
        )}

        {section === "workflow" && (
          <>
            <h3 className="dev-doc__h3">End-to-end example</h3>
            <p>
              Build a three-level category branch and publish a product in its deepest category. The key needs <code>categories:create</code> and{" "}
              <code>products:create</code>.
            </p>
            {wf.map((w) => (
              <div key={w.n} className="dev-doc__block">
                <h4 className="dev-doc__h4">
                  {w.n}. {w.n === "1" ? "Create a root category" : w.n === "2" ? "Create a sub-category" : "Create a nested sub-category (level 3)"}
                </h4>
                <CodeBlock
                  tabs={[
                    { label: "cURL", code: curlSample(baseUrl, w) },
                    { label: "JavaScript (fetch)", code: fetchSample(baseUrl, w) },
                  ]}
                />
              </div>
            ))}
            <div className="dev-doc__block">
              <h4 className="dev-doc__h4">4. Create a product in the nested category</h4>
              <CodeBlock
                tabs={[
                  { label: "cURL", code: curlSample(baseUrl, productInDeepCat, { idempotency: true }) },
                  { label: "JavaScript (fetch)", code: fetchSample(baseUrl, productInDeepCat, { idempotency: true }) },
                ]}
              />
            </div>
            <div className="dev-doc__block">
              <h4 className="dev-doc__h4">Postman</h4>
              <ol className="dev-list">
                <li>
                  New request → set the URL to <code>{baseUrl}/categories</code>.
                </li>
                <li>
                  Headers tab: add <code>X-API-Key</code> = your key (and <code>Content-Type: application/json</code> for POST/PATCH).
                </li>
                <li>Body tab → raw → JSON, paste one of the bodies above, then Send.</li>
              </ol>
            </div>
          </>
        )}

        {section === "errors" && (
          <>
            <h3 className="dev-doc__h3">Errors, rate limits and logging</h3>
            <h4 className="dev-doc__h4">Error format</h4>
            <CodeBlock tabs={[{ label: "400 response", code: pretty(ERROR_EXAMPLE) }]} />
            <h4 className="dev-doc__h4">Error codes</h4>
            <div className="dash-table-wrap">
              <table className="dash-table dev-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Code</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {ERROR_CODES.map((c) => (
                    <tr key={c.code}>
                      <td>
                        <span className={`dev-http ${c.status < 400 ? "dev-http--ok" : "dev-http--err"}`}>{c.status}</span>
                      </td>
                      <td>
                        <code className="dash-code">{c.code}</code>
                      </td>
                      <td>{c.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h4 className="dev-doc__h4">Rate limits</h4>
            <ul className="dev-list">
              <li>
                {meta?.rateLimitPerMinute ?? 120} requests per minute per key (fixed window). Every response carries <code>X-RateLimit-Limit</code>,{" "}
                <code>X-RateLimit-Remaining</code> and <code>X-RateLimit-Reset</code> (Unix seconds).
              </li>
              <li>
                Over the limit you get 429 with <code>Retry-After</code> (seconds). Repeated failed authentications from one IP are throttled too.
              </li>
            </ul>
            <h4 className="dev-doc__h4">Logging</h4>
            <p>
              Each request is logged (key name, method, path, status, duration, IP, error code) for {meta?.logRetentionDays ?? 90} days and visible under
              the <strong>Request logs</strong> tab. Bodies, query strings and key values are never stored.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
