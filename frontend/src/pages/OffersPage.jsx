import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/catalog/ProductCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import useSEO from '../hooks/useSEO';
import {
  FiPercent,
  FiArrowRight,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiCheckCircle,
} from 'react-icons/fi';
import themeConfig from '../config/theme';

const CATEGORY_TABS = [
  { id: 'all', label: 'Todas las ofertas' },
  { id: 'lenceria', label: 'Lencería' },
  { id: 'cosmetica-intima', label: 'Cosmética' },
  { id: 'dilatadores-consoladores-y-vibradores', label: 'Juguetes' },
  { id: 'fantasias', label: 'Fantasías' },
  { id: 'bdsm-y-arneses', label: 'Juegos & BDSM' },
];

const OffersPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount_desc');

  useSEO({
    title: `Ofertas y Promociones Exclusivas | ${themeConfig.brand.name}`,
    description:
      'Descubrí nuestras promociones vigentes con descuentos reales y validados en lencería, cosmética sensorial y juguetes íntimos en Córdoba.',
  });

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const params = {
          onlyOffers: 'true',
          sort: sortBy,
          limit: 30,
        };
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        const res = await client.get('/products', { params });
        setProducts(res.data?.products || []);
      } catch (err) {
        console.error('Error al cargar ofertas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [selectedCategory, sortBy]);

  return (
    <div className="bg-canvas min-h-[80vh] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero de Ofertas */}
        <div className="p-6 sm:p-10 rounded-2xl bg-surface border border-brand-border/25 relative overflow-hidden smoke-card-texture">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/50 border border-mauve/40 text-[11px] font-medium text-mauve uppercase tracking-widest mb-3">
              <FiPercent className="text-xs" />
              <span>Oportunidades &amp; Promociones Reales</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light uppercase tracking-wider text-content mb-3 leading-tight">
              Ofertas Exclusivas
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-6">
              Todos los precios tachados y porcentajes de descuento son 100% honestos y comprobados
              contra el historial de precios reales de los últimos 30 días. Sin sobreprecios previos ni falsas rebajas.
            </p>

            {/* Badges de beneficios activos */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-md bg-canvas/80 border border-brand-border/25 text-content-secondary inline-flex items-center gap-1.5">
                <FiTruck className="text-mauve" />
                <span>Envío gratis desde $50.000</span>
              </span>
              <span className="px-3 py-1 rounded-md bg-canvas/80 border border-brand-border/25 text-content-secondary inline-flex items-center gap-1.5">
                <FiPercent className="text-emerald-400" />
                <span>10% OFF extra por Transferencia</span>
              </span>
              <span className="px-3 py-1 rounded-md bg-canvas/80 border border-brand-border/25 text-content-secondary inline-flex items-center gap-1.5">
                <FiShield className="text-mauve" />
                <span>Empaque 100% discreto</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filtros por Categoría y Ordenamiento */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border/15">
          {/* Pills de categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand text-content border border-mauve'
                      : 'bg-surface text-content-secondary border border-brand-border/25 hover:text-content hover:border-mauve/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Ordenador */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            <span className="text-xs text-content-muted">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Ordenar ofertas"
              className="rounded-md border border-brand-border/30 text-xs text-content focus:border-mauve focus:ring-1 focus:ring-mauve py-1.5 pl-2.5 pr-8 bg-surface shadow-soft"
            >
              <option value="discount_desc">Mayor descuento</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="newest">Más recientes</option>
            </select>
          </div>
        </div>

        {/* Grilla de Ofertas */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-mauve/30 bg-surface flex items-center justify-center text-mauve">
              <FiPercent size={24} />
            </div>
            <h3 className="font-display text-lg uppercase tracking-wider text-content mb-2">
              No hay ofertas activas en esta categoría
            </h3>
            <p className="text-xs text-content-secondary mb-6 leading-relaxed">
              Actualmente no encontramos artículos con promociones en la sección seleccionada. Te invitamos a explorar el catálogo completo.
            </p>
            <Link to="/catalogo">
              <Button variant="primary">
                <span>Ver todo el catálogo</span>
                <FiArrowRight className="ml-2 text-xs" />
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-content-muted">
              <span>{products.length} {products.length === 1 ? 'oferta disponible' : 'ofertas disponibles'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;