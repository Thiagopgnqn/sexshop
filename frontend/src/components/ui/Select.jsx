import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-content-secondary mb-1.5 tracking-normal">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`block w-full rounded-md bg-surface-subtle border border-border text-content text-sm py-2 px-3 transition-smooth focus:outline-none focus:border-mauve focus:ring-1 focus:ring-mauve shadow-soft ${
          error ? 'border-status-error focus:border-status-error focus:ring-status-error' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value} className="bg-surface text-content">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-status-error font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
