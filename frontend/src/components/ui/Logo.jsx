import React from 'react';

const Logo = ({ variant = 'horizontal', className = '' }) => {
  if (variant === 'vertical') {
    return (
      <div
        className={`inline-flex flex-col items-center select-none ${className}`}
        aria-label="Nocturna SexShop"
      >
        <span className="font-display font-light text-2xl sm:text-3xl tracking-[0.22em] text-content leading-none">
          Nocturna
        </span>
        <span
          className="w-12 h-px bg-mauve/40 my-1.5"
          aria-hidden="true"
        />
        <span className="font-display font-light text-[10px] sm:text-xs tracking-[0.28em] text-content-secondary leading-none">
          SexShop
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center select-none leading-none ${className}`}
      aria-label="Nocturna SexShop"
    >
      <span className="font-display font-light text-xl sm:text-2xl tracking-[0.18em] text-content">
        Nocturna
      </span>
      <span className="font-display font-light text-[9px] sm:text-[10px] tracking-[0.25em] text-content-secondary mt-0.5">
        SexShop
      </span>
    </div>
  );
};

export default Logo;
