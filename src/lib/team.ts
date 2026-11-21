import type { Locale } from "@/lib/i18n";
import type { StaticImageData } from "next/image";
import sanan from "@/assets/Team/Sanan Hasanov - Director Of Company.jpeg";
import samir from "@/assets/Team/Samir Akhundov - Director of İT Department.jpeg";
import elvin from "@/assets/Team/Elvin Aliyev - HVAC & Mechanical Department Director.jpeg";
import tabriz from "@/assets/Team/Tabriz Siyabli - Procurement Director.jpeg";
import ahmed from "@/assets/Team/Ahmed Baxishov - Procurement Manager.jpeg";
import farid from "@/assets/Team/Farid Gasimov - IT Manager.jpeg";
import shahin from "@/assets/Team/Shahin Javadov. - Security Systems Manager..jpeg";
import intizar from "@/assets/Team/Intizar Habilayeva - Procurement Specialist.jpeg";
import sona from "@/assets/Team/Sona Mabudova - Procurement Specialist.jpeg";
import maksud from "@/assets/Team/Maksud Budagov -  IT Support.jpeg";

export type TeamMember = {
  name: string;
  role: Record<Locale, string>;
  photo: StaticImageData;
};

/** Roles come from the asset file names; az/ru are translations of those titles. */
const R = {
  director: { en: "Director of Company", az: "Şirkət direktoru", ru: "Директор компании" },
  itDir: {
    en: "Director of IT Department",
    az: "İT departamentinin direktoru",
    ru: "Директор ИТ-департамента",
  },
  hvacDir: {
    en: "HVAC & Mechanical Department Director",
    az: "HVAC və mexaniki sistemlər departamentinin direktoru",
    ru: "Директор департамента ОВК и механических систем",
  },
  procDir: { en: "Procurement Director", az: "Satınalma direktoru", ru: "Директор по закупкам" },
  procMgr: { en: "Procurement Manager", az: "Satınalma meneceri", ru: "Менеджер по закупкам" },
  itMgr: { en: "IT Manager", az: "İT meneceri", ru: "ИТ-менеджер" },
  secMgr: {
    en: "Security Systems Manager",
    az: "Təhlükəsizlik sistemləri meneceri",
    ru: "Менеджер систем безопасности",
  },
  procSpec: {
    en: "Procurement Specialist",
    az: "Satınalma mütəxəssisi",
    ru: "Специалист по закупкам",
  },
  itSupport: { en: "IT Support", az: "İT dəstək", ru: "ИТ-поддержка" },
} as const;

/** First entry is the company director (featured); the rest follow in order of seniority. */
export const TEAM: TeamMember[] = [
  { name: "Sanan Hasanov", role: R.director, photo: sanan },
  { name: "Samir Akhundov", role: R.itDir, photo: samir },
  { name: "Elvin Aliyev", role: R.hvacDir, photo: elvin },
  { name: "Tabriz Siyabli", role: R.procDir, photo: tabriz },
  { name: "Ahmed Baxishov", role: R.procMgr, photo: ahmed },
  { name: "Farid Gasimov", role: R.itMgr, photo: farid },
  { name: "Shahin Javadov", role: R.secMgr, photo: shahin },
  { name: "Intizar Habilayeva", role: R.procSpec, photo: intizar },
  { name: "Sona Mabudova", role: R.procSpec, photo: sona },
  { name: "Maksud Budagov", role: R.itSupport, photo: maksud },
];
