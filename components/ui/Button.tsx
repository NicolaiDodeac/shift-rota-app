import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  style?: React.CSSProperties;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  asChild = false,
  style,
  ...props
}: ButtonProps) {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: buttonClasses,
      style,
    } as any);
  }

  return (
    <button className={buttonClasses} style={style} {...props}>
      {children}
    </button>
  );
}
