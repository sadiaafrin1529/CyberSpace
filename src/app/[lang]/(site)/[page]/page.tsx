import OfficeMap from "@/components/OfficeMap";
import FaqAccordion from "@/components/FaqAccordion";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { FadeDown, FadeLeft, FadeRight, FadeUp } from "@/components/Motion";
import { ABOUT } from "@/lib/about-content";

const PAGES = ["about", "contact"] as const;
type PageKey = (typeof PAGES)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; page: string }>;
}): Promise<Metadata> {
  const { lang, page } = await params;
  if (!isLocale(lang) || !PAGES.includes(page as PageKey)) return {};
  const t = getDict(lang);
  return pageMeta(
    lang,
    `/${page}`,
    t.nav[page as PageKey],
    page === "about" ? ABOUT[lang].intro.text : t.home.aboutText,
  );
}

/* ── Content data ────────────────────────────────────────────── */

const CONTACT_INFO = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: { en: "Visit Us", az: "Bizi ziyarət edin", ru: "Наш офис" },
    lines: {
      en: ["14 Hasan Mejidov Street", "Baku, Azerbaijan"],
      az: ["Həsən Məcidov küç. 14", "Bakı, Azərbaycan"],
      ru: ["ул. Гасан Меджидов, 14", "Баку, Азербайджан"],
    },
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: { en: "Call Us", az: "Bizə zəng edin", ru: "Позвоните нам" },
    lines: {
      en: ["+994 12 404 74 45", "Mon–Fri 09:00–19:00, Sat 10:00–15:00"],
      az: ["+994 12 404 74 45", "B.e–Cümə 09:00–19:00, Şənbə 10:00–15:00"],
      ru: ["+994 12 404 74 45", "Пн–Пт 09:00–19:00, Сб 10:00–15:00"],
    },
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: { en: "Email Us", az: "Bizə e-poçt göndərin", ru: "Напишите нам" },
    lines: {
      en: ["info@cyberspace.az", "sales@cyberspace.az", "support@cyberspace.az"],
      az: ["info@cyberspace.az", "sales@cyberspace.az", "support@cyberspace.az"],
      ru: ["info@cyberspace.az", "sales@cyberspace.az", "support@cyberspace.az"],
    },
  },
];

const FAQS = [
  {
    q: {
      en: "How do I request a price quote?",
      az: "Necə qiymət sorğusu edə bilərəm?",
      ru: "Как запросить ценовое предложение?",
    },
    a: {
      en: "Open any product page, click 'Request Inquiry' and fill in your contact details. Our sales team responds within 4 business hours.",
      az: "Hər hansı məhsul səhifəsini açın, 'Sorğu Göndər' düyməsini basın və əlaqə məlumatlarınızı doldurun. Satış komandamız 4 iş saatı ərzində cavab verir.",
      ru: "Откройте страницу продукта, нажмите «Запросить коммерческое предложение» и заполните данные. Наша команда продаж отвечает в течение 4 рабочих часов.",
    },
  },
  {
    q: {
      en: "Do you offer installation services?",
      az: "Quraşdırma xidmətləri təklif edirsinizmi?",
      ru: "Предоставляете ли вы услуги установки?",
    },
    a: {
      en: "Yes. Our certified engineers perform on-site installation, cabling, configuration and handover testing for all hardware we supply.",
      az: "Bəli. Sertifikatlı mühəndislərimiz tədarük etdiyimiz bütün hardware üçün yerli quraşdırma, kabeli, konfiqurasiya və təhvil testlərini həyata keçirir.",
      ru: "Да. Наши сертифицированные инженеры выполняют монтаж, кабельную разводку, настройку и приёмо-сдаточные испытания для всего поставляемого оборудования.",
    },
  },
  {
    q: {
      en: "Are your products under official warranty?",
      az: "Məhsullarınız rəsmi zəmanət altındadırmı?",
      ru: "Имеют ли ваши продукты официальную гарантию?",
    },
    a: {
      en: "All products are sourced directly from authorised distributors and carry full manufacturer warranties registered in your name.",
      az: "Bütün məhsullar birbaşa səlahiyyətli distribütorlardan alınır və adınıza qeydiyyatdan keçmiş tam istehsalçı zəmanəti ilə gəlir.",
      ru: "Все продукты поставляются напрямую от авторизованных дистрибьюторов и несут полную гарантию производителя, зарегистрированную на ваше имя.",
    },
  },
  {
    q: {
      en: "Can you source products not listed on the website?",
      az: "Saytda siyahıda olmayan məhsulları ala bilərsinizmi?",
      ru: "Можете ли вы поставить продукты, не представленные на сайте?",
    },
    a: {
      en: "Yes. Our catalogue is a sample of in-stock items. Contact our sales team with your specifications and we will source it from our vendor network.",
      az: "Bəli. Kataloqimiz anbar məhsullarının nümunəsidir. Spesifikasiyalarınızla satış komandamızla əlaqə saxlayın, satıcı şəbəkəmizdən temin edəcəyik.",
      ru: "Да. Каталог — это лишь образец складских позиций. Свяжитесь с отделом продаж со спецификацией — мы найдём товар через нашу сеть вендоров.",
    },
  },
  {
    q: {
      en: "Do you offer leasing or financing options?",
      az: "Lizinq və ya maliyyələşdirmə seçənəkləri varmı?",
      ru: "Предоставляете ли вы варианты лизинга или финансирования?",
    },
    a: {
      en: "We work with several Azerbaijani banks on leasing programs for enterprise equipment. Ask our sales team for current program details.",
      az: "Biz korporativ avadanlıq üçün lizinq proqramları üzrə bir neçə Azərbaycan bankı ilə əməkdaşlıq edirik. Cari proqram detalları üçün satış komandamıza müraciət edin.",
      ru: "Мы сотрудничаем с несколькими азербайджанскими банками по лизинговым программам для корпоративного оборудования. Обратитесь к нашей команде продаж за актуальными условиями.",
    },
  },
];

