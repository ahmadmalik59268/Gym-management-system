import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-indigo-50 text-indigo-600',
  trend,
  subtitle,
  className = '',
}) => {
  return (
    <div
      className={`bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {(trend || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-700 bg-rose-50'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
