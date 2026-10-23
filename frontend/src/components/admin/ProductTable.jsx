import React from 'react';
import Badge from '../ui/Badge';
import { FiEdit2, FiTrash2, FiBox } from 'react-icons/fi';
import themeConfig from '../../config/theme';
import { resolveProductImage } from '../../utils/productImages';

const ProductTable = ({ products, onEdit, onDelete }) => {
  return (
    <div>
      {/* Mobile Card List (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const productId = product.id || product._id;
          const priceFormatted = Number(product.price || 0).toLocaleString('es-AR');
          const resolvedImg = resolveProductImage(product);
          const imageUrl = resolvedImg?.thumb || resolvedImg?.main || product.imageUrl || product.image;
          const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
          const totalStock =
            variantCount > 0
              ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
              : Number(product.stock || 0);

          return (
            <div
              key={productId}
              className="bg-surface p-4 rounded-lg border border-brand-border/20 shadow-soft flex flex-col justify-between"
            >
              <div className="flex items-start space-x-3">
                <div className="h-14 w-14 flex-shrink-0 bg-canvas rounded border border-brand-border/20 overflow-hidden flex items-center justify-center text-mauve/50">
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
                    <Badge variant={product.active === false ? 'cancelled' : 'neutral'}>
                      {product.active === false
                        ? 'Borrador'
                        : product.category?.name || 'General'}
                    </Badge>
                    {product.sku && (
                      <span className="text-[10px] text-content-muted font-mono">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-content truncate">{product.name}</h4>
                  {variantCount > 0 && (
                    <p className="text-[11px] text-mauve mt-0.5">{variantCount} variantes</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-brand-border/15">
                <div>
                  <span className="text-sm font-semibold text-content tracking-tight">
                    {themeConfig.brand.currencySymbol}{priceFormatted}
                  </span>
                  <span
                    className={`ml-2 text-[10px] font-medium px-2 py-0.5 rounded border ${
                      totalStock > 5
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                        : totalStock > 0
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                        : 'bg-surface-elevated text-content-muted border-brand-border/25'
                    }`}
                  >
                    {totalStock} un.
                  </span>
                </div>

                <div className="flex space-x-1.5">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 bg-surface-elevated hover:bg-brand text-content rounded transition-colors border border-brand-border/25"
                    title="Editar"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
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
      <div className="hidden md:block overflow-x-auto bg-surface rounded-lg border border-brand-border/20">
        <table className="min-w-full divide-y divide-brand-border/20">
          <thead className="bg-surface-elevated/60">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Producto / SKU
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Categoría / Variantes
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Stock / Estado
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-content-secondary uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/15">
            {products.map((product) => {
              const productId = product.id || product._id;
              const priceFormatted = Number(product.price || 0).toLocaleString('es-AR');
              const resolvedImg = resolveProductImage(product);
              const imageUrl = resolvedImg?.thumb || resolvedImg?.main || product.imageUrl || product.image;
              const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
              const totalStock =
                variantCount > 0
                  ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
                  : Number(product.stock || 0);

              return (
                <tr key={productId} className="hover:bg-surface-elevated/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-canvas rounded border border-brand-border/20 overflow-hidden flex items-center justify-center text-mauve/50">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt=""
                            className="h-10 w-10 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <FiBox size={16} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-xs font-medium text-content max-w-xs truncate">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-content-muted font-mono">
                          SKU: {product.sku || 'S/N'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-content-secondary font-medium">
                      {product.category?.parent?.name
                        ? `${product.category.parent.name} → ${product.category.name}`
                        : product.category?.name || 'Sin categoría'}
                    </span>
                    {variantCount > 0 && (
                      <span className="text-[11px] text-mauve block">
                        {variantCount} variantes registradas
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-content">
                    {themeConfig.brand.currencySymbol}{priceFormatted}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap space-x-1.5">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        totalStock > 5
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                          : totalStock > 0
                          ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                          : 'bg-surface-elevated text-content-muted border-brand-border/25'
                      }`}
                    >
                      {totalStock} un.
                    </span>
                    {product.active === false && (
                      <Badge variant="cancelled">Inactivo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium space-x-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-content-secondary hover:text-content p-1"
                      title="Editar"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar ${product.name}?`)) onDelete(productId);
                      }}
                      className="text-content-muted hover:text-rose-400 p-1"
                      title="Eliminar"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
