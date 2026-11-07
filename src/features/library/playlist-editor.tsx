"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";
import {
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  setPlaylistMovie,
  setFavorite,
} from "./actions";
import type { Playlist } from "./types";
export function PlaylistEditor({ playlists }: { playlists: Playlist[] }) {
  const [notice, setNotice] = useState(""),
    [pending, start] = useTransition(),
    router = useRouter();
  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    start(async () => {
      const r = await action();
      setNotice(
        r.ok ? "Đã cập nhật danh sách." : r.message || "Chưa lưu được.",
      );
      if (r.ok) router.refresh();
    });
  }
  return (
    <>
      <form
        className="list-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget,
            name = String(new FormData(form).get("name"));
          run(() => createPlaylist(name));
          form.reset();
        }}
      >
        <input
          name="name"
          placeholder="Tên danh sách mới"
          aria-label="Tên danh sách mới"
          required
          maxLength={80}
        />
        <button className="button" disabled={pending}>
          <Plus size={16} />
          Tạo danh sách
        </button>
      </form>
      {notice && (
        <p className="form-note" role="status">
          {notice}
        </p>
      )}
      {!playlists.length && (
        <p className="account-description">
          Tạo bộ sưu tập đầu tiên rồi thêm phim từ trang thông tin phim.
        </p>
      )}
      {playlists.map((p) => (
        <details className="list-editor" key={p.id} open>
          <summary>{p.name}</summary>
          <form
            className="list-toolbar"
            onSubmit={(e) => {
              e.preventDefault();
              run(() =>
                renamePlaylist(
                  p.id,
                  String(new FormData(e.currentTarget).get("name")),
                ),
              );
            }}
          >
            <input
              name="name"
              defaultValue={p.name}
              aria-label={"Đổi tên " + p.name}
              maxLength={80}
              required
            />
            <button className="button secondary small" disabled={pending}>
              Đổi tên
            </button>
            <button
              className="button secondary small danger"
              type="button"
              disabled={pending}
              onClick={() => {
                if (
                  confirm(
                    "Xóa danh sách “" +
                      p.name +
                      "”? Phim yêu thích và lịch sử xem vẫn được giữ.",
                  )
                )
                  run(() => deletePlaylist(p.id));
              }}
            >
              <Trash2 size={14} />
              Xóa danh sách
            </button>
          </form>
          {p.items.length ? (
            <div className="movie-grid compact-grid">
              {p.items.map((m) => (
                <article key={m.id}>
                  <Link className="movie-card" href={"/phim/" + m.slug}>
                    <div className="poster">
                      {m.posterUrl && (
                        <img src={m.posterUrl} alt="" loading="lazy" />
                      )}
                    </div>
                    <h3>{m.title}</h3>
                  </Link>
                  <button
                    className="remove-item"
                    disabled={pending}
                    onClick={() =>
                      run(() => setPlaylistMovie(p.id, m.slug, false))
                    }
                  >
                    <Trash2 size={13} />
                    Bỏ khỏi danh sách
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">
              Danh sách chưa có phim.{" "}
              <Link className="text-link" href="/kham-pha">
                Khám phá phim
              </Link>
            </p>
          )}
        </details>
      ))}
    </>
  );
}
export function RemoveFavorite({ slug }: { slug: string }) {
  const [pending, start] = useTransition(),
    router = useRouter(),
    [notice, setNotice] = useState("");
  return (
    <>
      <button
        className="remove-item"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await setFavorite(slug, false);
            if (r.ok) router.refresh();
            else setNotice(r.message);
          })
        }
      >
        <Trash2 size={13} />
        Bỏ yêu thích
      </button>
      {notice && (
        <span className="inline-note" role="alert">
          {notice}
        </span>
      )}
    </>
  );
}
