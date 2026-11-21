import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

type Ctx = { params: Promise<{ id: string }> };

const mutate = async (req: NextRequest, { params }: Ctx) => {
  const res = await proxy(req, `/project-categories/${encodeURIComponent((await params).id)}`, {
    auth: "required",
  });
  revalidateIfOk(res, CACHE_TAGS.projectCategories);
  // A renamed category changes the name shown on its projects.
  revalidateIfOk(res, CACHE_TAGS.projects);
  return res;
};
export const PATCH = mutate;
export const DELETE = mutate;
