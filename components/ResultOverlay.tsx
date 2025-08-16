"use client";
import { useEffect } from "react";
import s from "./ResultOverlay.module.css";

type Props = {
  ok: boolean;
  title: string;
  sub?: string;
  onClose?: () => void;
  autoHideMs?: number;
};

export default function ResultOverlay({
  ok,
  title,
  sub,
  onClose,
  autoHideMs = 2200,
}: Props) {
  useEffect(() => {
    if (!autoHideMs || !onClose) return;
    const t = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, onClose]);

  return (
    <div
      className={s.overlay}
      role="alert"
      aria-live="assertive"
      onClick={onClose}
    >
      <div className={s.card} onClick={(e) => e.stopPropagation()}>
        {ok ? (
          <svg
            className={s.icon}
            viewBox="0 0 120 120"
            width="112"
            height="112"
            aria-hidden
          >
            <circle
              className={`${s.pulseRing} ${s.ok}`}
              cx="60"
              cy="60"
              r="44"
            />
            <circle
              className={`${s.resultCircle} ${s.ok}`}
              cx="60"
              cy="60"
              r="36"
            />
            <path className={s.check} d="M42 62 L56 74 L80 46" />
          </svg>
        ) : (
          <svg
            className={s.icon}
            viewBox="0 0 120 120"
            width="112"
            height="112"
            aria-hidden
          >
            <circle
              className={`${s.pulseRing} ${s.err}`}
              cx="60"
              cy="60"
              r="44"
            />
            <circle
              className={`${s.resultCircle} ${s.err}`}
              cx="60"
              cy="60"
              r="36"
            />
            <path className={s.cross} d="M46 46 L74 74 M74 46 L46 74" />
          </svg>
        )}

        <div className={s.title}>{title}</div>
        {sub && <div className={s.sub}>{sub}</div>}
      </div>
    </div>
  );
}
