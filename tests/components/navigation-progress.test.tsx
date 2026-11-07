import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavigationProgress } from "@/components/ui/navigation-progress";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

it("renders the progress container without crashing", () => {
  const { container } = render(<NavigationProgress />);
  expect(container).toBeDefined();
});
it("does not start page loading for a same-page hash history event", () => {
  render(<NavigationProgress />);
  window.history.pushState({}, "", "#ban-quyen");
  fireEvent.popState(window);
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  window.history.replaceState({}, "", "/");
});
