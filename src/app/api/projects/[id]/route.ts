import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

type Ctx = { params: Promise<{ id: string }> };
const path = async ({ params }: Ctx) => `/projects/${encodeURIComponent((await params).id)}`;

export const GET = async (req: NextRequest, ctx: Ctx) =>
  proxy(req, await path(ctx), { auth: "none" });

const mutate = async (req: NextRequest, ctx: Ctx) => {
  const res = await proxy(req, await path(ctx), { auth: "required" });
  revalidateIfOk(res, CACHE_TAGS.projects);
  revalidateIfOk(res, CACHE_TAGS.projectCategories);
  return res;
};
export const PATCH = mutate;
export const DELETE = mutate;
