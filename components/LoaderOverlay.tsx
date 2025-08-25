"use client";
import s from "./LoaderOverlay.module.css";
import LogoSpinner from "./LogoSpinner";

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
        <div className={s.spinnerContainer}>
          <LogoSpinner size="lg" />
        </div>

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
