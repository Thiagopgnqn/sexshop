import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import ProductGrid from '../components/catalog/ProductGrid';
import Button from '../components/ui/Button';
import useSEO from '../hooks/useSEO';
import { getBrandImage } from '../utils/productImages';
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
    case 'lenceria':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <path d="M20 14v12c0 6 5 11 12 14 7-3 12-8 12-14V14" />
          <path d="M18 44c4-4 24-4 28 0l-4 8H22l-4-8z" />
          <path d="M25 22c3 3 11 3 14 0" strokeOpacity="0.55" />
        </svg>
      );
    case 'cosmetica-intima':
    case 'lubricantes':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <rect x="23" y="23" width="18" height="28" rx="4" />
          <path d="M27 23v-6h10v6M29 17v-4h6v4" />
          <path d="M32 32c-3 4-4 6-4 8a4 4 0 008 0c0-2-1-4-4-8z" />
        </svg>
      );
    case 'dilatadores-consoladores-y-vibradores':
    case 'juguetes':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <path d="M32 11c-7 11-11 19-11 27a11 11 0 0022 0c0-8-4-16-11-27z" />
          <circle cx="32" cy="39" r="3" />
          <path d="M20 22c-3 3-3 8 0 11M44 22c3 3 3 8 0 11" strokeOpacity="0.5" />
        </svg>
      );
    case 'fantasias':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <path d="M12 28c4-8 13-11 20-5 7-6 16-3 20 5-2 10-11 15-20 11-9 4-18-1-20-11z" />
          <ellipse cx="23" cy="29" rx="4" ry="2.5" />
          <ellipse cx="41" cy="29" rx="4" ry="2.5" />
        </svg>
      );
    case 'perfumes-y-feromonas':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <path d="M22 27h20l3 23a3 3 0 01-3 3H22a3 3 0 01-3-3l3-23z" />
          <rect x="28" y="19" width="8" height="8" rx="1" />
          <path d="M30 15h4v4h-4zM36 17h6" />
          <circle cx="46" cy="15" r="1" fill="currentColor" />
          <circle cx="49" cy="19" r="1" fill="currentColor" />
        </svg>
      );
    case 'bdsm-y-arneses':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <circle cx="22" cy="36" r="9" />
          <circle cx="42" cy="36" r="9" />
          <path d="M28 29l4-5 4 5" />
          <circle cx="22" cy="36" r="5" strokeOpacity="0.45" />
          <circle cx="42" cy="36" r="5" strokeOpacity="0.45" />
        </svg>
      );
    case 'anillos-y-estimuladores':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <circle cx="32" cy="36" r="13" />
          <circle cx="32" cy="36" r="7" />
          <path d="M26 23l3-7h6l3 7" />
        </svg>
      );
    case 'juegos':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <rect x="15" y="18" width="21" height="29" rx="2.5" />
          <path d="M27 14h20a2.5 2.5 0 012.5 2.5v26.5" />
          <path d="M25.5 28.5l4 4-4 4-4-4 4-4z" />
        </svg>
      );
    case 'linea-masculina':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <path d="M16 22h32l-3 16c-4 1-8 5-13 9-5-4-9-8-13-9l-3-16z" />
          <line x1="17" y1="27" x2="47" y2="27" strokeOpacity="0.55" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-mauve stroke-current" strokeWidth="1.25">
          <circle cx="32" cy="32" r="14" />
          <circle cx="32" cy="32" r="4" />
        </svg>
      );
  }
};

/**
 * Visual de marca por código (capas translúcidas tipo tela/humo bordó con desenfoque y movimiento lento que respeta prefers-reduced-motion).
 * Se muestra si no existe hero.webp o como respaldo visual.
 */
const HeroBrandVisual = () => (
  <div
    aria-hidden="true"
    className="relative w-full h-full min-h-[320px] rounded-xl overflow-hidden bg-canvas border border-mauve/20 flex items-center justify-center"
  >
    <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-brand/35 blur-3xl animate-silk-drift" />
    <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-surface-elevated/80 blur-3xl animate-silk-drift" />
    <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-mauve/15 blur-2xl animate-silk-drift" />

    <svg
      viewBox="0 0 600 500"
      fill="none"
      className="relative z-10 w-full h-full object-cover opacity-80 animate-silk-drift"
    >
      <defs>
        <linearGradient id="heroSilk1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5A2A2E" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#2B1917" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0F0A0A" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="heroSilk2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#907878" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#5A2A2E" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0F0A0A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M-40,360 C120,210 290,430 460,250 C540,165 600,210 650,140 L650,520 L-40,520 Z"
        fill="url(#heroSilk1)"
      />
      <path
        d="M-60,180 C130,310 310,70 510,220 C570,265 610,230 660,180 L660,520 L-60,520 Z"
        fill="url(#heroSilk2)"
      />
      <path
        d="M60,420 Q280,180 540,320"
        stroke="#907878"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <path
        d="M40,260 Q310,390 560,170"
        stroke="#5A2A2E"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />
    </svg>
  </div>
);

