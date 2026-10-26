import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import useSEO from '../hooks/useSEO';
import ProductGrid from '../components/catalog/ProductGrid';
import CountdownTimer from '../components/campaign/CountdownTimer';
import Button from '../components/ui/Button';
import { getCampaignTheme } from '../pricing-engine/index.js';
import { FiArrowLeft, FiShield, FiLock, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

const CampaignLandingPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const previewParam = searchParams.get('preview');

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCampaign = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = previewParam
          ? `/campaigns/public/${encodeURIComponent(slug)}?preview=${encodeURIComponent(previewParam)}`
          : `/campaigns/public/${encodeURIComponent(slug)}`;
        const res = await client.get(url);
        if (isMounted) {
          setCampaign(res.data);
          // Registrar visita anónima a la campaña (1 vez por sesión)
          if (!previewParam && res.data?.id) {
            const viewedKey = `viewed_camp_${res.data.id}`;
            if (!sessionStorage.getItem(viewedKey)) {
              sessionStorage.setItem(viewedKey, '1');
              client.post(`/campaigns/${res.data.id}/view`).catch(() => {});
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'No se pudo cargar la campaña');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCampaign();

    return () => {
      isMounted = false;
    };
  }, [slug, previewParam]);

  const isDraftOrPreview = Boolean(previewParam) || (campaign && campaign.effectiveStatus !== 'ACTIVE');

  useSEO({
    title: campaign?.seoTitle || (campaign ? `${campaign.name} | Nocturna SexShop` : 'Campaña'),
    description: campaign?.seoDescription || campaign?.description || 'Promociones exclusivas en Nocturna SexShop.',
    noindex: isDraftOrPreview,
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 rounded-full border-2 border-mauve/40 border-t-mauve animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-canvas px-4">
        <div className="max-w-md w-full text-center p-8 rounded-xl border border-brand-border/30 bg-surface">
          <FiAlertCircle className="mx-auto text-mauve text-4xl mb-4" />
          <h1 className="font-display text-xl uppercase tracking-wider text-content mb-2">
            Campaña no disponible
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mb-6 leading-relaxed">
            Esta campaña no está disponible públicamente en este momento o ya ha finalizado.
          </p>
          <Link to="/catalogo">
            <Button variant="primary" size="md">
              Explorar Catálogo General
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const theme = getCampaignTheme(campaign.theme);
  const products = campaign.products || [];

  return (
    <div className="bg-canvas min-h-screen">
      {/* Banner de aviso si está en modo preview */}
      {isDraftOrPreview && (
        <div className="bg-amber-500/90 text-black py-2 px-4 text-xs font-semibold text-center sticky top-0 z-30 shadow-md">
          Estás visualizando esta campaña en modo borrador o vista previa ({campaign.effectiveStatus}). No está indexada en buscadores.
        </div>
      )}

      {/* Hero Banner de la Campaña */}
      <section
        className={`relative py-14 sm:py-20 border-b ${theme.borderAccent} bg-gradient-to-b ${theme.bgGradient} overflow-hidden`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 350"
          fill="none"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        >
          <path d="M-50,280 C250,80 650,380 1050,160" stroke={theme.accent} strokeWidth="2" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-content mb-6 transition-colors font-medium uppercase tracking-widest"
          >
            <FiArrowLeft size={13} />
            <span>Volver al Catálogo</span>
          </Link>

          <div className="max-w-3xl">
            <span
              className={`inline-block text-[11px] uppercase tracking-[0.25em] px-3.5 py-1 rounded-full mb-4 ${theme.badgeBg} ${theme.badgeText}`}
            >
              {theme.tagText || 'EDICIÓN ESPECIAL'}
            </span>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-wider text-content mb-4 leading-tight">
              {campaign.headline || campaign.name}
            </h1>

            <p className="text-sm sm:text-base text-content-secondary mb-8 leading-relaxed">
              {campaign.subheadline || campaign.description || 'Promociones por tiempo limitado y productos seleccionados con entrega confidencial.'}
            </p>

            {/* Countdown integrado si showCountdown está activo */}
            {campaign.showCountdown && campaign.endsAt && (
              <div className="mb-8">
                <CountdownTimer
                  targetDate={campaign.endsAt}
                  title="Vigencia de la campaña:"
                  compact
                  themeConfig={theme}
                />
              </div>
            )}

            {/* Caja de Condiciones Legales y Comerciales */}
            {campaign.conditionsText && (
              <div className="p-4 sm:p-5 rounded-lg border border-brand-border/25 bg-canvas/60 text-xs text-content-secondary leading-relaxed">
                <strong className="text-content uppercase tracking-widest text-[10px] block mb-1">
                  Bases y Condiciones de la Campaña:
                </strong>
                {campaign.conditionsText}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grilla de Productos de la Campaña */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-brand-border/20">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-mauve font-medium">
              Colección en Promoción
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-widest text-content mt-1.5">
              Productos Incluidos ({products.length})
            </h2>
          </div>
          <span className="text-xs text-content-muted mt-2 sm:mt-0">
            Precios finales calculados automáticamente
          </span>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} loading={false} />
        ) : (
          <div className="text-center py-16 px-4 rounded-xl border border-brand-border/20 bg-surface/50">
            <p className="text-content-secondary text-sm">
              No hay productos con promociones directas asociadas a esta campaña actualmente.
            </p>
            <Link to="/catalogo" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Ver Catálogo General
              </Button>
            </Link>
          </div>
        )}

        {/* Garantías de confianza */}
        <div className="mt-16 pt-8 border-t border-brand-border/20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <FiEyeOff className="text-mauve text-2xl mb-2" />
            <h3 className="font-display text-xs uppercase tracking-widest text-content">Empaque 100% Neutro</h3>
            <p className="text-xs text-content-secondary mt-1">Sin logos ni descripciones de producto</p>
          </div>
          <div className="flex flex-col items-center">
            <FiShield className="text-mauve text-2xl mb-2" />
            <h3 className="font-display text-xs uppercase tracking-widest text-content">Precios Honestos</h3>
            <p className="text-xs text-content-secondary mt-1">Descuentos respaldados en historial verificado</p>
          </div>
          <div className="flex flex-col items-center">
            <FiLock className="text-mauve text-2xl mb-2" />
            <h3 className="font-display text-xs uppercase tracking-widest text-content">Atención Discreta</h3>
            <p className="text-xs text-content-secondary mt-1">Coordinación directa y confidencial por WhatsApp</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampaignLandingPage;
