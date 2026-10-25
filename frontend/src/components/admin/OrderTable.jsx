import React from 'react';
import Badge from '../ui/Badge';
import {
  FiEye,
  FiCalendar,
  FiUser,
  FiChevronRight,
  FiMessageCircle,
  FiTruck,
  FiMapPin,
  FiFileText,
} from 'react-icons/fi';

const cleanPhoneForWhatsApp = (rawPhone) => {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('54')) return digits;
  if (digits.startsWith('0')) return `549${digits.slice(1)}`;
  return `549${digits}`;
};

const OrderTable = ({ orders, onViewDetails, onStatusChange }) => {
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

  const buildQuickWhatsAppUrl = (order) => {
    const phone = cleanPhoneForWhatsApp(order.customerPhone || order.phone);
    if (!phone) return null;
    const orderId = (order.id || order._id || '').substring(0, 8);
    const customerName = order.customerName || order.name || 'Cliente';
    const total = Number(order.total || 0).toLocaleString('es-AR');
    const text = `Hola ${customerName}! Te escribimos de Nocturna por tu pedido #${orderId} ($${total}). ¿Cómo estás?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="p-10 text-center bg-surface rounded-lg border border-brand-border/20 text-content-muted text-xs">
        No se encontraron pedidos con los criterios seleccionados.
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
          const waUrl = buildQuickWhatsAppUrl(order);
          const itemCount = Array.isArray(order.items)
            ? order.items.reduce((sum, i) => sum + Number(i.quantity || 1), 0)
            : 0;

          return (
            <div
              key={orderId}
              onClick={() => onViewDetails(order)}
              className="bg-surface p-4 rounded-lg border border-brand-border/20 shadow-soft hover:border-mauve/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between pb-2 border-b border-brand-border/15 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium text-content-muted">
                    #{orderId.substring(0, 8)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-canvas text-content-secondary border border-brand-border/20">
                    {order.deliveryMethod === 'PICKUP' ? 'Retiro' : 'Envío'}
                  </span>
                </div>
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
                    {new Date(order.createdAt).toLocaleDateString('es-AR')} &bull; {itemCount}{' '}
                    un.
                  </p>
                </div>

                <div className="text-right flex items-center space-x-2">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                      title="Escribir por WhatsApp"
                    >
                      <FiMessageCircle size={14} />
                    </a>
                  )}
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
      <div
        tabIndex={0}
        role="region"
        aria-label="Tabla de pedidos"
        className="hidden md:block overflow-x-auto bg-surface rounded-lg border border-brand-border/20 focus:outline-none focus:ring-1 focus:ring-mauve/40"
      >
        <table className="min-w-full divide-y divide-brand-border/20">
          <thead className="bg-surface-elevated sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                ID / Fecha
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Cliente / Contacto
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Entrega / Artículos
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Acciones Rápidas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/15">
            {orders.map((order) => {
              const orderId = order.id || order._id;
              const customerName = order.customerName || order.name || 'Cliente';
              const customerPhone = order.customerPhone || order.phone || '';
              const customerEmail = order.customerEmail || order.email || '';
              const totalFormatted = Number(order.total || 0).toLocaleString('es-AR');
              const waUrl = buildQuickWhatsAppUrl(order);
              const isPickup = order.deliveryMethod === 'PICKUP';
              const itemCount = Array.isArray(order.items)
                ? order.items.reduce((sum, i) => sum + Number(i.quantity || 1), 0)
                : 0;

              return (
                <tr
                  key={orderId}
                  className="hover:bg-surface-elevated/30 cursor-pointer transition-colors"
                  onClick={() => onViewDetails(order)}
                >
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-medium text-content font-mono"
                        title={orderId}
                      >
                        #{orderId.substring(0, 8)}
                      </span>
                      {order.adminNotes && (
                        <FiFileText
                          size={12}
                          className="text-amber-400"
                          title={`Nota interna: ${order.adminNotes}`}
                        />
                      )}
                    </div>
                    <div className="text-[11px] text-content-muted">
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}{' '}
                      {new Date(order.createdAt).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-xs font-medium text-content">{customerName}</div>
                    <div className="text-[11px] text-content-muted font-mono">
                      {customerPhone || customerEmail || 'Sin teléfono'}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-xs text-content-secondary">
                      {isPickup ? (
                        <>
                          <FiMapPin size={12} className="text-mauve" />
                          <span>Retiro acordado</span>
                        </>
                      ) : (
                        <>
                          <FiTruck size={12} className="text-mauve" />
                          <span className="truncate max-w-[160px]">
                            {order.customerAddress || 'Envío a domicilio'}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-content-muted mt-0.5">
                      {itemCount} {itemCount === 1 ? 'unidad' : 'unidades'}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-content tracking-tight">
                    ${totalFormatted}
                  </td>

                  <td
                    className="px-4 py-3.5 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onStatusChange ? (
                      <select
                        value={(order.status || 'PENDING').toUpperCase()}
                        onChange={(e) => onStatusChange(orderId, e.target.value)}
                        aria-label={`Cambiar estado del pedido ${orderId.substring(0, 8)}`}
                        className="px-2.5 py-1 rounded text-[11px] font-medium bg-canvas border border-brand-border/30 text-content focus:outline-none focus:border-mauve cursor-pointer"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmado</option>
                        <option value="DELIVERED">Entregado</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    ) : (
                      <Badge variant={getStatusVariant(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    )}
                  </td>

                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-right text-xs font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 transition-colors text-[11px]"
                          title="Contactar cliente por WhatsApp"
                        >
                          <FiMessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        type="button"
                        className="text-content-secondary hover:text-content p-1.5 rounded hover:bg-surface-elevated transition-colors"
                        onClick={() => onViewDetails(order)}
                        title="Ver detalle, nota interna e imprimir etiqueta discreta"
                      >
                        <FiEye size={15} />
                      </button>
                    </div>
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
