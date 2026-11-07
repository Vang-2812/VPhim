import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VPhimLogo } from "@/components/ui/logo";

it("renders the VPhim logo with accessible label", () => {
  render(<VPhimLogo />);
  expect(screen.getByLabelText("VPhim")).toBeInTheDocument();
  expect(
    screen.getAllByText((_, el) => el?.textContent === "VPhim").length,
  ).toBeGreaterThan(0);
});

it("can render icon mark only when showText is false", () => {
  render(<VPhimLogo showText={false} />);
  expect(screen.getByLabelText("VPhim")).toBeInTheDocument();
  expect(
    screen.queryAllByText((_, el) => el?.textContent === "VPhim").length,
  ).toBe(0);
});
