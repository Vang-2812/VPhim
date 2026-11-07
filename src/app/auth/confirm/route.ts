import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getServerConfig } from "@/lib/config/server";
import { safeNext } from "@/features/auth/redirect";
export async function GET(request: NextRequest) {
  const origin = getServerConfig(process.env).appOrigin,
    token = request.nextUrl.searchParams.get("token_hash"),
    type = request.nextUrl.searchParams.get("type");
  if (token && (type === "signup" || type === "recovery" || type === "email"))
    try {
      const c = await createServerSupabase();
      const { error } = await c.auth.verifyOtp({ token_hash: token, type });
      if (!error)
        return NextResponse.redirect(
          origin + safeNext(request.nextUrl.searchParams.get("next")),
        );
    } catch {}
  return NextResponse.redirect(origin + "/dang-nhap?error=confirmation");
}
