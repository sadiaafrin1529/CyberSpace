import type { Locale } from "@/lib/i18n";
import type { BillingPeriod } from "@/redux/fetchers/solution/solutionApi";

/** UI labels of the public Solutions pages. All content itself (names, prices, items) comes from the database. */
type Labels = {
  eyebrow: string;
  title: string;
  hint: string;
  products: (n: number) => string;
  viewProducts: string;
  allSolutions: string;
  sectionHint: string;
  included: string;
  requestInquiry: string;
  order: string;
  priceOnRequest: string;
  empty: string;
  loadFailed: string;
  noBundles: string;
  bundleCount: (n: number) => string;
  orderMessage: (title: string) => string;
  allCategories: string;
  viewAll: string;
  toggleSection: string;
  billing: Record<BillingPeriod, string>;
};

const ruPlural = (n: number, one: string, few: string, many: string) =>
  `${n} ${n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many}`;

export const SOLUTION_LABELS: Record<Locale, Labels> = {
  en: {
    eyebrow: "Cyberspace Engineering",
    title: "Comprehensive IT Solutions",
    hint: "Hover over a card for interactive preview or click to explore dynamic bundles and products",
    products: (n) => `${n} ${n === 1 ? "product" : "products"}`,
    viewProducts: "View products",
    allSolutions: "All Solutions",
    sectionHint: "Hover a section bar for summary • Click to expand bundles & products",
    included: "What's included:",
    requestInquiry: "Request Inquiry",
    order: "Order / Add to Request",
    priceOnRequest: "Price on request",
    empty: "No solutions are published yet.",
    loadFailed: "Solutions could not be loaded right now. Please try again shortly.",
    noBundles: "No bundles are available in this category yet.",
    bundleCount: (n) => `${n} ${n === 1 ? "item" : "items"}`,
    orderMessage: (title) => `Order request: ${title}`,
    allCategories: "Solution categories",
    viewAll: "View all solutions",
    toggleSection: "Show or hide bundles",
    billing: { ONE_TIME: "", MONTHLY: "/ mo", QUARTERLY: "/ qtr", YEARLY: "/ yr" },
  },
  az: {
    eyebrow: "Cyberspace Engineering",
    title: "Kompleks İT Həlləri",
    hint: "İnteraktiv önizləmə üçün kartın üzərinə gəlin və ya dinamik paketləri və məhsulları kəşf etmək üçün klikləyin",
    products: (n) => `${n} məhsul`,
    viewProducts: "Məhsullara bax",
    allSolutions: "Bütün həllər",
    sectionHint: "Xülasə üçün bölmə zolağının üzərinə gəlin • Paketləri və məhsulları açmaq üçün klikləyin",
    included: "Nələr daxildir:",
    requestInquiry: "Sorğu göndər",
    order: "Sifariş / Sorğuya əlavə et",
    priceOnRequest: "Qiymət sorğu ilə",
    empty: "Hələ heç bir həll dərc edilməyib.",
    loadFailed: "Həllər hazırda yüklənə bilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
    noBundles: "Bu kateqoriyada hələ paket yoxdur.",
    bundleCount: (n) => `${n} element`,
    orderMessage: (title) => `Sifariş sorğusu: ${title}`,
    allCategories: "Həll kateqoriyaları",
    viewAll: "Bütün həllərə bax",
    toggleSection: "Paketləri göstər və ya gizlət",
    billing: { ONE_TIME: "", MONTHLY: "/ ay", QUARTERLY: "/ rüb", YEARLY: "/ il" },
  },
  ru: {
    eyebrow: "Cyberspace Engineering",
    title: "Комплексные IT-решения",
    hint: "Наведите на карточку для интерактивного просмотра или нажмите, чтобы изучить пакеты и продукты",
    products: (n) => ruPlural(n, "продукт", "продукта", "продуктов"),
    viewProducts: "Смотреть продукты",
    allSolutions: "Все решения",
    sectionHint: "Наведите на раздел для краткого описания • Нажмите, чтобы раскрыть пакеты и продукты",
    included: "Что входит:",
    requestInquiry: "Отправить запрос",
    order: "Заказать / Добавить в запрос",
    priceOnRequest: "Цена по запросу",
    empty: "Решения пока не опубликованы.",
    loadFailed: "Не удалось загрузить решения. Пожалуйста, повторите попытку позже.",
    noBundles: "В этой категории пока нет пакетов.",
    bundleCount: (n) => `${n} поз.`,
    orderMessage: (title) => `Запрос на заказ: ${title}`,
    allCategories: "Категории решений",
    viewAll: "Все решения",
    toggleSection: "Показать или скрыть пакеты",
    billing: { ONE_TIME: "", MONTHLY: "/ мес", QUARTERLY: "/ кв.", YEARLY: "/ год" },
  },
};

const SYMBOL: Record<string, string> = {
  AZN: "₼",
  USD: "$",
  EUR: "€",
  GBP: "£",
  RUB: "₽",
  TRY: "₺",
};

/** "14 800 ₼" style amount; the API serialises decimals as strings. */
export const formatPrice = (
  price: string | number | null | undefined,
  currency: string | null | undefined,
  lang: Locale,
) => {
  if (price === null || price === undefined || price === "") return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  const num = new Intl.NumberFormat(lang === "en" ? "en-US" : "ru-RU", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
  const cur = currency ? (SYMBOL[currency] ?? currency) : "";
  return cur ? `${num} ${cur}` : num;
};
