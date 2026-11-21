import type { Locale } from "@/lib/i18n";

export const PROJECT_LABELS: Record<
  Locale,
  {
    all: string;
    empty: string;
    emptyCategory: string;
    error: string;
    retry: string;
    categoriesNav: string;
    details: string;
    gallery: string;
    back: string;
    noProjects: string;
    view: string;
    close: string;
    prev: string;
    next: string;
    of: string;
  }
> = {
  en: {
    all: "All Projects",
    empty: "No projects have been published yet.",
    emptyCategory: "No projects in this category yet.",
    error: "Projects could not be loaded right now. Please try again shortly.",
    retry: "Reload",
    categoriesNav: "Project categories",
    details: "Project Details",
    gallery: "Gallery",
    back: "Back to Projects",
    noProjects: "No projects",
    view: "View project",
    close: "Close",
    prev: "Previous image",
    next: "Next image",
    of: "of",
  },
  az: {
    all: "Bütün layihələr",
    empty: "Hələ heç bir layihə dərc edilməyib.",
    emptyCategory: "Bu kateqoriyada hələ layihə yoxdur.",
    error: "Layihələr hazırda yüklənə bilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin.",
    retry: "Yenilə",
    categoriesNav: "Layihə kateqoriyaları",
    details: "Layihə haqqında",
    gallery: "Qalereya",
    back: "Layihələrə qayıt",
    noProjects: "Layihə yoxdur",
    view: "Layihəyə bax",
    close: "Bağla",
    prev: "Əvvəlki şəkil",
    next: "Növbəti şəkil",
    of: "/",
  },
  ru: {
    all: "Все проекты",
    empty: "Проекты пока не опубликованы.",
    emptyCategory: "В этой категории пока нет проектов.",
    error: "Не удалось загрузить проекты. Пожалуйста, повторите попытку позже.",
    retry: "Обновить",
    categoriesNav: "Категории проектов",
    details: "О проекте",
    gallery: "Галерея",
    back: "Ко всем проектам",
    noProjects: "Нет проектов",
    view: "Смотреть проект",
    close: "Закрыть",
    prev: "Предыдущее фото",
    next: "Следующее фото",
    of: "из",
  },
};
