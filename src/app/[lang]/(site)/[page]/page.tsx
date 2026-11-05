import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { BACKEND_URL } from "@/lib/server-auth";
import { FadeDown, FadeLeft, FadeRight, FadeUp, ZoomIn } from "@/components/Motion";
import PartnerCard from "@/components/PartnerCard";

export const dynamic = "force-dynamic";

const PAGES = ["about", "solutions", "partners", "contact"] as const;
type PageKey = (typeof PAGES)[number];

const MIGRATE: Record<Locale, string> = {
  en: "Full page content will be migrated from the current Cyberspace.az website.",
  az: "Tam səhifə məzmunu mövcud Cyberspace.az saytından köçürüləcək.",
  ru: "Полное содержание страницы будет перенесено с текущего сайта Cyberspace.az.",
};

interface DbPartner {
  id: number; name: string; logoUrl: string | null;
  descEN: string | null; descAZ: string | null; descRU: string | null;
  websiteUrl: string | null;
}

async function fetchActivePartners(): Promise<DbPartner[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/partners/active`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; page: string }> }): Promise<Metadata> {
  const { lang, page } = await params;
  if (!isLocale(lang) || !PAGES.includes(page as PageKey)) return {};
  const t = getDict(lang);
  return pageMeta(lang, `/${page}`, t.nav[page as PageKey], t.home.aboutText);
}

/* ── Content data ────────────────────────────────────────────── */

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: { en: "Customer Focus", az: "Müştəri Yönümlülük", ru: "Ориентация на клиента" },
    desc:  { en: "Every decision starts with our clients. We listen, understand and deliver solutions that match real business needs.", az: "Hər qərar müştərilərimizdən başlayır. Biz dinləyir, anlayır və real biznes ehtiyaclarına uyğun həllər çatdırırıq.", ru: "Каждое решение начинается с наших клиентов. Мы слушаем, понимаем и предлагаем решения под реальные бизнес-задачи." },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: { en: "Technical Expertise", az: "Texniki Ekspertiza", ru: "Техническая экспертиза" },
    desc:  { en: "Our certified engineers bring deep product knowledge and hands-on experience across every major vendor.", az: "Sertifikatlı mühəndislərimiz hər böyük satıcı üzrə dərin məhsul bilikləri və əməli təcrübəyə malikdir.", ru: "Наши сертифицированные инженеры обладают глубокими знаниями продуктов и практическим опытом работы со всеми ведущими вендорами." },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: { en: "Trusted Partnerships", az: "Etibar Tərəfdaşlığı", ru: "Доверенное партнёрство" },
    desc:  { en: "We are authorised resellers for the world's leading IT brands, giving our customers genuine products and official support.", az: "Biz dünyanın aparıcı IT brendlərinin səlahiyyətli distribütorlarıyıq, müştərilərimizə orijinal məhsullar və rəsmi dəstək təklif edirik.", ru: "Мы являемся авторизованными реселлерами ведущих мировых IT-брендов, обеспечивая клиентов оригинальными продуктами и официальной поддержкой." },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: { en: "Local Presence", az: "Yerli Mövcudluq", ru: "Местное присутствие" },
    desc:  { en: "Headquartered in Baku with local warehousing and a field team, we provide fast, responsive service across Azerbaijan.", az: "Bakıda baş ofisilə, yerli anbar və sahə komandası ilə biz bütün Azərbaycan boyu sürətli və cavabdeh xidmət göstəririk.", ru: "Головной офис в Баку, местный склад и выездная команда обеспечивают быстрое реагирование по всему Азербайджану." },
  },
];

const TIMELINE = [
  { year: "1998", en: "Founded in Baku with a small team, initially focused on selling computers and technology equipment.", az: "Bakıda kiçik komanda ilə yarandı, əvvəlcə kompüter və texnoloji avadanlıqların satışına fokuslandı.", ru: "Основана в Баку небольшой командой, изначально специализировалась на продаже компьютеров и техники." },
  { year: "2009", en: "Combined multiple service lines and expanded customer choice through international market research and staff training.", az: "Bir çox xidməti birləşdirdi, xarici bazar araşdırmaları və təlimlərlə müştərilər üçün seçim imkanlarını genişləndirdi.", ru: "Объединила несколько направлений услуг, расширив выбор для клиентов за счёт зарубежных исследований рынка и обучения персонала." },
  { year: "2019", en: "Fully adapted to the modern era, delivering numerous projects; partnerships with leading national companies became a hallmark of quality.", az: "Müasir dövrə tam uyğunlaşaraq bir çox layihəyə imza atdı; ölkənin aparıcı şirkətləri ilə əməkdaşlıq keyfiyyətin göstəricisinə çevrildi.", ru: "Полностью адаптировалась к современным реалиям, реализовав множество проектов; сотрудничество с ведущими компаниями страны стало показателем качества." },
];

const CERTIFICATIONS = [
  { vendor: "Dell Technologies", tier: { en: "Gold Partner", az: "Gold Tərəfdaş", ru: "Золотой партнёр" }, level: "gold",   icon: "D" },
  { vendor: "HPE",               tier: { en: "Platinum Partner", az: "Platinum Tərəfdaş", ru: "Платиновый партнёр" }, level: "plat", icon: "H" },
  { vendor: "Cisco",             tier: { en: "Premier Partner", az: "Premier Tərəfdaş", ru: "Премьер-партнёр" }, level: "blue", icon: "C" },
  { vendor: "Fortinet",          tier: { en: "Gold Partner", az: "Gold Tərəfdaş", ru: "Золотой партнёр" }, level: "gold",   icon: "F" },
  { vendor: "Microsoft",         tier: { en: "Gold Partner", az: "Gold Tərəfdaş", ru: "Золотой партнёр" }, level: "gold",   icon: "M" },
  { vendor: "Axis Comm.",        tier: { en: "Authorized", az: "Səlahiyyətli", ru: "Авторизованный" }, level: "silver", icon: "A" },
];

const TEAM_STATS = [
  { num: "50+", label: { en: "Engineers", az: "Mühəndis", ru: "Инженеров" }, color: "#1457d9" },
  { num: "12",  label: { en: "Sales team", az: "Satış komandası", ru: "Продажи" }, color: "#059669" },
  { num: "8",   label: { en: "Support desk", az: "Dəstək masası", ru: "Поддержка" }, color: "#7c3aed" },
  { num: "5",   label: { en: "Project mgrs", az: "Layihə müdirləri", ru: "PM" }, color: "#d97706" },
];

const SOLUTIONS = [
  {
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/>
        <circle cx="19" cy="5.5" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12.5" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="19.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title:    { en: "Server Infrastructure",          az: "Server İnfrastrukturu",          ru: "Серверная инфраструктура" },
    desc:     { en: "Design, supply and deploy enterprise-grade server environments built for reliability and scale.", az: "Etibarlılıq və miqyas üçün nəzərdə tutulmuş korporativ server mühitlərini dizayn edin, tədarük edin və yerləşdirin.", ru: "Проектирование, поставка и развёртывание серверных сред корпоративного уровня." },
    features: { en: ["Rack, tower and blade servers", "Hyper-converged infrastructure", "UPS and power management", "Rack systems and cooling"], az: ["Stend, qüllə və blade serverlər", "Hiperkonvergent infrastruktur", "UPS və güc idarəetməsi", "Stend sistemləri və soyutma"], ru: ["Стоечные, башенные и блейд-серверы", "Гиперконвергентная инфраструктура", "ИБП и управление питанием", "Стоечные системы и охлаждение"] },
  },
  {
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <circle cx="12" cy="20" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title:    { en: "Network Infrastructure",    az: "Şəbəkə İnfrastrukturu",    ru: "Сетевая инфраструктура" },
    desc:     { en: "Build scalable, managed networks that keep your organisation connected and secure from campus to branch.", az: "Kampusdan filiala qədər təşkilatınızı qoşulmuş və təhlükəsiz saxlayan miqyaslana bilən, idarə olunan şəbəkələr qurun.", ru: "Создайте масштабируемые управляемые сети для подключения и защиты организации от кампуса до филиала." },
    features: { en: ["Switching and routing", "Wi-Fi 6 access points", "SD-WAN solutions", "Network monitoring and management"], az: ["Kommutasiya və marşrutlaşdırma", "Wi-Fi 6 giriş nöqtələri", "SD-WAN həlləri", "Şəbəkə monitorinqi və idarəetməsi"], ru: ["Коммутация и маршрутизация", "Точки доступа Wi-Fi 6", "Решения SD-WAN", "Мониторинг и управление сетью"] },
  },
  {
    color: "red",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title:    { en: "Cybersecurity",          az: "Kibertəhlükəsizlik",          ru: "Кибербезопасность" },
    desc:     { en: "Protect your organisation with a layered security approach — from perimeter defence to endpoint and video surveillance.", az: "Perimetr müdafiəsindən endpoint-ə və video müşahidəyə qədər çoxqatlı təhlükəsizlik yanaşması ilə təşkilatınızı qoruyun.", ru: "Защитите организацию многоуровневым подходом: от периметра до конечных устройств и видеонаблюдения." },
    features: { en: ["Next-generation firewalls (FortiGate)", "Endpoint protection", "IP video surveillance (Axis)", "Access control and monitoring"], az: ["Növbəti nəsil firewall (FortiGate)", "Endpoint qorunması", "IP video müşahidə (Axis)", "Giriş nəzarəti və monitorinq"], ru: ["NGFW (FortiGate)", "Защита конечных устройств", "IP-видеонаблюдение (Axis)", "Контроль доступа и мониторинг"] },
  },
  {
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    title:    { en: "Data Storage & Backup",  az: "Məlumat Yaddaşı və Ehtiyat",  ru: "Хранение данных и резервное копирование" },
    desc:     { en: "Store, protect and recover your business data with enterprise storage arrays, NAS and tape backup systems.", az: "Korporativ yaddaş massivləri, NAS və lent ehtiyat sistemləri ilə biznes məlumatlarınızı saxlayın, qoruyun və bərpa edin.", ru: "Храните, защищайте и восстанавливайте бизнес-данные с помощью корпоративных СХД, NAS и ленточных систем резервного копирования." },
    features: { en: ["All-flash storage arrays (Dell PowerStore)", "NAS and hybrid storage", "Tape libraries (HPE StoreEver)", "Backup software and DR planning"], az: ["Tam flash yaddaş massivləri (Dell PowerStore)", "NAS və hibrid yaddaş", "Lent kitabxanaları (HPE StoreEver)", "Ehtiyat proqramı və DR planlaması"], ru: ["Полностью флэш СХД (Dell PowerStore)", "NAS и гибридное хранение", "Ленточные библиотеки (HPE StoreEver)", "ПО для резервного копирования и планирование DR"] },
  },
  {
    color: "green",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title:    { en: "Software & Licensing",   az: "Proqram və Lisenziyalaşdırma",  ru: "Программное обеспечение и лицензирование" },
    desc:     { en: "Get genuine, volume-licensed software with full vendor support — from Microsoft 365 to Windows Server and security suites.", az: "Microsoft 365-dən Windows Server-ə və təhlükəsizlik paketlərinə qədər tam satıcı dəstəyi ilə orijinal, həcmli lisenziyalı proqram əldə edin.", ru: "Подлинное программное обеспечение с корпоративными лицензиями и полной поддержкой вендора — от Microsoft 365 до Windows Server." },
    features: { en: ["Microsoft 365 and Windows licensing", "Windows Server and SQL Server", "Security and endpoint software", "Volume and open licensing programs"], az: ["Microsoft 365 və Windows lisenziyaları", "Windows Server və SQL Server", "Təhlükəsizlik və endpoint proqramı", "Həcmli və açıq lisenziyalaşdırma proqramları"], ru: ["Лицензирование Microsoft 365 и Windows", "Windows Server и SQL Server", "Защита и ПО для конечных устройств", "Корпоративное и открытое лицензирование"] },
  },
  {
    color: "indigo",
    icon: (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title:    { en: "End-User Computing",     az: "Son İstifadəçi Hesablaması",   ru: "Рабочие места" },
    desc:     { en: "Equip your workforce with business-grade laptops, desktops, monitors and accessories from leading brands.", az: "İş gücünüzü aparıcı brendlərin biznes sinifli noutbukları, masa kompüterləri, monitorları və aksesuarları ilə təchiz edin.", ru: "Оснастите сотрудников ноутбуками, ПК, мониторами и аксессуарами бизнес-класса от ведущих брендов." },
    features: { en: ["Business laptops (ThinkPad, EliteBook)", "Compact desktops and workstations", "4K monitors and peripherals", "Keyboard, mice and conferencing gear"], az: ["Biznes noutbuklar (ThinkPad, EliteBook)", "Yığcam masaüstü kompüterlər və iş stansiyaları", "4K monitorlar və periferiya", "Klaviatura, siçan və konfrans avadanlığı"], ru: ["Бизнес-ноутбуки (ThinkPad, EliteBook)", "Компактные ПК и рабочие станции", "4K-мониторы и периферия", "Клавиатуры, мыши и конференц-оборудование"] },
  },
];

const INDUSTRIES = [
  { icon: "🏦", name: { en: "Banking & Finance", az: "Bank & Maliyyə", ru: "Банки и финансы" } },
  { icon: "⛽", name: { en: "Oil & Gas",          az: "Neft & Qaz",     ru: "Нефть и газ" } },
  { icon: "🏥", name: { en: "Healthcare",         az: "Səhiyyə",        ru: "Здравоохранение" } },
  { icon: "🏛️", name: { en: "Government",         az: "Dövlət",         ru: "Госсектор" } },
  { icon: "✈️", name: { en: "Transport & Logistics", az: "Nəqliyyat", ru: "Транспорт и логистика" } },
  { icon: "🎓", name: { en: "Education",          az: "Təhsil",         ru: "Образование" } },
  { icon: "📡", name: { en: "Telecom",            az: "Telekommunikasiya", ru: "Телеком" } },
  { icon: "🏗️", name: { en: "Construction",       az: "İnşaat",         ru: "Строительство" } },
];

const CONTACT_INFO = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: { en: "Visit Us",      az: "Bizi ziyarət edin",     ru: "Наш офис" },
    lines: {
      en: ["14 Hasan Mejidov Street", "Baku, Azerbaijan"],
      az: ["Həsən Məcidov küç. 14", "Bakı, Azərbaycan"],
      ru: ["ул. Гасан Меджидов, 14", "Баку, Азербайджан"],
    },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: { en: "Call Us",       az: "Bizə zəng edin",        ru: "Позвоните нам" },
    lines: {
      en: ["+994 12 404 74 45", "Mon–Fri 09:00–19:00, Sat 10:00–15:00"],
      az: ["+994 12 404 74 45", "B.e–Cümə 09:00–19:00, Şənbə 10:00–15:00"],
      ru: ["+994 12 404 74 45", "Пн–Пт 09:00–19:00, Сб 10:00–15:00"],
    },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: { en: "Email Us",      az: "Bizə e-poçt göndərin",  ru: "Напишите нам" },
    lines: {
      en: ["info@cyberspace.az", "sales@cyberspace.az", "support@cyberspace.az"],
      az: ["info@cyberspace.az", "sales@cyberspace.az", "support@cyberspace.az"],
      ru: ["info@cyberspace.az", "sales@cyberspace.az", "support@cyberspace.az"],
    },
  },
];

const FAQS = [
  {
    q: { en: "How do I request a price quote?",           az: "Necə qiymət sorğusu edə bilərəm?",           ru: "Как запросить ценовое предложение?" },
    a: { en: "Open any product page, click 'Request Inquiry' and fill in your contact details. Our sales team responds within 4 business hours.", az: "Hər hansı məhsul səhifəsini açın, 'Sorğu Göndər' düyməsini basın və əlaqə məlumatlarınızı doldurun. Satış komandamız 4 iş saatı ərzində cavab verir.", ru: "Откройте страницу продукта, нажмите «Запросить коммерческое предложение» и заполните данные. Наша команда продаж отвечает в течение 4 рабочих часов." },
  },
  {
    q: { en: "Do you offer installation services?",       az: "Quraşdırma xidmətləri təklif edirsinizmi?",    ru: "Предоставляете ли вы услуги установки?" },
    a: { en: "Yes. Our certified engineers perform on-site installation, cabling, configuration and handover testing for all hardware we supply.", az: "Bəli. Sertifikatlı mühəndislərimiz tədarük etdiyimiz bütün hardware üçün yerli quraşdırma, kabeli, konfiqurasiya və təhvil testlərini həyata keçirir.", ru: "Да. Наши сертифицированные инженеры выполняют монтаж, кабельную разводку, настройку и приёмо-сдаточные испытания для всего поставляемого оборудования." },
  },
  {
    q: { en: "Are your products under official warranty?", az: "Məhsullarınız rəsmi zəmanət altındadırmı?",    ru: "Имеют ли ваши продукты официальную гарантию?" },
    a: { en: "All products are sourced directly from authorised distributors and carry full manufacturer warranties registered in your name.", az: "Bütün məhsullar birbaşa səlahiyyətli distribütorlardan alınır və adınıza qeydiyyatdan keçmiş tam istehsalçı zəmanəti ilə gəlir.", ru: "Все продукты поставляются напрямую от авторизованных дистрибьюторов и несут полную гарантию производителя, зарегистрированную на ваше имя." },
  },
  {
    q: { en: "Can you source products not listed on the website?", az: "Saytda siyahıda olmayan məhsulları ala bilərsinizmi?", ru: "Можете ли вы поставить продукты, не представленные на сайте?" },
    a: { en: "Yes. Our catalogue is a sample of in-stock items. Contact our sales team with your specifications and we will source it from our vendor network.", az: "Bəli. Kataloqimiz anbar məhsullarının nümunəsidir. Spesifikasiyalarınızla satış komandamızla əlaqə saxlayın, satıcı şəbəkəmizdən temin edəcəyik.", ru: "Да. Каталог — это лишь образец складских позиций. Свяжитесь с отделом продаж со спецификацией — мы найдём товар через нашу сеть вендоров." },
  },
  {
    q: { en: "Do you offer leasing or financing options?", az: "Lizinq və ya maliyyələşdirmə seçənəkləri varmı?", ru: "Предоставляете ли вы варианты лизинга или финансирования?" },
    a: { en: "We work with several Azerbaijani banks on leasing programs for enterprise equipment. Ask our sales team for current program details.", az: "Biz korporativ avadanlıq üçün lizinq proqramları üzrə bir neçə Azərbaycan bankı ilə əməkdaşlıq edirik. Cari proqram detalları üçün satış komandamıza müraciət edin.", ru: "Мы сотрудничаем с несколькими азербайджанскими банками по лизинговым программам для корпоративного оборудования. Обратитесь к нашей команде продаж за актуальными условиями." },
  },
];

/* ── Render ──────────────────────────────────────────────────── */
export default async function InfoPage({ params }: { params: Promise<{ lang: string; page: string }> }) {
  const { lang, page } = await params;
  if (page === "news") redirect(`/${lang}/news`);
  if (page === "services") redirect(`/${lang}`);
  if (!isLocale(lang) || !PAGES.includes(page as PageKey)) notFound();
  const t = getDict(lang);
  const key = page as PageKey;
  const L = lang as Locale;

  const dbPartners = key === "partners" ? await fetchActivePartners() : [];

  return (
    <>
      {/* ── Page Hero ── */}
      <section className="pagehero">
        <div className="container">
          <nav className="crumbs crumbs--light" aria-label="Breadcrumb">
            <a href={`/${lang}`}>{t.nav.home}</a><span>/</span><span>{t.nav[key]}</span>
          </nav>
          <FadeDown><h1>{t.nav[key]}</h1></FadeDown>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      {key === "about" && (
        <div className="info-body">
          <section className="container section">
            <FadeUp className="info-mission">
              <p className="eyebrow cats-eyebrow">{t.home.eyebrow}</p>
              <h2 className="info-mission__title">{t.home.aboutTitle}</h2>
              <p className="prose info-mission__text">{t.home.aboutText} We have built long-term partnerships with the world&rsquo;s leading IT manufacturers and bring their technology directly to businesses across Azerbaijan with local expertise, fast logistics and after-sales support.</p>
            </FadeUp>
          </section>

          <section className="info-alt-section">
            <div className="container">
              <FadeUp className="info-section-head">
                <p className="eyebrow cats-eyebrow">{ { en: "What drives us", az: "Bizi nə idarə edir", ru: "Что нами движет" }[L] }</p>
                <h2>{ { en: "Our Core Values", az: "Əsas Dəyərlərimiz", ru: "Наши ценности" }[L] }</h2>
              </FadeUp>
              <div className="icard-grid">
                {VALUES.map((v, i) => (
                  <FadeUp key={i} delay={(i % 4) * 0.06} className="icard">
                    <div className="icard__icon">{v.icon}</div>
                    <h3 className="icard__title">{v.title[L]}</h3>
                    <p className="icard__desc">{v.desc[L]}</p>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          <section className="container section">
            <FadeUp className="info-section-head">
              <p className="eyebrow cats-eyebrow">{ { en: "Official status", az: "Rəsmi status", ru: "Официальный статус" }[L] }</p>
              <h2>{ { en: "Vendor Certifications", az: "Satıcı Sertifikatları", ru: "Сертификаты вендоров" }[L] }</h2>
            </FadeUp>
            <div className="cert-grid">
              {CERTIFICATIONS.map((c, i) => (
                <ZoomIn key={c.vendor} delay={i * 0.055} className={`cert-badge cert-badge--${c.level}`}>
                  <div className="cert-badge__icon">{c.icon}</div>
                  <p className="cert-badge__vendor">{c.vendor}</p>
                  <p className="cert-badge__tier">{c.tier[L]}</p>
                </ZoomIn>
              ))}
            </div>
          </section>

          <section className="info-alt-section">
            <div className="container">
              <FadeUp className="info-section-head">
                <p className="eyebrow cats-eyebrow">{ { en: "Our journey", az: "Yolumuz", ru: "Наш путь" }[L] }</p>
                <h2>{ { en: "Company History", az: "Şirkət Tarixi", ru: "История компании" }[L] }</h2>
              </FadeUp>
              <div className="timeline">
                {TIMELINE.map((item, i) => (
                  <FadeUp key={item.year} delay={i * 0.06} className="timeline__item">
                    <div className="timeline__year">{item.year}</div>
                    <div className="timeline__dot" />
                    <div className="timeline__text">{item[L]}</div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          <section className="container section">
            <FadeUp className="info-section-head">
              <h2>{ { en: "Our Team", az: "Komandamız", ru: "Наша команда" }[L] }</h2>
            </FadeUp>
            <div className="team-stat-grid">
              {TEAM_STATS.map((s, i) => (
                <FadeUp key={i} delay={i * 0.06} className="team-stat-card">
                  <div className="team-stat-card__num" style={{ color: s.color }}>{s.num}</div>
                  <div className="team-stat-card__label">{s.label[L]}</div>
                </FadeUp>
              ))}
            </div>
          </section>

          <FadeUp className="container" style={{ marginBottom: "56px" }}>
            <p className="notice">{MIGRATE[L]}</p>
          </FadeUp>
        </div>
      )}

      {/* ═══════════ SOLUTIONS ═══════════ */}
      {key === "solutions" && (
        <div className="info-body">
          <section className="container section">
            <FadeUp className="info-section-head">
              <p className="eyebrow cats-eyebrow">{ { en: "What we offer", az: "Nə təklif edirik", ru: "Что мы предлагаем" }[L] }</p>
              <h2>{ { en: "End-to-End IT Solutions", az: "Tam Həcmli IT Həlləri", ru: "Комплексные IT-решения" }[L] }</h2>
              <p className="info-lead">{ { en: "From servers and networking to security and software — we design and deliver complete technology environments tailored to your business.", az: "Serverlərdən şəbəkəyə, təhlükəsizlikdən proqrama qədər — biznesinizə uyğunlaşdırılmış tam texnologiya mühitlərini dizayn edir və çatdırırıq.", ru: "От серверов и сетей до безопасности и программного обеспечения — проектируем и поставляем комплексные технологические среды под ваш бизнес." }[L] }</p>
            </FadeUp>
            <div className="sol-grid">
              {SOLUTIONS.map((s, i) => (
                <FadeUp key={i} delay={(i % 3) * 0.07} className={`sol-card sol-card--${s.color}`}>
                  <div className="sol-card__icon">{s.icon}</div>
                  <h3 className="sol-card__title">{s.title[L]}</h3>
                  <p className="sol-card__desc">{s.desc[L]}</p>
                  <ul className="sol-card__list">
                    {s.features[L].map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <Link href={`/${lang}/shop`} className="sol-card__link">
                    { { en: "Browse products →", az: "Məhsullara bax →", ru: "Смотреть продукты →" }[L] }
                  </Link>
                </FadeUp>
              ))}
            </div>
          </section>

          <section className="info-alt-section">
            <div className="container">
              <FadeUp className="info-section-head">
                <p className="eyebrow cats-eyebrow">{ { en: "Who we serve", az: "Kimə xidmət edirik", ru: "Кому мы помогаем" }[L] }</p>
                <h2>{ { en: "Industries We Serve", az: "Xidmət Etdiyimiz Sənayeler", ru: "Отрасли, которым мы помогаем" }[L] }</h2>
              </FadeUp>
              <div className="industry-grid">
                {INDUSTRIES.map((ind, i) => (
                  <ZoomIn key={i} delay={(i % 4) * 0.05} className="industry-card">
                    <div className="industry-card__icon">{ind.icon}</div>
                    <div className="industry-card__name">{ind.name[L]}</div>
                  </ZoomIn>
                ))}
              </div>
            </div>
          </section>

          <FadeUp className="container" style={{ marginBottom: "56px" }}>
            <p className="notice">{MIGRATE[L]}</p>
          </FadeUp>
        </div>
      )}

      {/* ═══════════ PARTNERS ═══════════ */}
      {key === "partners" && (
        <div className="info-body">
          <section className="container section">
            <FadeUp className="info-section-head">
              <p className="eyebrow cats-eyebrow">{ { en: "Authorised reseller", az: "Səlahiyyətli distribütor", ru: "Авторизованный реселлер" }[L] }</p>
              <h2>{ { en: "Our Technology Partners", az: "Texnologiya Tərəfdaşlarımız", ru: "Наши технологические партнёры" }[L] }</h2>
              <p className="info-lead">{ { en: "We are authorised resellers for 10 of the world's leading IT brands, giving you genuine products, official warranties and direct vendor support.", az: "Biz dünyanın aparıcı 10 IT brendinin səlahiyyətli distribütorlarıyıq, sizə orijinal məhsullar, rəsmi zəmanətlər və birbaşa satıcı dəstəyi təklif edirik.", ru: "Мы являемся авторизованными реселлерами 10 ведущих мировых IT-брендов — гарантируем подлинность продуктов, официальную гарантию и поддержку вендора." }[L] }</p>
            </FadeUp>
            <div className="partner-grid">
              {dbPartners.map((p, i) => (
                <FadeUp key={p.id} delay={(i % 5) * 0.05}>
                  <PartnerCard partner={p} />
                </FadeUp>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ═══════════ CONTACT ═══════════ */}
      {key === "contact" && (
        <div className="info-body">
          <section className="container section">
            <FadeUp className="info-section-head">
              <p className="eyebrow cats-eyebrow">{ { en: "Get in touch", az: "Əlaqə saxlayın", ru: "Свяжитесь с нами" }[L] }</p>
              <h2>{ { en: "We'd love to hear from you", az: "Sizdən eşitməyi çox istərdik", ru: "Мы будем рады услышать вас" }[L] }</h2>
              <p className="info-lead">{ { en: "Reach out to our team for product enquiries, pricing, technical support or partnership opportunities.", az: "Məhsul sorğuları, qiymət, texniki dəstək və ya tərəfdaşlıq imkanları üçün komandamızla əlaqə saxlayın.", ru: "Свяжитесь с нашей командой по вопросам продуктов, ценообразования, технической поддержки или партнёрства." }[L] }</p>
            </FadeUp>
            <div className="contact-grid">
              {CONTACT_INFO.map((c, i) => (
                <FadeUp key={i} delay={i * 0.08} className="contact-card">
                  <div className="contact-card__icon">{c.icon}</div>
                  <h3 className="contact-card__label">{c.label[L]}</h3>
                  {c.lines[L].map((line) => <p key={line} className="contact-card__line">{line}</p>)}
                </FadeUp>
              ))}
            </div>
          </section>

          <section className="info-alt-section">
            <div className="container">
              <FadeUp className="info-section-head">
                <p className="eyebrow cats-eyebrow">FAQ</p>
                <h2>{ { en: "Frequently Asked Questions", az: "Tez-tez Verilən Suallar", ru: "Часто задаваемые вопросы" }[L] }</h2>
              </FadeUp>
              <div className="faq-list">
                {FAQS.map((faq, i) => (
                  <FadeUp key={i} delay={i * 0.05} className="faq-item">
                    <div className="faq-q">
                      <span>{faq.q[L]}</span>
                      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
                        <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="faq-a">{faq.a[L]}</div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          <section className="info-cta-band">
            <FadeUp className="container info-cta-band__inner">
              <div>
                <h2>{ { en: "Need a price or demo?", az: "Qiymət və ya demo lazımdır?", ru: "Нужна цена или демо?" }[L] }</h2>
                <p>{ { en: "Browse our product catalogue and send an inquiry from any product page.", az: "Məhsul kataloqimizə baxın və istənilən məhsul səhifəsindən sorğu göndərin.", ru: "Просмотрите каталог продуктов и отправьте запрос с любой страницы продукта." }[L] }</p>
              </div>
              <Link href={`/${lang}/shop`} className="btn btn--primary btn--lg">
                { { en: "Browse Products", az: "Məhsullara bax", ru: "Перейти в каталог" }[L] }
              </Link>
            </FadeUp>
          </section>

          <FadeUp className="container" style={{ paddingTop: "40px", paddingBottom: "56px" }}>
            <p className="notice">{MIGRATE[L]}</p>
          </FadeUp>
        </div>
      )}

      {/* ═══════════ OTHER PAGES (fallback) ═══════════ */}
      {!["about","solutions","partners","contact"].includes(key) && (
        <div className="container section info">
          <p className="notice">{MIGRATE[L]}</p>
        </div>
      )}
    </>
  );
}
