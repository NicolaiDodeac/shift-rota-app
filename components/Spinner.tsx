"use client";

import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Spinner({ 
  size = 'md', 
  color = 'currentColor',
  className = '',
  style
}: SpinnerProps) {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${className}`}
      style={{
        borderTopColor: color,
        ...style
      }}
      role="status"
      aria-label="Loading"
    />
  );
}
