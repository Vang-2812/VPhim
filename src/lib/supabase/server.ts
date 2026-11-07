import "server-only";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicConfig } from "@/lib/config/public";
import { AppError } from "@/lib/result";
import { createTimedFetch } from "./timed-fetch";
export const createServerSupabase = cache(async () => {
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
      global: { fetch: createTimedFetch("server") },
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
});
