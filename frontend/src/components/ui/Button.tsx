import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger-outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-[var(--nx-red-primary)] text-white hover:brightness-110 shadow-[0_0_16px_rgba(255,59,59,0.2)]',
    secondary: 'bg-[var(--nx-bg-elevated)] border border-[var(--nx-border)] text-[var(--nx-text-secondary)] hover:bg-[var(--nx-bg-overlay)] hover:text-[var(--nx-text-primary)]',
    ghost: 'bg-transparent text-[var(--nx-text-secondary)] hover:text-[var(--nx-text-primary)] hover:underline',
    'danger-outline': 'bg-transparent border border-[var(--nx-red-primary)] text-[var(--nx-red-primary)] hover:bg-[var(--nx-red-dim)]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-sm h-8',
    md: 'px-4 py-2 text-sm rounded-md h-10',
    lg: 'px-6 py-3 text-base rounded-[var(--radius-lg)] h-12'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
