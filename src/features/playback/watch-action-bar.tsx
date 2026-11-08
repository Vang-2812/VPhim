"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Plus,
  SkipBack,
  SkipForward,
  Send,
  Check,
} from "lucide-react";
import { getLibraryState, setFavorite, setPlaylistMovie } from "@/features/library/actions";

export interface WatchActionBarProps {
  slug: string;
  member: boolean;
  prevHref: string | null;
  nextHref: string | null;
  autoNext: boolean;
  onToggleAutoNext: (enabled: boolean) => void;
  initialFavorite?: boolean;
  initialPlaylists?: { id: string; name: string }[];
}

export function WatchActionBar({
  slug,
  member,
  prevHref,
  nextHref,
  autoNext,
  onToggleAutoNext,
  initialFavorite = false,
  initialPlaylists = [],
}: WatchActionBarProps) {
  const router = useRouter();
  const [favorite, setFavoriteState] = useState(initialFavorite);
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loginHref = "/dang-nhap?next=" + encodeURIComponent("/xem/" + slug);

  // Load user library state if member and playlists not provided
  useEffect(() => {
    if (!member) return;
    let active = true;
    getLibraryState(slug).then((r) => {
      if (active && r.ok) {
        setFavoriteState(r.data.selected);
        setPlaylists(r.data.playlists);
      }
    });
    return () => {
      active = false;
    };
  }, [member, slug]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const handleFavorite = () => {
    startTransition(async () => {
      const res = await setFavorite(slug, !favorite);
      if (res.ok) {
        setFavoriteState(res.data.selected);
        showToastMsg(
          res.data.selected
            ? "Đã lưu vào danh sách yêu thích"
            : "Đã xóa khỏi danh sách yêu thích",
        );
      } else {
        showToastMsg(res.message);
      }
    });
  };

  const handleAddToPlaylist = (playlistId: string) => {
    startTransition(async () => {
      const res = await setPlaylistMovie(playlistId, slug, true);
      setShowPlaylists(false);
      showToastMsg(
        res.ok ? "Đã thêm phim vào danh sách!" : res.message,
      );
    });
  };

  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToastMsg("Đã sao chép liên kết xem phim!");
      } else {
        showToastMsg("Trình duyệt không hỗ trợ sao chép tự động.");
      }
    } catch {
      showToastMsg("Chưa thể sao chép liên kết.");
    }
  };

  return (
    <div className="watch-action-bar-wrapper">
      <div className="watch-action-bar">
        {/* 1. Favorite Button */}
        {member ? (
          <button
            type="button"
            className={`action-bar-btn ${favorite ? "active" : ""}`}
            onClick={handleFavorite}
            disabled={pending}
            aria-label={favorite ? "Đã yêu thích" : "Yêu thích"}
          >
            <Heart size={16} fill={favorite ? "currentColor" : "none"} />
            <span>{favorite ? "Đã thích" : "Yêu thích"}</span>
          </button>
        ) : (
          <Link
            href={loginHref}
            className="action-bar-btn"
            aria-label="Đăng nhập để yêu thích"
          >
            <Heart size={16} />
            <span>Yêu thích</span>
          </Link>
        )}

        {/* 2. Add to Playlist Button */}
        <div className="action-bar-dropdown-wrapper">
          {member ? (
            <button
              type="button"
              className="action-bar-btn"
              onClick={() => setShowPlaylists(!showPlaylists)}
              aria-label="Thêm vào danh sách"
            >
              <Plus size={16} />
              <span>Thêm vào</span>
            </button>
          ) : (
            <Link
              href={loginHref}
              className="action-bar-btn"
              aria-label="Đăng nhập để thêm vào danh sách"
            >
              <Plus size={16} />
              <span>Thêm vào</span>
            </Link>
          )}

          {showPlaylists && (
            <div className="action-bar-dropdown">
              <div className="action-bar-dropdown-title">Chọn danh sách</div>
              {playlists.length > 0 ? (
                playlists.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    className="action-bar-dropdown-item"
                    onClick={() => handleAddToPlaylist(pl.id)}
                  >
                    <span>{pl.name}</span>
                  </button>
                ))
              ) : (
                <div className="action-bar-dropdown-empty">
                  Chưa có danh sách nào
                </div>
              )}
              <button
                type="button"
                className="action-bar-dropdown-item create-new"
                onClick={() => {
                  setShowPlaylists(false);
                  router.push("/tai-khoan/danh-sach");
                }}
              >
                + Tạo danh sách mới
              </button>
            </div>
          )}
        </div>

        {/* 3. Auto-Next Toggle */}
        <button
          type="button"
          className="action-bar-btn auto-next-btn"
          onClick={() => onToggleAutoNext(!autoNext)}
          aria-label={`Chuyển tập tự động ${autoNext ? "đang bật" : "đang tắt"}`}
        >
          <span>Chuyển tập</span>
          <span className={`auto-next-badge ${autoNext ? "on" : "off"}`}>
            {autoNext ? "ON" : "OFF"}
          </span>
        </button>

        {/* 4. Previous Episode Link */}
        {prevHref ? (
          <Link
            href={prevHref}
            className="action-bar-btn"
            aria-label="Tập trước"
          >
            <SkipBack size={16} />
            <span>Tập trước</span>
          </Link>
        ) : (
          <span
            className="action-bar-btn disabled"
            aria-disabled="true"
            aria-label="Tập trước"
          >
            <SkipBack size={16} />
            <span>Tập trước</span>
          </span>
        )}

        {/* 5. Next Episode Link */}
        {nextHref ? (
          <Link
            href={nextHref}
            className="action-bar-btn"
            aria-label="Tập tiếp theo"
          >
            <SkipForward size={16} />
            <span>Tập tiếp theo</span>
          </Link>
        ) : (
          <span
            className="action-bar-btn disabled"
            aria-disabled="true"
            aria-label="Tập tiếp theo"
          >
            <SkipForward size={16} />
            <span>Tập tiếp theo</span>
          </span>
        )}

        {/* 6. Share Button */}
        <button
          type="button"
          className="action-bar-btn"
          onClick={handleShare}
          aria-label="Chia sẻ"
        >
          <Send size={15} />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="watch-action-toast" role="status">
          <Check size={14} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
