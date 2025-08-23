"use client";

import { Card } from "@/components/ui/Card";
import styles from "./LoaderOverlay.module.css";
import LogoSpinner from "./LogoSpinner";

interface LoaderOverlayProps {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'overlay' | 'inline';
  className?: string;
}

export default function LoaderOverlay({ 
  title = "Loading...", 
  subtitle = "Please wait while we fetch your data...",
  size = 'md',
  variant = 'overlay',
  className = ''
}: LoaderOverlayProps) {
  const content = (
    <div className={styles.card}>
      <div className={styles.spinnerContainer}>
        <LogoSpinner size={size} />
      </div>
      <h1 className={styles.title}>
        {title}
      </h1>
      <p className={styles.subtitle}>
        {subtitle}
      </p>
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className={styles.overlay}>
        {content}
      </div>
    );
  }

  return (
    <Card padding="lg" elevation="md" className={className}>
      {content}
    </Card>
  );
}
