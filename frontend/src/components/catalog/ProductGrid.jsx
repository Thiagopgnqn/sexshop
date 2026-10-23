import React from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { FiShoppingBag } from 'react-icons/fi';

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {[...Array(6)].map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center bg-surface rounded-lg border border-brand-border/20">
        <FiShoppingBag className="mx-auto text-3xl text-mauve/40 mb-3" />
        <h3 className="font-display text-base uppercase tracking-wider text-content mb-1">
          No encontramos artículos para esta selección
        </h3>
        <p className="text-content-secondary text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
          Probá ajustando los filtros activos o buscando con otra palabra clave.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
