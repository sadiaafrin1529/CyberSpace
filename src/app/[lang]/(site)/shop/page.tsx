import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShopClient from "@/components/ShopClient";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { FadeDown, FadeUp } from "@/components/Motion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return pageMeta(lang, "/shop", t.shop.title, t.shop.subtitle);
}

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <>
      <section className="shophero">
        <svg className="shophero__art" viewBox="0 0 520 260" fill="none" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="1">
            <circle cx="400" cy="130" r="40" />
            <circle cx="400" cy="130" r="80" opacity=".7" />
            <circle cx="400" cy="130" r="120" opacity=".45" />
            <circle cx="400" cy="130" r="165" opacity=".25" />
            <path d="M0 200h210l30-30h120M0 150h150l24 24h90M240 260v-50l30-30" opacity=".5" />
          </g>
          <g fill="currentColor">
            <circle cx="360" cy="170" r="3" />
            <circle cx="400" cy="90" r="3" />
            <circle cx="470" cy="150" r="3" />
            <circle cx="174" cy="174" r="3" opacity=".6" />
          </g>
        </svg>
        <div className="container shophero__in">
          <nav className="crumbs crumbs--shop" aria-label="Breadcrumb">
            <Link href={`/${lang}`}>{t.nav.home}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{t.shop.title}</span>
          </nav>
          <FadeDown>
            <h1>{t.shop.title}</h1>
          </FadeDown>
          <FadeUp delay={0.06}>
            <p>{t.shop.subtitle}</p>
          </FadeUp>
        </div>
      </section>
      <Suspense
        fallback={
          <div className="container section">
            <ProductGridSkeleton />
          </div>
        }
      >
        <ShopClient />
      </Suspense>
    </>
  );
}
