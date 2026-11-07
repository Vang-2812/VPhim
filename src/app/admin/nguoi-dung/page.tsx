import { listUsers } from "@/features/admin/service.server";
import { UserTable } from "@/features/admin/user-table";
import { Feedback } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
export const metadata = { title: "Quản lý người dùng" };
export default async function Users({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams,
    r = await listUsers({
      search: p.search,
      membership:
        p.membership === "vip"
          ? "vip"
          : p.membership === "normal"
            ? "normal"
            : undefined,
      status:
        p.status === "active"
          ? "active"
          : p.status === "blocked"
            ? "blocked"
            : undefined,
      page: Number(p.page) || 1,
    });
  return (
    <>
      <h1>Quản lý người dùng</h1>
      <p className="account-description">
        Tài khoản, trạng thái truy cập và loại thành viên.
      </p>
      <form className="admin-filters">
        <input
          name="search"
          aria-label="Tìm người dùng"
          placeholder="Tên hoặc email"
          defaultValue={p.search}
          maxLength={100}
        />
        <select
          name="membership"
          defaultValue={p.membership || ""}
          aria-label="Lọc loại tài khoản"
        >
          <option value="">Tất cả loại</option>
          <option value="normal">Thường</option>
          <option value="vip">VIP</option>
        </select>
        <select
          name="status"
          defaultValue={p.status || ""}
          aria-label="Lọc trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="blocked">Đã khóa</option>
        </select>
        <button className="button">Tìm</button>
      </form>
      {!r.ok ? (
        <Feedback
          title="Chưa tải được người dùng"
          message={r.message}
          kind="error"
        />
      ) : r.data.items.length ? (
        <>
          <UserTable users={r.data.items} />
          <Pagination
            page={r.data.page}
            totalPages={r.data.totalPages}
            params={p}
          />
        </>
      ) : (
        <Feedback
          title="Chưa có tài khoản phù hợp"
          message="Thử thay đổi điều kiện tìm kiếm."
        />
      )}
      <p className="watch-status">
        User thường và VIP có cùng chức năng. Quyền admin được quản lý riêng.
      </p>
    </>
  );
}
