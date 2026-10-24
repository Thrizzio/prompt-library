import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'neutral' | 'brand' | 'accent';
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  onClick,
  className = '',
}: BadgeProps) {
  const base =
    'inline-flex items-center font-medium rounded-md transition-colors select-none';

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/70',
    neutral: 'bg-slate-50 text-slate-600 border border-slate-200',
    brand: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70',
    accent: 'bg-indigo-50 text-indigo-800 border border-indigo-200/70',
  };

  const interactive = onClick ? 'cursor-pointer hover:opacity-85' : '';

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${interactive} ${className}`}
    >
      {children}
    </span>
  );
}
