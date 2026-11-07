import { getPlaylists } from "@/features/library/service.server";
import { PlaylistEditor } from "@/features/library/playlist-editor";
import { Feedback } from "@/components/ui/feedback";
export const metadata = { title: "Danh sách của bạn" };
export default async function Playlists() {
  const r = await getPlaylists();
  return (
    <>
      <h1>Danh sách của bạn</h1>
      <p className="account-description">
        Một bộ sưu tập cho từng tâm trạng. Chỉ mình bạn nhìn thấy.
      </p>
      {r.ok ? (
        <PlaylistEditor playlists={r.data} />
      ) : (
        <Feedback
          title="Chưa tải được danh sách"
          message={r.message}
          kind="error"
        />
      )}
    </>
  );
}
