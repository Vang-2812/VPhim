"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { clearWatchHistory } from "./actions";
export function HistoryRemove({ id }: { id: string }) {
  const [pending, start] = useTransition(),
    [message, setMessage] = useState(""),
    router = useRouter();
  return (
    <>
      <button
        className="remove-item"
        disabled={pending}
        onClick={() => {
          if (confirm("Xóa phim này khỏi lịch sử và tiến độ xem?"))
            start(async () => {
              const r = await clearWatchHistory(id);
              if (r.ok) router.refresh();
              else setMessage(r.message);
            });
        }}
      >
        <Trash2 size={13} />
        Xóa lịch sử
      </button>
      {message && (
        <p className="inline-note" role="alert">
          {message}
        </p>
      )}
    </>
  );
}
