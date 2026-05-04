import React from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'active' | 'ai' | 'danger';
}

export const Panel: React.FC<PanelProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  className = '', 
  action,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'active': return 'border-[var(--nx-blue-primary)] shadow-[0_0_15px_rgba(0,123,255,0.1)]';
      case 'ai': return 'border-[var(--nx-green-primary)] shadow-[0_0_15px_rgba(0,255,123,0.1)]';
      case 'danger': return 'border-[var(--nx-red-primary)] shadow-[0_0_15px_rgba(255,59,59,0.1)]';
      default: return 'border-[var(--nx-border)]';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'active': return 'text-[var(--nx-blue-primary)]';
      case 'ai': return 'text-[var(--nx-green-primary)]';
      case 'danger': return 'text-[var(--nx-red-primary)]';
      default: return 'text-[var(--nx-text-tertiary)]';
    }
  };

  return (
    <div className={`nexus-card flex flex-col overflow-hidden ${getVariantStyles()} ${className}`}>
      {(title || Icon) && (
        <div className="px-4 py-3 border-b border-inherit flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {Icon && <Icon size={16} className={getIconColor()} />}
            <div>
              {title && <h3 className="text-xs font-semibold uppercase tracking-wider text-white">{title}</h3>}
              {subtitle && <p className="text-[10px] text-[var(--nx-text-tertiary)] uppercase">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 p-4">
        {children}
      </div>
      {/* Decorative Scanline */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--nx-border-active)] to-transparent opacity-50" />
    </div>
  );
};
