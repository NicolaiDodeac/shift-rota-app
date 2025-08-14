"use client";

import { useEffect } from "react";

type Props = {
  ok: boolean; // true = success (green check); false = error (red cross)
  title: string;
  sub?: string;
  onClose?: () => void;
  autoHideMs?: number; // e.g., 2000 to auto-dismiss after 2s
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
      className="loader-overlay"
      role="alert"
      aria-live="assertive"
      onClick={onClose}
    >
      <div className="loader-card" onClick={(e) => e.stopPropagation()}>
        {/* Success / error icon */}
        {ok ? (
          <svg
            className="icon-result"
            viewBox="0 0 120 120"
            width="112"
            height="112"
            aria-hidden
          >
            {/* pulse ring */}
            <circle className="pulse-ring ok" cx="60" cy="60" r="44" />
            {/* circle + check path */}
            <circle className="result-circle ok" cx="60" cy="60" r="36" />
            <path className="result-check ok" d="M42 62 L56 74 L80 46" />
          </svg>
        ) : (
          <svg
            className="icon-result"
            viewBox="0 0 120 120"
            width="112"
            height="112"
            aria-hidden
          >
            <circle className="pulse-ring err" cx="60" cy="60" r="44" />
            <circle className="result-circle err" cx="60" cy="60" r="36" />
            <path className="result-x err" d="M46 46 L74 74 M74 46 L46 74" />
          </svg>
        )}

        <div className="loader-title">{title}</div>
        {sub && <div className="loader-sub">{sub}</div>}
      </div>
    </div>
  );
}
