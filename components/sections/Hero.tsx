import React from 'react';
import styles from './Hero.module.css';

interface HeroProps {
  title: string;
  subtitle?: string;
  highlightedWord?: string;
  children?: React.ReactNode;
}

export function Hero({ 
  title, 
  subtitle, 
  highlightedWord,
  children 
}: HeroProps) {
  const renderTitle = () => {
    if (!highlightedWord) {
      return title;
    }
    
    const words = title.split(' ');
    return words.map((word, index) => {
      if (word.toLowerCase() === highlightedWord.toLowerCase()) {
        return (
          <span key={index} className={styles.highlight}>
            {word}
          </span>
        );
      }
      return word + (index < words.length - 1 ? ' ' : '');
    });
  };

  return (
    <section className={styles.hero}>
      <div className={styles.background} />
      <div className={styles.content}>
        <h1 className={styles.title}>
          {renderTitle()}
        </h1>
        {subtitle && (
          <p className={styles.subtitle}>
            {subtitle}
          </p>
        )}
        {children && (
          <div className={styles.actions}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
