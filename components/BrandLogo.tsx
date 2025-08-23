"use client";

import Link from "next/link";
import Image from "next/image";

type Props = { width?: number; height?: number };

export default function BrandLogo({ width = 160, height = 96 }: Props) {
  return (
    <Link 
      href="/" 
      aria-label="Go to home"
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'var(--color-text)',
        transition: 'opacity var(--transition-fast)'
      }}
    >
      <Image
        src="/logo-yellow.png"
        alt="Magna Shift Rota by ND"
        width={width}
        height={height}
        priority
        sizes="(max-width: 600px) 140px, 160px"
        style={{
          // Remove the problematic filter and let the logo display naturally
          // The logo should work well in both light and dark themes
        }}
      />
    </Link>
  );
}
