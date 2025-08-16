"use client";
import s from "./LoaderOverlay.module.css";

type Props = {
  title?: string;
  sub?: string;
  progressCurrent?: number;
  progressTotal?: number;
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
      className={s.overlay}
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className={s.card}>
        <svg
          className={s.orbit}
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
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker
              id="arrow-orange"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          {/* CW blue arc */}
          <g className={s.animateCw} style={{ color: "var(--brand)" }}>
            <path
              className={`${s.ring} ${s.blue}`}
              d="M60 12 A48 48 0 1 1 59.99 12"
              strokeWidth="10"
              strokeLinecap="round"
              markerEnd="url(#arrow-blue)"
              strokeDasharray="260 140"
            />
          </g>

          {/* CCW orange arc */}
          <g className={s.animateCcw} style={{ color: "#ff8a00" }}>
            <path
              className={`${s.ring} ${s.orange}`}
              d="M60 108 A48 48 0 1 0 60.01 108"
              strokeWidth="10"
              strokeLinecap="round"
              markerEnd="url(#arrow-orange)"
              strokeDasharray="260 140"
            />
          </g>

          {/* Center sun + rays */}
          <g className={s.sunPulse}>
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

        <div className={s.title}>{title}</div>
        <div className={s.sub}>
          {hasProgress
            ? `${progressCurrent} / ${progressTotal} (${pct}%)`
            : sub}
        </div>

        {hasProgress && (
          <div className={s.progress}>
            <div className={s.progressBar} style={{ width: `${pct}%` }} />
          </div>
        )}

        <div className={s.dots} aria-hidden>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
}
