import React from 'react';
import Badge from '../ui/Badge';
import { FiEye, FiCalendar, FiUser, FiChevronRight } from 'react-icons/fi';

const OrderTable = ({ orders, onViewDetails }) => {
  const getStatusVariant = (status) => {
    const s = (status || '').toLowerCase();
    const map = {
      pending: 'pending',
      confirmed: 'confirmed',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    return map[s] || 'default';
  };

  const getStatusText = (status) => {
    const s = (status || '').toUpperCase();
    const map = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };
    return map[s] || status;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center bg-canvas rounded-lg border border-brand-border/20 text-content-muted text-xs">
        No se encontraron pedidos registrados.
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Card List (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const orderId = order.id || order._id;
          const customerName = order.customerName || order.name || 'Cliente';
          const totalFormatted = Number(order.total || 0).toLocaleString('es-AR');

          return (
            <div
              key={orderId}
              onClick={() => onViewDetails(order)}
              className="bg-surface p-4 rounded-lg border border-brand-border/20 shadow-soft hover:border-mauve/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between pb-2 border-b border-brand-border/15 mb-2">
                <span className="text-[11px] font-mono font-medium text-content-muted">
                  #{orderId.substring(0, 8)}
                </span>
                <Badge variant={getStatusVariant(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-content flex items-center">
                    <FiUser className="mr-1.5 text-xs text-mauve" />
                    {customerName}
                  </h4>
                  <p className="text-[11px] text-content-muted flex items-center mt-1">
                    <FiCalendar className="mr-1.5 text-[11px] text-content-muted" />
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>

                <div className="text-right flex items-center space-x-2">
                  <div>
                    <span className="text-[9px] text-content-muted block uppercase font-medium">
                      Total
                    </span>
                    <span className="text-sm font-semibold text-content">${totalFormatted}</span>
                  </div>
                  <FiChevronRight className="text-content-muted text-xs" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (screens >= 768px) */}
      <div className="hidden md:block overflow-x-auto bg-surface rounded-lg border border-brand-border/20">
        <table className="min-w-full divide-y divide-brand-border/20">
          <thead className="bg-surface-elevated/60">
            <tr>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                ID / Fecha
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Total
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Estado
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/15">
            {orders.map((order) => {
              const orderId = order.id || order._id;
              const customerName = order.customerName || order.name || 'Cliente';
              const customerEmail = order.customerEmail || order.email || '';
              const totalFormatted = Number(order.total || 0).toLocaleString('es-AR');

              return (
                <tr
                  key={orderId}
                  className="hover:bg-surface-elevated/30 cursor-pointer transition-colors"
                  onClick={() => onViewDetails(order)}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div
                      className="text-xs font-medium text-content truncate w-28 font-mono"
                      title={orderId}
                    >
                      #{orderId.substring(0, 8)}
                    </div>
                    <div className="text-[11px] text-content-muted">
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="text-xs font-medium text-content">{customerName}</div>
                    <div className="text-[11px] text-content-muted">{customerEmail}</div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-content tracking-tight">
                    ${totalFormatted}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-medium">
                    <button
                      className="text-content-secondary hover:text-content p-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(order);
                      }}
                      title="Ver detalles"
                    >
                      <FiEye size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
