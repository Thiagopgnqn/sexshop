import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import themeConfig from '../config/theme';
import useSEO from '../hooks/useSEO';

const LoginPage = () => {
  useSEO({
    title: `Iniciar Sesión | ${themeConfig.brand.name}`,
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center smoke-texture py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <svg
        aria-hidden="true"
        viewBox="0 0 800 500"
        fill="none"
        className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
      >
        <path
          d="M-40,390 C220,240 480,460 840,260 L840,520 L-40,520 Z"
          fill="#2B1917"
          fillOpacity="0.6"
        />
        <circle cx="400" cy="250" r="210" stroke="#907878" strokeOpacity="0.14" strokeWidth="1" />
      </svg>

      <div className="relative z-10 max-w-md w-full smoke-card-texture rounded-xl p-8 sm:p-10 border border-brand-border/25 shadow-2xl">
        <div className="text-center mb-7">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-mauve/35 bg-canvas/70 flex items-center justify-center text-mauve">
            <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6 stroke-current" strokeWidth="1.3">
              <rect x="13" y="21" width="22" height="17" rx="2.5" />
              <path d="M18 21v-5a6 6 0 0112 0v5" />
              <circle cx="24" cy="29" r="2" />
            </svg>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Acceso Privado
          </span>
          <h1 className="font-display text-xl sm:text-2xl uppercase tracking-widest text-content mt-1">
            Iniciar Sesión
          </h1>
          <p className="mt-1 text-xs text-content-secondary">
            Ingresá a tu cuenta en {themeConfig.brand.name}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
