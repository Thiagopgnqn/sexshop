import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import {
  FiEdit2,
  FiTrash2,
  FiBox,
  FiStar,
  FiCopy,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiMinus,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import themeConfig from '../../config/theme';
import { resolveProductImage } from '../../utils/productImages';

const formatVariantLabel = (v) => {
  const parts = [v.type, v.size, v.color, v.flavor, v.volume].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : v.sku || 'Variante';
};

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onToggleFeatured,
  onQuickStockChange,
  onVariantStockChange,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (productId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const allSelected =
    products.length > 0 &&
    products.every((p) => selectedIds.includes(p.id || p._id));

  if (!products || products.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-brand-border/20 p-10 text-center">
        <FiBox className="mx-auto text-mauve/50 mb-2" size={28} />
        <p className="text-sm font-medium text-content">
          No se encontraron productos con los filtros actuales
        </p>
        <p className="text-xs text-content-muted mt-1">
          Probá cambiar los criterios de búsqueda, categoría o estado de stock.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Card List (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const productId = product.id || product._id;
          const priceFormatted = Number(product.price || 0).toLocaleString('es-AR');
          const resolvedImg = resolveProductImage(product);
          const imageUrl =
            resolvedImg?.thumb || resolvedImg?.main || product.imageUrl || product.image;
          const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
          const totalStock =
            variantCount > 0
              ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
              : Number(product.stock || 0);
          const isFeatured = Boolean(product.featured || product.badge === 'Destacado');
          const isActive = product.active !== false;
          const isExpanded = Boolean(expandedRows[productId]);

          return (
            <div
              key={productId}
              onClick={() => onEdit(product)}
              className={`bg-surface p-4 rounded-lg border transition-colors shadow-soft cursor-pointer hover:border-mauve/50 ${
                !isActive
                  ? 'border-brand-border/15 opacity-75'
                  : 'border-brand-border/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {onToggleSelect && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(productId)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleSelect(productId)}
                    className="mt-1 rounded border-brand-border/40 bg-canvas text-brand focus:ring-mauve"
                    aria-label={`Seleccionar ${product.name}`}
                  />
                )}
                <div className="h-14 w-14 flex-shrink-0 bg-canvas rounded border border-brand-border/20 overflow-hidden flex items-center justify-center text-mauve/50 relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FiBox size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={!isActive ? 'cancelled' : 'neutral'}>
                        {!isActive ? 'Pausado' : product.category?.name || 'General'}
                      </Badge>
                      {!imageUrl && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/30">
                          Sin foto
                        </span>
                      )}
                    </div>
                    {product.sku && (
                      <span className="text-[10px] text-content-muted font-mono">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-content truncate hover:text-mauve">
                    {product.name}
                  </h4>
                  {variantCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(productId);
                      }}
                      className="text-[11px] text-mauve hover:text-content mt-0.5 inline-flex items-center gap-1"
                    >
                      <span>{variantCount} variantes</span>
                      {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && variantCount > 0 && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 pt-2.5 border-t border-brand-border/15 space-y-1.5"
                >
                  {product.variants.map((v) => (
                    <div
                      key={v.id || v.sku}
                      className="flex items-center justify-between text-xs bg-canvas px-2.5 py-1.5 rounded border border-brand-border/15"
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono text-[10px] text-mauve mr-1.5">
                          [{v.sku}]
                        </span>
                        <span className="text-content">{formatVariantLabel(v)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onVariantStockChange?.(product, v.id, -1)}
                          className="w-6 h-6 rounded bg-surface-elevated text-content flex items-center justify-center border border-brand-border/25"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="w-8 text-center font-mono text-xs text-content">
                          {v.stock ?? 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => onVariantStockChange?.(product, v.id, 1)}
                          className="w-6 h-6 rounded bg-surface-elevated text-content flex items-center justify-center border border-brand-border/25"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between mt-3.5 pt-3 border-t border-brand-border/15"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-content tracking-tight">
                    {themeConfig.brand.currencySymbol}
                    {priceFormatted}
                  </span>
                  <div className="inline-flex items-center gap-1">
                    {variantCount === 0 && onQuickStockChange && (
                      <button
                        type="button"
                        onClick={() => onQuickStockChange(product, -1)}
                        className="w-5 h-5 rounded bg-surface-elevated text-content-secondary hover:text-content flex items-center justify-center border border-brand-border/25"
                        title="Restar 1 al stock"
                      >
                        <FiMinus size={10} />
                      </button>
                    )}
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        totalStock > 3
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                          : totalStock > 0
                          ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                          : 'bg-rose-950/50 text-rose-300 border-rose-800/40'
                      }`}
                    >
                      {totalStock} un.
                    </span>
                    {variantCount === 0 && onQuickStockChange && (
                      <button
                        type="button"
                        onClick={() => onQuickStockChange(product, 1)}
                        className="w-5 h-5 rounded bg-surface-elevated text-content-secondary hover:text-content flex items-center justify-center border border-brand-border/25"
                        title="Sumar 1 al stock"
                      >
                        <FiPlus size={10} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {onToggleFeatured && (
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(product)}
                      className={`p-1.5 rounded border transition-colors ${
                        isFeatured
                          ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                          : 'bg-surface-elevated text-content-muted border-brand-border/25'
                      }`}
                      title={isFeatured ? 'Quitar de Destacados' : 'Destacar en Home'}
                    >
                      <FiStar size={13} className={isFeatured ? 'fill-current' : ''} />
                    </button>
                  )}
                  {onToggleActive && (
                    <button
                      type="button"
                      onClick={() => onToggleActive(product)}
                      className="p-1.5 bg-surface-elevated text-content-secondary hover:text-content rounded border border-brand-border/25"
                      title={isActive ? 'Pausar publicación' : 'Activar publicación'}
                    >
                      {isActive ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                    </button>
                  )}
                  {onDuplicate && (
                    <button
                      type="button"
                      onClick={() => onDuplicate(product)}
                      className="p-1.5 bg-surface-elevated hover:bg-brand text-content rounded border border-brand-border/25"
                      title="Duplicar producto"
                    >
                      <FiCopy size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="px-2.5 py-1 bg-brand hover:bg-brand/80 text-content rounded transition-colors border border-mauve/40 inline-flex items-center gap-1 text-xs font-medium"
                    title="Editar producto"
                  >
                    <FiEdit2 size={12} />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar ${product.name}?`)) onDelete(productId);
                    }}
                    className="p-1.5 bg-surface-elevated hover:bg-rose-950 text-rose-300 rounded transition-colors border border-brand-border/25"
                    title="Eliminar"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (screens >= 768px) */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Tabla de inventario de productos"
        className="hidden md:block overflow-x-auto bg-surface rounded-lg border border-brand-border/20 focus:outline-none focus:ring-1 focus:ring-mauve/40"
      >
        <table className="min-w-full divide-y divide-brand-border/20">
          <thead className="bg-surface-elevated sticky top-0 z-10">
            <tr>
              {onToggleSelect && (
                <th className="px-3 py-3 text-left w-9">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-brand-border/40 bg-canvas text-brand focus:ring-mauve cursor-pointer"
                    aria-label="Seleccionar todos los productos de la página"
                  />
                </th>
              )}
              <th className="px-3.5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Producto / SKU (Clic para editar)
              </th>
              <th className="px-3.5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Categoría / Variantes
              </th>
              <th className="px-3.5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Precio Lista / Transf.
              </th>
              <th className="px-3.5 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Stock Rápido
              </th>
              <th className="px-3.5 py-3 text-center text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3.5 py-3 text-right text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/15">
            {products.map((product) => {
              const productId = product.id || product._id;
              const priceFormatted = Number(product.price || 0).toLocaleString('es-AR');
              const transferFormatted = product.transferPrice
                ? Number(product.transferPrice).toLocaleString('es-AR')
                : null;
              const resolvedImg = resolveProductImage(product);
              const imageUrl =
                resolvedImg?.thumb || resolvedImg?.main || product.imageUrl || product.image;
              const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
              const totalStock =
                variantCount > 0
                  ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
                  : Number(product.stock || 0);
              const isFeatured = Boolean(product.featured || product.badge === 'Destacado');
              const isActive = product.active !== false;
              const isExpanded = Boolean(expandedRows[productId]);
              const isSelected = selectedIds.includes(productId);

              return (
                <React.Fragment key={productId}>
                  <tr
                    onClick={() => onEdit(product)}
                    className={`group hover:bg-surface-elevated/40 transition-colors cursor-pointer ${
                      !isActive ? 'opacity-65 bg-canvas/30' : ''
                    } ${isSelected ? 'bg-brand/15' : ''}`}
                    title="Hacé clic para abrir y editar este producto"
                  >
                    {onToggleSelect && (
                      <td
                        className="px-3 py-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(productId)}
                          className="rounded border-brand-border/40 bg-canvas text-brand focus:ring-mauve cursor-pointer"
                          aria-label={`Seleccionar ${product.name}`}
                        />
                      </td>
                    )}
                    <td className="px-3.5 py-3">
                      <div className="flex items-center">
                        <div className="h-11 w-11 flex-shrink-0 bg-canvas rounded border border-brand-border/20 group-hover:border-mauve/50 overflow-hidden flex items-center justify-center text-mauve/50 relative transition-colors">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="h-11 w-11 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <FiBox size={16} />
                          )}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-medium text-content group-hover:text-mauve group-hover:underline truncate max-w-[210px] transition-colors">
                              {product.name}
                            </span>
                            {product.badge && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/50 text-content border border-mauve/30">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-content-muted font-mono">
                              SKU: {product.sku || 'S/N'}
                            </span>
                            {!imageUrl && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-800/30">
                                Sin foto
                              </span>
                            )}
                            {Number(product.soldCount || 0) > 0 && (
                              <span className="text-[10px] text-content-muted">
                                &bull; {product.soldCount} vend.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="text-xs text-content-secondary font-medium block truncate max-w-[180px]">
                        {product.category?.parent?.name
                          ? `${product.category.parent.name} → ${product.category.name}`
                          : product.category?.name || 'Sin categoría'}
                      </span>
                      {variantCount > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(productId);
                          }}
                          className="text-[11px] text-mauve hover:text-content inline-flex items-center gap-1 mt-0.5 font-medium"
                        >
                          <span>
                            {variantCount} variante{variantCount !== 1 ? 's' : ''}
                          </span>
                          {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                        </button>
                      ) : (
                        <span className="text-[10px] text-content-muted block mt-0.5">
                          Producto único
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="text-xs font-semibold text-content">
                        {themeConfig.brand.currencySymbol}
                        {priceFormatted}
                      </div>
                      {transferFormatted && (
                        <div className="text-[10px] text-emerald-300/90 mt-0.5">
                          Transf: {themeConfig.brand.currencySymbol}
                          {transferFormatted}
                        </div>
                      )}
                    </td>
                    <td
                      className="px-3.5 py-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {variantCount === 0 && onQuickStockChange && (
                          <button
                            type="button"
                            onClick={() => onQuickStockChange(product, -1)}
                            disabled={totalStock <= 0}
                            className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content flex items-center justify-center border border-brand-border/30 disabled:opacity-30 transition-colors"
                            title="Restar 1 unidad"
                          >
                            <FiMinus size={11} />
                          </button>
                        )}

                        <span
                          onClick={() => variantCount > 0 && toggleExpand(productId)}
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded border ${
                            variantCount > 0 ? 'cursor-pointer' : ''
                          } ${
                            totalStock > 3
                              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                              : totalStock > 0
                              ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                              : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                          }`}
                          title={
                            variantCount > 0
                              ? 'Hacé clic para ajustar el stock de cada variante'
                              : 'Stock disponible'
                          }
                        >
                          {totalStock === 0 ? 'Agotado (0)' : `${totalStock} un.`}
                        </span>

                        {variantCount === 0 && onQuickStockChange && (
                          <button
                            type="button"
                            onClick={() => onQuickStockChange(product, 1)}
                            className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content flex items-center justify-center border border-brand-border/30 transition-colors"
                            title="Sumar 1 unidad"
                          >
                            <FiPlus size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-3.5 py-3 whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {onToggleActive && (
                          <button
                            type="button"
                            onClick={() => onToggleActive(product)}
                            className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors inline-flex items-center gap-1 ${
                              isActive
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-950/70'
                                : 'bg-surface-elevated text-content-muted border-brand-border/30 hover:text-content'
                            }`}
                            title={
                              isActive
                                ? 'Visible en tienda (clic para pausar)'
                                : 'Pausado / Borrador (clic para activar)'
                            }
                          >
                            {isActive ? <FiEye size={11} /> : <FiEyeOff size={11} />}
                            <span>{isActive ? 'Activo' : 'Pausado'}</span>
                          </button>
                        )}

                        {onToggleFeatured && (
                          <button
                            type="button"
                            onClick={() => onToggleFeatured(product)}
                            className={`p-1.5 rounded border transition-colors ${
                              isFeatured
                                ? 'bg-amber-950/50 text-amber-300 border-amber-700/50'
                                : 'bg-canvas text-content-muted border-brand-border/25 hover:text-content'
                            }`}
                            title={
                              isFeatured
                                ? 'Destacado en Home (clic para quitar)'
                                : 'Marcar como Destacado en Home'
                            }
                          >
                            <FiStar size={12} className={isFeatured ? 'fill-current' : ''} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-3.5 py-3 whitespace-nowrap text-right text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(product)}
                          className="px-2.5 py-1 rounded bg-brand/70 hover:bg-brand text-content border border-mauve/40 inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
                          title="Editar producto"
                        >
                          <FiEdit2 size={12} />
                          <span>Editar</span>
                        </button>
                        {onDuplicate && (
                          <button
                            type="button"
                            onClick={() => onDuplicate(product)}
                            className="text-content-secondary hover:text-content p-1.5 rounded hover:bg-surface-elevated transition-colors"
                            title="Duplicar producto"
                          >
                            <FiCopy size={13} />
                          </button>
                        )}
                        <Link
                          to={`/producto/${productId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-content-muted hover:text-content p-1.5 rounded hover:bg-surface-elevated transition-colors"
                          title="Ver ficha en la tienda"
                        >
                          <FiExternalLink size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar ${product.name}?`))
                              onDelete(productId);
                          }}
                          className="text-content-muted hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/40 transition-colors"
                          title="Eliminar producto"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Fila expandible con control de stock por variante */}
                  {isExpanded && variantCount > 0 && (
                    <tr className="bg-canvas/70">
                      <td colSpan={onToggleSelect ? 7 : 6} className="px-6 py-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-widest text-mauve font-medium">
                            Desglose y ajuste rápido de variantes ({variantCount})
                          </span>
                          <button
                            type="button"
                            onClick={() => onEdit(product)}
                            className="text-[11px] text-mauve hover:text-content underline"
                          >
                            Abrir editor completo del producto &rarr;
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {product.variants.map((v) => {
                            const vStock = Number(v.stock || 0);
                            return (
                              <div
                                key={v.id || v.sku}
                                className="flex items-center justify-between p-2.5 rounded bg-surface border border-brand-border/20 text-xs"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-mauve">
                                      SKU: {v.sku}
                                    </span>
                                    <span className="text-content-muted">&bull;</span>
                                    <span className="font-semibold text-content">
                                      {themeConfig.brand.currencySymbol}
                                      {Number(v.price || product.price || 0).toLocaleString(
                                        'es-AR'
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-xs text-content truncate mt-0.5">
                                    {formatVariantLabel(v)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => onVariantStockChange?.(product, v.id, -1)}
                                    disabled={vStock <= 0}
                                    className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content flex items-center justify-center border border-brand-border/30 disabled:opacity-30"
                                    title="Restar 1 al stock de esta variante"
                                  >
                                    <FiMinus size={10} />
                                  </button>
                                  <span
                                    className={`w-10 text-center font-mono text-xs py-0.5 rounded border ${
                                      vStock > 3
                                        ? 'text-emerald-300 border-emerald-800/40 bg-emerald-950/30'
                                        : vStock > 0
                                        ? 'text-amber-300 border-amber-800/40 bg-amber-950/30'
                                        : 'text-rose-300 border-rose-800/40 bg-rose-950/40'
                                    }`}
                                  >
                                    {vStock}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onVariantStockChange?.(product, v.id, 1)}
                                    className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content flex items-center justify-center border border-brand-border/30"
                                    title="Sumar 1 al stock de esta variante"
                                  >
                                    <FiPlus size={10} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
