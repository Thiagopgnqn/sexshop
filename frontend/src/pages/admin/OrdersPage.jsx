import React, { useState, useEffect, useMemo } from 'react';
import client from '../../api/client';
import OrderTable from '../../components/admin/OrderTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import themeConfig from '../../config/theme';
import {
  FiSearch,
  FiDownload,
  FiPlus,
  FiMessageCircle,
  FiPrinter,
  FiSave,
  FiTrash2,
  FiX,
  FiCheck,
} from 'react-icons/fi';

const statusTabs = [
  { id: 'ALL', label: 'Todos' },
  { id: 'PENDING', label: 'Pendientes' },
  { id: 'CONFIRMED', label: 'Confirmados' },
  { id: 'DELIVERED', label: 'Entregados' },
  { id: 'CANCELLED', label: 'Cancelados' },
];

const periodOptions = [
  { id: 'ALL', label: 'Período: Todo el historial' },
  { id: 'TODAY', label: 'Hoy (24 hs)' },
  { id: 'WEEK', label: 'Últimos 7 días (Semana)' },
  { id: 'MONTH', label: 'Últimos 30 días (Mes)' },
  { id: 'YEAR', label: 'Este Año' },
];

const isOrderInPeriod = (order, period) => {
  if (!order?.createdAt || period === 'ALL') return true;
  const orderTime = new Date(order.createdAt).getTime();
  if (Number.isNaN(orderTime)) return true;

  const now = new Date();
  if (period === 'TODAY') {
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const last24h = now.getTime() - 24 * 3600 * 1000;
    return orderTime >= Math.min(startOfToday, last24h);
  }
  if (period === 'WEEK') return orderTime >= now.getTime() - 7 * 86400 * 1000;
  if (period === 'MONTH') return orderTime >= now.getTime() - 30 * 86400 * 1000;
  if (period === 'YEAR') return orderTime >= now.getTime() - 365 * 86400 * 1000;
  return true;
};

const cleanPhoneForWhatsApp = (rawPhone) => {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('54')) return digits;
  if (digits.startsWith('0')) return `549${digits.slice(1)}`;
  return `549${digits}`;
};

