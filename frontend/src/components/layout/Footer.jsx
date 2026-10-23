import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiMail, FiLock, FiMapPin, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import themeConfig from '../../config/theme';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border text-content-secondary transition-colors">
      {/* Banner superior de privacidad garantizada */}
      <div className="bg-surface-elevated/80 border-b border-border-subtle py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <FiLock className="text-mauve text-sm flex-shrink-0" />
          <p className="text-xs text-content font-normal tracking-wide">
            {themeConfig.privacyNotice}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Columna 1: Marca y Propósito */}
          <div className="md:col-span-4 flex flex-col items-start space-y-4">
            <Link to="/" className="inline-block">
              <Logo variant="vertical" />
            </Link>
            <p className="text-xs text-content-secondary leading-relaxed font-normal max-w-sm">
              {themeConfig.brand.description}
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a
                href={themeConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-content-secondary hover:text-content hover:border-mauve transition-colors"
                aria-label="Instagram @nocturna.sexshop.cba"
                title={themeConfig.contact.instagram}
              >
                <FiInstagram size={15} />
              </a>
              <a
                href={`https://wa.me/${themeConfig.contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-content-secondary hover:text-content hover:border-mauve transition-colors"
                aria-label="WhatsApp Nocturna SexShop"
                title={themeConfig.contact.phone}
              >
                <FaWhatsapp size={15} />
              </a>
              <a
                href={`mailto:${themeConfig.contact.email}`}
                className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-content-secondary hover:text-content hover:border-mauve transition-colors"
                aria-label="Email de contacto"
                title={themeConfig.contact.email}
              >
                <FiMail size={15} />
              </a>
            </div>
          </div>

          {/* Columna 2: Categorías */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-display font-medium text-content uppercase tracking-[0.18em] mb-4">
              Colecciones
            </h3>
            <ul className="space-y-2.5 text-xs text-content-secondary">
              <li>
                <Link to="/catalogo" className="hover:text-content transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=lenceria"
                  className="hover:text-content transition-colors"
                >
                  Lencería &amp; Bodys
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=cosmetica-intima"
                  className="hover:text-content transition-colors"
                >
                  Cosmética Íntima &amp; Geles
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=perfumes-y-feromonas"
                  className="hover:text-content transition-colors"
                >
                  Perfumes con Feromonas
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=dilatadores-consoladores-y-vibradores"
                  className="hover:text-content transition-colors"
                >
                  Bienestar &amp; Juguetes
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=fantasias"
                  className="hover:text-content transition-colors"
                >
                  Fantasías &amp; Juegos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información y Políticas */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-display font-medium text-content uppercase tracking-[0.18em] mb-4">
              Información
            </h3>
            <ul className="space-y-2.5 text-xs text-content-secondary">
              <li>
                <Link to="/#nosotros" className="hover:text-content transition-colors">
                  Sobre Nocturna
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-content transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/legal#privacidad" className="hover:text-content transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/legal#cambios" className="hover:text-content transition-colors">
                  Política de Cambios
                </Link>
              </li>
              <li>
                <Link to="/legal#terminos" className="hover:text-content transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto & Córdoba */}
          <div className="md:col-span-3 space-y-2.5 text-xs text-content-secondary">
            <h3 className="text-xs font-display font-medium text-content uppercase tracking-[0.18em] mb-4">
              Atención &amp; Envíos
            </h3>
            <p className="flex items-start gap-2">
              <FaWhatsapp className="text-mauve mt-0.5 flex-shrink-0" size={14} />
              <span>
                WhatsApp:{' '}
                <a
                  href={`https://wa.me/${themeConfig.contact.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-content hover:underline"
                >
                  {themeConfig.contact.phone}
                </a>
              </span>
            </p>
            <p className="flex items-start gap-2">
              <FiMapPin className="text-mauve mt-0.5 flex-shrink-0" size={14} />
              <span>
                {themeConfig.contact.city} &bull; Zona: {themeConfig.contact.deliveryZone}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <FiClock className="text-mauve mt-0.5 flex-shrink-0" size={14} />
              <span>Horarios: {themeConfig.contact.hours}</span>
            </p>
            <p className="flex items-start gap-2">
              <FiMail className="text-mauve mt-0.5 flex-shrink-0" size={14} />
              <span>Email: {themeConfig.contact.email}</span>
            </p>
            <p className="pt-2 text-[11px] text-content-secondary/80 leading-relaxed border-t border-border-subtle">
              {themeConfig.returnPolicyNotice}
            </p>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between text-[11px] text-content-secondary gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>{themeConfig.legal.copyright}</p>
            <span className="hidden sm:inline text-mauve/50">&bull;</span>
            <p>
              Sitio desarrollado por{' '}
              <a
                href={
                  themeConfig.developer?.url ||
                  'https://thiagopgnqn.github.io/ScrollStudio/'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-content hover:text-mauve transition-colors underline underline-offset-2 font-medium"
              >
                {themeConfig.developer?.name || 'Scroll Studio'}
              </a>
            </p>
          </div>
          <p className="text-center md:text-right text-mauve-light">
            {themeConfig.legal.note}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
