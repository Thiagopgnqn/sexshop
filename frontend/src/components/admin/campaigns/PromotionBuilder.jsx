import React, { useState, useMemo } from 'react';
import {
  FiPercent,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiGift,
  FiTruck,
  FiCreditCard,
  FiAlertTriangle,
  FiCheckCircle,
  FiTrash2,
  FiPlus,
  FiInfo,
} from 'react-icons/fi';
import { getItemPricing } from '../../../pricing-engine/index.js';

const PROMO_KINDS = [
  {
    id: 'PERCENT',
    label: 'Porcentaje de Descuento (%)',
    icon: FiPercent,
    description: 'Aplica un descuento proporcional sobre el precio de lista (ej: 15% o 25% OFF).',
    example: 'Ej: 15% OFF en toda la categoría Lencería.',
  },
  {
    id: 'FIXED_AMOUNT',
    label: 'Monto Fijo de Descuento ($)',
    icon: FiDollarSign,
    description: 'Resta un importe fijo en pesos al precio del producto o carrito.',
    example: 'Ej: $5.000 OFF en compras seleccionadas.',
  },
  {
    id: 'FIXED_PRICE',
    label: 'Precio Promocional Fijo ($)',
    icon: FiTag,
    description: 'Establece un precio final fijo sin importar el valor de lista original.',
    example: 'Ej: Todos los geles aromáticos a $8.000.',
  },
  {
    id: 'BUY_X_PAY_Y',
    label: 'Promoción por Cantidad (2x1, 3x2, etc.)',
    icon: FiLayers,
    description: 'El cliente lleva X unidades y abona solo Y unidades (se bonifica la de menor valor).',
    example: 'Ej: 2x1 en Cosmética Sensorial (llevás 2, pagás 1).',
  },
  {
    id: 'BUNDLE_PRICE',
    label: 'Combo de Productos a Precio Fijo',
    icon: FiGift,
    description: 'Define un precio especial al comprar un conjunto específico de productos juntos.',
    example: 'Ej: Vibrador Luna + Gel Love Potion por $35.000.',
  },
  {
    id: 'TIERED',
    label: 'Descuento Escalonado por Volumen',
    icon: FiLayers,
    description: 'Descuento progresivo según la cantidad de unidades que agregue el cliente.',
    example: 'Ej: Llevando 3 un. 10% OFF, llevando 5 un. 20% OFF.',
  },
  {
    id: 'FREE_SHIPPING',
    label: 'Envío Gratis Promocional',
    icon: FiTruck,
    description: 'Bonifica el costo de cadetería o envío a domicilio.',
    example: 'Ej: Envío gratis en órdenes que incluyan este producto.',
  },
  {
    id: 'PAYMENT_METHOD',
    label: 'Descuento por Medio de Pago',
    icon: FiCreditCard,
    description: 'Bonificación por método de pago elegido (ej: Transferencia bancaria).',
    example: 'Ej: 10% OFF pagando con transferencia.',
  },
];

const TARGET_TYPES = [
  { id: 'ALL', label: 'Toda la tienda (sin distinción)' },
  { id: 'CATEGORY', label: 'Categoría completa' },
  { id: 'SUBCATEGORY', label: 'Subcategoría específica' },
  { id: 'PRODUCT', label: 'Producto individual' },
  { id: 'COLLECTION', label: 'Colección de productos' },
  { id: 'TAG', label: 'Por etiqueta (Tag)' },
];

