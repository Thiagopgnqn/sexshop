import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  FiShoppingBag,
  FiMenu,
  FiX,
  FiSearch,
  FiShield,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import themeConfig from '../../config/theme';
import Logo from '../ui/Logo';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-border-subtle text-content transition-colors">
      {/* Barra superior sutil de privacidad */}
      <div className="bg-surface-elevated/70 border-b border-border-subtle py-1.5 px-4 text-center">
        <p className="text-[11px] tracking-wider text-content-secondary">
          Envío y empaque 100% discreto en Córdoba &bull; Atención por WhatsApp{' '}
          <a
            href={`https://wa.me/${themeConfig.contact.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-content underline underline-offset-2 hover:text-mauve transition-colors"
          >
            {themeConfig.contact.phone}
          </a>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4 lg:gap-8">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              className="lg:hidden p-2 -ml-2 text-content-secondary hover:text-content rounded-md focus:outline-none"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center group pr-2 xl:pr-4">
              <Logo
                variant="horizontal"
                className="group-hover:opacity-85 transition-opacity"
              />
            </Link>
          </div>

          {/* Navegación Desktop — una sola línea garantizada (1280px a 1920px) */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 flex-1 min-w-0"
          >
            {themeConfig.navigation.map((item) => {
              const isActive =
                location.pathname + location.search === item.href ||
                (item.href === '/catalogo' &&
                  location.pathname === '/catalogo' &&
                  !location.search);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`whitespace-nowrap font-normal transition-colors hover:text-content relative py-1 text-[11px] xl:text-xs tracking-[0.07em] xl:tracking-[0.09em] uppercase ${
                    isActive
                      ? 'text-content font-medium border-b border-mauve'
                      : 'text-content-secondary'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones de la derecha: Búsqueda, Carrito, Usuario */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
            <Link
              to="/catalogo"
              className="p-2 text-content-secondary hover:text-content hover:bg-surface-elevated rounded-full transition-colors"
              aria-label="Buscar en catálogo"
              title="Buscar en catálogo"
            >
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <Link
              to="/carrito"
              className="relative p-2 text-content-secondary hover:text-content hover:bg-surface-elevated rounded-full transition-colors flex items-center"
              aria-label="Carrito de compras"
              title="Carrito de compras"
            >
              <FiShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-semibold text-content bg-brand border border-mauve/40 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Menú de Usuario Desktop */}
            <div className="hidden lg:block relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-content-secondary hover:text-content px-2.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-surface-elevated transition-colors"
                  >
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <FiChevronDown className="h-3 w-3 text-mauve" />
                  </button>
                  {userMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lifted py-1.5 bg-surface border border-border z-50 divide-y divide-border-subtle">
                      <div className="px-3.5 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-mauve font-medium">
                          Cuenta activa
                        </p>
                        <p className="text-xs font-medium text-content truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-3.5 py-2 text-xs font-medium text-content hover:bg-surface-elevated transition-colors"
                          >
                            <FiShield className="mr-2 text-mauve" /> Panel de Administración
                          </Link>
                        )}
                        <Link
                          to="/catalogo"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-3.5 py-2 text-xs text-content-secondary hover:bg-surface-elevated hover:text-content transition-colors"
                        >
                          Explorar Catálogo
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-3.5 py-2 text-xs text-status-error hover:bg-surface-elevated transition-colors font-medium"
                        >
                          <FiLogOut className="mr-2" /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-1">
                  <Link
                    to="/login"
                    className="text-content-secondary hover:text-content text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    to="/registro"
                    className="bg-brand hover:bg-brand-hover text-content border border-mauve/30 text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-soft"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESLIZANTE VIA PORTAL */}
      {mobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div
              className="fixed inset-0 bg-canvas/80 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-surface text-content flex flex-col justify-between shadow-overlay p-6 overflow-y-auto z-10 border-r border-border">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <Logo variant="horizontal" />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-content-secondary hover:text-content p-2 rounded-md hover:bg-surface-elevated focus:outline-none"
                    aria-label="Cerrar menú"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="py-6 space-y-1">
                  <p className="text-[10px] font-medium text-mauve uppercase tracking-widest px-2 mb-2">
                    Navegación
                  </p>
                  {themeConfig.navigation.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-normal text-content-secondary hover:bg-surface-elevated hover:text-content transition-colors"
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <Link
                    to="/carrito"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-content hover:bg-surface-elevated transition-colors mt-3 pt-3 border-t border-border-subtle"
                  >
                    <span>Mi Carrito</span>
                    {cartCount > 0 && (
                      <span className="bg-brand text-content border border-mauve/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                {user && isAdmin && (
                  <div className="p-3 bg-surface-elevated border border-border rounded-md mb-4">
                    <p className="text-[10px] font-semibold text-mauve uppercase tracking-wider mb-1">
                      Administración
                    </p>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-xs font-medium text-content hover:underline"
                    >
                      <FiShield className="text-mauve" />
                      <span>Panel de Control</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="border-t border-border-subtle pt-5">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-1">
                      <p className="text-[10px] uppercase tracking-wider text-mauve">
                        Usuario
                      </p>
                      <p className="text-xs font-semibold text-content truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-content-secondary truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-md bg-surface-elevated text-status-error text-xs font-medium hover:bg-brand transition-colors"
                    >
                      <FiLogOut size={14} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center py-2.5 px-3 rounded-md border border-border text-center text-xs font-medium text-content hover:bg-surface-elevated transition-colors"
                    >
                      Ingresar
                    </Link>
                    <Link
                      to="/registro"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center py-2.5 px-3 rounded-md bg-brand border border-mauve/30 text-center text-xs font-medium text-content hover:bg-brand-hover shadow-soft transition-colors"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};

export default Header;
