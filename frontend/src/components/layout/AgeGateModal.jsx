import React from 'react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';

const STORAGE_KEY = 'nocturna_age_verified';

export const isAgeVerifiedInStorage = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAgeVerifiedInStorage = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Fallback silencioso si el navegador bloquea localStorage
  }
};

const AgeGateModal = ({ onConfirm }) => {
  const handleConfirm = () => {
    setAgeVerifiedInStorage();
    onConfirm();
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 nocturna-smoke"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-description"
    >
      <div className="relative w-full max-w-md bg-surface border border-border rounded-lg p-7 sm:p-10 text-center shadow-overlay">
        <div className="mb-6">
          <Logo variant="vertical" />
        </div>

        <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-mauve border border-border px-3 py-1 rounded-full mb-4">
          Acceso Exclusivo +18
        </span>

        <h1
          id="age-gate-title"
          className="text-xl sm:text-2xl font-display font-light tracking-[0.08em] text-content mb-3"
        >
          Verificación de mayoría de edad
        </h1>

        <p
          id="age-gate-description"
          className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-7"
        >
          Este sitio contiene artículos de bienestar íntimo, lencería y cosmética sensorial destinados exclusivamente a personas mayores de 18 años.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleConfirm}
          >
            Soy mayor de 18 años
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            size="lg"
            onClick={handleExit}
          >
            Salir
          </Button>
        </div>

        <p className="mt-6 text-[11px] text-content-secondary/70 leading-relaxed">
          Envíos y empaques 100% discretos en Córdoba, Argentina. Al ingresar aceptás nuestros términos de confidencialidad.
        </p>
      </div>
    </div>
  );
};

export default AgeGateModal;
