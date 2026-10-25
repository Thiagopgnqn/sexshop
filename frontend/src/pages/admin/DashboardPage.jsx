import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import OrderTable from '../../components/admin/OrderTable';
import Modal from '../../components/ui/Modal';
import {
  FiBox,
  FiShoppingBag,
  FiDollarSign,
  FiAlertTriangle,
  FiImage,
  FiTrendingUp,
  FiPlus,
  FiExternalLink,
  FiLayers,
  FiCalendar,
  FiEdit2,
} from 'react-icons/fi';
import themeConfig from '../../config/theme';
import { resolveProductImage } from '../../utils/productImages';

const REVENUE_PERIODS = [
  { id: 'TODAY', label: 'Hoy' },
  { id: 'WEEK', label: 'Semana' },
  { id: 'MONTH', label: 'Mes' },
  { id: 'YEAR', label: 'Año' },
  { id: 'ALL', label: 'Histórico' },
  { id: 'CUSTOM', label: 'Rango' },
];

const isOrderInPeriod = (order, period, customFrom, customTo) => {
  if (!order?.createdAt) return true;
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
  if (period === 'WEEK') {
    return orderTime >= now.getTime() - 7 * 86400 * 1000;
  }
  if (period === 'MONTH') {
    return orderTime >= now.getTime() - 30 * 86400 * 1000;
  }
  if (period === 'YEAR') {
    return orderTime >= now.getTime() - 365 * 86400 * 1000;
  }
  if (period === 'CUSTOM') {
    if (customFrom) {
      const fromTime = new Date(`${customFrom}T00:00:00`).getTime();
      if (!Number.isNaN(fromTime) && orderTime < fromTime) return false;
    }
    if (customTo) {
      const toTime = new Date(`${customTo}T23:59:59`).getTime();
      if (!Number.isNaN(toTime) && orderTime > toTime) return false;
    }
    return true;
  }
  return true;
};

const getTotalStock = (product) => {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  }
  return Number(product.stock || 0);
};

