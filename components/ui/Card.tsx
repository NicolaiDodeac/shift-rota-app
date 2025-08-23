import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  elevation?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  elevation = 'md',
  style
}: CardProps) {
  const cardClasses = [
    styles.card,
    styles[padding],
    styles[elevation],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} style={style}>
      {children}
    </div>
  );
}
