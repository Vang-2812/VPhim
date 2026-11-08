import type { MovieDetail } from "@/features/movies/types";
import { cleanDescription } from "./config";

export function WebSiteJsonLd({ origin }: { origin: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VPhim",
    alternateName: ["VPhim Online", "VPhim HD"],
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/kham-pha?keyword={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function MovieJsonLd({
  movie,
  origin,
}: {
  movie: MovieDetail;
  origin: string;
}) {
  const isSeries =
    movie.servers.some((s) => s.episodes.length > 1) ||
    movie.genres.some((g) => g.toLowerCase().includes("bộ"));

  const schema = {
    "@context": "https://schema.org",
    "@type": isSeries ? "TVSeries" : "Movie",
    name: movie.title,
    alternateName: movie.originalTitle || undefined,
    url: `${origin}/phim/${movie.slug}`,
    image: movie.posterUrl || movie.thumbUrl || undefined,
    description: cleanDescription(movie.description, 300),
    dateCreated: movie.year ? `${movie.year}` : undefined,
    genre: movie.genres.length > 0 ? movie.genres : undefined,
    inLanguage: movie.language || "vi",
    countryOfOrigin: movie.countries.map((c) => ({
      "@type": "Country",
      name: c,
    })),
    director: movie.director.filter(Boolean).map((d) => ({
      "@type": "Person",
      name: d,
    })),
    actor: movie.actors.filter(Boolean).map((a) => ({
      "@type": "Person",
      name: a,
    })),
    potentialAction: {
      "@type": "WatchAction",
      target: `${origin}/xem/${movie.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function VideoObjectJsonLd({
  movie,
  episodeLabel,
  origin,
}: {
  movie: MovieDetail;
  episodeLabel?: string;
  origin: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${movie.title}${episodeLabel ? ` - ${episodeLabel}` : ""}`,
    description: cleanDescription(movie.description, 200),
    thumbnailUrl: [movie.thumbUrl || movie.posterUrl || `${origin}/icon.svg`],
    uploadDate: new Date().toISOString(),
    contentUrl: `${origin}/xem/${movie.slug}`,
    embedUrl: `${origin}/xem/${movie.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
