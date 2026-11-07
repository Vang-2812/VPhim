import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicConfig } from "@/lib/config/public";
import { AppError } from "@/lib/result";
export async function createServerSupabase() {
  if (!publicConfig.supabaseUrl || !publicConfig.supabasePublishableKey)
    throw new AppError(
      "CONFIG_MISSING",
      "Tài khoản chưa sẵn sàng. Cần cấu hình Supabase để sử dụng.",
    );
  const store = await cookies();
  return createServerClient(
    publicConfig.supabaseUrl,
    publicConfig.supabasePublishableKey,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Proxy refreshes cookies when rendering a Server Component. */
          }
        },
      },
    },
  );
}
