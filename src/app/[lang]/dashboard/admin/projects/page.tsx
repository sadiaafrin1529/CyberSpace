import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ProjectsClient lang={lang} />;
}
