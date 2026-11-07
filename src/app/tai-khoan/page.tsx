import { getProfile } from "@/features/profile/service.server";
import { ProfileForm } from "@/features/profile/profile-form";
import { Feedback } from "@/components/ui/feedback";
export const metadata = { title: "Tài khoản" };
export default async function ProfilePage() {
  const r = await getProfile();
  return (
    <>
      <h1>Tài khoản</h1>
      <p className="account-description">
        Một vài điều về bạn, theo cách bạn muốn.
      </p>
      {r.ok ? (
        <ProfileForm profile={r.data} />
      ) : (
        <Feedback
          title="Chưa tải được hồ sơ"
          message={r.message}
          kind="error"
        />
      )}
    </>
  );
}
