import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { ABOUT } from "@/lib/about-content";
import { TEAM } from "@/lib/team";
import { FadeDown, FadeUp } from "@/components/Motion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMeta(lang, "/team", getDict(lang).nav.team, ABOUT[lang].intro.text);
}

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const { intro } = ABOUT[lang];
  const [lead, ...rest] = TEAM;

  return (
    <>
      <section className="pagehero">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <a href={`/${lang}`}>{t.nav.home}</a>
            <span>/</span>
            <span>{t.nav.team}</span>
          </nav>
          <FadeDown>
            <h1>{t.nav.team}</h1>
            <p>{intro.title}</p>
          </FadeDown>
        </div>
      </section>

      <div className="info-body">
        <section className="container team-lead-section">
          <FadeUp className="team-lead">
            <div className="team-lead__photo">
              <Image
                src={lead.photo}
                alt={`${lead.name} — ${lead.role[lang]}`}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 380px"
              />
            </div>
            <div className="team-lead__body">
              <span className="team-lead__role">{lead.role[lang]}</span>
              <h2>{lead.name}</h2>
              <span className="team-lead__rule" aria-hidden="true" />
              <p className="prose">{intro.text}</p>
            </div>
          </FadeUp>
        </section>

        <section className="info-alt-section">
          <div className="container">
            <ul className="team-grid">
              {rest.map((m, i) => (
                <li key={m.name}>
                  <FadeUp delay={(i % 3) * 0.08} className="team-card">
                    <div className="team-card__photo">
                      <Image
                        src={m.photo}
                        alt={`${m.name} — ${m.role[lang]}`}
                        fill
                        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 380px"
                      />
                    </div>
                    <div className="team-card__info">
                      <h3>{m.name}</h3>
                      <p>{m.role[lang]}</p>
                    </div>
                  </FadeUp>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="info-cta-band">
          <FadeUp className="container info-cta-band__inner">
            <h2>{intro.title}</h2>
            <Link href={`/${lang}/about`} className="btn btn--primary btn--lg">
              {t.nav.about}
            </Link>
          </FadeUp>
        </section>
      </div>
    </>
  );
}
