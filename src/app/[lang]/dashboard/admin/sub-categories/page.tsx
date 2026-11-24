import { redirect } from "next/navigation";

// Sub-categories are now managed as a tree on the Categories page.
export default async function SubCategoriesRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/dashboard/admin/categories`);
}
