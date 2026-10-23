import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex justify-center items-center font-medium rounded-md transition-smooth focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas select-none active:scale-[0.99] disabled:active:scale-100';

  const variants = {
    primary:
      'bg-brand text-content hover:bg-brand-hover border border-mauve/30 shadow-soft',
    secondary:
      'border border-border bg-surface text-content hover:bg-surface-elevated hover:border-mauve shadow-soft',
    ghost:
      'text-content-secondary hover:text-content hover:bg-surface-elevated border border-transparent',
    danger:
      'bg-status-error-bg text-status-error hover:bg-brand border border-status-error-border shadow-soft',
    outline:
      'border border-mauve text-content bg-transparent hover:bg-brand hover:border-brand hover:text-content',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm font-medium tracking-wide',
  };

  const width = fullWidth ? 'w-full' : '';
  const stateClasses =
    disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${width} ${stateClasses} ${className}`}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          className="mr-2"
          color="text-content"
        />
      )}
      {children}
    </button>
  );
};

export default Button;
