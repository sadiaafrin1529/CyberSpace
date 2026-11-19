import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

type Ctx = { params: Promise<{ id: string }> };
const forward = async (req: NextRequest, { params }: Ctx) =>
  proxy(req, `/solutions/${encodeURIComponent((await params).id)}`, { auth: "required" });

export const GET = forward;

const mutate = async (req: NextRequest, ctx: Ctx) => {
  const res = await forward(req, ctx);
  revalidateIfOk(res, CACHE_TAGS.solutions);
  return res;
};
export const PATCH = mutate;
export const DELETE = mutate;
