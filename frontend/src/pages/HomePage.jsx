import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import useSEO from '../hooks/useSEO';
import client from '../api/client';
import themeConfig from '../config/theme';
import DynamicSection from '../components/home/DynamicSection';
import { getCampaignTheme, getSuggestedHomeSectionsTemplate } from '../pricing-engine/index.js';
import { FiEye, FiX } from 'react-icons/fi';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const previewParam = searchParams.get('preview');

  const { products, loading: loadingProducts, fetchProducts } = useProducts();
  const [sections, setSections] = useState(() => getSuggestedHomeSectionsTemplate('base'));
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [campaignTheme, setCampaignTheme] = useState(() => getCampaignTheme('neutro'));
  const [isPreview, setIsPreview] = useState(false);
  const [loadingSections, setLoadingSections] = useState(true);

  useSEO({
    title: activeCampaign?.seoTitle || (previewParam ? 'Vista Previa de Campaña | Nocturna' : 'Nocturna Sexshop — Tienda online en Córdoba | Envíos discretos'),
    description: activeCampaign?.seoDescription || themeConfig.brand.description,
    noindex: Boolean(previewParam),
  });

  useEffect(() => {
    fetchProducts({ limit: 12 });
  }, [fetchProducts]);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      setLoadingSections(true);
      try {
        const url = previewParam ? `/home-sections?preview=${encodeURIComponent(previewParam)}` : '/home-sections';
        const res = await client.get(url);
        const data = res.data || {};

        if (isMounted) {
          if (Array.isArray(data.sections) && data.sections.length > 0) {
            setSections(data.sections);
          } else {
            setSections(getSuggestedHomeSectionsTemplate('base'));
          }
          setActiveCampaign(data.activeCampaign || null);
          setCampaignTheme(data.theme || getCampaignTheme(data.activeCampaign?.theme || 'neutro'));
          setIsPreview(Boolean(data.isPreview || previewParam));
        }
      } catch (err) {
        console.error('Error al cargar secciones de portada:', err);
        if (isMounted) {
          setSections(getSuggestedHomeSectionsTemplate('base'));
          setCampaignTheme(getCampaignTheme('neutro'));
        }
      } finally {
        if (isMounted) {
          setLoadingSections(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [previewParam]);

  return (
    <div className="space-y-0 relative">
      {/* Barra de Vista Previa para Administradores */}
      {isPreview && (
        <div
          role="status"
          className="sticky top-0 z-50 bg-amber-500/90 text-black py-2 px-4 shadow-lg backdrop-blur-md font-medium text-xs sm:text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="inline-flex items-center gap-2">
              <FiEye className="animate-pulse" />
              <span>
                <strong>Modo Vista Previa:</strong> Estás previsualizando la portada con la campaña{' '}
                <span className="underline font-bold">{activeCampaign?.name || previewParam}</span>
              </span>
            </span>

            <Link
              to="/"
              className="inline-flex items-center gap-1 bg-black/80 hover:bg-black text-white px-2.5 py-1 rounded text-xs transition-colors"
            >
              <span>Salir</span>
              <FiX size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Renderizado dinámico de secciones configuradas */}
      {sections.map((section, idx) => (
        <DynamicSection
          key={section.id || `${section.type}_${idx}`}
          section={section}
          products={products}
          loadingProducts={loadingProducts}
          activeCampaign={activeCampaign}
          themeConfig={campaignTheme}
        />
      ))}
    </div>
  );
};

export default HomePage;
