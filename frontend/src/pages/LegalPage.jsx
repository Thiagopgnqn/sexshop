import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import themeConfig from '../config/theme';
import { FiShield, FiTruck, FiRefreshCw, FiFileText, FiArrowLeft } from 'react-icons/fi';

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
      </div>
    </div>
  );
};

export default LegalPage;
