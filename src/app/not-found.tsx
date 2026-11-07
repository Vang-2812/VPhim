import Link from "next/link";
import { Feedback } from "@/components/ui/feedback";
export default function NotFound() {
  return (
    <div className="container">
      <Feedback
        title="Câu chuyện này chưa có ở đây"
        message="Phim có thể đã đổi tên hoặc không còn trong nguồn."
      >
        <Link className="button" href="/kham-pha">
          Khám phá phim khác
        </Link>
      </Feedback>
    </div>
  );
}