const PromotionBuilder = ({
  promotions = [],
  onChange,
  categories = [],
  products = [],
  collections = [],
  tags = [],
  priceHistory = [],
}) => {
  const [activePromoIndex, setActivePromoIndex] = useState(0);

  const currentPromo = promotions[activePromoIndex] || promotions[0] || null;

  // Cálculo de suma de productos individuales para combos (BUNDLE_PRICE)
  const targetProductIds = (currentPromo?.targets || [])
    .filter((t) => t.targetType === 'PRODUCT' && t.targetId)
    .map((t) => t.targetId);

  let separateSum = 0;
  if (targetProductIds.length > 0) {
    separateSum = targetProductIds.reduce((acc, pId) => {
      const prod = products.find((p) => p.id === pId);
      return acc + (Number(prod?.price) || 0);
    }, 0);
  } else if (currentPromo?.bundleSkus) {
    try {
      const skus =
        typeof currentPromo.bundleSkus === 'string'
          ? JSON.parse(currentPromo.bundleSkus)
          : currentPromo.bundleSkus;
      if (Array.isArray(skus)) {
        separateSum = skus.reduce((acc, sku) => {
          const prod = products.find((p) => p.sku === sku);
          return acc + (Number(prod?.price) || 0);
        }, 0);
      }
    } catch {}
  }

  const isComboPriceInvalid =
    currentPromo?.kind === 'BUNDLE_PRICE' &&
    separateSum > 0 &&
    Number(currentPromo.value || 0) >= separateSum;

  const handleUpdateCurrent = (field, value) => {
    if (!currentPromo) return;
    const updated = [...promotions];
    updated[activePromoIndex] = {
      ...updated[activePromoIndex],
      [field]: value,
    };
    onChange(updated);
  };

  const handleAddPromotion = () => {
    const newPromo = {
      name: `Promoción ${promotions.length + 1}`,
      kind: 'PERCENT',
      value: 15,
      minQuantity: null,
      minOrderAmount: null,
      maxDiscountAmount: null,
      buyQuantity: 2,
      payQuantity: 1,
      stackable: false,
      targets: [{ targetType: 'ALL', targetId: null, excluded: false }],
    };
    const updated = [...promotions, newPromo];
    onChange(updated);
    setActivePromoIndex(updated.length - 1);
  };

  const handleRemovePromotion = (index) => {
    const updated = promotions.filter((_, idx) => idx !== index);
    onChange(updated);
    setActivePromoIndex(Math.max(0, index - 1));
  };

  // Normalizar y aplanar categorías (soporta tanto árbol jerárquico como lista plana)
  const allFlattenedCategories = useMemo(() => {
    const map = new Map();
    for (const cat of categories) {
      if (!cat || !cat.id) continue;
      if (!map.has(cat.id)) {
        map.set(cat.id, cat);
      }
      if (Array.isArray(cat.children)) {
        for (const child of cat.children) {
          if (!child || !child.id) continue;
          const parentName = cat.name || 'Categoría';
          map.set(child.id, {
            ...child,
            parentId: child.parentId || cat.id,
            parent: child.parent || { id: cat.id, name: parentName, slug: cat.slug },
          });
        }
      }
    }
    return Array.from(map.values());
  }, [categories]);

  const rootCategories = useMemo(
    () => allFlattenedCategories.filter((c) => !c.parentId),
    [allFlattenedCategories]
  );

  const subcategoriesList = useMemo(
    () => allFlattenedCategories.filter((c) => Boolean(c.parentId)),
    [allFlattenedCategories]
  );

  // Muestra de productos alcanzados para vista previa en tiempo real
  const previewProducts = useMemo(() => {
    if (!currentPromo || !Array.isArray(products) || products.length === 0) return [];

    const target = (currentPromo.targets && currentPromo.targets[0]) || { targetType: 'ALL' };
    let filtered = products;

    if (target.targetType === 'CATEGORY' && target.targetId) {
      filtered = products.filter(
        (p) =>
          p.categoryId === target.targetId ||
          p.category?.parentId === target.targetId ||
          p.category?.id === target.targetId
      );
    } else if (target.targetType === 'SUBCATEGORY' && target.targetId) {
      filtered = products.filter(
        (p) =>
          p.categoryId === target.targetId ||
          p.category?.id === target.targetId ||
          p.subcategoryId === target.targetId
      );
    } else if (target.targetType === 'PRODUCT' && target.targetId) {
      filtered = products.filter((p) => p.id === target.targetId);
    } else if (target.targetType === 'TAG' && target.targetId) {
      filtered = products.filter((p) => {
        const pTags = p.tags || p.productTags || [];
        return pTags.some(
          (t) => String(t.tagId || t.tag?.id || t.id || t) === String(target.targetId)
        );
      });
    } else if (target.targetType === 'COLLECTION' && target.targetId) {
      filtered = products.filter((p) => {
        const pCols = p.collections || p.collectionProducts || [];
        return pCols.some(
          (c) => String(c.collectionId || c.collection?.id || c.id || c) === String(target.targetId)
        );
      });
    }

    const sample = filtered.slice(0, 4);

    return sample.map((prod) => {
      const pricing = getItemPricing(
        { product: prod, quantity: 1 },
        {
          promotions: [currentPromo],
          priceHistory,
          now: new Date(),
        }
      );
      return {
        product: prod,
        pricing,
        isZeroOrLow: pricing.finalPrice <= 1000,
      };
    });
  }, [currentPromo, products, priceHistory]);

  if (promotions.length === 0) {
    return (
      <div className="text-center py-8 bg-surface-elevated/40 rounded-xl border border-dashed border-brand-border/40 p-6">
        <FiGift className="mx-auto text-mauve h-10 w-10 mb-3 opacity-60" />
        <h4 className="text-sm font-semibold text-content">Esta campaña aún no tiene promociones</h4>
        <p className="text-xs text-content-secondary mt-1 max-w-md mx-auto">
          Podés crear descuentos porcentuales, 2x1, combos, precios fijos o envíos gratis asociados.
        </p>
        <button
          type="button"
          onClick={handleAddPromotion}
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-brand text-content rounded-lg text-xs font-medium hover:bg-brand/90 transition-colors shadow-sm"
        >
          <FiPlus size={14} />
          <span>Agregar Primera Promoción</span>
        </button>
      </div>
    );
  }

  const selectedKindObj = PROMO_KINDS.find((k) => k.id === currentPromo.kind) || PROMO_KINDS[0];

  return (
    <div className="space-y-6">
      {/* Pestañas de promociones */}
      <div className="flex items-center justify-between border-b border-brand-border/20 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center space-x-2">
          {promotions.map((promo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePromoIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
                activePromoIndex === idx
                  ? 'bg-brand text-content border border-mauve/40 shadow-xs'
                  : 'bg-surface-elevated text-content-secondary hover:text-content hover:bg-surface-elevated/80'
              }`}
            >
              <span>{promo.name || `Promo #${idx + 1}`}</span>
              <span className="text-[10px] opacity-75 font-mono">({promo.kind})</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddPromotion}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-elevated hover:bg-brand/70 text-content-secondary hover:text-content rounded-lg text-xs font-medium border border-brand-border/30 transition-colors shrink-0"
        >
          <FiPlus size={13} />
          <span>Otra Promo</span>
        </button>
      </div>

      {currentPromo && (
        <div className="space-y-5 bg-surface-elevated/30 p-4 sm:p-5 rounded-xl border border-brand-border/25">
          {/* Header de la promo actual con botón borrar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-content-secondary mb-1">
                Nombre de la Promoción
              </label>
              <input
                type="text"
                value={currentPromo.name || ''}
                onChange={(e) => handleUpdateCurrent('name', e.target.value)}
                placeholder="Ej: 15% OFF en Toda Lencería"
                className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
              />
            </div>
            {promotions.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemovePromotion(activePromoIndex)}
                className="mt-5 text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-950/40 transition-colors"
                title="Eliminar esta promoción"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>

          {/* Selector de Tipo de Promoción */}
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-2">
              Tipo de Promoción
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PROMO_KINDS.map((kind) => {
                const Icon = kind.icon;
                const isSelected = currentPromo.kind === kind.id;
                return (
                  <button
                    key={kind.id}
                    type="button"
                    onClick={() => handleUpdateCurrent('kind', kind.id)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-brand/40 border-mauve text-content shadow-xs ring-1 ring-mauve/40'
                        : 'bg-canvas/60 border-brand-border/25 text-content-secondary hover:text-content hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={isSelected ? 'text-mauve' : 'text-content-muted'} size={15} />
                      <span className="text-xs font-semibold">{kind.label}</span>
                    </div>
                    <p className="text-[11px] text-content-muted line-clamp-2 leading-tight">
                      {kind.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Ayuda y ejemplo contextual */}
            <div className="mt-2.5 p-2.5 rounded-lg bg-canvas/70 border border-brand-border/20 text-xs flex items-start space-x-2 text-content-secondary">
              <FiInfo className="text-mauve mt-0.5 shrink-0" size={14} />
              <div>
                <span className="text-content font-medium">Ejemplo de aplicación: </span>
                <span>{selectedKindObj.example}</span>
              </div>
            </div>
          </div>

          {/* Parámetros dinámicos según el tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {currentPromo.kind === 'PERCENT' && (
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Porcentaje de Descuento (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={currentPromo.value || ''}
                    onChange={(e) => handleUpdateCurrent('value', Number(e.target.value))}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg pl-3 pr-8 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                    placeholder="15"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-content-muted font-bold">%</span>
                </div>
              </div>
            )}

            {(currentPromo.kind === 'FIXED_AMOUNT' || currentPromo.kind === 'FIXED_PRICE') && (
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  {currentPromo.kind === 'FIXED_AMOUNT' ? 'Monto a Descontar ($)' : 'Precio Final Fijo ($)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-content-muted">$</span>
                  <input
                    type="number"
                    min="1"
                    value={currentPromo.value || ''}
                    onChange={(e) => handleUpdateCurrent('value', Number(e.target.value))}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg pl-7 pr-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                    placeholder="5000"
                  />
                </div>
              </div>
            )}

            {currentPromo.kind === 'BUY_X_PAY_Y' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Comprás (Unidades)
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={currentPromo.buyQuantity || 2}
                    onChange={(e) => handleUpdateCurrent('buyQuantity', Number(e.target.value))}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Pagás (Unidades)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentPromo.payQuantity || 1}
                    onChange={(e) => handleUpdateCurrent('payQuantity', Number(e.target.value))}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                  />
                </div>
              </>
            )}

            {currentPromo.kind === 'BUNDLE_PRICE' && (
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Precio Total del Combo ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-content-muted">$</span>
                  <input
                    type="number"
                    min="1"
                    value={currentPromo.value || ''}
                    onChange={(e) => handleUpdateCurrent('value', Number(e.target.value))}
                    className={`w-full bg-canvas border rounded-lg pl-7 pr-3 py-2 text-sm text-content focus:outline-none ${
                      isComboPriceInvalid
                        ? 'border-rose-500 ring-1 ring-rose-500/50'
                        : 'border-brand-border/35 focus:border-mauve'
                    }`}
                    placeholder="22000"
                  />
                </div>

                {/* Feedback de validación de combo */}
                {separateSum > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-content-secondary px-1">
                      <span>Suma de productos por separado:</span>
                      <span className="font-mono font-medium text-content">
                        ${separateSum.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {isComboPriceInvalid ? (
                      <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                        <FiAlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold">Precio de combo no permitido</p>
                          <p className="mt-0.5 text-rose-300/90 leading-relaxed text-[11px]">
                            El precio ingresado (${Number(currentPromo.value || 0).toLocaleString('es-AR')}) es igual o mayor a la suma de comprar los productos por separado (${separateSum.toLocaleString('es-AR')}).
                            Para cumplir con las normas de honestidad y lealtad comercial, el combo debe ser estrictamente más económico.
                          </p>
                        </div>
                      </div>
                    ) : Number(currentPromo.value || 0) > 0 ? (
                      <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
                        <span>Ahorro real para el cliente:</span>
                        <span className="font-bold text-emerald-400">
                          ${(separateSum - Number(currentPromo.value)).toLocaleString('es-AR')} (
                          {Math.round(((separateSum - Number(currentPromo.value)) / separateSum) * 100)}% OFF)
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Tope opcional para descuentos porcentuales */}
            {currentPromo.kind === 'PERCENT' && (
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Tope Máximo de Descuento ($ opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentPromo.maxDiscountAmount || ''}
                  onChange={(e) =>
                    handleUpdateCurrent('maxDiscountAmount', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Sin tope"
                  className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
                />
              </div>
            )}

            {/* Cantidad mínima requerida */}
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1">
                Cantidad Mínima Requerida
              </label>
              <input
                type="number"
                min="1"
                value={currentPromo.minQuantity || ''}
                onChange={(e) =>
                  handleUpdateCurrent('minQuantity', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="1 (cualquier cantidad)"
                className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-mauve"
              />
            </div>
          </div>

          {/* Selector de Alcance (Targets) */}
          <div className="pt-3 border-t border-brand-border/20">
            <h5 className="text-xs font-semibold text-content mb-2 flex items-center space-x-1.5">
              <span>Alcance de la Promoción (Productos Incluidos)</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Aplica a:
                </label>
                <select
                  value={currentPromo.targets?.[0]?.targetType || 'ALL'}
                  onChange={(e) => {
                    const newType = e.target.value;
                    handleUpdateCurrent('targets', [
                      { targetType: newType, targetId: null, excluded: false },
                    ]);
                  }}
                  className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                >
                  {TARGET_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {currentPromo.targets?.[0]?.targetType === 'CATEGORY' && (
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Seleccionar Categoría
                  </label>
                  <select
                    value={currentPromo.targets?.[0]?.targetId || ''}
                    onChange={(e) => {
                      const t = currentPromo.targets?.[0] || { targetType: 'CATEGORY' };
                      handleUpdateCurrent('targets', [{ ...t, targetId: e.target.value }]);
                    }}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  >
                    <option value="">-- Elegir categoría --</option>
                    {rootCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentPromo.targets?.[0]?.targetType === 'SUBCATEGORY' && (
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Seleccionar Subcategoría
                  </label>
                  <select
                    value={currentPromo.targets?.[0]?.targetId || ''}
                    onChange={(e) => {
                      const t = currentPromo.targets?.[0] || { targetType: 'SUBCATEGORY' };
                      handleUpdateCurrent('targets', [{ ...t, targetId: e.target.value }]);
                    }}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  >
                    <option value="">-- Elegir subcategoría --</option>
                    {rootCategories.map((parent) => {
                      const subs = subcategoriesList.filter((s) => s.parentId === parent.id);
                      if (subs.length === 0) return null;
                      return (
                        <optgroup key={parent.id} label={parent.name}>
                          {subs.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                    {subcategoriesList
                      .filter((s) => !rootCategories.some((p) => p.id === s.parentId))
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.parent?.name || 'Subcategoría'})
                        </option>
                      ))}
                  </select>
                  {subcategoriesList.length === 0 && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      No hay subcategorías registradas en el catálogo. Podés crearlas en la sección de Categorías.
                    </p>
                  )}
                </div>
              )}

              {currentPromo.targets?.[0]?.targetType === 'PRODUCT' && (
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Seleccionar Producto Específico
                  </label>
                  <select
                    value={currentPromo.targets?.[0]?.targetId || ''}
                    onChange={(e) => {
                      const t = currentPromo.targets?.[0] || { targetType: 'PRODUCT' };
                      handleUpdateCurrent('targets', [{ ...t, targetId: e.target.value }]);
                    }}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  >
                    <option value="">-- Elegir producto --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${Number(p.price).toLocaleString('es-AR')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentPromo.targets?.[0]?.targetType === 'COLLECTION' && (
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Seleccionar Colección
                  </label>
                  <select
                    value={currentPromo.targets?.[0]?.targetId || ''}
                    onChange={(e) => {
                      const t = currentPromo.targets?.[0] || { targetType: 'COLLECTION' };
                      handleUpdateCurrent('targets', [{ ...t, targetId: e.target.value }]);
                    }}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  >
                    <option value="">-- Elegir colección --</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name} ({col.products?.length || 0} productos)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentPromo.targets?.[0]?.targetType === 'TAG' && (
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Seleccionar Etiqueta (Tag)
                  </label>
                  <select
                    value={currentPromo.targets?.[0]?.targetId || ''}
                    onChange={(e) => {
                      const t = currentPromo.targets?.[0] || { targetType: 'TAG' };
                      handleUpdateCurrent('targets', [{ ...t, targetId: e.target.value }]);
                    }}
                    className="w-full bg-canvas border border-brand-border/35 rounded-lg px-3 py-2 text-xs text-content focus:outline-none focus:border-mauve"
                  >
                    <option value="">-- Elegir etiqueta --</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Vista previa en tiempo real con motor de precios */}
          <div className="pt-3 border-t border-brand-border/20">
            <h5 className="text-xs font-semibold text-content mb-2 flex items-center justify-between">
              <span>Vista Previa del Precio Resultante (Calculado con el Motor)</span>
              <span className="text-[10px] text-content-muted font-normal">
                Verificación legal: sin descuentos falsos
              </span>
            </h5>

            {previewProducts.length === 0 ? (
              <p className="text-xs text-content-muted italic">
                No hay productos en catálogo que coincidan con el alcance seleccionado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {previewProducts.map(({ product, pricing, isZeroOrLow }) => (
                  <div
                    key={product.id}
                    className={`p-3 rounded-lg border bg-canvas ${
                      isZeroOrLow ? 'border-amber-500/50' : 'border-brand-border/30'
                    }`}
                  >
                    <p className="text-xs font-medium text-content truncate">{product.name}</p>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        {pricing.compareAtPrice ? (
                          <span className="text-[11px] text-content-muted line-through mr-1.5 font-mono">
                            ${pricing.compareAtPrice.toLocaleString('es-AR')}
                          </span>
                        ) : null}
                        <span className="text-sm font-bold text-mauve font-mono">
                          ${pricing.finalPrice.toLocaleString('es-AR')}
                        </span>
                      </div>
                      {pricing.savingsAmount > 0 && (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.5 rounded font-medium">
                          -{pricing.discountPercent}%
                        </span>
                      )}
                    </div>

                    {isZeroOrLow && (
                      <div className="mt-2 text-[10px] text-amber-300 flex items-center space-x-1">
                        <FiAlertTriangle size={12} className="shrink-0" />
                        <span>¡Atención! Precio muy bajo o $0</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionBuilder;
