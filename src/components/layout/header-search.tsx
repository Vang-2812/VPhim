"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Film, Search } from "lucide-react";

type Suggestion = {
  slug: string;
  title: string;
  posterUrl: string | null;
  year: number | null;
  quality: string | null;
};

type SearchState =
  | { kind: "idle" | "loading"; items: Suggestion[] }
  | { kind: "ready"; items: Suggestion[] }
  | { kind: "error"; items: Suggestion[]; message: string };

export function HeaderSearch(): React.JSX.Element {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<SearchState>({ kind: "idle", items: [] });
  const root = useRef<HTMLDivElement>(null);
  const keyword = value.trim();

  useEffect(() => {
    if (keyword.length < 2) return;
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          "/api/search-suggestions?keyword=" + encodeURIComponent(keyword),
          { signal: controller.signal, headers: { accept: "application/json" } },
        );
        const data = (await response.json()) as {
          items?: Suggestion[];
          error?: string;
        };
        if (!active) return;
        if (!response.ok) {
          setState({
            kind: "error",
            items: [],
            message: data.error || "Tạm thời chưa tìm được phim. Hãy thử lại.",
          });
        } else {
          setState({ kind: "ready", items: data.items || [] });
        }
      } catch {
        if (active)
          setState({
            kind: "error",
            items: [],
            message: "Tạm thời chưa tìm được phim. Hãy thử lại.",
          });
      }
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  const showDropdown = open && keyword.length >= 2;
  return (
    <div className="header-search" ref={root}>
      <form action="/kham-pha" method="get" role="search" autoComplete="off">
        <input
          type="search"
          name="keyword"
          value={value}
          maxLength={120}
          placeholder="Tìm tên phim..."
          aria-label="Tìm phim"
          aria-controls="header-search-suggestions"
          aria-expanded={showDropdown}
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            setOpen(next.trim().length >= 2);
            setState(
              next.trim().length >= 2
                ? { kind: "loading", items: [] }
                : { kind: "idle", items: [] },
            );
          }}
          onFocus={() => {
            if (keyword.length >= 2) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        />
        <button type="submit" aria-label="Tìm kiếm" title="Tìm kiếm">
          <Search size={19} />
        </button>
      </form>
      {showDropdown && (
        <div
          className="search-suggestions"
          id="header-search-suggestions"
          role="region"
          aria-label="Gợi ý phim"
        >
          <p className="search-suggestions-label">Gợi ý phim</p>
          {state.kind === "loading" && <p role="status">Đang tìm phim…</p>}
          {state.kind === "error" && <p role="status">{state.message}</p>}
          {state.kind === "ready" && !state.items.length && (
            <p role="status">Chưa tìm thấy phim phù hợp.</p>
          )}
          {state.kind === "ready" && state.items.length > 0 && (
            <ul>
              {state.items.map((movie) => (
                <li key={movie.slug}>
                  <Link href={"/phim/" + movie.slug} onClick={() => setOpen(false)}>
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="search-poster-fallback">
                        <Film size={18} />
                      </span>
                    )}
                    <span>
                      <strong>{movie.title}</strong>
                      <small>
                        {[movie.year, movie.quality].filter(Boolean).join(" · ")}
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
