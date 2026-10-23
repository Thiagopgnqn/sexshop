import React from 'react';

const CategoryMinimalIcon = ({ type = 'default', className = 'w-8 h-8' }) => {
  const normalized = String(type || '').toLowerCase();

  if (normalized.includes('lenceria') || normalized.includes('lingerie') || normalized.includes('fantas')) {
    return (
      <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        aria-hidden="true"
      >
        <path d="M10 6v5c0 3.5 2.5 6 6 6s6-2.5 6-6V6" strokeLinecap="round" />
        <path d="M7 18c2.8-1.5 5.8-2.2 9-2.2s6.2.7 9 2.2l-3.5 8.5c-1.8-1.2-3.6-1.8-5.5-1.8s-3.7.6-5.5 1.8L7 18Z" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalized.includes('cosmet') || normalized.includes('perfume') || normalized.includes('gel')) {
    return (
      <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        aria-hidden="true"
      >
        <rect x="11" y="11" width="10" height="15" rx="2.5" />
        <path d="M13.5 11V8.5h5V11" />
        <path d="M16 8.5V6m-2 0h4" strokeLinecap="round" />
        <circle cx="16" cy="18.5" r="2" />
      </svg>
    );
  }

  if (normalized.includes('juego') || normalized.includes('game') || normalized.includes('bdsm')) {
    return (
      <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        aria-hidden="true"
      >
        <rect x="7" y="7" width="18" height="18" rx="3.5" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        <circle cx="20" cy="20" r="1.2" fill="currentColor" />
        <circle cx="16" cy="16" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
    >
      <path
        d="M16 6c2.2 4.4 5.6 7.8 10 10-4.4 2.2-7.8 5.6-10 10-2.2-4.4-5.6-7.8-10-10 4.4-2.2 7.8-5.6 10-10Z"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ProductPlaceholder = ({
  categoryName = '',
  sku = '',
  size = 'md',
}) => {
  return (
    <div className="w-full h-full nocturna-silk-card flex flex-col items-center justify-center p-5 text-center relative overflow-hidden select-none">
      {/* Marco interno sutil */}
      <div
        className="absolute inset-3 border border-border-subtle rounded pointer-events-none"
        aria-hidden="true"
      />

      <div className="text-mauve/70 mb-2.5 transition-transform duration-500 group-hover:scale-105">
        <CategoryMinimalIcon
          type={categoryName}
          className={size === 'lg' ? 'w-11 h-11' : 'w-8 h-8'}
        />
      </div>

      <span className="font-display font-light tracking-[0.22em] text-content/80 text-xs sm:text-sm">
        Nocturna
      </span>
      <span className="font-display font-light tracking-[0.26em] text-content-secondary/60 text-[9px] mt-0.5">
        SexShop
      </span>

      {sku && (
        <span className="mt-2.5 text-[10px] font-mono text-content-secondary/50 tracking-wider">
          Cód. {sku}
        </span>
      )}
    </div>
  );
};

export default ProductPlaceholder;
