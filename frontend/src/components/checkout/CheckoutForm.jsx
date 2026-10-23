import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import Input from '../ui/Input';
import client from '../../api/client';
import { trackPurchase } from '../../utils/metaPixel';
import { formatVariantDescription } from '../../context/CartContext';
import { FaWhatsapp } from 'react-icons/fa';
import { FiCheckCircle, FiLock, FiShield, FiTruck, FiMapPin } from 'react-icons/fi';
import themeConfig from '../../config/theme';

const CheckoutForm = ({ onOrderSuccess }) => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerProvince: 'Córdoba',
    customerCity: 'Córdoba Capital',
    customerPostalCode: '5000',
    customerAddress: '',
    deliveryMethod: 'DELIVERY',
    comments: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        customerEmail: prev.customerEmail || user.email || '',
        customerPhone: prev.customerPhone || user.phone || '',
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDeliveryChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: method,
      customerAddress: method === 'PICKUP' && !prev.customerAddress ? 'Retiro a coordinar' : prev.customerAddress,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      setLoading(false);
      return;
    }

    try {
      const isPickup = formData.deliveryMethod === 'PICKUP';
      const addressText = isPickup
        ? 'Retiro a coordinar por WhatsApp'
        : formData.customerAddress.trim();

      const fullAddress = isPickup
        ? `Retiro en ${formData.customerCity || 'Córdoba'}`
        : [
            addressText,
            formData.customerCity.trim(),
            formData.customerPostalCode.trim() ? `CP ${formData.customerPostalCode.trim()}` : '',
            formData.customerProvince.trim(),
          ]
            .filter(Boolean)
            .join(', ');

      const orderItems = items.map((item) => ({
        productId: item.product.id || item.product._id,
        variantId: item.variant?.id || null,
        variantDescription:
          item.variantDescription || formatVariantDescription(item.variant) || null,
        quantity: item.quantity,
      }));

      const orderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerAddress: fullAddress,
        customerProvince: formData.customerProvince.trim() || 'Córdoba',
        customerCity: formData.customerCity.trim() || 'Córdoba',
        customerPostalCode: formData.customerPostalCode.trim() || '5000',
        deliveryMethod: formData.deliveryMethod,
        comments: formData.comments?.trim() || undefined,
        items: orderItems,
      };

      const res = await client.post('/orders', orderData);
      const link = res.data?.whatsappLink;

      // Meta Pixel Purchase — estrictamente IDs/SKUs numéricos, sin nombres ni categorías
      trackPurchase({
        orderId: res.data?.id,
        items,
        total: cartTotal,
      });

      if (link) {
        setWhatsappUrl(link);
        window.open(link, '_blank');
      }

      if (onOrderSuccess) {
        onOrderSuccess();
      }
      setSuccess(true);
      clearCart();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        'No pudimos registrar el pedido. Revisá los datos ingresados o escribinos por WhatsApp.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 px-6 bg-surface rounded-lg border border-brand-border/25">
        <div className="mx-auto w-12 h-12 bg-emerald-950/60 text-emerald-300 rounded-full flex items-center justify-center mb-4 border border-emerald-800/50">
          <FiCheckCircle size={26} />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
          ¡Pedido Registrado!
        </span>
        <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-content mt-1 mb-2">
          Finalizá la coordinación por WhatsApp
        </h2>
        <p className="text-content-secondary mb-6 max-w-sm mx-auto text-xs sm:text-sm leading-relaxed">
          Ya preparamos el resumen de tu pedido. Hacé clic abajo para enviarlo a nuestro WhatsApp y coordinar el pago y la entrega discreta.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-sm mx-auto">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-brand hover:bg-brand-hover text-content border border-mauve/40 px-5 py-3 rounded-md font-medium text-xs sm:text-sm transition-colors"
            >
              <FaWhatsapp size={18} />
              <span>Abrir WhatsApp Ahora</span>
            </a>
          )}
          <Link
            to="/"
            className="flex items-center justify-center px-5 py-3 rounded-md border border-brand-border/30 text-content-secondary text-xs font-medium hover:bg-surface-elevated hover:text-content transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20 space-y-7"
    >
      {/* Paso 1: Contacto */}
      <div>
        <div className="pb-3 mb-4 border-b border-brand-border/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
              Paso 1
            </span>
            <h2 className="font-display text-base uppercase tracking-widest text-content mt-0.5">
              Datos de Contacto
            </h2>
          </div>
          <span className="text-xs text-content-muted">100% Confidencial</span>
        </div>

        <div className="space-y-4">
          <Input
            label="Nombre o Alias para recibir"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Ej: Carolina P."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Correo Electrónico"
              type="email"
              name="customerEmail"
              required
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="carolina@ejemplo.com"
            />
            <Input
              label="Teléfono / WhatsApp"
              type="tel"
              name="customerPhone"
              required
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="Ej: 351 757 2841"
            />
          </div>
        </div>
      </div>

      {/* Paso 2: Modalidad de entrega */}
      <div className="pt-2">
        <div className="pb-3 mb-4 border-b border-brand-border/15">
          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
            Paso 2
          </span>
          <h2 className="font-display text-base uppercase tracking-widest text-content mt-0.5">
            Modalidad de Entrega
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => handleDeliveryChange('DELIVERY')}
            className={`p-4 rounded-md border text-left transition-all flex items-start gap-3 ${
              formData.deliveryMethod === 'DELIVERY'
                ? 'bg-brand/40 border-mauve text-content'
                : 'bg-canvas border-brand-border/25 text-content-secondary hover:border-mauve/40'
            }`}
          >
            <FiTruck className="text-mauve mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-xs font-medium text-content">Envío Discreto a Domicilio</p>
              <p className="text-[11px] text-content-muted mt-0.5">
                Cadetería en {themeConfig.contact.deliveryZone} y envíos en paquete neutro.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDeliveryChange('PICKUP')}
            className={`p-4 rounded-md border text-left transition-all flex items-start gap-3 ${
              formData.deliveryMethod === 'PICKUP'
                ? 'bg-brand/40 border-mauve text-content'
                : 'bg-canvas border-brand-border/25 text-content-secondary hover:border-mauve/40'
            }`}
          >
            <FiMapPin className="text-mauve mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-xs font-medium text-content">Punto de Retiro Acordado</p>
              <p className="text-[11px] text-content-muted mt-0.5">
                Coordinamos día y horario por WhatsApp en {themeConfig.contact.city}.
              </p>
            </div>
          </button>
        </div>

        {formData.deliveryMethod === 'DELIVERY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Provincia"
                name="customerProvince"
                required
                value={formData.customerProvince}
                onChange={handleChange}
                placeholder="Córdoba"
              />
              <Input
                label="Ciudad / Barrio"
                name="customerCity"
                required
                value={formData.customerCity}
                onChange={handleChange}
                placeholder="Ej: Nueva Córdoba, Córdoba Capital"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Código Postal"
                name="customerPostalCode"
                required
                value={formData.customerPostalCode}
                onChange={handleChange}
                placeholder="Ej: 5000"
              />
              <Input
                label="Calle, Altura y Piso/Depto"
                name="customerAddress"
                required
                value={formData.customerAddress}
                onChange={handleChange}
                placeholder="Ej: Av. Hipólito Yrigoyen 320, 4B"
              />
            </div>
          </div>
        )}
      </div>

      {/* Paso 3: Notas */}
      <div className="pt-2 border-t border-brand-border/15">
        <label className="block text-xs font-medium text-content-secondary mb-1.5 tracking-wide">
          Indicaciones para la entrega o franja horaria preferida (Opcional)
        </label>
        <textarea
          name="comments"
          rows="2"
          value={formData.comments}
          onChange={handleChange}
          className="block w-full rounded-md border border-brand-border/30 bg-surface-elevated text-content text-xs sm:text-sm p-3 focus:outline-none focus:border-mauve focus:ring-1 focus:ring-mauve transition-smooth placeholder:text-content-muted"
          placeholder="Ej: Entregar después de las 18 hs, llamar al llegar..."
        />
      </div>

      {/* Aviso de privacidad */}
      <div className="p-3.5 rounded-md bg-canvas border border-brand-border/20 flex items-start gap-2.5 text-xs text-content-secondary">
        <FiShield className="text-mauve mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-content font-medium">{themeConfig.legal.discreetNotice}</p>
          <p className="text-[11px] text-content-muted mt-0.5">
            {themeConfig.legal.returnsPolicyNotice}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-rose-300 text-xs bg-rose-950/60 p-3 rounded-md border border-rose-800/50 font-medium">
          {error}
        </div>
      )}

      {/* Botón de Confirmación por WhatsApp */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2.5 bg-brand hover:bg-brand-hover active:scale-[0.99] text-content border border-mauve/40 py-3.5 px-6 rounded-md font-medium text-xs sm:text-sm uppercase tracking-wider transition-smooth disabled:opacity-50"
        >
          <FaWhatsapp size={18} />
          <span>{loading ? 'Procesando pedido...' : 'Confirmar Pedido por WhatsApp'}</span>
        </button>
        <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-content-muted mt-3">
          <FiLock className="text-mauve text-[11px]" />
          <span>Sin ingreso de tarjetas en la web &bull; Coordinación privada con Nocturna</span>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;
