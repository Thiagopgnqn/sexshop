import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiLogOut,
  FiArrowLeft,
  FiX,
  FiRefreshCw,
  FiZap,
  FiGift,
  FiLayers,
  FiLayout,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Logo from '../ui/Logo';
import { isDemoMode, resetDemoState } from '../../api/demo/demoAdapter';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', to: '/admin', icon: FiBarChart2, end: true },
    { name: 'Catálogo de Productos', to: '/admin/productos', icon: FiBox },
    { name: 'Categorías y Subcategorías', to: '/admin/categorias', icon: FiTag },
    { name: 'Pedidos de Clientes', to: '/admin/pedidos', icon: FiShoppingBag },
    { name: 'Usuarios y Cuentas', to: '/admin/usuarios', icon: FiUsers },
    { name: 'Configuración Tienda', to: '/admin/configuracion', icon: FiSettings },
  ];

  const marketingItems = [
    { name: 'Métricas & Atribución', to: '/admin/marketing', icon: FiTrendingUp },
    { name: 'Portada y Secciones', to: '/admin/portada', icon: FiLayout },
    { name: 'Campañas y Promos', to: '/admin/campanas', icon: FiZap },
    { name: 'Cupones de Descuento', to: '/admin/cupones', icon: FiGift },
    { name: 'Colecciones y Etiquetas', to: '/admin/colecciones', icon: FiLayers },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface text-content-secondary border-r border-brand-border/20 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div>
          <div className="p-6 border-b border-brand-border/20 flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-2" onClick={onClose}>
              <div>
                <Logo variant="horizontal" />
                <span className="text-[9px] text-mauve uppercase tracking-widest block font-medium mt-1">
                  Panel de Control
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="md:hidden text-content-secondary hover:text-content p-1 rounded"
              aria-label="Cerrar barra lateral"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="p-4">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-md bg-canvas text-content-secondary border border-brand-border/25 hover:bg-surface-elevated hover:text-content transition-colors text-xs font-medium"
            >
              <FiArrowLeft size={12} />
              <span>Ver Tienda Online</span>
            </Link>
          </div>

          <div className="px-3 py-2">
            <p className="text-[10px] font-medium text-content-muted uppercase tracking-widest px-3 mb-2">
              Administración
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand text-content border border-mauve/30'
                        : 'text-content-secondary hover:bg-surface-elevated hover:text-content'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 text-mauve" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="px-3 py-2 border-t border-brand-border/15">
            <p className="text-[10px] font-medium text-content-muted uppercase tracking-widest px-3 mb-2">
              Marketing y Promos
            </p>
            <nav className="space-y-1">
              {marketingItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand text-content border border-mauve/30'
                        : 'text-content-secondary hover:bg-surface-elevated hover:text-content'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 text-mauve" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className={`p-4 border-t border-brand-border/20 bg-canvas/50 ${isDemoMode() ? 'pb-14' : ''}`}>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="truncate">
              <p className="text-xs font-medium text-content truncate">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-[10px] text-content-muted truncate">{user?.email}</p>
            </div>
            <span className="text-[9px] bg-brand/60 text-content border border-mauve/30 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          {isDemoMode() && (
            <button
              type="button"
              onClick={resetDemoState}
              className="flex items-center justify-center space-x-2 w-full py-2 px-3 mb-2 rounded-md text-xs font-medium text-content bg-surface-elevated border border-mauve/35 hover:bg-brand transition-colors"
            >
              <FiRefreshCw size={12} className="text-mauve" />
              <span>Restablecer demo</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-md text-xs font-medium text-rose-300 hover:bg-rose-950/50 transition-colors"
          >
            <FiLogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
