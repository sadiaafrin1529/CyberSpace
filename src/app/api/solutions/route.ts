import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

export const GET = (req: NextRequest) => proxy(req, "/solutions", { auth: "required" });

export const POST = async (req: NextRequest) => {
  const res = await proxy(req, "/solutions", { auth: "required" });
  revalidateIfOk(res, CACHE_TAGS.solutions);
  return res;
};
