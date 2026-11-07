export default function DetailLoading() {
  return (
    <div
      className="container page-space"
      aria-busy="true"
      aria-label="Đang tải thông tin phim"
    >
      <div
        className="skeleton"
        style={{ height: "20px", width: "160px", marginBottom: "24px" }}
      />
      <section className="detail-layout">
        <div className="detail-poster">
          <div
            className="skeleton skeleton-poster"
            style={{ width: "100%", minHeight: "360px" }}
          />
        </div>
        <div>
          <div
            className="skeleton"
            style={{ height: "40px", width: "70%", marginBottom: "16px" }}
          />
          <div
            className="skeleton"
            style={{ height: "20px", width: "40%", marginBottom: "24px" }}
          />
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
            <div
              className="skeleton"
              style={{ height: "44px", width: "140px" }}
            />
            <div
              className="skeleton"
              style={{ height: "44px", width: "140px" }}
            />
          </div>
          <div
            className="skeleton"
            style={{ height: "24px", width: "30%", marginBottom: "16px" }}
          />
          <div
            className="skeleton"
            style={{ height: "16px", width: "95%", marginBottom: "10px" }}
          />
          <div
            className="skeleton"
            style={{ height: "16px", width: "85%", marginBottom: "10px" }}
          />
          <div
            className="skeleton"
            style={{ height: "16px", width: "70%", marginBottom: "24px" }}
          />
        </div>
      </section>
    </div>
  );
}
