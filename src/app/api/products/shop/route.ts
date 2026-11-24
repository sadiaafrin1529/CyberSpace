import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/server-auth";

/** Public, server-side filtered + paginated product listing (forwards the query string as-is). */
export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/products/shop${req.nextUrl.search}`, { cache: "no-store" });
    const body = await res.json().catch(() => ({ data: [] }));
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ data: [] }, { status: 503 });
  }
}
