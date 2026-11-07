"use client";
import { Feedback } from "@/components/ui/feedback";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container">
      <Feedback
        title="Có chút gián đoạn"
        message="Vui lòng thử tải lại nội dung."
        kind="error"
      >
        <button className="button" onClick={reset}>
          Thử lại
        </button>
      </Feedback>
    </div>
  );
}
