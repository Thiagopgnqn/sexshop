import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiInfo,
  FiRefreshCw,
  FiKey,
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import {
  isDemoMode,
  resetDemoState,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from '../../api/demo/demoAdapter';
import useAuth from '../../hooks/useAuth';

const MINIMIZED_STORAGE_KEY = 'nocturna_demo_banner_minimized';

const DemoBanner = () => {
  const [minimized, setMinimized] = useState(() => {
    try {
      return localStorage.getItem(MINIMIZED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { isAdmin } = useAuth();

  if (!isDemoMode()) return null;

  const toggleMinimized = (val) => {
    setMinimized(val);
    if (val) setShowCredentials(false);
    try {
      localStorage.setItem(MINIMIZED_STORAGE_KEY, val ? 'true' : 'false');
    } catch {
      // ignore storage errors
    }
  };

  const handleCopy = (text, field) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  // Versión minimizada: pastilla flotante discreta en esquina inferior derecha
  if (minimized) {
    return (
      <div
        role="region"
        aria-label="Aviso de modo demostración minimizado"
        className="fixed bottom-2.5 right-2.5 z-30 flex items-center gap-1.5 rounded-full bg-surface/95 backdrop-blur-md border border-mauve/35 px-2.5 py-1 text-[11px] text-content shadow-lg"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-mauve flex-shrink-0" />
        <button
          type="button"
          onClick={() => toggleMinimized(false)}
          className="inline-flex items-center gap-1 text-content-secondary hover:text-content font-medium transition-colors"
          title="Expandir barra de modo demostración"
        >
          <span>Modo demo</span>
          <FiChevronUp size={12} className="text-mauve" />
        </button>
        <span className="text-brand-border/40">|</span>
        <button
          type="button"
          onClick={resetDemoState}
          className="text-mauve hover:text-content transition-colors p-0.5"
          title="Restablecer demo"
          aria-label="Restablecer demo"
        >
          <FiRefreshCw size={11} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Aviso de modo demostración"
      className="fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-mauve/30 text-content shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-content-secondary min-w-0">
          <FiInfo size={12} className="text-mauve flex-shrink-0" />
          <span className="font-normal text-content-secondary truncate">
            Modo demostración: los datos se guardan solo en tu navegador
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setShowCredentials((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-mauve/35 bg-surface-elevated hover:bg-brand/50 text-content transition-colors font-medium"
          >
            <FiKey size={11} className="text-mauve" />
            <span>Acceso Admin</span>
          </button>

          <button
            type="button"
            onClick={resetDemoState}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-brand-border/35 bg-canvas hover:bg-brand text-content-secondary hover:text-content transition-colors font-medium"
            title="Borrar cambios locales y restaurar datos originales de la demo"
          >
            <FiRefreshCw size={11} className="text-mauve" />
            <span>Restablecer demo</span>
          </button>

          <button
            type="button"
            onClick={() => toggleMinimized(true)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-content-muted hover:text-content hover:bg-surface-elevated transition-colors"
            title="Minimizar a pastilla"
            aria-label="Minimizar aviso de demostración"
          >
            <FiChevronDown size={13} />
            <span className="hidden sm:inline text-[10px]">Minimizar</span>
          </button>
        </div>
      </div>

      {showCredentials && (
        <div className="border-t border-brand-border/25 bg-canvas/95 px-3 sm:px-6 py-2 text-[11px]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-content-secondary">
              <span className="text-[10px] uppercase tracking-wider text-mauve font-medium">
                Admin Demo:
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface px-2 py-0.5 rounded border border-brand-border/25 text-content font-mono text-[11px]">
                <span>Usuario: {DEMO_ADMIN_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_ADMIN_EMAIL, 'email')}
                  className="text-mauve hover:text-content ml-1"
                  title="Copiar usuario"
                >
                  {copiedField === 'email' ? <FiCheck size={11} /> : <FiCopy size={11} />}
                </button>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface px-2 py-0.5 rounded border border-brand-border/25 text-content font-mono text-[11px]">
                <span>Clave: {DEMO_ADMIN_PASSWORD}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_ADMIN_PASSWORD, 'pass')}
                  className="text-mauve hover:text-content ml-1"
                  title="Copiar contraseña"
                >
                  {copiedField === 'pass' ? <FiCheck size={11} /> : <FiCopy size={11} />}
                </button>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setShowCredentials(false)}
                  className="inline-flex items-center gap-1 text-mauve hover:text-content font-medium underline underline-offset-2"
                >
                  <span>Ir al Panel Admin</span>
                  <FiExternalLink size={11} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setShowCredentials(false)}
                  className="inline-flex items-center gap-1 text-mauve hover:text-content font-medium underline underline-offset-2"
                >
                  <span>Iniciar sesión como Admin</span>
                  <FiExternalLink size={11} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoBanner;
