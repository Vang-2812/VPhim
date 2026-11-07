import { it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { NavigationProgress } from "@/components/ui/navigation-progress";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

it("renders the progress container without crashing", () => {
  const { container } = render(<NavigationProgress />);
  expect(container).toBeDefined();
});
