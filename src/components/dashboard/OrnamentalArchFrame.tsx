/**
 * OrnamentalArchFrame
 * --------------------
 * Decorative Moorish/ogee arch frame rendered as an inline SVG overlay.
 *
 *  ┌──────────────────────────────┐
 *  │ ░░░ star-pattern band ░░░░░░ │   ← patterned border
 *  │ ░░░  ┌──────────────┐  ░░░░ │
 *  │ ░░░  │              │  ░░░░ │   ← inner arch (cutout)
 *  │ ░░░  │   the photo  │  ░░░░ │
 *  │ ░░░  │              │  ░░░░ │
 *  └──────┴──────────────┴──────┘
 *
 * Drops into any element that holds an `.ogee-arch-portal` image. The portal's
 * clip-path masks the photo to the same inner arch the frame draws around.
 *
 * Pass `OGEE_INNER_ARCH_BBOX_D` to the matching <clipPath clipPathUnits="objectBoundingBox">.
 */

/** Inner arch path, expressed in objectBoundingBox units (0–1). */
export const OGEE_INNER_ARCH_BBOX_D =
  "M 0.15 1 " +
  "L 0.15 0.5 " +
  "C 0.15 0.357, 0.25 0.321, 0.32 0.321 " +
  "C 0.40 0.321, 0.45 0.214, 0.50 0.057 " +
  "C 0.55 0.214, 0.60 0.321, 0.68 0.321 " +
  "C 0.75 0.321, 0.85 0.357, 0.85 0.5 " +
  "L 0.85 1 Z";

/** Same inner arch, drawn in a 100×140 viewBox for the frame SVG. */
const INNER_ARCH_VB =
  "M 15 140 " +
  "L 15 70 " +
  "C 15 50, 25 45, 32 45 " +
  "C 40 45, 45 30, 50 8 " +
  "C 55 30, 60 45, 68 45 " +
  "C 75 45, 85 50, 85 70 " +
  "L 85 140 Z";

/** Outer rectangle of the frame. */
const OUTER_RECT_VB = "M 0 0 L 100 0 L 100 140 L 0 140 Z";

type Props = {
  /** Tailwind text-color class so pattern + outlines inherit via currentColor. */
  colorClassName?: string;
  /** Optional className passthrough on the wrapping SVG. */
  className?: string;
};

export function OrnamentalArchFrame({
  colorClassName = "text-midnight-sapphire",
  className = "",
}: Props) {
  // Unique-ish IDs avoid clashing when several frames live on one page.
  const uid = "ogee-frame";
  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      aria-hidden="true"
      className={`pointer-events-none absolute ${colorClassName} ${className}`}
    >
      <defs>
        {/* 8-point interlaced star, drawn once as a symbol */}
        <symbol id={`${uid}-star`} viewBox="0 0 10 10">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="0.45"
            strokeLinejoin="miter"
          >
            <rect x="2.2" y="2.2" width="5.6" height="5.6" />
            <rect
              x="2.2"
              y="2.2"
              width="5.6"
              height="5.6"
              transform="rotate(45 5 5)"
            />
            <circle cx="5" cy="5" r="0.35" fill="currentColor" stroke="none" />
          </g>
        </symbol>

        {/* Tile the star into a repeating pattern */}
        <pattern
          id={`${uid}-pattern`}
          x="0"
          y="0"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <use href={`#${uid}-star`} x="0" y="0" width="5" height="5" />
          <use href={`#${uid}-star`} x="2.5" y="2.5" width="5" height="5" />
        </pattern>

        {/* Frame band = outer rect minus inner arch (evenodd) */}
        <clipPath id={`${uid}-band-clip`} clipPathUnits="userSpaceOnUse">
          <path
            d={`${OUTER_RECT_VB} ${INNER_ARCH_VB}`}
            clipRule="evenodd"
            fillRule="evenodd"
          />
        </clipPath>
      </defs>

      {/* Patterned band (rect filled with pattern, clipped to band shape) */}
      <g clipPath={`url(#${uid}-band-clip)`} clipRule="evenodd">
        <rect x="0" y="0" width="100" height="140" fill={`url(#${uid}-pattern)`} />
      </g>

      {/* Outer thin border */}
      <rect
        x="0.6"
        y="0.6"
        width="98.8"
        height="138.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />

      {/* Inner arch — thick outline */}
      <path
        d={INNER_ARCH_VB}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="miter"
      />

      {/* Inner arch — thin inset line (creates double-outline look) */}
      <path
        d={
          "M 17 140 " +
          "L 17 70.5 " +
          "C 17 52, 26.5 47, 33 47 " +
          "C 40.5 47, 45.5 32.5, 50 12 " +
          "C 54.5 32.5, 59.5 47, 67 47 " +
          "C 73.5 47, 83 52, 83 70.5 " +
          "L 83 140"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </svg>
  );
}
