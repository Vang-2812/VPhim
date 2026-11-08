import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: unknown;
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ ok: false, error: "Empty body" }, { status: 400 });
    }
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const { path, visitorId, deviceType } = body as {
      path?: string;
      visitorId?: string;
      deviceType?: string;
    };

    if (!path || typeof path !== "string" || !visitorId || typeof visitorId !== "string") {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const cleanPath = path.trim().slice(0, 500);
    const cleanVisitorId = visitorId.trim().slice(0, 100);
    const cleanDevice =
      deviceType === "mobile" || deviceType === "tablet" ? deviceType : "desktop";

    // Ignore tracking for admin panel and internal API routes
    if (cleanPath.startsWith("/admin") || cleanPath.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const c = await createServerSupabase();
    // Try RPC first
    const { error: rpcError } = await c.rpc("record_page_visit", {
      p_path: cleanPath,
      p_visitor_id: cleanVisitorId,
      p_device_type: cleanDevice,
    });

    if (rpcError) {
      // Fallback to table insert if RPC is missing
      await c.from("page_visits").insert({
        path: cleanPath,
        visitor_id: cleanVisitorId,
        device_type: cleanDevice,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics tracking should fail silently to avoid impacting user browsing
    return NextResponse.json({ ok: true });
  }
}
