export default function DiscoveryLoading() {
  return (
    <div
      className="container page-space"
      aria-busy="true"
      aria-label="Đang tải phim"
    >
      <div
        className="skeleton"
        style={{ height: "36px", width: "220px", marginBottom: "16px" }}
      />
      <div
        className="skeleton"
        style={{ height: "48px", width: "100%", marginBottom: "32px" }}
      />
      <div className="movie-grid">
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="skeleton skeleton-poster" style={{ width: "100%" }} />
            <div className="skeleton" style={{ height: "16px", width: "75%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
