"use client";
import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { ImagePlus } from "lucide-react";
import { updateProfile, uploadAvatar } from "./actions";
import type { Profile } from "./service.server";
import type { Gender } from "./validation";
export function ProfileForm({ profile }: { profile: Profile }) {
  const avatarInput = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(profile.avatarUrl),
    [notice, setNotice] = useState(""),
    [success, setSuccess] = useState(false),
    [pending, start] = useTransition();
  return (
    <>
      <div className="profile-layout">
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            start(async () => {
              const r = await updateProfile({
                displayName: String(f.get("displayName")),
                gender: String(f.get("gender")) as Gender,
              });
              setSuccess(r.ok);
              setNotice(r.ok ? "Thông tin đã được cập nhật." : r.message);
            });
          }}
        >
          <label>
            Email
            <input value={profile.email} readOnly />
          </label>
          <label>
            Tên hiển thị
            <input
              name="displayName"
              defaultValue={profile.displayName}
              required
              maxLength={80}
              autoComplete="nickname"
            />
          </label>
          <fieldset>
            <legend>Giới tính</legend>
            <div className="radio-row">
              {[
                ["male", "Nam"],
                ["female", "Nữ"],
                ["unspecified", "Không xác định"],
              ].map(([v, t]) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="gender"
                    value={v}
                    defaultChecked={profile.gender === v}
                  />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <button type="submit" className="button" disabled={pending}>
              {pending ? "Đang lưu…" : "Cập nhật"}
            </button>
          </div>
        </form>
        <div className="profile-avatar">
          <div className="avatar">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar của bạn"
                onError={() => setAvatar(null)}
              />
            ) : (
              profile.displayName[0]?.toUpperCase()
            )}
          </div>
          <button
            type="button"
            className="button secondary"
            disabled={pending}
            onClick={() => avatarInput.current?.click()}
          >
            <ImagePlus size={16} />
            Đổi avatar
          </button>
          <input
            ref={avatarInput}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={pending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const f = new FormData();
              f.set("avatar", file);
              start(async () => {
                const r = await uploadAvatar(f);
                setSuccess(r.ok);
                setNotice(r.ok ? "Avatar đã được cập nhật." : r.message);
                if (r.ok) setAvatar(r.data.avatarUrl);
              });
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {notice && (
        <p
          className={"form-note " + (success ? "success" : "error")}
          role={success ? "status" : "alert"}
        >
          {notice}
        </p>
      )}
      <p className="watch-status">
        Đổi mật khẩu qua{" "}
        <Link className="text-link" href="/quen-mat-khau">
          khôi phục mật khẩu
        </Link>
        . Ảnh JPEG, PNG hoặc WebP, tối đa 2 MB.
      </p>
    </>
  );
}
