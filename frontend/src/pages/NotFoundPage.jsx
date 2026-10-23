import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { FiAlertCircle } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center bg-canvas">
      <FiAlertCircle className="text-4xl text-mauve/50 mb-3" />
      <h1 className="font-display text-7xl sm:text-8xl font-light text-content mb-2 tracking-widest">
        404
      </h1>
      <h2 className="font-display text-xl sm:text-2xl uppercase tracking-widest text-content mb-2">
        Página no encontrada
      </h2>
      <p className="text-content-secondary text-xs sm:text-sm font-normal mb-8 max-w-sm leading-relaxed">
        El enlace que intentaste abrir no existe, cambió de dirección o fue removido.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg" className="px-6 text-xs sm:text-sm">
          Volver a la tienda
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
