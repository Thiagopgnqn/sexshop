import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import themeConfig from '../config/theme';
import {
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiFileText,
  FiArrowLeft,
  FiTag,
  FiPercent,
  FiCheckCircle,
} from 'react-icons/fi';

const LegalPage = () => {
  useSEO({
    title: `Información Legal, Privacidad y Envíos | ${themeConfig.brand.name}`,
    description:
      'Políticas de envío 100% discreto, privacidad, cambios y términos y condiciones de Nocturna SexShop en Córdoba, Argentina.',
  });

  return (
    <div className="bg-canvas min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-xs text-content-secondary hover:text-content mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-1.5" />
            Volver al inicio
          </Link>
          <span className="block text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
            Transparencia &amp; Confidencialidad
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-light uppercase tracking-widest text-content mt-1">
            Políticas, Privacidad y Términos
          </h1>
        </div>

        {/* 1. Sobre Nosotros */}
        <section id="nosotros" className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20 space-y-3">
          <h2 className="font-display text-base uppercase tracking-widest text-content">
            Sobre Nocturna SexShop
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Nocturna SexShop es una boutique íntima online con base en {themeConfig.contact.city}. Seleccionamos juguetes íntimos, geles sensoriales, cosmética erótica, lencería y juegos para adultos priorizando calidad de materiales, seguridad corporal y una atención cercana y respetuosa.
          </p>
          <div className="pt-2 text-xs text-content-muted space-y-1">
            <p><strong className="text-content">WhatsApp de atención:</strong> {themeConfig.contact.phoneDisplay}</p>
            <p><strong className="text-content">Correo electrónico:</strong> {themeConfig.contact.email}</p>
            <p><strong className="text-content">Horarios de atención:</strong> {themeConfig.contact.schedule}</p>
            <p><strong className="text-content">Zona de cobertura:</strong> {themeConfig.contact.deliveryZone}</p>
            <p><strong className="text-content">Titular / Razón Social:</strong> {themeConfig.contact.legalName}</p>
          </div>
        </section>

        {/* 2. Envío y Empaque 100% Discreto */}
        <section id="envios" className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20 space-y-3">
          <div className="flex items-center gap-2.5">
            <FiTruck className="text-mauve text-lg" />
            <h2 className="font-display text-base uppercase tracking-widest text-content">
              Envíos y Empaque 100% Discreto
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content font-medium">
            {themeConfig.legal.discreetNotice}
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Todos nuestros pedidos se embalan en cajas o sobres cerrados de color neutro, sin logotipos, sin cintas publicitarias y sin ninguna mención a &ldquo;sexshop&rdquo; ni al tipo de producto en el rótulo de envío. Tampoco exigimos monto ni cantidad mínima de compra.
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Realizamos entregas mediante cadetería privada en {themeConfig.contact.deliveryZone} y coordinamos retiros previamente acordados por WhatsApp en {themeConfig.contact.city}.
          </p>
        </section>

        {/* 3. Política de Cambios e Higiene */}
        <section id="cambios" className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20 space-y-3">
          <div className="flex items-center gap-2.5">
            <FiRefreshCw className="text-mauve text-lg" />
            <h2 className="font-display text-base uppercase tracking-widest text-content">
              Política de Cambios y Garantía
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content font-medium">
            {themeConfig.legal.returnsPolicyNotice}
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Por estrictas razones de salud, bioseguridad e higiene, los juguetes íntimos, lencería, lubricantes y cosmética no admiten cambios ni devoluciones una vez abierto su empaque o retirado su precinto de seguridad.
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            En caso de que un dispositivo electrónico presente una falla de funcionamiento de fábrica al momento de recibirlo, contás con cobertura para su revisión y reemplazo comunicándote por WhatsApp al {themeConfig.contact.phoneDisplay}.
          </p>
        </section>

        {/* 4. Privacidad y Protección de Datos */}
        <section id="privacidad" className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20 space-y-3">
          <div className="flex items-center gap-2.5">
            <FiShield className="text-mauve text-lg" />
            <h2 className="font-display text-base uppercase tracking-widest text-content">
              Política de Privacidad
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Los datos de contacto y entrega proporcionados durante el checkout se utilizan exclusivamente para procesar tu pedido y coordinar la entrega por WhatsApp. No compartimos, vendemos ni cedemos información personal a terceros. Las herramientas analíticas del sitio registran únicamente identificadores técnicos anónimos sin exponer nombres ni categorías de productos.
          </p>
        </section>

        {/* 5. Términos y Condiciones (+18) */}
        <section id="terminos" className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20 space-y-3">
          <div className="flex items-center gap-2.5">
            <FiFileText className="text-mauve text-lg" />
            <h2 className="font-display text-base uppercase tracking-widest text-content">
              Términos y Condiciones de Uso (+18)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            {themeConfig.legal.ageDisclaimer} Al navegar y realizar pedidos en este sitio declarás bajo tu responsabilidad ser mayor de 18 años. Los precios expresados en pesos argentinos (ARS) pueden actualizarse sin previo aviso, respetándose el valor confirmado al momento de cerrar la orden por WhatsApp.
          </p>
        </section>

        {/* 6. Términos de Promociones, Campañas y Cupones */}
        <section id="promociones" className="bg-surface p-6 sm:p-8 rounded-lg border border-brand-border/20 space-y-4">
          <div className="flex items-center gap-2.5">
            <FiTag className="text-mauve text-lg" />
            <h2 className="font-display text-base uppercase tracking-widest text-content">
              Términos y Condiciones de Promociones, Campañas y Cupones
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-content-secondary space-y-3 leading-relaxed">
            <div>
              <h3 className="font-semibold text-content mb-1">
                Transparencia, Honestidad y Veracidad de Precios
              </h3>
              <p>
                En Nocturna SexShop cumplimos estrictamente con la normativa vigente en materia de transparencia comercial y defensa del consumidor. Queda terminantemente prohibido el uso de precios tachados artificiales o descuentos engañosos. El precio de referencia tachado (&ldquo;antes $X&rdquo;) únicamente se exhibe en el sitio si coincide fehacientemente con el precio que dicho producto o variante tuvo vigente en el sistema durante los últimos 30 (treinta) días corridos. Si un artículo en oferta no cuenta con dicho antecedente histórico comprobable, se exhibe únicamente el precio final a pagar junto a la etiqueta informativa de la promoción.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-content mb-1">
                Vigencia y Disponibilidad de Stock
              </h3>
              <p>
                Las promociones, descuentos porcentuales, combos especiales y campañas temporales rigen exclusivamente durante el período de fechas indicado en cada ficha o hasta agotar el stock real disponible asignado a la promoción. Los indicadores de disponibilidad (&ldquo;Últimas unidades&rdquo;) reflejan stock físico real de nuestra tienda y no contadores ficticios.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-content mb-1">
                Cupones de Descuento y Acumulabilidad
              </h3>
              <p>
                Los cupones de descuento no son acumulables entre sí en un mismo pedido y no pueden canjearse por dinero en efectivo. Aquellos cupones que posean límite de uso por cliente se restringen a un único uso por persona, validado mediante correo electrónico o teléfono. En cupones con requisito de compra mínima, dicho umbral se computa sobre el subtotal resultante tras aplicar descuentos automáticos por ítem.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-content mb-1">
                Bonificación por Transferencia Bancaria
              </h3>
              <p>
                Ofrecemos una bonificación directa del 10% (diez por ciento) sobre el total del pedido al abonar mediante transferencia bancaria inmediata (CBU, CVU o Alias informado por WhatsApp al confirmar la orden).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-content mb-1">
                Envío Bonificado a Domicilio
              </h3>
              <p>
                Las compras cuyo importe alcance o supere los $50.000 (cincuenta mil pesos argentinos) acceden a envío bonificado sin costo a domicilio en la ciudad de Córdoba y zonas de cobertura habitual.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LegalPage;
