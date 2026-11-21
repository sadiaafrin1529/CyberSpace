import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

export const GET = (req: NextRequest) => proxy(req, "/projects", { auth: "none" });

export const POST = async (req: NextRequest) => {
  const res = await proxy(req, "/projects", { auth: "required" });
  revalidateIfOk(res, CACHE_TAGS.projects);
  revalidateIfOk(res, CACHE_TAGS.projectCategories);
  return res;
};
