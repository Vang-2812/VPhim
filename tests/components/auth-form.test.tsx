import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Feedback } from "@/components/ui/feedback";
it("keeps the reason and recovery action visible on provider failure", () => {
  render(
    <Feedback
      kind="error"
      title="Nguồn phim chưa sẵn sàng"
      message="Thử lại sau."
    >
      <a href="/kham-pha">Khám phá phim</a>
    </Feedback>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Thử lại sau.");
  expect(screen.getByRole("link", { name: "Khám phá phim" })).toHaveAttribute(
    "href",
    "/kham-pha",
  );
});
