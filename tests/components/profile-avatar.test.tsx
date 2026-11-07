import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("@/features/profile/actions", () => ({
  updateProfile: async () => ({ ok: false, message: "Unavailable" }),
  uploadAvatar: async () => ({ ok: false, message: "Unavailable" }),
}));
import { ProfileForm } from "@/features/profile/profile-form";
it("provides a keyboard accessible button to choose an avatar", () => {
  render(
    <ProfileForm
      profile={{
        userId: "a",
        displayName: "Người xem",
        email: "a@example.test",
        gender: "unspecified",
        avatarUrl: null,
      }}
    />,
  );
  expect(screen.getByRole("button", { name: "Đổi avatar" })).toBeEnabled();
});
