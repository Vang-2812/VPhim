import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function VPhimLogo({
  size = 28,
  showText = true,
  className = "",
}: LogoProps) {
  const iconSize = size;
  return (
    <div
      role="img"
      aria-label="VPhim"
      className={`vphim-brand ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${Math.max(6, Math.round(size * 0.28))}px`,
        textDecoration: "none",
        userSelect: "none",
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient
            id="vphim-amber-grad"
            x1="4"
            y1="6"
            x2="36"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fbbf24" />
            <stop offset="0.5" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
          <linearGradient
            id="vphim-accent-grad"
            x1="20"
            y1="10"
            x2="28"
            y2="26"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fef3c7" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Outer squircle frame */}
        <rect
          x="1.5"
          y="1.5"
          width="37"
          height="37"
          rx="10"
          fill="#1c1917"
          stroke="#292524"
          strokeWidth="1.5"
        />

        {/* Film strip sprocket holes on side */}
        <rect x="4" y="6" width="3" height="4" rx="1" fill="#44403c" />
        <rect x="4" y="14" width="3" height="4" rx="1" fill="#44403c" />
        <rect x="4" y="22" width="3" height="4" rx="1" fill="#44403c" />
        <rect x="4" y="30" width="3" height="4" rx="1" fill="#44403c" />

        {/* Dynamic faceted letter V with filmic play arrow */}
        {/* Left arm of V */}
        <path
          d="M11 9L19.5 28.5C19.8 29.2 20.8 29.2 21.1 28.5L25.5 19L20 14L11 9Z"
          fill="url(#vphim-amber-grad)"
        />
        {/* Right arm & play triangle overlay */}
        <path
          d="M29 9L20.2 28.5L24.5 19L31 11.5L29 9Z"
          fill="url(#vphim-accent-grad)"
        />
        {/* Play triangle inside the V */}
        <path
          d="M18.5 13.5L26 18L18.5 22.5V13.5Z"
          fill="#1c1917"
          opacity="0.92"
        />
        <path
          d="M19.5 15L24.5 18L19.5 21V15Z"
          fill="url(#vphim-amber-grad)"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "var(--font-display, inherit)",
            fontWeight: 800,
            fontSize: `${Math.round(size * 0.75)}px`,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "baseline",
          }}
        >
          <span style={{ color: "#f59e0b" }}>V</span>
          <span style={{ color: "var(--color-ink, #f5f5f4)" }}>Phim</span>
        </span>
      )}
    </div>
  );
}
