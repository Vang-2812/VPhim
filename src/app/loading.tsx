export default function Loading() {
  return (
    <div
      className="container page-space"
      aria-busy="true"
      aria-label="Đang tải nội dung"
    >
      <div className="skeleton skeleton-heading" />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="skeleton skeleton-poster" key={i} />
        ))}
      </div>
    </div>
  );
}
