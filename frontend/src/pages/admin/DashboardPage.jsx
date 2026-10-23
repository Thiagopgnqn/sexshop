import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import OrderTable from '../../components/admin/OrderTable';
import Modal from '../../components/ui/Modal';
import { FiBox, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import themeConfig from '../../config/theme';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          client.get('/products?limit=100&includeInactive=true'),
          client.get('/orders?limit=100').catch(() => ({ data: { orders: [] } })),
          client.get('/users').catch(() => ({ data: { users: [] } })),
        ]);

        const products = productsRes.data.products || productsRes.data || [];
        const orders = ordersRes.data.orders || ordersRes.data || [];
        const users = usersRes.data.users || [];

        const pending = orders.filter((o) => (o.status || '').toUpperCase() === 'PENDING');
        const revenue = orders
          .filter((o) => (o.status || '').toUpperCase() !== 'CANCELLED')
          .reduce((acc, o) => acc + Number(o.total || 0), 0);

        setStats({
          totalProducts: productsRes.data.total || products.length,
          totalOrders: ordersRes.data.total || orders.length,
          pendingOrders: pending.length,
          totalRevenue: revenue,
          totalUsers: users.length,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Productos en Catálogo',
      value: stats.totalProducts,
      icon: FiBox,
      link: '/admin/productos',
    },
    {
      title: 'Total Pedidos',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      link: '/admin/pedidos',
    },
    {
      title: 'Usuarios Registrados',
      value: stats.totalUsers,
      icon: FiUsers,
      link: '/admin/usuarios',
    },
    {
      title: 'Ingresos Estimados',
      value: `${themeConfig.brand.currencySymbol}${stats.totalRevenue.toLocaleString('es-AR')}`,
      icon: FiDollarSign,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-border/20">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Resumen General
          </span>
          <h1 className="font-display text-2xl uppercase tracking-wider text-content mt-0.5">
            Panel de Control
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Métricas operativas y actividad reciente de {themeConfig.brand.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, idx) => {
          const content = (
            <div className="bg-surface rounded-lg border border-brand-border/20 p-5 flex items-center hover:border-mauve/50 transition-colors">
              <div className="p-3 rounded-md border border-brand-border/25 bg-surface-elevated text-mauve mr-4">
                <card.icon size={20} />
              </div>
              <div>
                <p className="text-[11px] text-content-muted uppercase font-medium tracking-wider">
                  {card.title}
                </p>
                <p className="text-xl font-semibold text-content mt-0.5 tracking-tight">
                  {card.value}
                </p>
              </div>
            </div>
          );

          return card.link ? (
            <Link key={idx} to={card.link} className="block group">
              {content}
            </Link>
          ) : (
            <div key={idx}>{content}</div>
          );
        })}
      </div>

      <div className="bg-surface rounded-lg border border-brand-border/20 p-6">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-brand-border/15">
          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-content">
              Pedidos Recientes
            </h2>
            <p className="text-xs text-content-muted">Últimas órdenes registradas</p>
          </div>
          <Link to="/admin/pedidos" className="text-xs text-mauve font-medium hover:text-content">
            Ver todos los pedidos &rarr;
          </Link>
        </div>
        <OrderTable orders={recentOrders} onViewDetails={setSelectedOrder} />
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Detalle del Pedido"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border/15">
              <div>
                <p className="text-[11px] text-content-muted font-mono">
                  ID: {selectedOrder.id || selectedOrder._id}
                </p>
                <p className="text-xs text-content-secondary">
                  {new Date(selectedOrder.createdAt).toLocaleString('es-AR')}
                </p>
              </div>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface-elevated text-content border border-brand-border/30">
                {selectedOrder.status}
              </span>
            </div>

            <div className="bg-canvas p-4 rounded-md text-xs space-y-1.5 border border-brand-border/20 text-content-secondary">
              <p>
                <strong className="text-content">Cliente:</strong>{' '}
                {selectedOrder.customerName || selectedOrder.name}
              </p>
              <p>
                <strong className="text-content">Teléfono:</strong>{' '}
                {selectedOrder.customerPhone || selectedOrder.phone}
              </p>
              <p>
                <strong className="text-content">Email:</strong>{' '}
                {selectedOrder.customerEmail || selectedOrder.email}
              </p>
              <p>
                <strong className="text-content">Entrega:</strong>{' '}
                {selectedOrder.customerAddress || 'Sin dirección'}
              </p>
            </div>

            <div className="pt-2 flex justify-between font-semibold text-sm border-t border-brand-border/15">
              <span className="text-content">Total</span>
              <span className="text-content font-bold">
                {themeConfig.brand.currencySymbol}
                {Number(selectedOrder.total || 0).toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
