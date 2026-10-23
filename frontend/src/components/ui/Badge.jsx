import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    pending: 'bg-status-warning-bg text-status-warning border-status-warning-border',
    confirmed: 'bg-brand text-content border-mauve/40 font-medium',
    delivered: 'bg-status-success-bg text-status-success border-status-success-border',
    cancelled: 'bg-status-error-bg text-status-error border-status-error-border',
    new: 'bg-brand text-content border-mauve/40',
    sale: 'bg-surface-elevated text-mauve-light border-mauve/40',
    neutral: 'bg-surface-elevated text-content-secondary border-border',
    default: 'bg-surface-elevated text-content-secondary border-border',
  };

  const style = variants[variant?.toLowerCase()] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase border ${style} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
