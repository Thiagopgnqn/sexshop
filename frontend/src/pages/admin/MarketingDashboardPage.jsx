import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiPercent,
  FiUsers,
  FiDownload,
  FiEye,
  FiCalendar,
  FiRefreshCw,
  FiShare2,
  FiFilter,
  FiCheckCircle,
  FiLayers,
  FiArrowUpRight,
  FiExternalLink,
} from 'react-icons/fi';
import { FaInstagram, FaWhatsapp, FaFacebook } from 'react-icons/fa';
import CampaignShareModal from '../../components/admin/campaigns/CampaignShareModal';

const DATE_RANGES = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: 'month', label: 'Este mes' },
  { id: 'all', label: 'Histórico completo' },
];

export default function MarketingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedRange, setSelectedRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'coupons' | 'attribution' | 'subscribers'
  const [subscribers, setSubscribers] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [shareCampaign, setShareCampaign] = useState(null);
  const [exportingCsv, setExportingCsv] = useState(false);

  const fetchMetrics = async (range) => {
    setLoading(true);
    try {
      const res = await client.get(`/audit/marketing?range=${range}`);
      setData(res.data);
    } catch (err) {
      console.error('Error cargando métricas de marketing:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setSubsLoading(true);
    try {
      const res = await client.get('/newsletter/admin/subscribers');
      setSubscribers(res.data?.subscribers || []);
    } catch (err) {
      console.error('Error cargando suscriptores:', err);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedRange);
  }, [selectedRange]);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab]);

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const res = await client.get('/newsletter/admin/export', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suscriptores-nocturna-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando CSV:', err);
    } finally {
      setExportingCsv(false);
    }
  };

  const formatMoney = (val) =>
    `$${Math.round(Number(val) || 0).toLocaleString('es-AR')}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const overview = data?.overview || {
    totalOrders: 0,
    totalRevenue: 0,
    totalDiscounts: 0,
    averageTicket: 0,
    totalUnits: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-border/40">
        <div>
          <h1 className="text-2xl font-bold font-display text-content flex items-center gap-2.5">
            <FiTrendingUp className="text-mauve" />
            <span>Marketing, Métricas y Atribución UTM</span>
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Rendimiento de campañas, eficacia de cupones, atribución multicanal y suscriptores con consentimiento (Ley 25.326).
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-surface border border-brand-border/40 rounded-xl p-1 flex items-center gap-1">
            {DATE_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRange(r.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedRange === r.id
                    ? 'bg-mauve text-white shadow'
                    : 'text-content-secondary hover:text-content hover:bg-surface-elevated'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchMetrics(selectedRange)}
            disabled={loading}
            className="p-2 bg-surface hover:bg-surface-elevated border border-brand-border/40 rounded-xl text-content-secondary hover:text-content transition"
            title="Actualizar datos"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <div className="p-5 rounded-2xl bg-surface border border-brand-border/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-secondary">
              Ingresos Totales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-content mt-2">
            {formatMoney(overview.totalRevenue)}
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Ventas brutas del período seleccionado
          </p>
        </div>

        {/* Pedidos y Unidades */}
        <div className="p-5 rounded-2xl bg-surface border border-brand-border/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-secondary">
              Pedidos Realizados
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-content mt-2 flex items-baseline gap-2">
            <span>{overview.totalOrders}</span>
            <span className="text-xs font-normal text-content-muted">
              ({overview.totalUnits} unidades)
            </span>
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Excluye pedidos cancelados
          </p>
        </div>

        {/* Descuentos Otorgados */}
        <div className="p-5 rounded-2xl bg-surface border border-brand-border/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-secondary">
              Descuentos Otorgados
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FiPercent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-content mt-2">
            {formatMoney(overview.totalDiscounts)}
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Promociones + cupones + transferencias
          </p>
        </div>

        {/* Ticket Promedio */}
        <div className="p-5 rounded-2xl bg-surface border border-brand-border/40 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-secondary">
              Ticket Promedio
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FiTrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-content mt-2">
            {formatMoney(overview.averageTicket)}
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Gasto promedio por cada pedido
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-border/40 flex items-center space-x-1">
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'campaigns'
              ? 'border-mauve text-mauve'
              : 'border-transparent text-content-secondary hover:text-content'
          }`}
        >
          Rendimiento de Campañas ({data?.campaigns?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'coupons'
              ? 'border-mauve text-mauve'
              : 'border-transparent text-content-secondary hover:text-content'
          }`}
        >
          Eficacia de Cupones ({data?.coupons?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attribution')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'attribution'
              ? 'border-mauve text-mauve'
              : 'border-transparent text-content-secondary hover:text-content'
          }`}
        >
          Atribución UTM y Canales
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'subscribers'
              ? 'border-mauve text-mauve'
              : 'border-transparent text-content-secondary hover:text-content'
          }`}
        >
          Newsletter &amp; Suscriptores (Ley 25.326)
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-content flex items-center gap-2">
              <FiLayers className="text-mauve" />
              <span>Métricas individuales por Campaña</span>
            </h2>
            <Link
              to="/admin/campanas"
              className="text-xs text-mauve hover:text-mauve/80 flex items-center gap-1 font-medium"
            >
              <span>Gestionar campañas</span>
              <FiArrowUpRight />
            </Link>
          </div>

          <div className="bg-surface border border-brand-border/40 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-elevated border-b border-brand-border/40 text-content-secondary font-medium">
                    <th className="py-3 px-4">Campaña</th>
                    <th className="py-3 px-3 text-center">Visitas (Landing)</th>
                    <th className="py-3 px-3 text-center">Pedidos</th>
                    <th className="py-3 px-3 text-center">Tasa Conv.</th>
                    <th className="py-3 px-3 text-center">Unidades</th>
                    <th className="py-3 px-3 text-right">Ingresos</th>
                    <th className="py-3 px-3 text-right">Descuentos</th>
                    <th className="py-3 px-3 text-right">Ticket Prom.</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20">
                  {data?.campaigns?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-content-muted">
                        No hay campañas registradas en este período.
                      </td>
                    </tr>
                  ) : (
                    data?.campaigns?.map((camp) => (
                      <tr
                        key={camp.id}
                        className="hover:bg-surface-elevated/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-content">{camp.name}</div>
                          <div className="text-[11px] text-content-muted font-mono flex items-center gap-1.5 mt-0.5">
                            <span>/{camp.slug}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold tracking-wider ${
                                camp.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : camp.status === 'SCHEDULED'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {camp.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="bg-surface-elevated px-2 py-0.5 rounded text-content">
                            {camp.views || 0}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-content">
                          {camp.ordersCount || 0}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-semibold text-mauve">
                            {camp.conversionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-content-secondary">
                          {camp.unitsSold || 0}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-content">
                          {formatMoney(camp.revenue)}
                        </td>
                        <td className="py-3 px-3 text-right text-rose-400 font-mono">
                          {formatMoney(camp.discountsGranted)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-content">
                          {formatMoney(camp.averageTicket)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setShareCampaign(camp)}
                            className="p-1.5 bg-surface-elevated hover:bg-mauve/20 text-mauve rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                            title="Compartir con UTM y Código QR"
                          >
                            <FiShare2 className="w-3.5 h-3.5" />
                            <span>UTM &amp; QR</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-content flex items-center gap-2">
              <FiPercent className="text-mauve" />
              <span>Eficacia y redenciones de Cupones</span>
            </h2>
            <Link
              to="/admin/cupones"
              className="text-xs text-mauve hover:text-mauve/80 flex items-center gap-1 font-medium"
            >
              <span>Gestionar cupones</span>
              <FiArrowUpRight />
            </Link>
          </div>

          <div className="bg-surface border border-brand-border/40 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-elevated border-b border-brand-border/40 text-content-secondary font-medium">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-3">Beneficio</th>
                    <th className="py-3 px-3 text-center">Redenciones</th>
                    <th className="py-3 px-3 text-right">Descuentos Otorgados</th>
                    <th className="py-3 px-3 text-right">Ingresos Generados</th>
                    <th className="py-3 px-3 text-right">Ticket Promedio</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20">
                  {data?.coupons?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-content-muted">
                        No hay cupones registrados.
                      </td>
                    </tr>
                  ) : (
                    data?.coupons?.map((cp) => (
                      <tr
                        key={cp.id}
                        className="hover:bg-surface-elevated/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-mauve bg-mauve/10 border border-mauve/20 px-2 py-0.5 rounded">
                            {cp.code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-content-secondary">
                          {cp.type === 'PERCENT'
                            ? `${cp.value}% OFF`
                            : cp.type === 'FIXED'
                            ? `$${cp.value} OFF`
                            : 'Envío Gratis'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-content">
                          {cp.redemptionsCount || 0}
                        </td>
                        <td className="py-3 px-3 text-right text-rose-400 font-mono">
                          {formatMoney(cp.totalDiscountGranted)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-content">
                          {formatMoney(cp.totalRevenueGenerated)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-content">
                          {formatMoney(cp.averageTicket)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              cp.active
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {cp.active ? 'Activo' : 'Pausado'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. UTM ATTRIBUTION TAB */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Source */}
            <div className="bg-surface border border-brand-border/40 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-content flex items-center justify-between">
                <span>Por Canal de Origen (utm_source)</span>
                <span className="text-[10px] text-content-muted font-mono">1ra visita</span>
              </h3>
              <div className="space-y-2.5">
                {data?.utmAttribution?.bySource?.length === 0 ? (
                  <p className="text-xs text-content-muted py-4 text-center">
                    Sin datos en el período
                  </p>
                ) : (
                  data?.utmAttribution?.bySource?.map((src) => (
                    <div
                      key={src.source}
                      className="p-2.5 rounded-xl bg-surface-elevated/50 border border-brand-border/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-content capitalize flex items-center gap-1.5">
                          {src.source === 'instagram' && (
                            <FaInstagram className="text-pink-400" />
                          )}
                          {src.source === 'whatsapp' && (
                            <FaWhatsapp className="text-emerald-400" />
                          )}
                          {src.source === 'facebook' && (
                            <FaFacebook className="text-blue-400" />
                          )}
                          <span>{src.source}</span>
                        </div>
                        <div className="text-[11px] text-content-muted">
                          {src.orders} pedidos &bull; Ticket {formatMoney(src.averageTicket)}
                        </div>
                      </div>
                      <div className="text-right font-bold text-xs text-content">
                        {formatMoney(src.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* By Campaign */}
            <div className="bg-surface border border-brand-border/40 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-content flex items-center justify-between">
                <span>Por Campaña (utm_campaign)</span>
                <span className="text-[10px] text-content-muted font-mono">Pedidos</span>
              </h3>
              <div className="space-y-2.5">
                {data?.utmAttribution?.byCampaign?.length === 0 ? (
                  <p className="text-xs text-content-muted py-4 text-center">
                    Sin datos en el período
                  </p>
                ) : (
                  data?.utmAttribution?.byCampaign?.map((cmp) => (
                    <div
                      key={cmp.campaign}
                      className="p-2.5 rounded-xl bg-surface-elevated/50 border border-brand-border/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-content font-mono">
                          {cmp.campaign}
                        </div>
                        <div className="text-[11px] text-content-muted">
                          {cmp.orders} pedidos atribuidos
                        </div>
                      </div>
                      <div className="text-right font-bold text-xs text-content">
                        {formatMoney(cmp.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* By Medium */}
            <div className="bg-surface border border-brand-border/40 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-content flex items-center justify-between">
                <span>Por Medio (utm_medium)</span>
                <span className="text-[10px] text-content-muted font-mono">Tipo</span>
              </h3>
              <div className="space-y-2.5">
                {data?.utmAttribution?.byMedium?.length === 0 ? (
                  <p className="text-xs text-content-muted py-4 text-center">
                    Sin datos en el período
                  </p>
                ) : (
                  data?.utmAttribution?.byMedium?.map((med) => (
                    <div
                      key={med.medium}
                      className="p-2.5 rounded-xl bg-surface-elevated/50 border border-brand-border/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-xs text-content font-mono">
                          {med.medium}
                        </div>
                        <div className="text-[11px] text-content-muted">
                          {med.orders} pedidos
                        </div>
                      </div>
                      <div className="text-right font-bold text-xs text-content">
                        {formatMoney(med.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. NEWSLETTER & SUBSCRIBERS TAB */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-content flex items-center gap-2">
                <FiUsers className="text-mauve" />
                <span>Suscriptores al Newsletter (Conformidad Ley 25.326)</span>
              </h2>
              <p className="text-xs text-content-secondary mt-0.5">
                Base de suscriptores con consentimiento explícito, fecha de otorgamiento y estado de vigencia.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exportingCsv || subscribers.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs flex-shrink-0"
            >
              <FiDownload className="w-4 h-4" />
              <span>{exportingCsv ? 'Exportando...' : 'Exportar CSV'}</span>
            </button>
          </div>

          <div className="bg-surface border border-brand-border/40 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-elevated border-b border-brand-border/40 text-content-secondary font-medium">
                    <th className="py-3 px-4">Correo Electrónico</th>
                    <th className="py-3 px-3 text-center">Consentimiento Ley 25.326</th>
                    <th className="py-3 px-3 text-center">Fecha Consentimiento</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Fecha de Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20">
                  {subsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-content-muted">
                        Cargando suscriptores...
                      </td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-content-muted">
                        No hay suscriptores registrados aún.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-surface-elevated/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-content">
                          {sub.email}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Explícito</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-content-secondary">
                          {formatDate(sub.consentDate || sub.createdAt)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              sub.active !== false
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {sub.active !== false ? 'Activo' : 'Baja'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-content-muted">
                          {formatDate(sub.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Share & QR Modal */}
      {shareCampaign && (
        <CampaignShareModal
          campaign={shareCampaign}
          isOpen={Boolean(shareCampaign)}
          onClose={() => setShareCampaign(null)}
        />
      )}
    </div>
  );
}
