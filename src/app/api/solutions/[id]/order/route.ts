import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const res = await proxy(req, `/solutions/${encodeURIComponent((await params).id)}/order`, {
    auth: "required",
  });
  revalidateIfOk(res, CACHE_TAGS.solutions);
  return res;
};
