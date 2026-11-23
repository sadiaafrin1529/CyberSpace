import type { Locale } from "@/lib/i18n";

/** Homepage "Industries We Serve" bento section: ids drive the illustrations, texts are per language. */
export type IndustryId =
  | "banking"
  | "oilgas"
  | "health"
  | "gov"
  | "transport"
  | "education"
  | "telecom"
  | "construction";

type Item = { name: string; desc: string };

type Labels = {
  eyebrow: string;
  title: string;
  hint: string;
  more: string;
  items: Record<IndustryId, Item>;
};

export const INDUSTRY_ORDER: { id: IndustryId; wide?: boolean }[] = [
  { id: "banking", wide: true },
  { id: "oilgas" },
  { id: "health" },
  { id: "gov" },
  { id: "transport", wide: true },
  { id: "education" },
  { id: "telecom" },
  { id: "construction" },
];

export const INDUSTRY_LABELS: Record<Locale, Labels> = {
  en: {
    eyebrow: "BENTO INDUSTRY SCENES",
    title: "Industries We Serve",
    hint: "Interactive industry solutions: hover over or tap a card to see how it works",
    more: "Learn more",
    items: {
      banking: { name: "Banking & Finance", desc: "Secure infrastructure for banks and fintech" },
      oilgas: { name: "Oil & Gas", desc: "Reliable infrastructure for remote sites" },
      health: { name: "Healthcare", desc: "Systems that keep clinics running" },
      gov: { name: "Government", desc: "Secure, certified solutions" },
      transport: {
        name: "Transport & Logistics",
        desc: "Connectivity for airports and fleets",
      },
      education: { name: "Education", desc: "Campus networks and classroom equipment" },
      telecom: { name: "Telecom", desc: "Equipment for networks and operators" },
      construction: {
        name: "Construction",
        desc: "Electrical, low-current systems and HVAC for buildings",
      },
    },
  },
  az: {
    eyebrow: "BENTO INDUSTRY SCENES",
    title: "Xidmət göstərdiyimiz sahələr",
    hint: "İnteraktiv sahə həlləri: iş ssenarisini görmək üçün kartın üzərinə gəlin və ya toxunun",
    more: "Ətraflı",
    items: {
      banking: { name: "Banklar və maliyyə", desc: "Banklar və fintex üçün təhlükəsiz infrastruktur" },
      oilgas: { name: "Neft və qaz", desc: "Uzaq obyektlər üçün etibarlı infrastruktur" },
      health: { name: "Səhiyyə", desc: "Klinikaların işini təmin edən sistemlər" },
      gov: { name: "Dövlət sektoru", desc: "Təhlükəsiz sertifikatlı həllər" },
      transport: {
        name: "Nəqliyyat və logistika",
        desc: "Hava limanları və avtoparklar üçün rabitə",
      },
      education: { name: "Təhsil", desc: "Kampus şəbəkələri və sinif avadanlığı" },
      telecom: { name: "Telekom", desc: "Şəbəkələr və operatorlar üçün avadanlıq" },
      construction: {
        name: "Tikinti",
        desc: "Binalar üçün elektrik, zəif cərəyan sistemləri və HVAC",
      },
    },
  },
  ru: {
    eyebrow: "BENTO INDUSTRY SCENES",
    title: "Отрасли, которым мы помогаем",
    hint: "Интерактивные отраслевые решения: наведите или нажмите на карточку, чтобы увидеть сценарий работы",
    more: "Подробнее",
    items: {
      banking: { name: "Банки и финансы", desc: "Защищённая инфраструктура для банков и финтеха" },
      oilgas: { name: "Нефть и газ", desc: "Надёжная инфраструктура для удалённых объектов" },
      health: { name: "Здравоохранение", desc: "Системы, на которых держится работа клиник" },
      gov: { name: "Госсектор", desc: "Безопасные сертифицированные решения" },
      transport: { name: "Транспорт и логистика", desc: "Связь для аэропортов и автопарков" },
      education: { name: "Образование", desc: "Кампусные сети и техника для классов" },
      telecom: { name: "Телеком", desc: "Оборудование для сетей и операторов" },
      construction: {
        name: "Строительство",
        desc: "Электрика, слаботочные системы и HVAC для зданий",
      },
    },
  },
};
