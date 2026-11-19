import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import SolutionsClient from "./SolutionsClient";

export default async function SolutionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <SolutionsClient lang={lang} />;
}
