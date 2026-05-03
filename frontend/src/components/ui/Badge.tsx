import React from 'react';

interface BadgeProps {
  variant?: 'critical' | 'warning' | 'active' | 'ai' | 'mesh' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, className = '' }) => {
  const styles = {
    critical: 'bg-[var(--nx-red-dim)] text-[var(--nx-red-primary)] border-[var(--nx-red-primary)]/30',
    warning: 'bg-[var(--nx-amber-dim)] text-[var(--nx-amber-primary)] border-[var(--nx-amber-primary)]/30',
    active: 'bg-[var(--nx-green-dim)] text-[var(--nx-green-primary)] border-[var(--nx-green-primary)]/30',
    ai: 'bg-[var(--nx-purple-dim)] text-[var(--nx-purple-primary)] border-[var(--nx-purple-primary)]/30',
    mesh: 'bg-[var(--nx-teal-dim)] text-[var(--nx-teal-primary)] border-[var(--nx-teal-primary)]/30',
    info: 'bg-[var(--nx-blue-dim)] text-[var(--nx-blue-primary)] border-[var(--nx-blue-primary)]/30'
  };

  return (
    <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-semibold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
