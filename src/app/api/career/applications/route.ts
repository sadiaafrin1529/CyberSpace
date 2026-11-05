import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  try {
    const res = await fetch(`${BACKEND_URL}/career/applications`, {
      method: "POST",
      body: formData,
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 503 });
  }
}

export async function GET() {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(`${BACKEND_URL}/career/applications`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
