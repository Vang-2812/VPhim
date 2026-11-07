import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getServerConfig } from "@/lib/config/server";
import { safeNext } from "@/features/auth/redirect";
export async function GET(request: NextRequest) {
  const origin = getServerConfig(process.env).appOrigin,
    code = request.nextUrl.searchParams.get("code");
  if (code)
    try {
      const client = await createServerSupabase();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          origin + safeNext(request.nextUrl.searchParams.get("next")),
        );
    } catch {}
  return NextResponse.redirect(origin + "/dang-nhap?error=callback");
}
