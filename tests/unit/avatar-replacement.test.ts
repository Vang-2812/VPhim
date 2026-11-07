import { it, expect } from "vitest";
import { replaceAvatar } from "@/features/profile/avatar-replacement";
it("keeps the old avatar and removes the new upload if profile save fails", async () => {
  const files = new Set(["old.webp"]);
  await expect(
    replaceAvatar("old.webp", {
      upload: async () => {
        files.add("new.webp");
        return "new.webp";
      },
      save: async () => {
        throw new Error("database");
      },
      remove: async (path) => {
        files.delete(path);
      },
    }),
  ).rejects.toThrow("database");
  expect([...files]).toEqual(["old.webp"]);
});
it("removes the previous avatar only after a successful profile save", async () => {
  const files = new Set(["old.webp"]);
  let profile = "old.webp";
  await replaceAvatar(profile, {
    upload: async () => {
      files.add("new.webp");
      return "new.webp";
    },
    save: async (path) => {
      profile = path;
    },
    remove: async (path) => {
      files.delete(path);
    },
  });
  expect(profile).toBe("new.webp");
  expect([...files]).toEqual(["new.webp"]);
});
