import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiTag,
  FiRefreshCw,
  FiAlertTriangle,
  FiPercent,
  FiDollarSign,
  FiTruck,
  FiCopy,
} from 'react-icons/fi';
import client from '../../api/client';

const getRandomCode = () => {
  const prefixes = ['NOCTURNA', 'VIP', 'HOT', 'DESEO', 'PLACER', 'SECRETO', 'BIENVENIDA'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randNum}`;
};

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modal Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    kind: 'PERCENT',
    value: 10,
    minOrderAmount: '',
    maxDiscountAmount: '',
    startsAt: '',
    endsAt: '',
    usageLimitTotal: '',
    usageLimitPerCustomer: 1,
    active: true,
    stackableWithPromotions: false,
  });

  const [errorMsg, setErrorMsg] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await client.get('/coupons', {
        params: { search, active: activeFilter },
      });
      setCoupons(res.data || []);
    } catch (err) {
      console.error('Error cargando cupones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [search, activeFilter]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: getRandomCode(),
      kind: 'PERCENT',
      value: 10,
      minOrderAmount: '',
      maxDiscountAmount: '',
      startsAt: '',
      endsAt: '',
      usageLimitTotal: '',
      usageLimitPerCustomer: 1,
      active: true,
      stackableWithPromotions: false,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      kind: c.kind,
      value: c.value,
      minOrderAmount: c.minOrderAmount != null ? c.minOrderAmount : '',
      maxDiscountAmount: c.maxDiscountAmount != null ? c.maxDiscountAmount : '',
      startsAt: c.startsAt ? new Date(c.startsAt).toISOString().split('T')[0] : '',
      endsAt: c.endsAt ? new Date(c.endsAt).toISOString().split('T')[0] : '',
      usageLimitTotal: c.usageLimitTotal != null ? c.usageLimitTotal : '',
      usageLimitPerCustomer: c.usageLimitPerCustomer != null ? c.usageLimitPerCustomer : '',
      active: c.active !== false,
      stackableWithPromotions: Boolean(c.stackableWithPromotions),
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.code.trim()) {
      setErrorMsg('El código es requerido');
      return;
    }

    if (formData.kind === 'PERCENT' && (formData.value <= 0 || formData.value > 100)) {
      setErrorMsg('El porcentaje de descuento debe estar entre 1 y 100%');
      return;
    }

    if (formData.startsAt && formData.endsAt) {
      if (new Date(formData.endsAt).getTime() <= new Date(formData.startsAt).getTime()) {
        setErrorMsg('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }
    }

    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      value: Number(formData.value || 0),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      usageLimitTotal: formData.usageLimitTotal ? Number(formData.usageLimitTotal) : null,
      usageLimitPerCustomer: formData.usageLimitPerCustomer ? Number(formData.usageLimitPerCustomer) : null,
      startsAt: formData.startsAt || null,
      endsAt: formData.endsAt || null,
    };

    try {
      if (editingCoupon) {
        await client.put(`/coupons/${editingCoupon.id}`, payload);
      } else {
        await client.post('/coupons', payload);
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al guardar cupón');
    }
  };

  const handleToggle = async (id) => {
    try {
      await client.patch(`/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar estado del cupón');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este cupón?')) return;
    try {
      await client.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar cupón');
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await client.get('/coupons/export/csv', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cupones-nocturna-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exportando cupones a CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-content">Cupones de Descuento</h1>
          <p className="text-xs text-content-secondary mt-1">
            Administración de códigos promocionales, límites de canje por cliente y reportes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-surface-elevated hover:bg-brand text-content-secondary hover:text-content rounded-xl text-xs font-semibold border border-brand-border/30 transition-colors"
            title="Exportar a CSV"
          >
            <FiDownload size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand text-content rounded-xl text-xs font-bold hover:bg-brand/90 transition-colors shadow-sm border border-mauve/40"
          >
            <FiPlus size={16} />
            <span>Nuevo Cupón</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-brand-border/20">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === ''
                ? 'bg-brand text-content border border-mauve/40'
                : 'bg-surface-elevated text-content-secondary hover:text-content'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('true')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'true'
                ? 'bg-brand text-content border border-mauve/40'
                : 'bg-surface-elevated text-content-secondary hover:text-content'
            }`}
          >
            Activos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('false')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === 'false'
                ? 'bg-brand text-content border border-mauve/40'
                : 'bg-surface-elevated text-content-secondary hover:text-content'
            }`}
          >
            Inactivos
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-2.5 text-content-muted" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código de cupón..."
            className="w-full bg-canvas border border-brand-border/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-content focus:outline-none focus:border-mauve"
          />
        </div>
      </div>

      {/* Tabla de Cupones */}
      <div className="bg-surface rounded-xl border border-brand-border/25 overflow-hidden shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-content-muted">
            <FiRefreshCw className="animate-spin h-5 w-5 mx-auto mb-2 text-mauve" />
            <p className="text-xs">Cargando cupones...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-content-muted">
            <FiTag className="mx-auto h-8 w-8 mb-2 opacity-40 text-mauve" />
            <p className="text-xs">No se encontraron cupones.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-content-secondary">
              <thead className="bg-canvas border-b border-brand-border/20 uppercase text-[10px] tracking-wider text-content-muted">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Beneficio</th>
                  <th className="py-3 px-4">Condición</th>
                  <th className="py-3 px-4">Usos / Límite</th>
                  <th className="py-3 px-4">Por Cliente</th>
                  <th className="py-3 px-4">Acumulable</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/15">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-content">
                      <span className="px-2 py-1 rounded bg-canvas border border-brand-border/35 text-mauve">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-content font-medium">
                      {c.kind === 'PERCENT' && `${c.value}% OFF`}
                      {c.kind === 'FIXED_AMOUNT' && `$${Number(c.value).toLocaleString('es-AR')} OFF`}
                      {c.kind === 'FREE_SHIPPING' && 'Envío Gratis'}
                    </td>
                    <td className="py-3 px-4">
                      {c.minOrderAmount
                        ? `Mín. $${Number(c.minOrderAmount).toLocaleString('es-AR')}`
                        : 'Sin mínimo'}
                      {c.maxDiscountAmount && (
                        <span className="block text-[10px] text-content-muted">
                          Tope: ${Number(c.maxDiscountAmount).toLocaleString('es-AR')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-content">{c.usedCount || 0}</span>
                      <span className="text-content-muted">
                        {' '}
                        / {c.usageLimitTotal != null ? c.usageLimitTotal : '∞'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.usageLimitPerCustomer != null ? `${c.usageLimitPerCustomer} por cliente` : 'Ilimitado'}
                    </td>
                    <td className="py-3 px-4">
                      {c.stackableWithPromotions ? (
                        <span className="text-emerald-400 font-medium">Sí</span>
                      ) : (
                        <span className="text-content-muted">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(c.id)}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          c.active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        <span>{c.active ? 'Activo' : 'Pausado'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded hover:bg-brand/50 text-content-secondary hover:text-content transition-colors"
                          title="Editar cupón"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded hover:bg-rose-950/40 text-content-muted hover:text-rose-400 transition-colors"
                          title="Eliminar cupón"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-surface border border-brand-border/40 rounded-2xl max-w-lg w-full p-6 text-content space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border/20 pb-3">
              <h3 className="text-lg font-bold font-display text-content">
                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón de Descuento'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-content-secondary hover:text-content p-1"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Código con botón random */}
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Código de Cupón *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ej: BIENVENIDA10"
                    className="flex-1 bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content font-mono font-bold focus:outline-none focus:border-mauve uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, code: getRandomCode() })}
                    className="px-3 py-2 bg-surface-elevated hover:bg-brand text-content-secondary hover:text-content text-xs font-medium rounded-lg border border-brand-border/30 transition-colors shrink-0"
                    title="Generar código aleatorio"
                  >
                    Aleatorio
                  </button>
                </div>
              </div>

              {/* Tipo de Beneficio */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'PERCENT', label: '% Porcentaje', icon: FiPercent },
                  { id: 'FIXED_AMOUNT', label: '$ Monto Fijo', icon: FiDollarSign },
                  { id: 'FREE_SHIPPING', label: 'Envío Gratis', icon: FiTruck },
                ].map((k) => {
                  const Icon = k.icon;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, kind: k.id })}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        formData.kind === k.id
                          ? 'bg-brand/50 border-mauve text-content'
                          : 'bg-canvas border-brand-border/25 text-content-secondary hover:text-content'
                      }`}
                    >
                      <Icon className="mx-auto mb-1" size={14} />
                      <span className="text-xs font-semibold">{k.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Valor (si no es free shipping) */}
              {formData.kind !== 'FREE_SHIPPING' && (
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    {formData.kind === 'PERCENT' ? 'Porcentaje de Descuento (%)' : 'Monto de Descuento ($)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.kind === 'PERCENT' ? '100' : undefined}
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  />
                </div>
              )}

              {/* Mínimo y Tope */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Monto Mínimo de Compra ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="Sin mínimo"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Tope Máximo de Descuento ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Sin tope"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>
              </div>

              {/* Límites de uso */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Límite de Usos Totales
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimitTotal}
                    onChange={(e) => setFormData({ ...formData, usageLimitTotal: e.target.value })}
                    placeholder="Ilimitado"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Límite por Cliente (email/tel)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimitPerCustomer}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerCustomer: e.target.value })}
                    placeholder="1 uso por persona"
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>
              </div>

              {/* Fechas de vigencia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Vigente Desde
                  </label>
                  <input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Vigente Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  />
                </div>
              </div>

              {/* Acumulable */}
              <div className="pt-1">
                <label className="flex items-center space-x-2 text-xs text-content cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stackableWithPromotions}
                    onChange={(e) => setFormData({ ...formData, stackableWithPromotions: e.target.checked })}
                    className="rounded bg-canvas border-brand-border/40 text-brand focus:ring-mauve"
                  />
                  <span>Acumulable con otras promociones activas de la tienda</span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
                  <FiAlertTriangle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-brand-border/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-surface-elevated hover:bg-surface text-content rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand text-content hover:bg-brand/90 rounded-lg text-xs font-bold border border-mauve/40 shadow-sm"
                >
                  {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
