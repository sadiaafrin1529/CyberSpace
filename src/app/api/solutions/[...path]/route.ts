import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";
import { CACHE_TAGS, revalidateIfOk } from "@/lib/server-api";

type Ctx = { params: Promise<{ path: string[] }> };

/**
 * One handler for the whole Solutions API.
 *   GET  /api/solutions/categories[/:slug]  public (active content only)
 *   any  /api/solutions/admin/...           admin only (auth cookie required, role checked by the backend)
 * Successful writes drop the cached public Solutions pages, so admin changes show up immediately.
 */
const forward = async (req: NextRequest, { params }: Ctx) => {
  const path = (await params).path.map(encodeURIComponent).join("/");
  const isAdmin = path.startsWith("admin/") || path === "admin";
  const res = await proxy(req, `/solutions/${path}`, { auth: isAdmin ? "required" : "none" });
  if (req.method !== "GET") revalidateIfOk(res, CACHE_TAGS.solutions);
  return res;
};

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