/* ── Render ──────────────────────────────────────────────────── */
export default async function InfoPage({
  params,
}: {
  params: Promise<{ lang: string; page: string }>;
}) {
  const { lang, page } = await params;
  if (page === "news") redirect(`/${lang}/news`);
  if (page === "services") redirect(`/${lang}`);
  if (!isLocale(lang) || !PAGES.includes(page as PageKey)) notFound();
  const t = getDict(lang);
  const key = page as PageKey;
  const L = lang as Locale;
  const A = ABOUT[L];

  return (
    <>
      {/* ── Page Hero ── */}
      <section className="pagehero">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <a href={`/${lang}`}>{t.nav.home}</a>
            <span>/</span>
            <span>{t.nav[key]}</span>
          </nav>
          <FadeDown>
            <h1>{t.nav[key]}</h1>
          </FadeDown>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      {key === "about" && (
        <div className="info-body">
          <section className="container section">
            <FadeUp className="info-mission about-intro">
              <h2 className="info-mission__title">{A.intro.title}</h2>
              <p className="prose info-mission__text">{A.intro.text}</p>
            </FadeUp>
          </section>

          {A.sections.map((sec, i) => (
            <section
              key={sec.title}
              className={i % 2 === 0 ? "info-alt-section" : "container section"}
            >
              <div className={i % 2 === 0 ? "container" : undefined}>
                <FadeUp className="about-block">
                  <div className="about-block__head">
                    <span className="about-block__num">{String(i + 1).padStart(2, "0")}</span>
                    <h2>{sec.title}</h2>
                  </div>
                  <div className="about-block__body">
                    {sec.paras.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ═══════════ CONTACT ═══════════ */}
      {key === "contact" && (
        <div className="info-body">
          <section className="container section">
            <FadeUp className="info-section-head">
              <p className="eyebrow cats-eyebrow">
                {{ en: "Get in touch", az: "Əlaqə saxlayın", ru: "Свяжитесь с нами" }[L]}
              </p>
              <h2>
                {
                  {
                    en: "We'd love to hear from you",
                    az: "Sizdən eşitməyi çox istərdik",
                    ru: "Мы будем рады услышать вас",
                  }[L]
                }
              </h2>
              <p className="info-lead">
                {
                  {
                    en: "Reach out to our team for product enquiries, pricing, technical support or partnership opportunities.",
                    az: "Məhsul sorğuları, qiymət, texniki dəstək və ya tərəfdaşlıq imkanları üçün komandamızla əlaqə saxlayın.",
                    ru: "Свяжитесь с нашей командой по вопросам продуктов, ценообразования, технической поддержки или партнёрства.",
                  }[L]
                }
              </p>
            </FadeUp>
            <div className="contact-grid">
              {CONTACT_INFO.map((c, i) => (
                <FadeUp key={i} delay={i * 0.08} className="contact-card">
                  <div className="contact-card__icon">{c.icon}</div>
                  <h3 className="contact-card__label">{c.label[L]}</h3>
                  {c.lines[L].map((line) => (
                    <p key={line} className="contact-card__line">
                      {line}
                    </p>
                  ))}
                </FadeUp>
              ))}
            </div>
          </section>

          <section className="info-alt-section">
            <div className="container">
              <FadeUp className="info-section-head">
                <p className="eyebrow cats-eyebrow">FAQ</p>
                <h2>
                  {
                    {
                      en: "Frequently Asked Questions",
                      az: "Tez-tez Verilən Suallar",
                      ru: "Часто задаваемые вопросы",
                    }[L]
                  }
                </h2>
              </FadeUp>
              <FaqAccordion items={FAQS.map((f) => ({ q: f.q[L], a: f.a[L] }))} />
            </div>
          </section>

          <section className="container section office-map-section">
            <FadeUp>
              <OfficeMap
                title={{ en: "Our Office", az: "Ofisimiz", ru: "Наш офис" }[L]}
                directionsLabel={
                  { en: "Get Directions", az: "Yol tarifi al", ru: "Построить маршрут" }[L]
                }
                unavailableLabel={
                  {
                    en: "The map is currently unavailable.",
                    az: "Xəritə hazırda əlçatan deyil.",
                    ru: "Карта сейчас недоступна.",
                  }[L]
                }
              />
            </FadeUp>
          </section>

          <section className="info-cta-band">
            <FadeUp className="container info-cta-band__inner">
              <div>
                <h2>
                  {
                    {
                      en: "Need a price or demo?",
                      az: "Qiymət və ya demo lazımdır?",
                      ru: "Нужна цена или демо?",
                    }[L]
                  }
                </h2>
                <p>
                  {
                    {
                      en: "Browse our product catalogue and send an inquiry from any product page.",
                      az: "Məhsul kataloqimizə baxın və istənilən məhsul səhifəsindən sorğu göndərin.",
                      ru: "Просмотрите каталог продуктов и отправьте запрос с любой страницы продукта.",
                    }[L]
                  }
                </p>
              </div>
              <Link href={`/${lang}/shop`} className="btn btn--primary btn--lg">
                {{ en: "Browse Products", az: "Məhsullara bax", ru: "Перейти в каталог" }[L]}
              </Link>
            </FadeUp>
          </section>
        </div>
      )}
    </>
  );
}
