import { z } from "zod";
import { fail, type Result } from "@/lib/result";
export type Gender = "male" | "female" | "unspecified";
const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên.")
    .max(80, "Tên tối đa 80 ký tự."),
  gender: z.enum(["male", "female", "unspecified"]),
});
export const parseProfile = (value: unknown) => schema.parse(value);
export function validateAvatar(
  bytes: Uint8Array,
  declaredType: string,
): Result<{
  mime: "image/jpeg" | "image/png" | "image/webp";
  extension: string;
}> {
  if (bytes.length > 2 * 1024 * 1024 || bytes.length < 12)
    return fail("VALIDATION", "Ảnh phải là JPEG, PNG hoặc WebP, tối đa 2 MB.");
  const png =
    bytes[0] === 137 &&
    bytes[1] === 80 &&
    bytes[2] === 78 &&
    bytes[3] === 71 &&
    bytes[4] === 13 &&
    bytes[5] === 10 &&
    bytes[6] === 26 &&
    bytes[7] === 10;
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const mime = png
    ? "image/png"
    : jpg
      ? "image/jpeg"
      : webp
        ? "image/webp"
        : null;
  return mime && mime === declaredType
    ? {
        ok: true,
        data: { mime, extension: png ? "png" : jpg ? "jpg" : "webp" },
      }
    : fail("VALIDATION", "Nội dung ảnh không hợp lệ.");
}
