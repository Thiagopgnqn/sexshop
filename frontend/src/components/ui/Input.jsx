import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-content-secondary mb-1.5 tracking-normal">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mauve">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-md bg-surface-subtle border border-border text-content placeholder:text-content-secondary/50 text-sm py-2 px-3 transition-smooth focus:outline-none focus:border-mauve focus:ring-1 focus:ring-mauve shadow-soft ${
            Icon ? 'pl-9' : 'pl-3'
          } ${
            error ? 'border-status-error focus:border-status-error focus:ring-status-error' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-status-error font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
