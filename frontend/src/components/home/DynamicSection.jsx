import NewsletterForm from '../newsletter/NewsletterForm';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiLock, FiEyeOff, FiMessageCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Button from '../ui/Button';
import ProductGrid from '../catalog/ProductGrid';
import CountdownTimer from '../campaign/CountdownTimer';
import themeConfig from '../../config/theme';
import { getBrandImage } from '../../utils/productImages';

export const CategoryLineIcon = ({ id }) => {
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

export const HeroBrandVisual = () => (
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
      <path d="M60,420 Q280,180 540,320" stroke="#907878" strokeOpacity="0.25" strokeWidth="1" />
      <path d="M40,260 Q310,390 560,170" stroke="#5A2A2E" strokeOpacity="0.4" strokeWidth="1.2" />
    </svg>
  </div>
);

const DynamicSection = ({
  section,
  products = [],
  loadingProducts = false,
  activeCampaign = null,
  themeConfig: theme = null,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [heroImgError, setHeroImgError] = useState(false);
  const [aboutImgError, setAboutImgError] = useState(false);

  if (!section || section.enabled === false) return null;

  const config = section.config || {};
  const heroImageUrl = getBrandImage('hero') || '/images/brand/hero.webp';
  const heroMobileUrl = getBrandImage('heroMobile') || '/images/brand/hero-mobile.webp';
  const aboutImageUrl = getBrandImage('about');

  // =========================================================================
  // 1. HERO (Base o de Campaña)
  // =========================================================================
  if (section.type === 'HERO') {
    const isCampaignHero = Boolean(section.campaignId || config.headline?.includes('BLACK FRIDAY') || config.headline?.includes('CYBER'));

    if (isCampaignHero) {
      return (
        <section
          className={`relative min-h-[440px] lg:min-h-[500px] flex items-center border-b ${
            theme?.borderAccent || 'border-brand-border/20'
          } bg-gradient-to-b ${theme?.bgGradient || 'from-canvas via-surface to-canvas'} overflow-hidden py-12 lg:py-16`}
        >
          {/* Fondo gráfico abstracto por código */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-40">
            <svg viewBox="0 0 1200 600" fill="none" className="w-full h-full object-cover">
              <path
                d="M-50,450 C300,200 600,550 1250,250 L1250,650 L-50,650 Z"
                fill={theme?.accent || '#5A2A2E'}
                fillOpacity="0.18"
              />
              <path
                d="M100,500 Q600,150 1100,450"
                stroke={theme?.accent || '#907878'}
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <span
                className={`inline-block text-[11px] uppercase tracking-[0.28em] px-3.5 py-1 rounded-full mb-4 ${
                  theme?.badgeBg || 'bg-surface-elevated'
                } ${theme?.badgeText || 'text-content'}`}
              >
                {theme?.tagText || 'CAMPAÑA ESPECIAL'}
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-[0.1em] text-content mb-4 leading-[1.12]">
                {config.headline || activeCampaign?.headline || 'Edición Especial Nocturna'}
              </h1>

              <p className="text-sm sm:text-base text-content-secondary mb-7 leading-relaxed max-w-xl">
                {config.subheadline || activeCampaign?.subheadline || 'Aprovechá beneficios exclusivos por tiempo limitado en boutique íntima con envíos 100% confidenciales.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link to={config.ctaLink || '/ofertas'}>
                  <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-3.5">
                    <span>{config.ctaText || 'Aprovechar Ofertas'}</span>
                    <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
                {activeCampaign?.slug && (
                  <Link to={`/campanas/${activeCampaign.slug}`}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 py-3.5 bg-canvas/40 backdrop-blur-sm">
                      <span>Ver Detalles de Campaña</span>
                    </Button>
                  </Link>
                )}
              </div>

              <div className="mt-8 pt-5 border-t border-brand-border/25 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-content-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <FiEyeOff className="text-mauve" /> Empaque 100% neutro
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiShield className="text-mauve" /> Descuentos reales garantizados
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiLock className="text-mauve" /> Entrega confidencial en Córdoba
                </span>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Hero Base de la tienda
    return (
      <section className="relative min-h-[480px] lg:min-h-[540px] flex items-center bg-canvas border-b border-brand-border/20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          {!heroImgError && heroImageUrl ? (
            <img
              src={heroImageUrl}
              srcSet={`${heroMobileUrl} 900w, ${heroImageUrl} 1920w`}
              sizes="100vw"
              width="1920"
              height="760"
              {...{ fetchpriority: 'high' }}
              decoding="async"
              alt="Ambientación íntima nocturna — Nocturna SexShop"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover object-[68%_center] lg:object-center"
            />
          ) : (
            <div className="w-full h-full">
              <HeroBrandVisual />
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-canvas/85 via-canvas/45 to-canvas/15" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/35" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 w-full">
          <div className="max-w-2xl">
            <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-mauve font-medium mb-3">
              Córdoba, Argentina &bull; Boutique Íntima Online
            </span>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-5xl font-light uppercase tracking-[0.12em] text-content mb-4 leading-[1.14] drop-shadow-sm">
              Intimidad, <br />
              diseño y placer <br />
              <span className="text-mauve">sin tabúes.</span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-[15px] text-content-secondary mb-6 font-normal leading-relaxed max-w-xl drop-shadow-sm">
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
                href={`https://wa.me/${themeConfig.contact.whatsapp}?text=${encodeURIComponent(themeConfig.contact.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 py-3 bg-canvas/45 backdrop-blur-[2px]">
                  <FaWhatsapp className="mr-2 text-mauve text-base" />
                  <span>Asesoramiento Privado</span>
                </Button>
              </a>
            </div>

            <div className="mt-7 pt-4 border-t border-brand-border/25 flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] sm:text-xs text-content-secondary">
              <span className="inline-flex items-center gap-1.5">
                <FiEyeOff className="text-mauve" /> Empaque neutro sin logos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiShield className="text-mauve" /> Sin mínimo de compra
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiLock className="text-mauve" /> Atención confidencial
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 2. CAMPAIGN_BANNER
  // =========================================================================
  if (section.type === 'CAMPAIGN_BANNER') {
    return (
      <section className="py-8 sm:py-12 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-2xl border ${
              theme?.borderAccent || 'border-brand-border/30'
            } bg-gradient-to-r ${theme?.bgGradient || 'from-surface via-surface-elevated to-surface'} p-8 sm:p-12 shadow-2xl`}
          >
            {/* Gráficos vectoriales por código */}
            <svg
              aria-hidden="true"
              viewBox="0 0 800 300"
              fill="none"
              className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
            >
              <circle cx="700" cy="80" r="140" stroke={theme?.accent || '#5A2A2E'} strokeWidth="1.5" />
              <path d="M-50,220 C200,80 500,280 850,150" stroke={theme?.accent || '#907878'} strokeWidth="1.5" />
            </svg>

            <div className="relative z-10 max-w-2xl">
              {config.badge && (
                <span
                  className={`inline-block text-[10px] sm:text-[11px] uppercase tracking-[0.25em] px-3.5 py-1 rounded-full mb-3.5 ${
                    theme?.badgeBg || 'bg-brand'
                  } ${theme?.badgeText || 'text-white'}`}
                >
                  {config.badge}
                </span>
              )}

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light uppercase tracking-wider text-content mb-3 leading-tight">
                {config.title || activeCampaign?.headline || 'Promoción Destacada'}
              </h2>

              <p className="text-xs sm:text-sm text-content-secondary mb-6 leading-relaxed">
                {config.subtitle || activeCampaign?.subheadline || 'Aprovechá beneficios exclusivos y entrega discreta en Córdoba.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link to={config.ctaLink || (activeCampaign?.slug ? `/campanas/${activeCampaign.slug}` : '/ofertas')}>
                  <Button size="md" variant="primary" className="px-6 py-2.5">
                    <span>{config.ctaText || 'Ver Colección'}</span>
                    <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
                {activeCampaign?.conditionsText && (
                  <span className="text-[11px] text-content-muted">
                    Condiciones aplicables • Hasta agotar stock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 3. COUNTDOWN
  // =========================================================================
  if (section.type === 'COUNTDOWN') {
    const targetDate = config.targetDate || activeCampaign?.endsAt || null;
    if (!targetDate) return null;

    return (
      <div className="py-6 sm:py-8 bg-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CountdownTimer
            targetDate={targetDate}
            title={config.title || 'Tiempo restante de campaña:'}
            message={config.message || 'Los precios promocionales finalizan automáticamente al cumplirse el plazo.'}
            themeConfig={theme}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. PRODUCT_GRID
  // =========================================================================
  if (section.type === 'PRODUCT_GRID') {
    const limit = Number(config.limit || 6);
    let displayProducts = products;

    if (config.filter === 'campaign' && activeCampaign?.id) {
      displayProducts = products.filter((p) =>
        (p.activePromotions || []).some((ap) => ap.campaignId === activeCampaign.id)
      );
      if (displayProducts.length === 0) displayProducts = products;
    }

    return (
      <section className="py-14 sm:py-20 bg-surface/35 border-y border-brand-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-brand-border/20">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
                {config.subtitle || 'Curaduría'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
                {config.title || 'Seleccionados para Vos'}
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="mt-3 sm:mt-0 text-xs font-medium uppercase tracking-widest text-content-secondary hover:text-content inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Ver todos</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          <ProductGrid products={displayProducts.slice(0, limit)} loading={loadingProducts} />

          <div className="mt-10 text-center">
            <Link to="/catalogo">
              <Button variant="outline" size="lg" className="px-8">
                Explorar el catálogo completo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 5. CATEGORY_GRID
  // =========================================================================
  if (section.type === 'CATEGORY_GRID') {
    return (
      <section className="py-16 sm:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-brand-border/20">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
                {config.subtitle || 'Universo Nocturna'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
                {config.title || 'Categorías de la Colección'}
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
                    <path d="M10,140 Q200,50 390,110" stroke="#907878" strokeOpacity="0.22" strokeWidth="1" />
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
    );
  }

  // =========================================================================
  // 6. TEXT_BLOCK ("Sobre Nosotros")
  // =========================================================================
  if (section.type === 'TEXT_BLOCK') {
    return (
      <section id={config.id || 'nosotros'} className="py-16 sm:py-20 smoke-texture border-b border-brand-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="text-[11px] uppercase tracking-[0.3em] text-mauve font-medium mb-3 block">
                Sobre Nocturna
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light uppercase tracking-widest text-content mb-5 leading-snug">
                {config.title || 'Una experiencia íntima pensada desde el respeto, la estética y la confidencialidad.'}
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
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-canvas/40 pointer-events-none" />
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-brand-border/25 smoke-card-texture p-8 flex flex-col items-center justify-center text-center shadow-xl">
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
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 7. BENEFITS
  // =========================================================================
  if (section.type === 'BENEFITS') {
    return (
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
    );
  }

  // =========================================================================
  // 8. FAQ
  // =========================================================================
  if (section.type === 'FAQ') {
    return (
      <section id={config.id || 'faq'} className="py-16 sm:py-20 bg-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
              Dudas Frecuentes
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
              {config.title || 'Preguntas Frecuentes'}
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
    );
  }

  
  // =========================================================================
  // 9. NEWSLETTER
  // =========================================================================
  if (section.type === 'NEWSLETTER') {
    return (
      <section className="py-12 sm:py-16 bg-surface/30 border-y border-brand-border/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <NewsletterForm
            title={config.title || 'Suscribite a nuestro Newsletter'}
            subtitle={config.subtitle || 'Recibí ofertas exclusivas, lanzamientos y cupones de descuento directo en tu correo.'}
          />
        </div>
      </section>
    );
  }

  return null;
};

export default DynamicSection;
