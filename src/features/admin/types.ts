export interface AdminUserRow {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  role: "member" | "admin";
  membership: "normal" | "vip";
  status: "active" | "blocked";
  authSyncPending: boolean;
}
