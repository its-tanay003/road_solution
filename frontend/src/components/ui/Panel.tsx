import React from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  className = '', 
  action 
}) => {
  return (
    <div className={`nexus-card flex flex-col overflow-hidden ${className}`}>
      {(title || Icon) && (
        <div className="px-4 py-3 border-b border-[var(--nx-border)] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {Icon && <Icon size={16} className="text-[var(--nx-red-primary)]" />}
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
