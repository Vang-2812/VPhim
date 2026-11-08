export function VideoFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        pointerEvents: "none",
        opacity: 0,
        visibility: "hidden",
      }}
    >
      <defs>
        <filter id="vphim-sharpen-low" colorInterpolationFilters="sRGB">
          <feConvolveMatrix
            order="3"
            preserveAlpha="true"
            kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0"
          />
        </filter>
        <filter id="vphim-sharpen-high" colorInterpolationFilters="sRGB">
          <feConvolveMatrix
            order="3"
            preserveAlpha="true"
            kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