const HomePage = () => {
  const { products, loading, fetchProducts } = useProducts();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [heroImgError, setHeroImgError] = useState(false);
  const [aboutImgError, setAboutImgError] = useState(false);

  const heroImageUrl = getBrandImage('hero') || '/images/brand/hero.webp';
  const heroMobileUrl = getBrandImage('heroMobile') || '/images/brand/hero-mobile.webp';
  const aboutImageUrl = getBrandImage('about');

  useSEO({
    title: 'Nocturna Sexshop — Tienda online en Córdoba | Envíos discretos',
    description: themeConfig.brand.description,
  });

  useEffect(() => {
    fetchProducts({ limit: 6 });
  }, [fetchProducts]);

  return (
    <div className="space-y-0">
      {/* 1. Hero — Calibrado para entrar completo en 1366x768 y 1920x1080 sin scroll */}
      <section className="relative min-h-[480px] lg:min-h-[530px] flex items-center smoke-texture border-b border-brand-border/20 overflow-hidden">
        {/* Fondo en celular: imagen del hero con overlay oscuro para máxima legibilidad sin desplazar botones */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          {!heroImgError && heroImageUrl ? (
            <img
              src={heroMobileUrl || heroImageUrl}
              srcSet={`${heroMobileUrl} 800w, ${heroImageUrl} 1400w`}
              sizes="100vw"
              width="800"
              height="600"
              alt=""
              aria-hidden="true"
              decoding="async"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover opacity-45"
            />
          ) : (
            <div className="w-full h-full opacity-50">
              <HeroBrandVisual />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-canvas/85 via-canvas/80 to-canvas" />
        </div>

        {/* Líneas arquitectónicas sutiles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="max-w-7xl mx-auto h-full border-x border-brand-border/15" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Columna izquierda: Texto y CTAs */}
            <div className="lg:col-span-7 max-w-2xl">
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-mauve font-medium mb-3">
                Córdoba, Argentina &bull; Boutique Íntima Online
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-5xl font-light uppercase tracking-[0.12em] text-content mb-4 leading-[1.14]">
                Intimidad, <br />
                diseño y placer <br />
                <span className="text-mauve">sin tabúes.</span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-[15px] text-content-secondary mb-6 font-normal leading-relaxed max-w-xl">
                Una selección curada de bienestar íntimo, cosmética sensorial y lencería.
                Comprá con total reserva desde tu casa: envíos 100% discretos en Córdoba y atención personalizada por WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link to="/catalogo">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto px-7 py-3">
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
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 py-3">
                    <FaWhatsapp className="mr-2 text-mauve text-base" />
                    <span>Asesoramiento Privado</span>
                  </Button>
                </a>
              </div>

              <div className="mt-7 pt-4 border-t border-brand-border/20 flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] sm:text-xs text-content-muted">
                <span className="inline-flex items-center gap-1.5">
                  <FiEyeOff className="text-mauve" />
                  Empaque neutro sin logos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiShield className="text-mauve" />
                  Sin mínimo de compra
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiLock className="text-mauve" />
                  Atención confidencial
                </span>
              </div>
            </div>

            {/* Columna derecha en escritorio: Fotografía de seda bordó fundida con #0F0A0A o visual de marca */}
            <div className="hidden lg:block lg:col-span-5">
              {!heroImgError && heroImageUrl ? (
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-mauve/20 bg-canvas shadow-2xl">
                  <img
                    src={heroImageUrl}
                    srcSet={`${heroMobileUrl} 800w, ${heroImageUrl} 1400w`}
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    width="1400"
                    height="1050"
                    {...{ fetchpriority: 'high' }}
                    decoding="async"
                    alt="Textura de seda y satén bordó oscuro — Nocturna SexShop"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover"
                  />
                  {/* Degradés suaves para fundir la foto con el fondo #0F0A0A sin cortes duros */}
                  <div
                    aria-hidden="true"
                    className="
                      absolute inset-0 pointer-events-none
                      bg-gradient-to-r from-canvas/90 via-transparent to-canvas/75
                    "
                  />
                  <div
                    aria-hidden="true"
                    className="
                      absolute inset-0 pointer-events-none
                      bg-gradient-to-t from-canvas/85 via-transparent to-canvas/65
                    "
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-3 rounded-lg border border-mauve/15 pointer-events-none"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full">
                  <HeroBrandVisual />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Las 9 Categorías de la Tienda (fondos con textura bordó/humo CSS/SVG e íconos lineales) */}
      <section className="py-16 sm:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-brand-border/20">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
                Universo Nocturna
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
                Categorías de la Colección
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {themeConfig.featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?category=${cat.slug}`}
                className="group flex flex-col border border-brand-border/20 rounded-lg overflow-hidden bg-surface hover:border-mauve/60 transition-smooth"
              >
                <div className="h-36 w-full overflow-hidden smoke-card-texture relative flex flex-col items-center justify-center p-5 border-b border-brand-border/15">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 400 160"
                    fill="none"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
                  >
                    <path
                      d="M-20,130 C90,70 210,150 340,60 C370,40 400,55 420,35 L420,170 L-20,170 Z"
                      fill="#2B1917"
                      fillOpacity="0.65"
                    />
                    <path
                      d="M10,140 Q200,50 390,110"
                      stroke="#907878"
                      strokeOpacity="0.22"
                      strokeWidth="1"
                    />
                  </svg>
                  <div className="relative z-10 w-14 h-14 rounded-full border border-brand-border/30 bg-canvas/60 flex items-center justify-center group-hover:scale-105 group-hover:border-mauve/60 transition-all duration-500">
                    <CategoryLineIcon id={cat.id} />
                  </div>
                  <span className="relative z-10 mt-2.5 text-[10px] font-display uppercase tracking-[0.22em] text-content-muted text-center line-clamp-1">
                    {cat.subtitle}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-base uppercase tracking-wider text-content mb-1.5 group-hover:text-mauve-light transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-content-secondary leading-relaxed font-normal mb-4 flex-1">
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
      <section className="py-16 sm:py-20 bg-surface/40 border-y border-brand-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-brand-border/20">
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

          <ProductGrid products={products.slice(0, 6)} loading={loading} />

          <div className="mt-10 text-center">
            <Link to="/catalogo">
              <Button variant="outline" size="lg" className="px-8">
                Explorar el catálogo completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Sobre Nosotros — Usa /images/brand/about.webp si existe, o composición de textura/SVG por código */}
      <section id="nosotros" className="py-16 sm:py-20 smoke-texture border-b border-brand-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="text-[11px] uppercase tracking-[0.3em] text-mauve font-medium mb-3 block">
                Sobre Nocturna
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light uppercase tracking-widest text-content mb-5 leading-snug">
                Una experiencia íntima pensada desde el respeto, la estética y la confidencialidad.
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-4">
                Nacimos en Córdoba con una idea clara: que elegir productos para tu placer o el de tu pareja sea tan cómodo, elegante y natural como cualquier otra compra personal. Sin miradas incómodas, sin apuros y con información honesta sobre materiales, cuidados y usos.
              </p>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-7">
                Cada pedido se prepara en empaque completamente neutro —sin cintas impresas, logos ni referencias al contenido— y se coordina de forma directa por WhatsApp para que elijas el horario y punto de entrega que mejor te quede.
              </p>
              <Link to="/legal">
                <Button variant="secondary" size="md">
                  Conocé nuestras políticas de privacidad y envíos
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-5">
              {aboutImageUrl && !aboutImgError ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-mauve/25 bg-surface shadow-xl">
                  <img
                    src={aboutImageUrl}
                    width="1000"
                    height="750"
                    loading="lazy"
                    decoding="async"
                    alt="Sobre Nocturna SexShop — Boutique íntima en Córdoba"
                    onError={() => setAboutImgError(true)}
                    className="w-full h-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-canvas/40 pointer-events-none"
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-brand-border/25 smoke-card-texture p-8 flex flex-col items-center justify-center text-center shadow-xl">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 500 380"
                    fill="none"
                    className="absolute inset-0 w-full h-full object-cover opacity-65 pointer-events-none"
                  >
                    <defs>
                      <radialGradient id="aboutGlow" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="#5A2A2E" stopOpacity="0.45" />
                        <stop offset="65%" stopColor="#2B1917" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1A1212" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="500" height="380" fill="url(#aboutGlow)" />
                    <path
                      d="M-30,300 C120,200 290,350 460,210 L530,390 L-30,390 Z"
                      fill="#2B1917"
                      fillOpacity="0.6"
                    />
                    <circle cx="250" cy="190" r="120" stroke="#907878" strokeOpacity="0.18" strokeWidth="1" />
                    <circle cx="250" cy="190" r="88" stroke="#5A2A2E" strokeOpacity="0.35" strokeWidth="1" />
                  </svg>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border border-mauve/35 bg-canvas/70 flex items-center justify-center mb-4 text-mauve">
                      <FiLock size={22} />
                    </div>
                    <span className="font-display text-2xl uppercase tracking-[0.28em] text-content font-light">
                      Nocturna
                    </span>
                    <span className="font-display text-[11px] uppercase tracking-[0.35em] text-mauve mt-1">
                      Boutique Íntima &bull; Córdoba
                    </span>
                    <p className="mt-4 text-xs text-content-secondary max-w-xs leading-relaxed">
                      Reserva absoluta desde la consulta hasta la entrega en tus manos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bloque de Beneficios */}
      <section className="py-14 bg-surface border-b border-brand-border/20">
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
      <section id="faq" className="py-16 sm:py-20 bg-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
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
