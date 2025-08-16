"use client";

import React from "react";
import styles from "./ColorIdPicker.module.css";

/**
 * We expose 24 swatches (IDs "1".."24"). The actual colors shown here are UI-only;
 * Google will style the calendar using its own palette for the same ID.
 */
const SWATCHES: { id: string; h: number }[] = Array.from(
  { length: 24 },
  (_, i) => ({
    id: String(i + 1),
    h: (i * 360) / 24, // spread hues around the wheel
  })
);

type Props = {
  value: string; // current colorId (e.g. "11")
  onChange: (id: string) => void; // callback when user picks a swatch
  size?: number; // px size of squares (default 32)
};

export default function ColorIdPicker({ value, onChange, size = 32 }: Props) {
  return (
    <div className={styles.grid} role="radiogroup" aria-label="Calendar color">
      {SWATCHES.map(({ id, h }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            className={`${styles.swatch} ${selected ? styles.selected : ""}`}
            style={{
              width: size,
              height: size,
              backgroundColor: `hsl(${Math.round(h)}, 70%, 55%)`,
            }}
            role="radio"
            aria-checked={selected}
            aria-label={`Color ${id}`}
            onClick={() => onChange(id)}
          >
            {selected && (
              <svg
                className={styles.tick}
                viewBox="0 0 20 20"
                width="16"
                height="16"
                aria-hidden
              >
                <path
                  d="M5 10.5 L8.5 14 L15 6"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span className={styles.idBadge}>{id}</span>
          </button>
        );
      })}
    </div>
  );
}
