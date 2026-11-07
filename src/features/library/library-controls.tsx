"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ListPlus } from "lucide-react";
import { getLibraryState, setFavorite, setPlaylistMovie } from "./actions";
import { isAuthConfigured } from "@/lib/config/public";

export function LibraryControls({
  slug,
  initialMember,
  initialSelected = false,
  initialPlaylists = [],
}: {
  slug: string;
  initialMember?: boolean;
  initialSelected?: boolean;
  initialPlaylists?: { id: string; name: string }[];
}) {
  const router = useRouter(),
    [member, setMember] = useState(initialMember ?? false),
    [selected, setSelected] = useState(initialSelected),
    [lists, setLists] =
      useState<{ id: string; name: string }[]>(initialPlaylists),
    [notice, setNotice] = useState(""),
    [pending, start] = useTransition();

  useEffect(() => {
    setMember(initialMember ?? false);
    setSelected(initialSelected);
    setLists(initialPlaylists);
  }, [initialMember, initialSelected, initialPlaylists]);

  useEffect(() => {
    if (initialMember !== undefined) return;
    if (!isAuthConfigured()) return;
    let active = true;
    getLibraryState(slug).then((r) => {
      if (active && r.ok) {
        setMember(true);
        setSelected(r.data.selected);
        setLists(r.data.playlists);
      }
    });
    return () => {
      active = false;
    };
  }, [slug, initialMember]);

  const login = "/dang-nhap?next=" + encodeURIComponent("/phim/" + slug);

  return (
    <div className="library-controls">
      {member ? (
        <>
          <button
            className="button secondary"
            disabled={pending}
            aria-pressed={selected}
            onClick={() =>
              start(async () => {
                const r = await setFavorite(slug, !selected);
                if (r.ok) setSelected(r.data.selected);
                setNotice(
                  r.ok
                    ? r.data.selected
                      ? "Đã lưu vào yêu thích."
                      : "Đã bỏ yêu thích."
                    : r.message,
                );
              })
            }
          >
            <Heart size={17} fill={selected ? "currentColor" : "none"} />
            {selected ? "Đã yêu thích" : "Yêu thích"}
          </button>
          {lists.length ? (
            <select
              aria-label="Thêm vào danh sách"
              disabled={pending}
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                e.target.value = "";
                if (id === "__new__") {
                  router.push("/tai-khoan/danh-sach");
                  return;
                }
                if (id)
                  start(async () => {
                    const r = await setPlaylistMovie(id, slug, true);
                    setNotice(r.ok ? "Đã thêm phim vào danh sách." : r.message);
                  });
              }}
            >
              <option value="" disabled>
                Thêm vào danh sách
              </option>
              {lists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="__new__">+ Tạo danh sách mới…</option>
            </select>
          ) : (
            <Link className="button secondary" href="/tai-khoan/danh-sach">
              <ListPlus size={17} />
              Tạo danh sách
            </Link>
          )}
        </>
      ) : (
        <>
          <Link className="button secondary" href={login}>
            <Heart size={17} />
            Yêu thích
          </Link>
          <Link className="button secondary" href={login}>
            <ListPlus size={17} />
            Danh sách
          </Link>
        </>
      )}
      {notice && (
        <span role="status" className="inline-note">
          {notice}
        </span>
      )}
    </div>
  );
}
