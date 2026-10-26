import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  FiSettings,
  FiTruck,
  FiPercent,
  FiClock,
  FiFileText,
  FiSave,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';

const DEFAULT_SETTINGS = {
  shippingCost: 4500,
  freeShippingThreshold: 45000,
  freePickupEnabled: true,
  transferDiscountPercent: 10,
  transferDiscountEnabled: true,
  priceHistoryDays: 30,
  generalTermsText: 'Envíos 100% discretos en empaque neutro sin identificación del contenido.',
  shippingNoticeText: 'Envío gratis a todo el país superando el monto mínimo de compra.',
  bankTransferInstructions: 'Transferencia bancaria. Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp.',
};

const SettingsPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await client.get('/settings');
      if (res.data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data,
        });
      }
    } catch (err) {
      console.warn('Error al cargar configuración:', err);
      setErrorMessage('No se pudo cargar la configuración remota. Mostrando valores locales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSuccessMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        shippingCost: Math.max(0, Math.round(Number(settings.shippingCost) || 0)),
        freeShippingThreshold: Math.max(0, Math.round(Number(settings.freeShippingThreshold) || 0)),
        freePickupEnabled: Boolean(settings.freePickupEnabled),
        transferDiscountPercent: Math.max(0, Math.min(100, Math.round(Number(settings.transferDiscountPercent) || 0))),
        transferDiscountEnabled: Boolean(settings.transferDiscountEnabled),
        priceHistoryDays: Math.max(1, Math.round(Number(settings.priceHistoryDays) || 30)),
        generalTermsText: settings.generalTermsText || '',
        shippingNoticeText: settings.shippingNoticeText || '',
        bankTransferInstructions: settings.bankTransferInstructions || '',
      };

      const res = await client.put('/settings', payload);
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
      setSuccessMessage('¡Configuración de la tienda guardada exitosamente!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setErrorMessage(err.response?.data?.error || err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseás restaurar los valores de configuración por defecto?')) {
      setSettings(DEFAULT_SETTINGS);
      setSuccessMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FiRefreshCw className="w-8 h-8 text-mauve animate-spin mb-3" />
        <p className="text-sm text-content-muted">Cargando configuración de la tienda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/30 pb-6">
        <div>
          <h1 className="text-2xl font-serif text-content flex items-center gap-2.5">
            <FiSettings className="text-mauve" />
            Configuración de la Tienda
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Administrá valores dinámicos de envíos, métodos de pago, reglas legales de precios y condiciones generales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content bg-canvas border border-brand-border/40 hover:border-brand-border rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Restaurar Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-surface-950 bg-mauve hover:bg-mauve-light rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FiSave className="w-3.5 h-3.5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
          <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sección 1: Envíos y Logística */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-900/60 border border-brand-border/30 backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border/20">
            <FiTruck className="text-mauve w-5 h-5" />
            <h2 className="text-base font-semibold text-content">Envíos y Logística</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Costo base de envío */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Costo Base de Envío a Domicilio ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-content-muted">$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={settings.shippingCost}
                  onChange={(e) => handleChange('shippingCost', e.target.value)}
                  className="w-full bg-canvas border border-brand-border/40 rounded-lg pl-7 pr-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  required
                />
              </div>
              <p className="text-[11px] text-content-muted mt-1">
                Costo estándar aplicado a envíos cuando no se califica para envío gratis.
              </p>
            </div>

            {/* Umbral de envío gratis */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Monto Mínimo para Envío Gratis ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-content-muted">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                  className="w-full bg-canvas border border-brand-border/40 rounded-lg pl-7 pr-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  required
                />
              </div>
              <p className="text-[11px] text-content-muted mt-1">
                A partir de este subtotal de productos el costo de envío se bonifica automáticamente.
              </p>
            </div>

            {/* Retiro en local */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Retiro en Local Gratuito
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleChange('freePickupEnabled', !settings.freePickupEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.freePickupEnabled ? 'bg-mauve' : 'bg-surface-800'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      settings.freePickupEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs text-content">
                  {settings.freePickupEnabled ? 'Habilitado ($0 costo)' : 'Deshabilitado'}
                </span>
              </div>
              <p className="text-[11px] text-content-muted mt-1.5">
                Permite a los clientes elegir retiro en punto de entrega sin costo.
              </p>
            </div>
          </div>
        </div>

        {/* Sección 2: Métodos de Pago y Bonificaciones */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-900/60 border border-brand-border/30 backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border/20">
            <FiPercent className="text-mauve w-5 h-5" />
            <h2 className="text-base font-semibold text-content">Descuento por Transferencia Bancaria</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Activar/Desactivar descuento */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Estado del Descuento por Transferencia
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleChange('transferDiscountEnabled', !settings.transferDiscountEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.transferDiscountEnabled ? 'bg-emerald-600' : 'bg-surface-800'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      settings.transferDiscountEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-content">
                  {settings.transferDiscountEnabled ? 'Activo' : 'Desactivado'}
                </span>
              </div>
              <p className="text-[11px] text-content-muted mt-1.5">
                Si está desactivado, el total por transferencia coincidirá con el precio regular sin bonificación.
              </p>
            </div>

            {/* Porcentaje de descuento */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Porcentaje de Bonificación (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.transferDiscountPercent}
                  onChange={(e) => handleChange('transferDiscountPercent', e.target.value)}
                  disabled={!settings.transferDiscountEnabled}
                  className="w-full bg-canvas border border-brand-border/40 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve disabled:opacity-50"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-content-muted font-bold">%</span>
              </div>
              <p className="text-[11px] text-content-muted mt-1">
                Regla de cálculo: se aplica ÚNICAMENTE sobre el subtotal de productos (no sobre el costo de envío).
              </p>
            </div>
          </div>
        </div>

        {/* Sección 3: Honestidad de Precios e Historial Legal */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-900/60 border border-brand-border/30 backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border/20">
            <FiClock className="text-mauve w-5 h-5" />
            <h2 className="text-base font-semibold text-content">Reglas Legales de Precios e Historial</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1.5">
              Días Mínimos Requeridos en Historial de Precios (Defensa del Consumidor)
            </label>
            <div className="w-full sm:w-1/2">
              <input
                type="number"
                min="1"
                max="365"
                value={settings.priceHistoryDays}
                onChange={(e) => handleChange('priceHistoryDays', e.target.value)}
                className="w-full bg-canvas border border-brand-border/40 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                required
              />
            </div>
            <p className="text-[11px] text-content-muted mt-1.5">
              Período de referencia legal (default 30 días). El precio tachado ('antes') solo se muestra al cliente si el producto o variante tiene un registro fehaciente en el historial de precios que comprueba que ese precio regular estuvo vigente durante al menos este período.
            </p>
          </div>
        </div>

        {/* Sección 4: Textos y Condiciones Generales */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-900/60 border border-brand-border/30 backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border/20">
            <FiFileText className="text-mauve w-5 h-5" />
            <h2 className="text-base font-semibold text-content">Textos Informativos y Condiciones</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Texto de Condiciones Generales y Discreción
              </label>
              <textarea
                rows={3}
                value={settings.generalTermsText || ''}
                onChange={(e) => handleChange('generalTermsText', e.target.value)}
                className="w-full bg-canvas border border-brand-border/40 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                placeholder="Envíos 100% discretos en empaque neutro sin identificación..."
              />
              <p className="text-[11px] text-content-muted mt-1">
                Visible en el pie de página, carrito y pantalla de confirmación de pedido.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Aviso de Envíos
              </label>
              <textarea
                rows={2}
                value={settings.shippingNoticeText || ''}
                onChange={(e) => handleChange('shippingNoticeText', e.target.value)}
                className="w-full bg-canvas border border-brand-border/40 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                placeholder="Envío gratis a todo el país superando..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Instrucciones para Transferencia Bancaria
              </label>
              <textarea
                rows={2}
                value={settings.bankTransferInstructions || ''}
                onChange={(e) => handleChange('bankTransferInstructions', e.target.value)}
                className="w-full bg-canvas border border-brand-border/40 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                placeholder="Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp..."
              />
            </div>
          </div>
        </div>

        {/* Botón flotante o inferior para guardar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-surface-950 bg-mauve hover:bg-mauve-light rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Guardando configuración...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
