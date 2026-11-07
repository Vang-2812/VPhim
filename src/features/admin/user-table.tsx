"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeUser, retryAuthSync } from "./actions";
import type { AdminUserRow } from "./types";
export function UserTable({ users }: { users: AdminUserRow[] }) {
  const [pending, start] = useTransition(),
    [notice, setNotice] = useState(""),
    router = useRouter();
  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Tham gia</th>
              <th>Loại tài khoản</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.displayName}
                  <small>{user.email}</small>
                  {user.role === "admin" && <small>Quản trị viên</small>}
                </td>
                <td>
                  {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                </td>
                <td>
                  {user.role === "admin" ? (
                    user.membership === "vip" ? (
                      "VIP"
                    ) : (
                      "Thường"
                    )
                  ) : (
                    <select
                      aria-label={"Loại tài khoản của " + user.displayName}
                      value={user.membership}
                      disabled={pending}
                      onChange={(e) => {
                        const membership = e.target.value as "normal" | "vip";
                        if (
                          !confirm(
                            "Đổi loại tài khoản của " + user.displayName + "?",
                          )
                        )
                          return;
                        start(async () => {
                          const r = await changeUser({
                            userId: user.id,
                            membership,
                          });
                          setNotice(
                            r.ok ? "Đã đổi loại tài khoản." : r.message,
                          );
                          router.refresh();
                        });
                      }}
                    >
                      <option value="normal">Thường</option>
                      <option value="vip">VIP</option>
                    </select>
                  )}
                </td>
                <td>
                  <span className={"status-text " + user.status}>
                    {user.status === "blocked" ? "Đã khóa" : "Hoạt động"}
                  </span>
                  {user.authSyncPending && <small>Đang chờ đồng bộ Auth</small>}
                </td>
                <td>
                  {user.role !== "admin" && (
                    <button
                      className="button secondary small"
                      disabled={pending}
                      onClick={() => {
                        const status =
                          user.status === "active" ? "blocked" : "active";
                        if (
                          confirm(
                            (status === "blocked" ? "Khóa" : "Mở khóa") +
                              " tài khoản " +
                              user.displayName +
                              "?",
                          )
                        )
                          start(async () => {
                            const r = await changeUser({
                              userId: user.id,
                              status,
                            });
                            setNotice(
                              r.ok
                                ? r.data.authSyncPending
                                  ? "Đã cập nhật quyền truy cập. Đồng bộ Auth đang chờ thử lại."
                                  : "Đã cập nhật tài khoản."
                                : r.message,
                            );
                            router.refresh();
                          });
                      }}
                    >
                      {user.status === "active" ? "Khóa" : "Mở khóa"}
                    </button>
                  )}
                  {user.authSyncPending && (
                    <button
                      className="remove-item"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const r = await retryAuthSync(user.id);
                          setNotice(r.ok ? "Đã đồng bộ Auth." : r.message);
                          router.refresh();
                        })
                      }
                    >
                      Thử lại đồng bộ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notice && (
        <p className="form-note" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