const hasPhoto = (product) => {
  const resolved = resolveProductImage(product);
  return Boolean(resolved?.thumb || resolved?.main || product.imageUrl || product.image);
};

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [restockingId, setRestockingId] = useState(null);

  // Revenue period filter state
  const [revenuePeriod, setRevenuePeriod] = useState('MONTH');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        client.get('/products?limit=500&includeInactive=true'),
        client.get('/orders?limit=200').catch(() => ({ data: { orders: [] } })),
      ]);

      const prodList = productsRes.data.products || productsRes.data || [];
      const ordList = ordersRes.data.orders || ordersRes.data || [];

      setProducts(prodList);
      setOrders(ordList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Computed metrics with dynamic revenue period filter
  const metrics = useMemo(() => {
    const validOrders = orders.filter(
      (o) => (o.status || '').toUpperCase() !== 'CANCELLED'
    );
    const pendingOrders = orders.filter(
      (o) => (o.status || '').toUpperCase() === 'PENDING'
    );

    const periodValidOrders = validOrders.filter((o) =>
      isOrderInPeriod(o, revenuePeriod, customFrom, customTo)
    );
    const periodRevenue = periodValidOrders.reduce(
      (acc, o) => acc + Number(o.total || 0),
      0
    );
    const periodAvgTicket =
      periodValidOrders.length > 0
        ? Math.round(periodRevenue / periodValidOrders.length)
        : 0;

    // Quick breakdown across standard periods
    const calcRev = (p) =>
      validOrders
        .filter((o) => isOrderInPeriod(o, p))
        .reduce((acc, o) => acc + Number(o.total || 0), 0);

    const breakdown = {
      today: calcRev('TODAY'),
      week: calcRev('WEEK'),
      month: calcRev('MONTH'),
      year: calcRev('YEAR'),
      all: calcRev('ALL'),
    };

    let totalUnits = 0;
    let inventoryValue = 0;
    let activeProducts = 0;
    let featuredProducts = 0;
    let withPhotoCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      if (p.active !== false) activeProducts++;
      if (p.featured || p.badge === 'Destacado') featuredProducts++;
      if (hasPhoto(p)) withPhotoCount++;

      const stock = getTotalStock(p);
      totalUnits += stock;

      if (Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v) => {
          const vStock = Number(v.stock || 0);
          const vPrice = Number(v.price || p.price || 0);
          inventoryValue += vStock * vPrice;
        });
      } else {
        inventoryValue += stock * Number(p.price || 0);
      }

      if (stock <= 0) outOfStockCount++;
      else if (stock <= 3) lowStockCount++;
    });

    const photoPct =
      products.length > 0 ? Math.round((withPhotoCount / products.length) * 100) : 0;

    return {
      totalProducts: products.length,
      activeProducts,
      featuredProducts,
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      periodOrdersCount: periodValidOrders.length,
      periodRevenue,
      periodAvgTicket,
      breakdown,
      totalUnits,
      inventoryValue,
      withPhotoCount,
      photoPct,
      lowStockCount,
      outOfStockCount,
    };
  }, [products, orders, revenuePeriod, customFrom, customTo]);

  // Low / Out of stock items list (for urgent restock widget)
  const criticalStockProducts = useMemo(() => {
    return products
      .map((p) => ({ ...p, computedStock: getTotalStock(p) }))
      .filter((p) => p.computedStock <= 3)
      .sort((a, b) => a.computedStock - b.computedStock)
      .slice(0, 6);
  }, [products]);

  // Top selling products
  const topSellingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
      .slice(0, 5);
  }, [products]);

  // Category distribution
  const categoryBreakdown = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const catName =
        p.category?.parent?.name || p.category?.name || 'Sin categoría';
      if (!map[catName]) {
        map[catName] = { name: catName, count: 0, units: 0 };
      }
      map[catName].count += 1;
      map[catName].units += getTotalStock(p);
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [products]);

  // Quick +5 restock handler from Dashboard
  const handleQuickRestock = async (product, addUnits = 5) => {
    const id = product.id || product._id;
    setRestockingId(id);
    try {
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const updatedVariants = product.variants.map((v) => ({
          ...v,
          stock: Number(v.stock || 0) + addUnits,
        }));
        const total = updatedVariants.reduce(
          (sum, v) => sum + Number(v.stock || 0),
          0
        );
        await client.put(`/products/${id}`, {
          variants: updatedVariants,
          stock: total,
        });
      } else {
        const nextStock = Number(product.stock || 0) + addUnits;
        await client.put(`/products/${id}`, { stock: nextStock });
      }
      await fetchDashboardData();
    } catch (err) {
      alert('No se pudo reponer el stock');
    } finally {
      setRestockingId(null);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await client.patch(`/orders/${orderId}/status`, { status: newStatus });
      await fetchDashboardData();
      setSelectedOrder((prev) =>
        prev && (prev.id || prev._id) === orderId
          ? { ...prev, status: newStatus }
          : prev
      );
    } catch (err) {
      alert('Error al actualizar estado del pedido');
    }
  };

  const activePeriodLabel =
    REVENUE_PERIODS.find((p) => p.id === revenuePeriod)?.label || 'Período';

  return (
    <div className="space-y-6">
      {/* Header + Quick Shortcuts */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-brand-border/20">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Centro de Operaciones &bull; Resumen en Vivo
          </span>
          <h1 className="font-display text-2xl uppercase tracking-wider text-content mt-0.5">
            Panel de Control
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Métricas comerciales por período, salud del inventario y actividad reciente de{' '}
            {themeConfig.brand.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/productos"
            className="inline-flex items-center px-3.5 py-2 rounded-md text-xs font-medium bg-brand hover:bg-brand/80 text-content border border-mauve/40 transition-colors"
          >
            <FiPlus className="mr-1.5" size={14} /> Gestionar Productos
          </Link>
          <Link
            to="/admin/pedidos"
            className="inline-flex items-center px-3.5 py-2 rounded-md text-xs font-medium bg-surface hover:bg-surface-elevated text-content border border-brand-border/30 transition-colors"
          >
            <FiShoppingBag className="mr-1.5 text-mauve" size={14} /> Ver Pedidos (
            {metrics.pendingOrders} pend.)
          </Link>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-surface hover:bg-surface-elevated text-content-secondary hover:text-content border border-brand-border/30 transition-colors"
          >
            <span>Tienda</span>
            <FiExternalLink className="ml-1.5 text-mauve" size={13} />
          </Link>
        </div>
      </div>

      {/* Featured Revenue Card with Day / Week / Month / Year / All Filter */}
      <div className="bg-surface rounded-lg border border-brand-border/25 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-brand-border/15">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-md border border-brand-border/25 bg-surface-elevated text-emerald-300">
              <FiDollarSign size={22} />
            </div>
            <div>
              <span className="text-[11px] text-content-muted uppercase font-medium tracking-wider block">
                Ingresos Estimados ({activePeriodLabel})
              </span>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-2xl sm:text-3xl font-semibold text-emerald-300 tracking-tight">
                  {themeConfig.brand.currencySymbol}
                  {metrics.periodRevenue.toLocaleString('es-AR')}
                </span>
                <span className="text-xs text-content-secondary">
                  {metrics.periodOrdersCount}{' '}
                  {metrics.periodOrdersCount === 1 ? 'venta' : 'ventas'} &bull; Ticket
                  promedio:{' '}
                  <strong className="text-content">
                    {themeConfig.brand.currencySymbol}
                    {metrics.periodAvgTicket.toLocaleString('es-AR')}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Period Selector Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-canvas p-1 rounded-lg border border-brand-border/20 self-start md:self-auto">
            <FiCalendar className="text-mauve ml-2 mr-1" size={13} />
            {REVENUE_PERIODS.map((p) => {
              const isActive = revenuePeriod === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setRevenuePeriod(p.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-content border border-mauve/40 shadow-soft'
                      : 'text-content-secondary hover:text-content'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Range Picker (when Rango is active) */}
        {revenuePeriod === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <label className="text-content-secondary">Desde:</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-2.5 py-1 bg-canvas border border-brand-border/30 rounded text-xs text-content"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-content-secondary">Hasta:</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-2.5 py-1 bg-canvas border border-brand-border/30 rounded text-xs text-content"
              />
            </div>
          </div>
        )}

        {/* Comparative Strip: Hoy | Semana | Mes | Año | Histórico */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            { id: 'TODAY', label: 'Hoy (24h)', value: metrics.breakdown.today },
            { id: 'WEEK', label: 'Últimos 7 días', value: metrics.breakdown.week },
            { id: 'MONTH', label: 'Últimos 30 días', value: metrics.breakdown.month },
            { id: 'YEAR', label: 'Este Año', value: metrics.breakdown.year },
            { id: 'ALL', label: 'Histórico Total', value: metrics.breakdown.all },
          ].map((item) => {
            const active = revenuePeriod === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setRevenuePeriod(item.id)}
                className={`p-2.5 rounded border text-left transition-colors ${
                  active
                    ? 'bg-brand/25 border-mauve/60 text-content'
                    : 'bg-canvas border-brand-border/15 text-content-secondary hover:border-brand-border/40'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider text-content-muted block">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-content mt-0.5 block">
                  {themeConfig.brand.currencySymbol}
                  {item.value.toLocaleString('es-AR')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Remaining 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Pedidos y Pendientes */}
        <Link
          to="/admin/pedidos"
          className="bg-surface rounded-lg border border-brand-border/20 p-4 flex items-start justify-between hover:border-mauve/50 transition-colors"
        >
          <div>
            <p className="text-[10px] text-content-muted uppercase font-medium tracking-wider">
              Órdenes Totales
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-semibold text-content">
                {metrics.totalOrders}
              </span>
              {metrics.pendingOrders > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-medium">
                  {metrics.pendingOrders} pend.
                </span>
              )}
            </div>
            <p className="text-[11px] text-content-secondary mt-1.5">
              Gestionar despachos &rarr;
            </p>
          </div>
          <div className="p-2.5 rounded-md border border-brand-border/25 bg-surface-elevated text-mauve">
            <FiShoppingBag size={18} />
          </div>
        </Link>

        {/* Card 2: Valorización de Inventario */}
        <Link
          to="/admin/productos"
          className="bg-surface rounded-lg border border-brand-border/20 p-4 flex items-start justify-between hover:border-mauve/50 transition-colors"
        >
          <div>
            <p className="text-[10px] text-content-muted uppercase font-medium tracking-wider">
              Valorización Stock
            </p>
            <p className="text-xl font-semibold text-content mt-1 tracking-tight">
              {themeConfig.brand.currencySymbol}
              {metrics.inventoryValue.toLocaleString('es-AR')}
            </p>
            <p className="text-[11px] text-content-secondary mt-1.5">
              <strong className="text-content">
                {metrics.totalUnits.toLocaleString('es-AR')}
              </strong>{' '}
              un. disponibles
            </p>
          </div>
          <div className="p-2.5 rounded-md border border-brand-border/25 bg-surface-elevated text-mauve">
            <FiLayers size={18} />
          </div>
        </Link>

        {/* Card 3: Catálogo Activo y Destacados */}
        <Link
          to="/admin/productos"
          className="bg-surface rounded-lg border border-brand-border/20 p-4 flex items-start justify-between hover:border-mauve/50 transition-colors"
        >
          <div>
            <p className="text-[10px] text-content-muted uppercase font-medium tracking-wider">
              Catálogo Activo
            </p>
            <p className="text-xl font-semibold text-content mt-1">
              {metrics.activeProducts}{' '}
              <span className="text-xs font-normal text-content-muted">
                / {metrics.totalProducts}
              </span>
            </p>
            <p className="text-[11px] text-content-secondary mt-1.5">
              <strong className="text-amber-300">{metrics.featuredProducts}</strong>{' '}
              destacados en Home
            </p>
          </div>
          <div className="p-2.5 rounded-md border border-brand-border/25 bg-surface-elevated text-mauve">
            <FiBox size={18} />
          </div>
        </Link>

        {/* Card 4: Alertas de Stock */}
        <Link
          to="/admin/productos"
          className="bg-surface rounded-lg border border-brand-border/20 p-4 flex items-start justify-between hover:border-mauve/50 transition-colors"
        >
          <div>
            <p className="text-[10px] text-content-muted uppercase font-medium tracking-wider">
              Alertas de Stock
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-xl font-semibold ${
                  metrics.outOfStockCount + metrics.lowStockCount > 0
                    ? 'text-amber-300'
                    : 'text-emerald-300'
                }`}
              >
                {metrics.outOfStockCount + metrics.lowStockCount}
              </span>
              <span className="text-[11px] text-content-muted">críticos</span>
            </div>
            <p className="text-[11px] text-content-secondary mt-1.5">
              {metrics.outOfStockCount} agot. &bull; {metrics.lowStockCount} bajos
            </p>
          </div>
          <div className="p-2.5 rounded-md border border-brand-border/25 bg-surface-elevated text-amber-300">
            <FiAlertTriangle size={18} />
          </div>
        </Link>

        {/* Card 5: Cobertura Fotográfica */}
        <Link
          to="/admin/productos"
          className="bg-surface rounded-lg border border-brand-border/20 p-4 flex items-start justify-between hover:border-mauve/50 transition-colors"
        >
          <div className="flex-1 pr-2">
            <p className="text-[10px] text-content-muted uppercase font-medium tracking-wider">
              Cobertura Fotos
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-semibold text-content">
                {metrics.photoPct}%
              </span>
              <span className="text-[11px] text-content-secondary">
                ({metrics.withPhotoCount}/{metrics.totalProducts})
              </span>
            </div>
            <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden mt-2 border border-brand-border/20">
              <div
                className="h-full bg-mauve transition-all"
                style={{ width: `${metrics.photoPct}%` }}
              />
            </div>
          </div>
          <div className="p-2.5 rounded-md border border-brand-border/25 bg-surface-elevated text-mauve">
            <FiImage size={18} />
          </div>
        </Link>
      </div>

      {/* Middle Operational Row: Critical Stock Restock + Top Selling & Category Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Alertas de Stock y Reposición Rápida */}
        <div className="lg:col-span-6 bg-surface rounded-lg border border-brand-border/20 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border/15">
              <div>
                <h2 className="font-display text-sm uppercase tracking-widest text-content flex items-center gap-2">
                  <FiAlertTriangle className="text-amber-400" size={15} />
                  <span>Reposición Rápida de Stock</span>
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  Artículos agotados o con 3 unidades o menos
                </p>
              </div>
              <Link
                to="/admin/productos"
                className="text-xs text-mauve hover:text-content font-medium"
              >
                Ver inventario &rarr;
              </Link>
            </div>

            {criticalStockProducts.length === 0 ? (
              <div className="p-6 text-center bg-canvas rounded-md border border-brand-border/15">
                <p className="text-xs text-emerald-300 font-medium">
                  Todo el catálogo cuenta con stock saludable (&gt; 3 unidades).
                </p>
                <p className="text-[11px] text-content-muted mt-1">
                  Cuando algún producto o variante baje de 3 unidades aparecerá acá para
                  reponerlo en 1 clic.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalStockProducts.map((p) => {
                  const id = p.id || p._id;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2.5 rounded bg-canvas border border-brand-border/20 text-xs"
                    >
                      <Link
                        to={`/admin/productos?edit=${id}`}
                        className="min-w-0 pr-2 hover:text-mauve transition-colors"
                        title="Clic para abrir y editar este producto"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-mauve">
                            [{p.sku || 'S/N'}]
                          </span>
                          <span className="font-medium text-content hover:underline truncate">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-content-muted">
                          {p.category?.name || 'General'}
                        </span>
                      </Link>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            p.computedStock <= 0
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                          }`}
                        >
                          {p.computedStock} un.
                        </span>
                        <button
                          type="button"
                          disabled={restockingId === id}
                          onClick={() => handleQuickRestock(p, 5)}
                          className="px-2 py-1 rounded bg-surface-elevated hover:bg-brand text-content border border-brand-border/30 text-[11px] font-medium transition-colors"
                          title="Sumar 5 unidades al stock"
                        >
                          {restockingId === id ? '...' : '+5 un.'}
                        </button>
                        <Link
                          to={`/admin/productos?edit=${id}`}
                          className="p-1.5 rounded bg-surface-elevated hover:bg-brand text-content-secondary hover:text-content border border-brand-border/30"
                          title="Editar producto"
                        >
                          <FiEdit2 size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Distribución por Categoría */}
          <div className="mt-5 pt-4 border-t border-brand-border/15">
            <h3 className="text-[11px] uppercase tracking-wider font-medium text-mauve mb-2.5">
              Distribución del Catálogo por Categoría
            </h3>
            <div className="space-y-2">
              {categoryBreakdown.map((cat) => {
                const pct =
                  metrics.totalProducts > 0
                    ? Math.round((cat.count / metrics.totalProducts) * 100)
                    : 0;
                return (
                  <div key={cat.name} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-content font-medium">{cat.name}</span>
                      <span className="text-content-muted">
                        {cat.count} prod. ({cat.units} un.) &bull; {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand border-r border-mauve"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Top 5 Productos Más Vendidos */}
        <div className="lg:col-span-6 bg-surface rounded-lg border border-brand-border/20 p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border/15">
            <div>
              <h2 className="font-display text-sm uppercase tracking-widest text-content flex items-center gap-2">
                <FiTrendingUp className="text-emerald-400" size={15} />
                <span>Productos Más Vendidos</span>
              </h2>
              <p className="text-xs text-content-muted mt-0.5">
                Hacé clic en cualquier producto para abrirlo y editarlo
              </p>
            </div>
            <Link
              to="/admin/productos"
              className="text-xs text-mauve hover:text-content font-medium"
            >
              Catálogo completo &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {topSellingProducts.map((p, idx) => {
              const id = p.id || p._id;
              const resolved = resolveProductImage(p);
              const imgUrl = resolved?.thumb || resolved?.main || p.imageUrl || p.image;
              const stock = getTotalStock(p);

              return (
                <Link
                  key={id}
                  to={`/admin/productos?edit=${id}`}
                  className="group flex items-center justify-between p-2.5 rounded-md bg-canvas border border-brand-border/20 hover:border-mauve/50 transition-colors"
                  title="Clic para editar este producto"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-surface-elevated border border-brand-border/30 text-[10px] font-mono text-mauve flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded bg-surface border border-brand-border/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-mauve/40">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiBox size={14} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-content group-hover:text-mauve group-hover:underline truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-content-muted font-mono">
                        SKU: {p.sku || 'S/N'} &bull; Stock: {stock} un.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-300 block">
                        {Number(p.soldCount || 0)} vendidos
                      </span>
                      <span className="text-[11px] text-content-secondary">
                        {themeConfig.brand.currencySymbol}
                        {Number(p.price || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <span className="p-1.5 rounded bg-surface-elevated group-hover:bg-brand text-content-secondary group-hover:text-content border border-brand-border/30 transition-colors">
                      <FiEdit2 size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-surface rounded-lg border border-brand-border/20 p-6">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-brand-border/15">
          <div>
            <h2 className="font-display text-sm uppercase tracking-widest text-content">
              Pedidos Recientes
            </h2>
            <p className="text-xs text-content-muted">
              Últimas órdenes recibidas con cambio de estado directo y acceso a WhatsApp
            </p>
          </div>
          <Link to="/admin/pedidos" className="text-xs text-mauve font-medium hover:text-content">
            Ver todos los pedidos &rarr;
          </Link>
        </div>
        <OrderTable
          orders={orders.slice(0, 5)}
          onViewDetails={setSelectedOrder}
          onStatusChange={handleOrderStatusChange}
        />
      </div>

      {/* Order Quick Modal */}
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
              <select
                value={(selectedOrder.status || 'PENDING').toUpperCase()}
                onChange={(e) =>
                  handleOrderStatusChange(
                    selectedOrder.id || selectedOrder._id,
                    e.target.value
                  )
                }
                aria-label="Estado del pedido"
                className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-elevated text-content border border-brand-border/30"
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
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

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="border border-brand-border/20 rounded-md divide-y divide-brand-border/15 bg-canvas">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between text-xs">
                    <span className="text-content">
                      {item.product?.name || item.name}{' '}
                      {item.variantDescription ? `(${item.variantDescription})` : ''} x{' '}
                      {item.quantity}
                    </span>
                    <span className="font-semibold text-content">
                      {themeConfig.brand.currencySymbol}
                      {(
                        Number(item.price || item.product?.price || 0) * item.quantity
                      ).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            )}

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
