import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import ProductGrid from '../components/catalog/ProductGrid';
import Button from '../components/ui/Button';
import useSEO from '../hooks/useSEO';
import {
  FiArrowRight,
  FiShield,
  FiLock,
  FiMessageCircle,
  FiEyeOff,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import themeConfig from '../config/theme';

const CategoryLineIcon = ({ id }) => {
  switch (id) {
    case 'juguetes':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-mauve stroke-current" strokeWidth="1.2">
          <path d="M32 10C24 22 20 30 20 39a12 12 0 0024 0c0-9-4-17-12-29z" />
          <circle cx="32" cy="40" r="3" />
        </svg>
      );
    case 'lubricantes':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-mauve stroke-current" strokeWidth="1.2">
          <rect x="23" y="22" width="18" height="30" rx="4" />
          <path d="M27 22v-6h10v6M29 16v-4h6v4" />
          <line x1="23" y1="34" x2="41" y2="34" />
        </svg>
      );
    case 'lenceria':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-mauve stroke-current" strokeWidth="1.2">
          <path d="M20 14v12c0 6 5 11 12 14 7-3 12-8 12-14V14" />
          <path d="M18 44c4-4 24-4 28 0l-4 8H22l-4-8z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-mauve stroke-current" strokeWidth="1.2">
          <rect x="16" y="18" width="22" height="30" rx="2" />
          <path d="M26 14h22v30" />
          <circle cx="27" cy="33" r="3" />
        </svg>
      );
  }
};

