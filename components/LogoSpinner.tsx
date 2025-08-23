"use client";

import React from 'react';
import styles from './LogoSpinner.module.css';

interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export default function LogoSpinner({ 
  size = 'md', 
  className = '',
  style
}: LogoSpinnerProps) {
  return (
    <div className={`${styles.spinner} ${styles[size]} ${className}`} style={style}>
      <div className={styles.logoContainer}>
        {/* Central sun/gear icon */}
        <div className={styles.centerIcon}>
          <div className={styles.sunCenter}></div>
          <div className={styles.sunRays}>
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={styles.ray}
                style={{ transform: `rotate(${i * 45}deg)` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Rotating curved arrows from the logo */}
      <div className={styles.arrows}>
        {/* Dark blue curved arrow (top-left, clockwise) */}
        <svg className={styles.curvedArrow} viewBox="0 0 100 100">
          <path 
            d="M 25 25 A 25 25 0 0 1 75 75" 
            stroke="var(--midnight-800)" 
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        {/* Orange curved arrow (bottom-right, counter-clockwise) */}
        <svg className={styles.curvedArrow} viewBox="0 0 100 100">
          <path 
            d="M 75 75 A 25 25 0 0 0 25 25" 
            stroke="var(--magna-orange)" 
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