const formatVariantLabel = (v) => {
  if (!v) return '';
  const parts = [v.type, v.size, v.color, v.flavor, v.volume].filter(Boolean);
  return parts.length > 0 ? parts.join(' / ') : v.sku || '';
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [deliveryFilter, setDeliveryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);

  // Manual Order / POS Modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualCustomerEmail, setManualCustomerEmail] = useState('');
  const [manualDeliveryMethod, setManualDeliveryMethod] = useState('SHIPPING');
  const [manualAddress, setManualAddress] = useState('');
  const [manualComments, setManualComments] = useState('');
  const [manualStatus, setManualStatus] = useState('CONFIRMED');
  const [manualItems, setManualItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const fetchOrdersAndProducts = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        client.get('/orders'),
        client.get('/products?limit=500&includeInactive=true').catch(() => ({ data: [] })),
      ]);
      setOrders(ordersRes.data.orders || ordersRes.data || []);
      const prodData = productsRes.data;
      setProducts(prodData.products || prodData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const handleOpenOrderDetail = (order) => {
    setSelectedOrder(order);
    setAdminNotesDraft(order.adminNotes || '');
    setNotesSavedMsg(false);
  };

  // Summary metrics (filtered by selected periodFilter)
  const orderMetrics = useMemo(() => {
    const periodOrders = orders.filter((o) => isOrderInPeriod(o, periodFilter));
    const validOrders = periodOrders.filter(
      (o) => (o.status || '').toUpperCase() !== 'CANCELLED'
    );
    const pendingCount = periodOrders.filter(
      (o) => (o.status || '').toUpperCase() === 'PENDING'
    ).length;
    const totalRevenue = validOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const avgTicket =
      validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
    return {
      totalCount: periodOrders.length,
      pendingCount,
      totalRevenue,
      avgTicket,
    };
  }, [orders, periodFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (!isOrderInPeriod(o, periodFilter)) {
        return false;
      }
      if (filter !== 'ALL' && (o.status || '').toUpperCase() !== filter) {
        return false;
      }
      if (deliveryFilter !== 'ALL' && (o.deliveryMethod || 'SHIPPING') !== deliveryFilter) {
        return false;
      }
      if (q) {
        const idStr = (o.id || o._id || '').toLowerCase();
        const nameStr = (o.customerName || o.name || '').toLowerCase();
        const phoneStr = (o.customerPhone || o.phone || '').toLowerCase();
        const emailStr = (o.customerEmail || o.email || '').toLowerCase();
        const addrStr = (o.customerAddress || '').toLowerCase();
        const itemsMatch =
          Array.isArray(o.items) &&
          o.items.some((item) =>
            (item.product?.name || item.name || '').toLowerCase().includes(q)
          );
        if (
          !idStr.includes(q) &&
          !nameStr.includes(q) &&
          !phoneStr.includes(q) &&
          !emailStr.includes(q) &&
          !addrStr.includes(q) &&
          !itemsMatch
        ) {
          return false;
        }
      }
      return true;
    });
  }, [orders, filter, periodFilter, deliveryFilter, searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await client.patch(`/orders/${id}/status`, { status: newStatus });
      await fetchOrdersAndProducts();
      setSelectedOrder((prev) =>
        prev && (prev.id || prev._id) === id ? { ...prev, status: newStatus } : prev
      );
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar el estado del pedido');
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedOrder) return;
    const id = selectedOrder.id || selectedOrder._id;
    setSavingNotes(true);
    try {
      await client.patch(`/orders/${id}/status`, {
        status: selectedOrder.status || 'PENDING',
        adminNotes: adminNotesDraft,
      });
      await fetchOrdersAndProducts();
      setSelectedOrder((prev) =>
        prev ? { ...prev, adminNotes: adminNotesDraft } : null
      );
      setNotesSavedMsg(true);
      setTimeout(() => setNotesSavedMsg(false), 2500);
    } catch (error) {
      alert('No se pudo guardar la nota interna');
    } finally {
      setSavingNotes(false);
    }
  };

  // WhatsApp Templates for selectedOrder
  const getWhatsAppTemplateUrl = (order, templateType) => {
    const phone = cleanPhoneForWhatsApp(order.customerPhone || order.phone);
    if (!phone) return null;
    const shortId = (order.id || order._id || '').substring(0, 8);
    const name = order.customerName || order.name || 'Cliente';
    const total = Number(order.total || 0).toLocaleString('es-AR');
    const addr = order.customerAddress || 'tu domicilio';

    let message = '';
    if (templateType === 'PAYMENT') {
      message = `Hola ${name}! Te escribimos de Nocturna por tu pedido #${shortId} (Total: $${total}). Te confirmamos que tenemos stock separado para vos. En cuanto nos envíes el comprobante coordinamos la entrega discreta.`;
    } else if (templateType === 'SHIPPING') {
      message = `Hola ${name}! Te avisamos que tu pedido #${shortId} ya fue despachado hacia ${addr}. Va en paquete 100% discreto, cerrado y sin logos ni referencias externas.`;
    } else if (templateType === 'PICKUP') {
      message = `Hola ${name}! Tu pedido #${shortId} ya está preparado en paquete 100% discreto listo para retirar. Avisanos en qué horario pasás.`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Print Discreet Shipping Label & Internal Packing Slip
  const handlePrintPackingSlip = (order) => {
    const shortId = (order.id || order._id || '').substring(0, 8).toUpperCase();
    const dateStr = new Date(order.createdAt).toLocaleString('es-AR');
    const name = order.customerName || order.name || 'Cliente';
    const phone = order.customerPhone || order.phone || '-';
    const address =
      order.deliveryMethod === 'PICKUP'
        ? 'RETIRO ACORDADO'
        : order.customerAddress || 'A coordinar';
    const total = Number(order.total || 0).toLocaleString('es-AR');

    const itemsRows = (order.items || [])
      .map((item) => {
        const pName = item.product?.name || item.name || 'Producto';
        const sku = item.product?.sku || '-';
        const variant = item.variantDescription ? ` (${item.variantDescription})` : '';
        const qty = Number(item.quantity || 1);
        const subtotal = (
          Number(item.price || item.product?.price || 0) * qty
        ).toLocaleString('es-AR');
        return `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #ddd;font-family:monospace;">${sku}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">${pName}${variant}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;font-weight:bold;">${qty}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${subtotal}</td>
          </tr>
        `;
      })
      .join('');

    const win = window.open('', '_blank', 'width=800,height=700');
    if (!win) {
      alert('Habilitá las ventanas emergentes para imprimir la etiqueta.');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Etiqueta Discreta y Hoja de Armado #${shortId}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
          .label-box { border: 2px solid #000; padding: 20px; border-radius: 6px; margin-bottom: 28px; }
          .cut-line { border-top: 2px dashed #666; margin: 28px 0; text-align: center; font-size: 11px; color: #555; padding-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th { background: #f3f3f3; text-align: left; padding: 8px; border-bottom: 2px solid #ccc; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; text-align: right;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #111; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Imprimir / Guardar PDF
          </button>
        </div>

        <!-- ETIQUETA EXTERNA 100% DISCRETA (SIN LOGOS NI MENCION AL RUBRO) -->
        <div class="label-box">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #000; padding-bottom:10px; margin-bottom:14px;">
            <div>
              <strong style="font-size:12px; text-transform:uppercase; letter-spacing:1px;">ENVÍO CONFIDENCIAL / PAQUETE CERRADO</strong>
              <div style="font-size:11px; color:#444; margin-top:2px;">Remitente: N.C. Logística Córdoba</div>
            </div>
            <div style="text-align:right;">
              <strong style="font-size:16px; font-family:monospace;">ORDEN #${shortId}</strong>
              <div style="font-size:11px; color:#444;">${dateStr}</div>
            </div>
          </div>

          <div style="font-size:15px; line-height:1.6;">
            <div><strong>DESTINATARIO:</strong> ${name}</div>
            <div><strong>TELÉFONO:</strong> ${phone}</div>
            <div><strong>DIRECCIÓN / ENTREGA:</strong> ${address}</div>
            ${
              order.comments
                ? `<div style="margin-top:8px; font-size:13px; background:#f7f7f7; padding:8px; border-left:3px solid #333;"><strong>Indicaciones:</strong> ${order.comments}</div>`
                : ''
            }
          </div>
        </div>

        <div class="cut-line">✂ CORTAR POR AQUÍ — USO INTERNO DE DEPÓSITO (NO PEGAR EN EL EXTERIOR)</div>

        <!-- HOJA DE ARMADO INTERNA -->
        <div>
          <h3 style="margin:0 0 4px 0; font-size:15px; text-transform:uppercase;">Hoja de Armado Interna — Nocturna SexShop (#${shortId})</h3>
          <p style="margin:0 0 12px 0; font-size:12px; color:#555;">Estado: ${order.status} | Método: ${
      order.deliveryMethod === 'PICKUP' ? 'Retiro' : 'Envío'
    }</p>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto / Variante</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div style="text-align:right; margin-top:14px; font-size:15px; font-weight:bold;">
            TOTAL ORDEN: $${total}
          </div>
          ${
            order.adminNotes
              ? `<div style="margin-top:12px; font-size:12px; padding:8px; border:1px solid #ccc;"><strong>Nota interna admin:</strong> ${order.adminNotes}</div>`
              : ''
          }
        </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  // Export Orders CSV
  const handleExportOrdersCSV = () => {
    const headers = [
      'ID_Pedido',
      'Fecha',
      'Estado',
      'Cliente',
      'Telefono',
      'Email',
      'Metodo_Entrega',
      'Direccion',
      'Articulos',
      'Total_ARS',
      'Nota_Interna',
    ];

    const escapeCSV = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = filteredOrders.map((o) => {
      const itemsSummary = (o.items || [])
        .map(
          (i) =>
            `${i.quantity}x ${i.product?.name || i.name || 'Item'}${
              i.variantDescription ? ` (${i.variantDescription})` : ''
            }`
        )
        .join(' | ');

      return [
        escapeCSV(o.id || o._id),
        escapeCSV(new Date(o.createdAt).toLocaleString('es-AR')),
        escapeCSV(o.status || 'PENDING'),
        escapeCSV(o.customerName || o.name || ''),
        escapeCSV(o.customerPhone || o.phone || ''),
        escapeCSV(o.customerEmail || o.email || ''),
        escapeCSV(o.deliveryMethod === 'PICKUP' ? 'Retiro' : 'Envio'),
        escapeCSV(o.customerAddress || ''),
        escapeCSV(itemsSummary),
        Number(o.total || 0),
        escapeCSV(o.adminNotes || ''),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `pedidos_nocturna_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Manual Order Product & Variant Selection
  const currentManualProduct = useMemo(
    () => products.find((p) => (p.id || p._id) === selectedProductId),
    [products, selectedProductId]
  );

  const handleAddManualItem = () => {
    if (!currentManualProduct) return;
    const hasVariants =
      Array.isArray(currentManualProduct.variants) &&
      currentManualProduct.variants.length > 0;

    let chosenVariant = null;
    if (hasVariants) {
      chosenVariant =
        currentManualProduct.variants.find((v) => v.id === selectedVariantId) ||
        currentManualProduct.variants[0];
    }

    const unitPrice = Number(
      chosenVariant?.price || currentManualProduct.price || 0
    );
    const variantDesc = chosenVariant ? formatVariantLabel(chosenVariant) : '';

    setManualItems((prev) => [
      ...prev,
      {
        productId: currentManualProduct.id || currentManualProduct._id,
        name: currentManualProduct.name,
        variantId: chosenVariant?.id || undefined,
        variantDescription: variantDesc || undefined,
        price: unitPrice,
        quantity: Math.max(1, Number(selectedQty) || 1),
      },
    ]);
    setSelectedProductId('');
    setSelectedVariantId('');
    setSelectedQty(1);
  };

  const handleRemoveManualItem = (idx) => {
    setManualItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const manualOrderTotal = useMemo(
    () => manualItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [manualItems]
  );

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();
    if (manualItems.length === 0) {
      alert('Agregá al menos un producto a la venta.');
      return;
    }

    setCreatingOrder(true);
    try {
      const res = await client.post('/orders', {
        customerName: manualCustomerName || 'Cliente WhatsApp / Instagram',
        customerPhone: manualCustomerPhone || '5493517572841',
        customerEmail: manualCustomerEmail || 'venta.manual@nocturna.demo',
        deliveryMethod: manualDeliveryMethod,
        customerAddress:
          manualDeliveryMethod === 'PICKUP'
            ? 'Retiro acordado'
            : manualAddress || 'Córdoba Capital',
        comments: manualComments,
        items: manualItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          variantDescription: i.variantDescription,
          quantity: i.quantity,
        })),
      });

      const createdId = res.data?.id || res.data?._id;
      if (createdId && manualStatus !== 'PENDING') {
        await client.patch(`/orders/${createdId}/status`, {
          status: manualStatus,
          adminNotes: 'Venta registrada manualmente desde panel Admin',
        });
      }

      await fetchOrdersAndProducts();
      setIsManualModalOpen(false);
      setManualCustomerName('');
      setManualCustomerPhone('');
      setManualCustomerEmail('');
      setManualAddress('');
      setManualComments('');
      setManualItems([]);
    } catch (error) {
      alert(
        error.response?.data?.error ||
          'No se pudo registrar la venta manual. Verificá los datos.'
      );
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-brand-border/20">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Operaciones &bull; Ventas &bull; Despacho Discreto
          </span>
          <h1 className="font-display text-2xl uppercase tracking-wider text-content mt-0.5">
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Seguimiento de órdenes, contacto rápido por WhatsApp, etiquetas discretas y ventas manuales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportOrdersCSV}
            className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-surface hover:bg-surface-elevated text-content-secondary hover:text-content border border-brand-border/30 transition-colors"
          >
            <FiDownload className="mr-1.5 text-mauve" size={14} />
            Exportar CSV
          </button>

          <Button
            onClick={() => setIsManualModalOpen(true)}
            variant="primary"
            className="inline-flex items-center py-2 text-xs"
          >
            <FiPlus className="mr-1.5" /> Registrar Venta Manual
          </Button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface p-3.5 rounded-lg border border-brand-border/20">
          <span className="text-[10px] uppercase tracking-wider text-content-muted block">
            Total Pedidos
          </span>
          <span className="text-xl font-semibold text-content mt-0.5 block">
            {orderMetrics.totalCount}
          </span>
        </div>

        <div className="bg-surface p-3.5 rounded-lg border border-brand-border/20">
          <span className="text-[10px] uppercase tracking-wider text-content-muted block">
            Pendientes de Confirmar
          </span>
          <span className="text-xl font-semibold text-amber-300 mt-0.5 block">
            {orderMetrics.pendingCount}
          </span>
        </div>

        <div className="bg-surface p-3.5 rounded-lg border border-brand-border/20">
          <span className="text-[10px] uppercase tracking-wider text-content-muted block">
            Facturación Acumulada
          </span>
          <span className="text-xl font-semibold text-emerald-300 mt-0.5 block">
            {themeConfig.brand.currencySymbol}
            {orderMetrics.totalRevenue.toLocaleString('es-AR')}
          </span>
        </div>

        <div className="bg-surface p-3.5 rounded-lg border border-brand-border/20">
          <span className="text-[10px] uppercase tracking-wider text-content-muted block">
            Ticket Promedio
          </span>
          <span className="text-xl font-semibold text-content mt-0.5 block">
            {themeConfig.brand.currencySymbol}
            {orderMetrics.avgTicket.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface rounded-lg overflow-x-auto border border-brand-border/20">
          {statusTabs.map((tab) => {
            const isActive = filter === tab.id;
            const count =
              tab.id === 'ALL'
                ? orders.length
                : orders.filter((o) => (o.status || '').toUpperCase() === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-normal whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-brand text-content border border-mauve/30 shadow-soft'
                    : 'text-content-secondary hover:text-content'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-canvas/40 text-content font-semibold'
                      : 'bg-surface-elevated text-content-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Delivery Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
              size={13}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, tel, ID o producto..."
              className="w-full pl-8 pr-7 py-1.5 bg-surface border border-brand-border/30 rounded-md text-xs text-content placeholder-content-muted focus:outline-none focus:border-mauve"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
              >
                <FiX size={12} />
              </button>
            )}
          </div>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            aria-label="Filtrar ingresos y pedidos por período"
            className="px-3 py-1.5 bg-surface border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
          >
            {periodOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            aria-label="Filtrar por modalidad de entrega"
            className="px-3 py-1.5 bg-surface border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
          >
            <option value="ALL">Entrega: Todas</option>
            <option value="SHIPPING">Envíos a domicilio</option>
            <option value="PICKUP">Retiro acordado</option>
          </select>
        </div>
      </div>

      <OrderTable
        orders={filteredOrders}
        onViewDetails={handleOpenOrderDetail}
        onStatusChange={handleStatusChange}
      />

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Ficha Operativa del Pedido"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Top Bar: ID, Date, Print Button & Status Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-brand-border/15 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-content font-mono font-semibold">
                    N° {selectedOrder.id || selectedOrder._id}
                  </p>
                  <button
                    type="button"
                    onClick={() => handlePrintPackingSlip(selectedOrder)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-surface-elevated hover:bg-brand text-content border border-brand-border/30 transition-colors"
                    title="Imprimir etiqueta confidencial para el paquete y hoja de armado"
                  >
                    <FiPrinter size={11} className="text-mauve" />
                    <span>Etiqueta Discreta / Armado</span>
                  </button>
                </div>
                <p className="text-xs text-content-secondary mt-1">
                  Fecha: {new Date(selectedOrder.createdAt).toLocaleString('es-AR')}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-content-muted font-medium">
                  Estado de la orden:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      value: 'PENDING',
                      label: 'Pendiente',
                      color: 'bg-amber-950/50 text-amber-300 border-amber-800/40',
                    },
                    {
                      value: 'CONFIRMED',
                      label: 'Confirmado',
                      color: 'bg-blue-950/50 text-blue-300 border-blue-800/40',
                    },
                    {
                      value: 'DELIVERED',
                      label: 'Entregado',
                      color: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40',
                    },
                    {
                      value: 'CANCELLED',
                      label: 'Cancelado',
                      color: 'bg-rose-950/50 text-rose-300 border-rose-800/40',
                    },
                  ].map((s) => {
                    const isActive =
                      (selectedOrder.status || 'PENDING').toUpperCase() === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() =>
                          !isActive &&
                          handleStatusChange(selectedOrder.id || selectedOrder._id, s.value)
                        }
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                          isActive
                            ? 'bg-brand text-content border-mauve shadow-soft cursor-default font-semibold'
                            : `${s.color} hover:opacity-80 cursor-pointer`
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-canvas p-3.5 rounded-md border border-brand-border/20">
                <h4 className="text-[10px] uppercase font-medium text-mauve tracking-wider mb-1.5">
                  Datos del Cliente
                </h4>
                <p className="text-xs sm:text-sm font-medium text-content">
                  {selectedOrder.customerName || selectedOrder.name}
                </p>
                <p className="text-xs text-content-secondary mt-0.5">
                  {selectedOrder.customerEmail || selectedOrder.email}
                </p>
                <p className="text-xs text-content-secondary mt-0.5 font-mono">
                  {selectedOrder.customerPhone || selectedOrder.phone}
                </p>
              </div>

              <div className="bg-canvas p-3.5 rounded-md border border-brand-border/20">
                <h4 className="text-[10px] uppercase font-medium text-mauve tracking-wider mb-1.5">
                  Entrega ({selectedOrder.deliveryMethod === 'PICKUP' ? 'Retiro' : 'Envío Discreto'})
                </h4>
                <p className="text-xs sm:text-sm text-content">
                  {selectedOrder.customerAddress || 'No especificada'}
                </p>
                {selectedOrder.comments && (
                  <p className="text-xs text-content-muted italic mt-2 border-t border-brand-border/15 pt-1">
                    Nota cliente: &ldquo;{selectedOrder.comments}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Quick WhatsApp Templates */}
            {(selectedOrder.customerPhone || selectedOrder.phone) && (
              <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-md p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                  <FiMessageCircle size={14} />
                  <span>Respuestas Rápidas por WhatsApp al Cliente:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={getWhatsAppTemplateUrl(selectedOrder, 'PAYMENT')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded text-xs bg-surface hover:bg-surface-elevated text-content border border-brand-border/30 transition-colors"
                  >
                    1. Confirmar stock y pedir comprobante
                  </a>
                  <a
                    href={getWhatsAppTemplateUrl(selectedOrder, 'SHIPPING')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded text-xs bg-surface hover:bg-surface-elevated text-content border border-brand-border/30 transition-colors"
                  >
                    2. Avisar envío discreto en camino
                  </a>
                  <a
                    href={getWhatsAppTemplateUrl(selectedOrder, 'PICKUP')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded text-xs bg-surface hover:bg-surface-elevated text-content border border-brand-border/30 transition-colors"
                  >
                    3. Avisar pedido listo para retirar
                  </a>
                </div>
              </div>
            )}

            {/* Artículos del pedido */}
            <div>
              <h4 className="text-xs font-display uppercase tracking-widest text-content mb-2">
                Artículos del Pedido
              </h4>
              <div className="border border-brand-border/20 rounded-md overflow-hidden divide-y divide-brand-border/15 bg-canvas">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      {item.product?.sku && (
                        <span className="font-mono text-[10px] text-content-muted mr-1.5">
                          [{item.product.sku}]
                        </span>
                      )}
                      <span className="font-medium text-content">
                        {item.product?.name || item.name || 'Producto'}
                      </span>
                      {item.variantDescription && (
                        <span className="text-mauve ml-1.5">({item.variantDescription})</span>
                      )}
                      <span className="text-content-muted ml-2">x {item.quantity} un.</span>
                    </div>
                    <span className="font-semibold text-content">
                      {themeConfig.brand.currencySymbol}
                      {(
                        Number(item.price || item.product?.price || 0) * item.quantity
                      ).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="bg-canvas p-3.5 rounded-md border border-brand-border/20 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider font-medium text-mauve">
                  Nota Interna del Administrador (privada)
                </label>
                {notesSavedMsg && (
                  <span className="text-[11px] text-emerald-300 inline-flex items-center gap-1">
                    <FiCheck size={12} /> Guardada
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminNotesDraft}
                  onChange={(e) => setAdminNotesDraft(e.target.value)}
                  placeholder="Ej: Pagó por transferencia MercadoPago #4491, enviar por Uber Moto a las 18hs..."
                  className="flex-1 px-3 py-1.5 bg-surface border border-brand-border/30 rounded text-xs text-content placeholder-content-muted focus:outline-none focus:border-mauve"
                />
                <button
                  type="button"
                  onClick={handleSaveAdminNotes}
                  disabled={savingNotes}
                  className="px-3 py-1.5 rounded bg-surface-elevated hover:bg-brand text-xs text-content border border-brand-border/30 inline-flex items-center gap-1 transition-colors"
                >
                  <FiSave size={12} />
                  <span>Guardar</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border/20 flex justify-between items-center text-sm font-semibold text-content">
              <span>Total de la Orden</span>
              <span className="text-base font-bold">
                {themeConfig.brand.currencySymbol}
                {Number(selectedOrder.total || 0).toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Order / POS Creation Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Registrar Venta Manual (Instagram / WhatsApp)"
      >
        <form onSubmit={handleCreateManualOrder} className="space-y-4">
          <p className="text-xs text-content-secondary">
            Cargá una venta cerrada por Instagram o WhatsApp para descontar stock automáticamente y
            dejarla registrada en las métricas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                required
                value={manualCustomerName}
                onChange={(e) => setManualCustomerName(e.target.value)}
                placeholder="Ej: Sofía G."
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                Teléfono / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={manualCustomerPhone}
                onChange={(e) => setManualCustomerPhone(e.target.value)}
                placeholder="Ej: 351 612-3456"
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                Modalidad de Entrega
              </label>
              <select
                value={manualDeliveryMethod}
                onChange={(e) => setManualDeliveryMethod(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              >
                <option value="SHIPPING">Envío discreto a domicilio</option>
                <option value="PICKUP">Retiro acordado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                Estado inicial
              </label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
              >
                <option value="CONFIRMED">Confirmado (Pagado)</option>
                <option value="DELIVERED">Entregado</option>
                <option value="PENDING">Pendiente de pago</option>
              </select>
            </div>

            {manualDeliveryMethod === 'SHIPPING' && (
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-content-secondary uppercase tracking-wider mb-1">
                  Dirección / Zona en Córdoba
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Ej: Av. Colón 1200, Nueva Córdoba"
                  className="w-full px-3 py-2 bg-canvas border border-brand-border/30 rounded-md text-xs text-content focus:outline-none focus:border-mauve"
                />
              </div>
            )}
          </div>

          {/* Add Products to Manual Order */}
          <div className="p-3.5 rounded-md bg-canvas border border-brand-border/20 space-y-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-mauve block">
              Agregar Productos a la Orden
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[10px] text-content-muted mb-1">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setSelectedVariantId('');
                  }}
                  className="w-full px-2.5 py-2 bg-surface border border-brand-border/30 rounded text-xs text-content"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.sku ? `[${p.sku}] ` : ''}
                      {p.name} (${Number(p.price || 0).toLocaleString('es-AR')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] text-content-muted mb-1">Variante</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  disabled={
                    !currentManualProduct ||
                    !Array.isArray(currentManualProduct.variants) ||
                    currentManualProduct.variants.length === 0
                  }
                  className="w-full px-2.5 py-2 bg-surface border border-brand-border/30 rounded text-xs text-content disabled:opacity-40"
                >
                  <option value="">
                    {currentManualProduct?.variants?.length
                      ? 'Elegir variante...'
                      : 'Única'}
                  </option>
                  {(currentManualProduct?.variants || []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatVariantLabel(v)} ({v.stock} disp.)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 flex gap-1.5">
                <div className="w-16">
                  <label className="block text-[10px] text-content-muted mb-1">Cant.</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(e.target.value)}
                    className="w-full px-2 py-2 bg-surface border border-brand-border/30 rounded text-xs text-content text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddManualItem}
                  disabled={!selectedProductId}
                  className="flex-1 py-2 px-2.5 bg-brand hover:bg-brand/80 disabled:opacity-40 text-content rounded text-xs font-medium border border-mauve/40"
                >
                  + Agregar
                </button>
              </div>
            </div>

            {/* Items list */}
            {manualItems.length > 0 && (
              <div className="border border-brand-border/20 rounded divide-y divide-brand-border/15 bg-surface mt-2">
                {manualItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-content">{item.name}</span>
                      {item.variantDescription && (
                        <span className="text-mauve ml-1">({item.variantDescription})</span>
                      )}
                      <span className="text-content-muted ml-2">x {item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-content">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveManualItem(idx)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="px-3 py-2 flex justify-between items-center text-xs font-semibold bg-surface-elevated">
                  <span>Total a cobrar</span>
                  <span className="text-sm text-emerald-300">
                    ${manualOrderTotal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-border/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManualModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={creatingOrder || manualItems.length === 0}
            >
              {creatingOrder ? 'Registrando...' : 'Guardar Venta y Descontar Stock'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