const HomePage = () => {
  const { products, loading, fetchProducts } = useProducts();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useSEO({
    title: 'Nocturna Sexshop — Tienda online en Córdoba | Envíos discretos',
    description: themeConfig.brand.description,
  });

  useEffect(() => {
    fetchProducts({ limit: 8 });
  }, [fetchProducts]);

  return (
    <div className="space-y-0">
      {/* 1. Hero — Boutique Íntima Nocturna con textura humo bordó en CSS */}
      <section className="relative min-h-[76vh] sm:min-h-[82vh] flex items-center smoke-texture border-b border-brand-border/20 overflow-hidden">
        {/* Líneas arquitectónicas sutiles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="max-w-7xl mx-auto h-full border-x border-brand-border/15" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-2xl">
            <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-mauve font-medium mb-5">
              Córdoba, Argentina &bull; Boutique Íntima Online
            </span>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-light uppercase tracking-[0.14em] text-content mb-6 leading-[1.12]">
              Intimidad, <br />
              diseño y placer <br />
              <span className="text-mauve">sin tabúes.</span>
            </h1>

            <p className="text-sm sm:text-base text-content-secondary mb-10 font-normal leading-relaxed max-w-xl">
              Una selección curada de bienestar íntimo, cosmética sensorial y lencería.
              Comprá con total reserva desde tu casa: envíos 100% discretos en Córdoba y atención personalizada por WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link to="/catalogo">
                <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-3.5">
                  <span>Explorar Colección</span>
                  <FiArrowRight className="ml-2.5" />
                </Button>
              </Link>
              <a
                href={`https://wa.me/${themeConfig.contact.whatsapp}?text=${encodeURIComponent(
                  themeConfig.contact.whatsappDefaultMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-7 py-3.5">
                  <FaWhatsapp className="mr-2 text-mauve text-base" />
                  <span>Asesoramiento Privado</span>
                </Button>
              </a>
            </div>

            <div className="mt-12 pt-6 border-t border-brand-border/20 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-content-muted">
              <span className="inline-flex items-center gap-2">
                <FiEyeOff className="text-mauve" />
                Empaque neutro sin logos
              </span>
              <span className="inline-flex items-center gap-2">
                <FiShield className="text-mauve" />
                Sin mínimo de compra
              </span>
              <span className="inline-flex items-center gap-2">
                <FiLock className="text-mauve" />
                Atención confidencial
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categorías Destacadas (Placeholders oscuros elegantes en CSS + íconos lineales) */}
      <section className="py-20 sm:py-24 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b border-brand-border/20">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
                Universo Nocturna
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
                Categorías Destacadas
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="mt-3 sm:mt-0 text-xs font-medium uppercase tracking-widest text-content-secondary hover:text-content inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Ver catálogo completo</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {themeConfig.featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?category=${cat.slug}`}
                className="group flex flex-col border border-brand-border/20 rounded-lg overflow-hidden bg-surface hover:border-mauve/60 transition-smooth"
              >
                <div className="aspect-[4/3] w-full overflow-hidden smoke-card-texture relative flex flex-col items-center justify-center p-6 border-b border-brand-border/15">
                  <div className="w-16 h-16 rounded-full border border-brand-border/25 bg-canvas/50 flex items-center justify-center group-hover:scale-105 group-hover:border-mauve/60 transition-all duration-500">
                    <CategoryLineIcon id={cat.id} />
                  </div>
                  <span className="mt-3 text-[10px] font-display uppercase tracking-[0.25em] text-content-muted">
                    {cat.subtitle}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-base uppercase tracking-wider text-content mb-2 group-hover:text-mauve-light transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-content-secondary leading-relaxed font-normal mb-5 flex-1">
                    {cat.description}
                  </p>
                  <span className="text-xs font-medium uppercase tracking-widest text-mauve inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Explorar</span>
                    <FiArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Productos Destacados */}
      <section className="py-20 sm:py-24 bg-surface/40 border-y border-brand-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b border-brand-border/20">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
                Curaduría
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
                Seleccionados para Vos
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="mt-3 sm:mt-0 text-xs font-medium uppercase tracking-widest text-content-secondary hover:text-content inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Ver todos los productos</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          <ProductGrid products={products.slice(0, 8)} loading={loading} />

          <div className="mt-12 text-center">
            <Link to="/catalogo">
              <Button variant="outline" size="lg" className="px-8">
                Ver las 298 opciones del catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Sobre Nosotros — Propuesta de marca */}
      <section id="nosotros" className="py-20 sm:py-24 smoke-texture border-b border-brand-border/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] text-mauve font-medium mb-3 block">
            Sobre Nocturna
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-light uppercase tracking-widest text-content mb-6 leading-snug">
            Una experiencia íntima pensada desde el respeto, la estética y la confidencialidad.
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary max-w-2xl mx-auto leading-relaxed mb-6">
            Nacimos en Córdoba con una idea clara: que elegir productos para tu placer o el de tu pareja sea tan cómodo, elegante y natural como cualquier otra compra personal. Sin miradas incómodas, sin apuros y con información honesta sobre materiales, cuidados y usos.
          </p>
          <p className="text-xs sm:text-sm text-content-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            Cada pedido se prepara en empaque completamente neutro —sin cintas impresas, logos ni referencias al contenido— y se coordina de forma directa por WhatsApp para que elijas el horario y punto de entrega que mejor te quede.
          </p>
          <Link to="/legal">
            <Button variant="secondary" size="md">
              Conocé nuestras políticas de privacidad y envíos
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. Bloque de Beneficios */}
      <section className="py-16 bg-surface border-b border-brand-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded bg-surface-elevated text-mauve border border-brand-border/25 mt-0.5">
                <FiEyeOff size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs uppercase tracking-widest text-content">
                  Envío 100% Discreto
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Cajas y bolsas cerradas sin logos ni inscripciones externas. Tu privacidad es absoluta.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded bg-surface-elevated text-mauve border border-brand-border/25 mt-0.5">
                <FiLock size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs uppercase tracking-widest text-content">
                  Compra Segura
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Sin mínimo de compra y sin cargar tarjetas en la web. Coordinás el pago directo por WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded bg-surface-elevated text-mauve border border-brand-border/25 mt-0.5">
                <FiMessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs uppercase tracking-widest text-content">
                  Atención por WhatsApp
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Te asesoramos sobre materiales, lubricantes compatibles, talles y modos de uso sin prejuicios.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded bg-surface-elevated text-mauve border border-brand-border/25 mt-0.5">
                <FiShield size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs uppercase tracking-widest text-content">
                  Higiene y Garantía
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Productos sellados y controlados. Garantía ante cualquier falla de funcionamiento de fábrica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Preguntas Frecuentes (FAQ) */}
      <section id="faq" className="py-20 sm:py-24 bg-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
              Dudas Frecuentes
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-2">
              Todo lo que necesitás saber sobre envíos, discreción, pagos y cuidados.
            </p>
          </div>

          <div className="divide-y divide-brand-border/20 border border-brand-border/20 rounded-lg bg-surface overflow-hidden">
            {themeConfig.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-medium text-content hover:bg-surface-elevated/50 transition-colors"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <FiChevronUp className="text-mauve flex-shrink-0 ml-4" />
                    ) : (
                      <FiChevronDown className="text-content-muted flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-content-secondary leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
