import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 font-medium',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60 font-medium',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60 font-medium',
    info: 'bg-blue-50 text-blue-700 border-blue-200/60 font-medium',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border tracking-wide whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
