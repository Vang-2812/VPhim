import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getServerConfig } from "@/lib/config/server";
import { safeNext } from "@/features/auth/redirect";
export async function GET(request: NextRequest) {
  const origin = getServerConfig(process.env).appOrigin;
  try {
    const client = await createServerSupabase();
    const next = safeNext(request.nextUrl.searchParams.get("next"));
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: origin + "/auth/callback?next=" + encodeURIComponent(next),
      },
    });
    if (!error && data.url) return NextResponse.redirect(data.url);
  } catch {}
  return NextResponse.redirect(origin + "/dang-nhap?error=oauth");
}
