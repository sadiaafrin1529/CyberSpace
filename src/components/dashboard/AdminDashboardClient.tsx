"use client";

import Link from "next/link";
import { type Dict, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { useGetInquiriesQuery, type Inquiry } from "@/redux/fetchers/inquiry/inquiryApi";
import { useGetProductsQuery } from "@/redux/fetchers/product/productApi";
import { useGetAllUsersQuery } from "@/redux/fetchers/user/userApi";
import { useGetCategoriesQuery } from "@/redux/fetchers/category/categoryApi";
import { useGetJobStatsQuery } from "@/redux/fetchers/job/jobApi";
import { useGetPartnersQuery } from "@/redux/fetchers/partner/partnerApi";
import { useGetNewsQuery } from "@/redux/fetchers/news/newsApi";
import { useMeQuery } from "@/redux/fetchers/auth/authApi";
import {
  ArrowUpRight,
  Briefcase,
  FileText,
  Handshake,
  Layers,
  MessageSquare,
  Newspaper,
  Package,
  Users,
} from "lucide-react";
import SkeletonTableRows from "@/components/dashboard/SkeletonTableRows";

interface Props {
  lang: string;
  t: Dict;
  base: string;
}

function getStatusLabel(status: string, t: Dict) {
  if (status === "NEW") return t.dash.statusNew;
  if (status === "IN_PROGRESS") return t.dash.statusInProgress;
  return t.dash.statusDone;
}

function getProductName(inq: Inquiry, lang: string) {
  const trans = inq.product?.translations?.find((x) => x.lang === lang.toUpperCase());
  return trans?.name ?? "—";
}

export default function AdminDashboardClient({ lang, t, base }: Props) {
  const {
    data: inquiryData,
    isLoading: inquiriesLoading,
    isError: inquiriesError,
  } = useGetInquiriesQuery();
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsQuery();
  const { data: usersData, isLoading: usersLoading, isError: usersError } = useGetAllUsersQuery();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();
  const { data: jobStats, isLoading: jobsLoading, isError: jobsError } = useGetJobStatsQuery();
  const {
    data: partnersData,
    isLoading: partnersLoading,
    isError: partnersError,
  } = useGetPartnersQuery();
  const { data: newsData, isLoading: newsLoading, isError: newsError } = useGetNewsQuery();
  const { data: user } = useMeQuery();

  const hasError =
    inquiriesError ||
    productsError ||
    usersError ||
    categoriesError ||
    jobsError ||
    partnersError ||
    newsError;
  const isLoading =
    inquiriesLoading ||
    productsLoading ||
    usersLoading ||
    categoriesLoading ||
    jobsLoading ||
    partnersLoading ||
    newsLoading;

  if (isLoading) {
    return (
      <div>
        <div className="dash-page-header">
          <div>
            <span
              className="skel skel--xl"
              style={{ width: 220, marginBottom: 8, display: "block" }}
            />
            <span className="skel skel--sm" style={{ width: 140, display: "block" }} />
          </div>
        </div>
        <div className="stat-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="stat-card">
              <span className="skel skel--avatar" />
              <div className="stat-card__body">
                <span
                  className="skel skel--sm"
                  style={{ width: 90, marginBottom: 6, display: "block" }}
                />
                <span className="skel skel--lg" style={{ width: 40, display: "block" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="dash-section">
          <div className="dash-section__head">
            <h2 className="dash-section__title">{t.dash.recentInquiries}</h2>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t.dash.product}</th>
                  <th>{t.dash.customer}</th>
                  <th>{t.dash.phone}</th>
                  <th>{t.dash.date}</th>
                  <th>{t.dash.status}</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonTableRows columns={["text", "text", "text", "sm", "badge"]} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const inquiries = inquiryData ?? [];
  const products = productsData ?? [];
  const users = usersData ?? [];
  const categories = categoriesData ?? [];
  const newCount = inquiries.filter((i) => i.status === "NEW").length;
  const inProgressCount = inquiries.filter((i) => i.status === "IN_PROGRESS").length;
  const doneCount = inquiries.filter((i) => i.status === "DONE").length;
  const partners = partnersData ?? [];
  const activePartners = partners.filter((p) => p.isActive).length;
  const news = newsData ?? [];
  const publishedNews = news.filter((n) => n.status === "PUBLISHED").length;
  const activeJobs = jobStats?.activeJobs ?? 0;
  const totalApplications = jobStats?.totalApplications ?? 0;
  const pendingApplications = jobStats?.pendingApplications ?? 0;
  const recent = inquiries.slice(0, 5);

  const totalInq = inquiries.length;
  const pct = (n: number) => (totalInq ? (n / totalInq) * 100 : 0);
  const topJobs = (jobStats?.applicationsPerJob ?? []).slice(0, 5);
  const maxApps = Math.max(1, ...topJobs.map((j) => j.applications));

  const stats = [
    {
      href: `${base}/inquiries`,
      icon: MessageSquare,
      tone: "blue",
      label: t.dash.inquiries,
      value: totalInq,
      sub: `${newCount} ${t.dash.newLabel}`,
    },
    {
      href: `${base}/products`,
      icon: Package,
      tone: "violet",
      label: t.dash.totalProducts,
      value: products.length,
    },
    {
      href: `${base}/categories`,
      icon: Layers,
      tone: "indigo",
      label: t.dash.categories ?? "Categories",
      value: categories.length,
    },
    {
      href: `${base}/users`,
      icon: Users,
      tone: "cyan",
      label: t.dash.totalUsers,
      value: users.length,
    },
    {
      href: `${base}/news`,
      icon: Newspaper,
      tone: "amber",
      label: t.dash.publishedNews,
      value: publishedNews,
      sub: `${news.length} ${t.dash.totalLabel}`,
    },
    {
      href: `${base}/partners`,
      icon: Handshake,
      tone: "green",
      label: t.dash.activePartners,
      value: activePartners,
      sub: `${partners.length} ${t.dash.totalLabel}`,
    },
    {
      href: `${base}/jobs`,
      icon: Briefcase,
      tone: "blue",
      label: t.dash.activeJobs,
      value: activeJobs,
    },
    {
      href: `${base}/applications`,
      icon: FileText,
      tone: "violet",
      label: t.dash.applications,
      value: totalApplications,
      sub: `${pendingApplications} ${t.dash.pendingLabel}`,
    },
  ];

  const statusRows = [
    { key: "NEW", label: t.dash.statusNew, n: newCount, tone: "blue" },
    { key: "IN_PROGRESS", label: t.dash.statusInProgress, n: inProgressCount, tone: "amber" },
    { key: "DONE", label: t.dash.statusDone, n: doneCount, tone: "green" },
  ];

  return (
    <div className="ov">
      <section className="ov-hero">
        <div>
          <p className="ov-hero__date">{formatDate(new Date().toISOString(), lang as Locale)}</p>
          <h1 className="ov-hero__title">
            {t.dash.welcomeBack}
            {user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="ov-hero__sub">{t.dash.adminPanel}</p>
        </div>
        <div className="ov-hero__chips">
          <Link href={`${base}/inquiries`} className="ov-chip">
            <strong>{newCount}</strong> {t.dash.newInquiries}
            <ArrowUpRight size={14} />
          </Link>
          <Link href={`${base}/applications`} className="ov-chip">
            <strong>{pendingApplications}</strong> {t.dash.pendingApplications}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {hasError && (
        <p role="alert" className="ov-alert">
          {t.dash.loadError}
        </p>
      )}

      <div className="ov-stats">
        {stats.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className={`ov-stat ov-stat--${c.tone}`}>
              <span className="ov-stat__icon">
                <Icon size={20} />
              </span>
              <span className="ov-stat__value">{c.value}</span>
              <span className="ov-stat__label">{c.label}</span>
              {c.sub && <span className="ov-stat__sub">{c.sub}</span>}
              <ArrowUpRight size={16} className="ov-stat__go" />
            </Link>
          );
        })}
      </div>

      <div className="ov-grid">
        <section className="ov-panel ov-panel--wide">
          <div className="ov-panel__head">
            <h2>{t.dash.recentInquiries}</h2>
            <Link href={`${base}/inquiries`} className="dash-section__link">
              {t.common.viewAll} →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty__icon">
                <MessageSquare size={24} />
              </div>
              <p>{t.dash.noData}</p>
              <Link
                href={`${base}/inquiries`}
                className="btn btn--ghost btn--sm dash-empty__cta"
                style={{ textDecoration: "none" }}
              >
                {t.dash.goToInquiries}
              </Link>
            </div>
          ) : (
            <div className="dash-table-wrap ov-table">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>{t.dash.product}</th>
                    <th>{t.dash.customer}</th>
                    <th>{t.dash.phone}</th>
                    <th>{t.dash.date}</th>
                    <th>{t.dash.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((inq) => (
                    <tr key={inq.id}>
                      <td>{getProductName(inq, lang)}</td>
                      <td>{inq.name}</td>
                      <td>{inq.phone}</td>
                      <td>{formatDate(inq.createdAt, lang as Locale)}</td>
                      <td>
                        <span
                          className={`status-badge status-badge--${inq.status.toLowerCase().replace("_", "-")}`}
                        >
                          {getStatusLabel(inq.status, t)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="ov-side">
          <section className="ov-panel">
            <div className="ov-panel__head">
              <h2>{t.dash.inquiries}</h2>
            </div>
            <div className="ov-seg" aria-hidden="true">
              {statusRows.map((r) => (
                <span
                  key={r.key}
                  className={`ov-seg__bar ov-tone--${r.tone}`}
                  style={{ width: `${pct(r.n)}%` }}
                />
              ))}
            </div>
            <ul className="ov-legend">
              {statusRows.map((r) => (
                <li key={r.key}>
                  <span className={`ov-dot ov-tone--${r.tone}`} />
                  <span>{r.label}</span>
                  <strong>{r.n}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="ov-panel">
            <div className="ov-panel__head">
              <h2>{t.dash.topJobs}</h2>
              <Link href={`${base}/jobs`} className="dash-section__link">
                {t.common.viewAll} →
              </Link>
            </div>
            {topJobs.length === 0 ? (
              <p className="ov-muted">{t.dash.noData}</p>
            ) : (
              <ul className="ov-bars">
                {topJobs.map((j) => (
                  <li key={j.id}>
                    <div className="ov-bars__row">
                      <span className="ov-bars__name">{j.title}</span>
                      <strong>{j.applications}</strong>
                    </div>
                    <div className="ov-bars__track">
                      <span style={{ width: `${(j.applications / maxApps) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
