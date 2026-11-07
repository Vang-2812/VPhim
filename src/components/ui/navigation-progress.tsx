"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousRoute = useRef("");

  // When pathname or searchParams change, navigation has completed.
  useEffect(() => {
    previousRoute.current = window.location.pathname + window.location.search;
    if (active) {
      setProgress(100);
      const doneTimeout = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(doneTimeout);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    function startProgress() {
      if (timerRef.current) clearInterval(timerRef.current);
      setActive(true);
      setProgress(20);
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore anchor clicks with modifiers, hash links, external links, or target="_blank"
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      try {
        const url = new URL(anchor.href, window.location.href);
        const current = new URL(window.location.href);
        // If internal navigation to a different page or different query
        if (
          url.origin === current.origin &&
          (url.pathname !== current.pathname || url.search !== current.search)
        ) {
          startProgress();
        }
      } catch {
        /* invalid url */
      }
    }

    function handlePopState() {
      const route = window.location.pathname + window.location.search;
      if (route === previousRoute.current) return;
      previousRoute.current = route;
      startProgress();
    }

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!active && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Đang tải trang"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${progress}%`,
        background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
        boxShadow: "0 0 10px rgba(245, 158, 11, 0.7)",
        zIndex: 99999,
        transition:
          progress === 100
            ? "width 150ms ease-out, opacity 200ms ease-in"
            : "width 250ms ease",
        opacity: progress === 100 ? 0 : 1,
        pointerEvents: "none",
      }}
    />
  );
}
