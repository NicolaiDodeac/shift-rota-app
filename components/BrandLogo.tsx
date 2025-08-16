"use client";

import Link from "next/link";
import Image from "next/image";
import s from "./BrandLogo.module.css";

type Props = { width?: number; height?: number };

export default function BrandLogo({ width = 160, height = 96 }: Props) {
  return (
    <Link href="/" className={s.logo} aria-label="Go to home">
      <Image
        src="/logo-yellow.png"
        alt="Magna Shift Rota by ND"
        width={width}
        height={height}
        priority
        sizes="(max-width: 600px) 140px, 160px"
      />
    </Link>
  );
}
