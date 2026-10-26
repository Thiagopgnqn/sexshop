import React, { useState, useEffect } from 'react';

const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, diff };
};

const CountdownTimer = ({
  targetDate,
  title = 'La campaña finaliza en:',
  message,
  themeConfig,
  onExpire,
  className = '',
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(targetDate);
      if (!remaining) {
        clearInterval(interval);
        setTimeLeft(null);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!timeLeft) return null;

  const { days, hours, minutes, seconds } = timeLeft;
  const pad = (n) => String(n).padStart(2, '0');

  const accentColor = themeConfig?.accent || '#907878';
  const borderClass = themeConfig?.borderAccent || 'border-brand-border/30';

  // Texto amigable para tecnologías asistivas (no anuncia cada segundo tick)
  const accessibleLabel = `${title} ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos.`;

  if (compact) {
    return (
      <div
        role="timer"
        aria-live="off"
        aria-label={accessibleLabel}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${borderClass} bg-surface-elevated/75 text-xs text-content ${className}`}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
        <span className="font-mono font-medium tracking-wider">
          {days > 0 ? `${days}d ` : ''}
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </div>
    );
  }

  return (
    <section
      role="timer"
      aria-live="off"
      aria-label={accessibleLabel}
      className={`relative overflow-hidden rounded-xl border ${borderClass} bg-surface/85 backdrop-blur-sm p-6 sm:p-8 text-center smoke-card-texture ${className}`}
    >
      {/* Visual de fondo sutil por código */}
      <svg
        aria-hidden="true"
        viewBox="0 0 500 120"
        fill="none"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      >
        <path d="M-20,90 Q180,20 380,80 T600,40" stroke={accentColor} strokeWidth="1.5" />
      </svg>

      <div className="relative z-10 max-w-xl mx-auto">
        {title && (
          <h3 className="font-display text-xs sm:text-sm uppercase tracking-[0.22em] text-mauve mb-1">
            {title}
          </h3>
        )}
        {message && (
          <p className="text-xs text-content-secondary mb-5 font-normal">
            {message}
          </p>
        )}

        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-sm sm:max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-canvas/80 border border-brand-border/20 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-light text-content tracking-wider">
              {pad(days)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-content-muted mt-1">
              Días
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-canvas/80 border border-brand-border/20 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-light text-content tracking-wider">
              {pad(hours)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-content-muted mt-1">
              Horas
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-canvas/80 border border-brand-border/20 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-light text-content tracking-wider">
              {pad(minutes)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-content-muted mt-1">
              Minutos
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg bg-canvas/80 border border-brand-border/20 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-light text-content tracking-wider">
              {pad(seconds)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-content-muted mt-1">
              Segundos
            </span>
          </div>
        </div>

        <p className="text-[10px] text-content-muted mt-4 uppercase tracking-widest">
          Válido hasta agotar stock disponible • Envíos discretos en Córdoba
        </p>
      </div>
    </section>
  );
};

export default CountdownTimer;
