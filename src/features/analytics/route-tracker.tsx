"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "vphim_visitor_id";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined" || !window.localStorage) {
    return "guest";
  }
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function detectDeviceType(userAgent: string): "desktop" | "mobile" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua,
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

export function RouteTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Don't track admin routes or API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    // Avoid double firing for the exact same path in the same mount cycle
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    try {
      const visitorId = getOrCreateVisitorId();
      const deviceType = detectDeviceType(
        typeof navigator !== "undefined" ? navigator.userAgent : "",
      );

      const payload = JSON.stringify({
        path: pathname,
        visitorId,
        deviceType,
      });

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
      } else {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {
          // Ignore network errors in analytics tracking
        });
      }
    } catch {
      // Ignore client errors
    }
  }, [pathname]);

  return null;
}
