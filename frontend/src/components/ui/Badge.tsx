import React from 'react';

interface BadgeProps {
  variant?: 'critical' | 'warning' | 'active' | 'ai' | 'mesh' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, className = '' }) => {
  const styles = {
    critical: 'bg-(--nx-red-dim) text-(--nx-red-primary) border-(--nx-red-primary)/30',
    warning: 'bg-(--nx-amber-dim) text-(--nx-amber-primary) border-(--nx-amber-primary)/30',
    active: 'bg-(--nx-green-dim) text-(--nx-green-primary) border-(--nx-green-primary)/30',
    ai: 'bg-(--nx-purple-dim) text-(--nx-purple-primary) border-(--nx-purple-primary)/30',
    mesh: 'bg-(--nx-teal-dim) text-(--nx-teal-primary) border-(--nx-teal-primary)/30',
    info: 'bg-(--nx-blue-dim) text-(--nx-blue-primary) border-(--nx-blue-primary)/30'
  };

  return (
    <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-semibold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
