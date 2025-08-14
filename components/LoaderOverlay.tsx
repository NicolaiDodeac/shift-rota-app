"use client";

type Props = {
  title?: string;
  sub?: string;
  progressCurrent?: number; // NEW
  progressTotal?: number; // NEW
};

export default function LoaderOverlay({
  title = "Updating your Google Calendar…",
  sub = "This can take a moment for large seasons.",
  progressCurrent,
  progressTotal,
}: Props) {
  const hasProgress =
    typeof progressCurrent === "number" &&
    typeof progressTotal === "number" &&
    progressTotal > 0;

  const pct = hasProgress
    ? Math.min(100, Math.round((progressCurrent! / progressTotal!) * 100))
    : 0;

  return (
    <div
      className="loader-overlay"
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="loader-card">
        {/* Orbiting arrows (brand colors) */}
        <svg
          className="loader-orbit"
          viewBox="0 0 120 120"
          width="112"
          height="112"
          aria-hidden
        >
          <defs>
            <marker
              id="arrow-blue"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--brand-blue)" />
            </marker>
            <marker
              id="arrow-orange"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--brand-orange)" />
            </marker>
          </defs>

          {/* CW blue arc */}
          <g className="animate-cw">
            <path
              className="ring blue"
              d="M60 12 A48 48 0 1 1 59.99 12"
              strokeWidth="10"
              strokeLinecap="round"
              markerEnd="url(#arrow-blue)"
              strokeDasharray="260 140"
            />
          </g>

          {/* CCW orange arc */}
          <g className="animate-ccw">
            <path
              className="ring orange"
              d="M60 108 A48 48 0 1 0 60.01 108"
              strokeWidth="10"
              strokeLinecap="round"
              markerEnd="url(#arrow-orange)"
              strokeDasharray="260 140"
            />
          </g>

          {/* Center “sun” pulse */}
          <g className="sun-pulse">
            <circle cx="60" cy="60" r="11" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              const x1 = 60 + Math.cos(a) * 18;
              const y1 = 60 + Math.sin(a) * 18;
              const x2 = 60 + Math.cos(a) * 26;
              const y2 = 60 + Math.sin(a) * 26;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
        </svg>

        <div className="loader-title">{title}</div>
        <div className="loader-sub">
          {hasProgress
            ? `${progressCurrent} / ${progressTotal} (${pct}%)`
            : sub}
        </div>

        {/* NEW: linear progress bar */}
        {hasProgress && (
          <div className="progress">
            <div className="progress-bar" style={{ width: `${pct}%` }} />
          </div>
        )}

        <div className="dots" aria-hidden>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
}
