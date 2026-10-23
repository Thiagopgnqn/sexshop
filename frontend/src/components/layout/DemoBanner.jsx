import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInfo, FiRefreshCw, FiKey, FiCheck, FiCopy, FiExternalLink } from 'react-icons/fi';
import {
  isDemoMode,
  resetDemoState,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from '../../api/demo/demoAdapter';
import useAuth from '../../hooks/useAuth';

const DemoBanner = () => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { isAdmin } = useAuth();

  if (!isDemoMode()) return null;

  const handleCopy = (text, field) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div
      role="region"
      aria-label="Aviso de modo demostración"
      className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-mauve/35 text-content shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 text-content-secondary">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/70 text-mauve border border-mauve/40 flex-shrink-0">
            <FiInfo size={12} />
          </span>
          <span className="font-medium text-content">
            Modo demostración: los datos se guardan solo en tu navegador
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            type="button"
            onClick={() => setShowCredentials((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-mauve/40 bg-surface-elevated hover:bg-brand/50 text-content transition-colors font-medium"
          >
            <FiKey size={12} className="text-mauve" />
            <span>Acceso Admin</span>
          </button>

          <button
            type="button"
            onClick={resetDemoState}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-brand-border/40 bg-canvas hover:bg-brand text-content-secondary hover:text-content transition-colors font-medium"
            title="Borrar cambios locales y restaurar datos originales de la demo"
          >
            <FiRefreshCw size={12} className="text-mauve" />
            <span>Restablecer demo</span>
          </button>
        </div>
      </div>

      {showCredentials && (
        <div className="border-t border-brand-border/25 bg-canvas/95 px-3 sm:px-6 py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-content-secondary">
              <span className="text-[11px] uppercase tracking-wider text-mauve font-medium">
                Credenciales Admin Demo:
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface px-2 py-0.5 rounded border border-brand-border/25 text-content font-mono text-[11px]">
                <span>Usuario: {DEMO_ADMIN_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_ADMIN_EMAIL, 'email')}
                  className="text-mauve hover:text-content ml-1"
                  title="Copiar usuario"
                >
                  {copiedField === 'email' ? <FiCheck size={12} /> : <FiCopy size={12} />}
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
                  {copiedField === 'pass' ? <FiCheck size={12} /> : <FiCopy size={12} />}
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
                  <FiExternalLink size={12} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setShowCredentials(false)}
                  className="inline-flex items-center gap-1 text-mauve hover:text-content font-medium underline underline-offset-2"
                >
                  <span>Iniciar sesión como Admin</span>
                  <FiExternalLink size={12} />
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
