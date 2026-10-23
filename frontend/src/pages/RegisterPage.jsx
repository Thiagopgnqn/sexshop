import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import themeConfig from '../config/theme';
import useSEO from '../hooks/useSEO';

const RegisterPage = () => {
  useSEO({
    title: `Crear Cuenta | ${themeConfig.brand.name}`,
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-canvas py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-lg p-8 sm:p-10 border border-brand-border/20">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Registro Confidencial
          </span>
          <h1 className="font-display text-xl sm:text-2xl uppercase tracking-widest text-content mt-1">
            Crear Cuenta
          </h1>
          <p className="mt-1 text-xs text-content-secondary">
            Guardá tus datos para agilizar tus próximos pedidos en {themeConfig.brand.name}
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
