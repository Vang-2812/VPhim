import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Play, ChevronRight, HelpCircle } from "lucide-react";
import { getMovie } from "@/features/movies/client.server";
import { Feedback, RetryLink } from "@/components/ui/feedback";
import { LibraryControls } from "@/features/library/library-controls";
import { getOptionalMember } from "@/features/auth/context.server";
import { getLibraryState } from "@/features/library/actions";
import { getMovieResume } from "@/features/playback/progress.server";
import type { MovieDetail } from "@/features/movies/types";
import { getSiteOrigin, cleanDescription, buildMovieTitle } from "@/lib/seo/config";
import {
  MovieJsonLd,
  BreadcrumbJsonLd,
  FaqJsonLd,
} from "@/lib/seo/schema-org";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const r = await getMovie((await params).slug);
  if (!r.ok) {
    return { title: "Thông tin phim | VPhim" };
  }
  const m = r.data;
  const siteOrigin = getSiteOrigin();
  const title = buildMovieTitle(m);
  const description = cleanDescription(m.description, 160);
  const imageUrl = m.posterUrl || m.thumbUrl || `${siteOrigin}/icon.svg`;

  return {
    title,
    description,
    keywords: [
      m.title,
      m.originalTitle || "",
      `phim ${m.title}`,
      `xem phim ${m.title}`,
      ...m.genres,
      ...m.countries,
      "vietsub",
      "thuyết minh",
      "full hd",
    ].filter(Boolean),
    alternates: {
      canonical: `/phim/${m.slug}`,
    },
    openGraph: {
      type: "video.movie",
      title,
      description,
      url: `/phim/${m.slug}`,
      siteName: "VPhim",
      locale: "vi_VN",
      images: [
        {
          url: imageUrl,
          alt: m.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const r = await getMovie((await params).slug);
  if (!r.ok) {
    if (r.code === "NOT_FOUND") notFound();
    return (
      <div className="container">
        <Feedback
          title="Chưa tải được thông tin phim"
          message={r.message}
          kind="error"
        >
          <RetryLink />
        </Feedback>
      </div>
    );
  }
  const m = r.data;
  const siteOrigin = getSiteOrigin();

  const totalEpisodes = m.servers[0]?.episodes.length || 0;
  const faqs = [
    {
      question: `Phim ${m.title} có phụ đề Vietsub và Thuyết minh không?`,
      answer: `Phim ${m.title} trên VPhim có đầy đủ phụ đề Vietsub và Thuyết minh với chất lượng Full HD, âm thanh rõ ràng và cập nhật liên tục.`,
    },
    {
      question: `Xem phim ${m.title} ở đâu nhanh và không giật lag?`,
      answer: `Bạn có thể xem phim ${m.title} trực tiếp trên VPhim qua luồng phát HLS tốc độ cao, hỗ trợ chuyển tập tự động và bộ lọc hình ảnh chuyên sâu.`,
    },
    ...(totalEpisodes > 1
      ? [
          {
            question: `Phim ${m.title} có bao nhiêu tập?`,
            answer: `Hiện tại phim ${m.title} có ${totalEpisodes} tập được phát hành trên hệ thống VPhim.`,
          },
        ]
      : []),
    {
      question: `VPhim có lưu lại thời gian đang xem dở phim ${m.title} không?`,
      answer: `Có, hệ thống tự động ghi nhớ chính xác giây phút bạn đang xem dở trên phim ${m.title} để bạn có thể tiếp tục xem lại bất kỳ lúc nào.`,
    },
  ];

  return (
    <>
      <MovieJsonLd key="ld-movie" movie={m} origin={siteOrigin} />
      <BreadcrumbJsonLd
        key="ld-bc"
        items={[
          { name: "Trang chủ", url: siteOrigin },
          { name: "Khám phá", url: `${siteOrigin}/kham-pha` },
          { name: m.title, url: `${siteOrigin}/phim/${m.slug}` },
        ]}
      />
      <FaqJsonLd key="ld-faq" faqs={faqs} />

      <section className="detail-hero">
        <div className="detail-backdrop" aria-hidden="true">
          {(m.thumbUrl || m.posterUrl) && (
            <img src={(m.thumbUrl || m.posterUrl)!} alt="" fetchPriority="high" />
          )}
        </div>
        <div className="container detail-hero-inner">
          <Link href="/kham-pha" className="breadcrumb">
            Khám phá
            <ChevronRight size={14} />
            Thông tin phim
          </Link>
          <div className="detail-hero-copy">
            <p className="hero-eyebrow">Thông tin phim</p>
            <h1 className="detail-title">{m.title}</h1>
            {m.originalTitle && <p className="original-title">{m.originalTitle}</p>}
            <div className="metadata-row">
              {[m.year, m.quality, m.duration, m.language, m.status]
                .filter(Boolean)
                .map((v, i) => (
                  <span key={i}>{v}</span>
                ))}
            </div>
            <p className="detail-teaser">
              {m.description || "Nguồn phim chưa cung cấp phần giới thiệu."}
            </p>
            <Suspense
              fallback={
                <div className="detail-actions" role="status">
                  Đang tải tùy chọn xem…
                </div>
              }
            >
              <DetailActions movie={m} />
            </Suspense>
          </div>
        </div>
      </section>
      <div className="container detail-page-body">
        <section className={m.posterUrl ? "detail-overview" : "detail-overview no-poster"}>
          {m.posterUrl && (
            <div className="detail-poster">
              <img src={m.posterUrl} alt={m.title} loading="lazy" />
            </div>
          )}
          <div>
            <h2 className="small-heading">Câu chuyện</h2>
            <p className="synopsis">
              {m.description || "Nguồn phim chưa cung cấp phần giới thiệu."}
            </p>
            <dl className="movie-facts">
              {[
                ["Thể loại", m.genres.join(", ")],
                ["Quốc gia", m.countries.join(", ")],
                ["Đạo diễn", m.director.join(", ")],
                ["Diễn viên", m.actors.join(", ")],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </section>
        <section className="movie-section">
          <div className="section-heading">
            <h2>Chọn tập để bắt đầu</h2>
          </div>
          {m.servers.length ? (
            m.servers.map((s) => (
              <div className="episode-section" key={s.key}>
                <h3>{s.label}</h3>
                <div className="episode-grid">
                  {s.episodes.map((e) => (
                    <Link
                      className="episode"
                      key={e.key}
                      href={
                        "/xem/" +
                        m.slug +
                        "?" +
                        new URLSearchParams({ server: s.key, episode: e.key })
                      }
                    >
                      {e.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Feedback
              title="Chưa có tập phim"
              message="Nguồn phim chưa cập nhật tập hoặc đang phát hành trailer."
            />
          )}
        </section>

        {/* Visible FAQ Section for GEO and Users */}
        <section className="movie-section movie-faq-section">
          <div className="section-heading">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HelpCircle size={20} className="text-amber" />
              <h2>Câu hỏi thường gặp về {m.title}</h2>
            </div>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

async function DetailActions({ movie: m }: { movie: MovieDetail }) {
  const member = await getOptionalMember();
  let initialSelected = false;
  let initialPlaylists: { id: string; name: string }[] = [];
  let resumeState: { episodeKey: string; serverKey: string } | null = null;
  if (member) {
    const [libState, resume] = await Promise.all([
      getLibraryState(m.slug),
      getMovieResume(m.slug),
    ]);
    if (libState.ok) {
      initialSelected = libState.data.selected;
      initialPlaylists = libState.data.playlists;
    }
    if (resume.ok && resume.data) {
      resumeState = resume.data;
    }
  }

  let watchHref = "/xem/" + m.slug;
  let watchLabel = "Xem phim";
  if (resumeState) {
    watchHref =
      "/xem/" +
      m.slug +
      "?" +
      new URLSearchParams({
        server: resumeState.serverKey,
        episode: resumeState.episodeKey,
      });
    const s = m.servers.find((srv) => srv.key === resumeState?.serverKey);
    const ep = s?.episodes.find((e) => e.key === resumeState?.episodeKey);
    watchLabel = ep ? "Tiếp tục " + ep.label : "Tiếp tục xem";
  }
  return (
    <div className="detail-actions">
      <Link className="button" href={watchHref}>
        <Play size={18} fill="currentColor" />
        {watchLabel}
      </Link>
      <LibraryControls
        slug={m.slug}
        initialMember={Boolean(member)}
        initialSelected={initialSelected}
        initialPlaylists={initialPlaylists}
      />
    </div>
  );
}
