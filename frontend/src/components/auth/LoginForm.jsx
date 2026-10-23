import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
  isDemoMode,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from '../../api/demo/demoAdapter';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      navigate(loggedUser?.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Credenciales incorrectas. Verificá tu correo y contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail(DEMO_ADMIN_EMAIL);
    setPassword(DEMO_ADMIN_PASSWORD);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isDemoMode() && (
        <div className="p-3 rounded-md bg-surface-elevated border border-mauve/35 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-content">Acceso Admin de Demostración</span>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="text-[11px] px-2 py-0.5 rounded bg-brand text-content border border-mauve/40 hover:bg-brand/80 transition-colors font-medium"
            >
              Autocompletar
            </button>
          </div>
          <p className="text-[11px] text-content-secondary font-mono">
            {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}
          </p>
        </div>
      )}

      <Input
        label="Correo Electrónico"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
      />
      <Input
        label="Contraseña"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      {error && (
        <div className="text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded border border-rose-800/50 font-medium">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="md"
        loading={loading}
        className="py-2.5 text-xs sm:text-sm mt-2"
      >
        Ingresar a mi Cuenta
      </Button>

      <div className="text-center text-xs text-content-secondary pt-3 border-t border-brand-border/15">
        ¿Aún no tenés cuenta?{' '}
        <Link to="/registro" className="text-mauve font-medium hover:text-content transition-colors">
          Registrate acá
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
