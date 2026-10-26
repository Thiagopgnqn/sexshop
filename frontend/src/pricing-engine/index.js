/**
 * Nocturna SexShop — Pricing Engine
 * Módulo único compartido de lógica de precios, promociones, cupones y validación de historial.
 * Compatible con Node.js (backend) y Vite/ESM en navegador (modo demo).
 * Zona horaria de referencia: America/Argentina/Cordoba.
 * Moneda: Pesos Argentinos (ARS) enteros sin centavos.
 */

export const PRICING_ENGINE_VERSION = '1.0.0';
export const DEFAULT_PRICE_HISTORY_DAYS = 30;
export const DEFAULT_SHIPPING_COST = 4500;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 50000;
export const DEFAULT_TRANSFER_DISCOUNT_PERCENT = 10;

/**
 * Redondeo reglamentario a pesos enteros argentinos no negativos.
 */
export const roundARS = (val) => {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num));
};

/**
 * Normaliza claves de cliente para límites de cupones (email o teléfono).
 */
export const normalizeCustomerKey = ({ email, phone }) => {
  if (email && String(email).trim()) {
    return `email:${String(email).trim().toLowerCase()}`;
  }
  if (phone && String(phone).trim()) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits) return `phone:${digits}`;
  }
  return null;
};

/**
 * Verifica si una entidad temporal (Campaña, Promoción, Cupón) está vigente.
 */
export const isPeriodActive = (entity, now = new Date()) => {
  if (!entity) return false;
  if (entity.active === false) return false;

  const current = new Date(now).getTime();
  if (Number.isNaN(current)) return false;

  if (entity.startsAt) {
    const start = new Date(entity.startsAt).getTime();
    if (!Number.isNaN(start) && current < start) return false;
  }

  if (entity.endsAt) {
    const end = new Date(entity.endsAt).getTime();
    if (!Number.isNaN(end) && current > end) return false;
  }

  return true;
};

/**
 * Deriva el estado efectivo de una campaña según su estado base y fechas.
 */
export const getEffectiveCampaignStatus = (campaign, now = new Date()) => {
  if (!campaign) return 'ARCHIVED';
  if (campaign.status === 'ARCHIVED') return 'ARCHIVED';
  if (campaign.status === 'DRAFT') return 'DRAFT';

  const current = new Date(now).getTime();
  const start = campaign.startsAt ? new Date(campaign.startsAt).getTime() : null;
  const end = campaign.endsAt ? new Date(campaign.endsAt).getTime() : null;

  if (start && current < start) return 'SCHEDULED';
  if (end && current > end) return 'ENDED';
  return 'ACTIVE';
};

/**
 * REGLA LEGAL Y DE HONESTIDAD:
 * Valida si un producto o variante tuvo efectivamente el precio de lista vigente en los últimos N días.
 * El precio tachado ('antes') SOLO se devuelve si existe registro comprobable en priceHistory.
 * Si no hay historial real o fue introducido como un precio inflado sin vigencia real, devuelve null.
 */
export const validateCompareAtPrice = ({
  productId,
  variantId = null,
  listPrice,
  priceHistory = [],
  days = DEFAULT_PRICE_HISTORY_DAYS,
  now = new Date(),
}) => {
  const current = new Date(now).getTime();
  const thresholdMs = days * 24 * 60 * 60 * 1000;
  const expectedPrice = roundARS(listPrice);

  if (!Array.isArray(priceHistory) || priceHistory.length === 0 || expectedPrice <= 0) {
    return null;
  }

  // Filtrar registros correspondientes al producto o variante específica
  const matchingRecords = priceHistory.filter((rec) => {
    if (!rec) return false;
    const sameProduct = String(rec.productId) === String(productId);
    if (!sameProduct) return false;

    if (variantId) {
      // Si se consulta una variante, preferir registros de la variante o registros de producto base
      return !rec.variantId || String(rec.variantId) === String(variantId);
    }
    return !rec.variantId || rec.variantId === null;
  });

  if (matchingRecords.length === 0) return null;

  // REGLA LEGAL DE HONESTIDAD:
  // El precio tachado ('antes') SOLO se muestra si el producto o variante tiene un historial
  // comprobable de al menos N días (default 30) en el que el precio regular estuvo vigente.
  // Un producto sin historial de al menos N días (ej. recién importado hoy o con menos de 30 días)
  // NO puede mostrar precio tachado.
  const hasAntiquity = matchingRecords.some((rec) => {
    const changedTime = new Date(rec.changedAt || rec.createdAt || 0).getTime();
    const diff = current - changedTime;
    const priceMatch = roundARS(rec.oldPrice) === expectedPrice || roundARS(rec.newPrice) === expectedPrice;
    return priceMatch && diff >= thresholdMs;
  });

  if (!hasAntiquity) {
    return null;
  }

  // Verificar que en los últimos N días no haya habido una alteración que rompa la vigencia
  const hasRecentConflict = matchingRecords.some((rec) => {
    const changedTime = new Date(rec.changedAt || rec.createdAt || 0).getTime();
    const diff = current - changedTime;
    if (diff >= 0 && diff < thresholdMs) {
      const recPrice = roundARS(rec.newPrice);
      if (recPrice > 0 && recPrice !== expectedPrice) {
        return true;
      }
    }
    return false;
  });

  if (hasRecentConflict) {
    return null;
  }

  return expectedPrice;
};

/**
 * Evalúa si un ítem coincide con un target de promoción.
 */
export const matchesTarget = (target, item) => {
  if (!target || !item) return false;
  const type = String(target.targetType || '').toUpperCase();
  const targetId = target.targetId ? String(target.targetId) : null;

  if (type === 'ALL') return true;

  const product = item.product || item;
  const variant = item.variant || null;
  const productId = String(item.productId || product?.id || '');
  const variantId = item.variantId ? String(item.variantId) : variant?.id ? String(variant.id) : null;

  if (type === 'PRODUCT') {
    return Boolean(targetId && productId === targetId);
  }

  if (type === 'VARIANT') {
    return Boolean(targetId && variantId && variantId === targetId);
  }

  const categoryId = product?.categoryId ? String(product.categoryId) : product?.category?.id ? String(product.category.id) : null;
  const parentCategoryId = product?.category?.parentId ? String(product.category.parentId) : null;

  if (type === 'CATEGORY') {
    return Boolean(targetId && (categoryId === targetId || parentCategoryId === targetId));
  }

  if (type === 'SUBCATEGORY') {
    return Boolean(targetId && categoryId === targetId);
  }

  if (type === 'TAG') {
    const productTags = product?.tags || product?.productTags || [];
    return productTags.some((pt) => {
      const tagId = pt.tagId || pt.tag?.id || pt.id || pt;
      const tagName = pt.tag?.name || pt.name || pt;
      return String(tagId) === targetId || String(tagName).toLowerCase() === String(targetId).toLowerCase();
    });
  }

  if (type === 'COLLECTION') {
    const collections = product?.collections || product?.collectionProducts || [];
    return collections.some((c) => {
      const collId = c.collectionId || c.collection?.id || c.id || c;
      return String(collId) === targetId;
    });
  }

  return false;
};

/**
 * Determina si una promoción aplica a un ítem, respetando inclusiones y exclusiones.
 */
export const isPromotionApplicableToItem = (promotion, item) => {
  if (!promotion || !item) return false;

  const targets = Array.isArray(promotion.targets) ? promotion.targets : [];

  // Si no hay targets configurados, por defecto aplica a todo salvo exclusión explícita
  if (targets.length === 0) return true;

  // Si hay alguna regla de exclusión que coincida con el ítem, queda excluido
  const isExcluded = targets.some((t) => t.excluded && matchesTarget(t, item));
  if (isExcluded) return false;

  // Reglas de inclusión
  const inclusionTargets = targets.filter((t) => !t.excluded);
  if (inclusionTargets.length === 0) return true;

  return inclusionTargets.some((t) => matchesTarget(t, item));
};

/**
 * Calcula el precio de un ítem individual considerando promociones automáticas de producto y validando el precio tachado.
 *
 * @param {Object} item - { product, variant, quantity }
 * @param {Object} context - { promotions, campaigns, priceHistory, now, historyDays }
 * @returns {Object} { finalPrice, listPrice, discountPercent, savingsAmount, promotionLabel, badge, compareAtPrice, promotionId, campaignId }
 */
export const getItemPricing = (item, context = {}) => {
  const {
    promotions = [],
    campaigns = [],
    priceHistory = [],
    now = new Date(),
    historyDays = DEFAULT_PRICE_HISTORY_DAYS,
  } = context;

  const product = item.product || item;
  const variant = item.variant || null;
  const quantity = Math.max(1, Number(item.quantity || 1));

  const listPrice = roundARS(variant ? variant.price : product.price);
  if (listPrice <= 0) {
    return {
      finalPrice: 0,
      listPrice: 0,
      discountPercent: 0,
      savingsAmount: 0,
      promotionLabel: null,
      badge: null,
      compareAtPrice: null,
      promotionId: null,
      campaignId: null,
    };
  }

  const campaignMap = new Map((campaigns || []).map((c) => [c.id, c]));

  // Filtrar promociones activas y aplicables a este ítem a nivel producto
  const itemKinds = ['PERCENT', 'FIXED_AMOUNT', 'FIXED_PRICE'];
  const eligiblePromotions = promotions.filter((promo) => {
    if (!promo || !itemKinds.includes(promo.kind)) return false;

    // Verificar vigencia de campaña
    if (promo.campaignId) {
      const parentCamp = campaignMap.get(promo.campaignId);
      if (parentCamp && !isPeriodActive(parentCamp, now)) return false;
    }

    // Heredar fechas de la campaña si no las tiene propias
    const effectivePromo = {
      ...promo,
      startsAt: promo.startsAt || (promo.campaignId ? campaignMap.get(promo.campaignId)?.startsAt : null),
      endsAt: promo.endsAt || (promo.campaignId ? campaignMap.get(promo.campaignId)?.endsAt : null),
    };

    if (!isPeriodActive(effectivePromo, now)) return false;

    // Verificar límite de uso
    if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) return false;

    // Verificar cantidad mínima de ítem
    if (promo.minQuantity && quantity < promo.minQuantity) return false;

    // Verificar targets
    return isPromotionApplicableToItem(promo, item);
  });

  if (eligiblePromotions.length === 0) {
    return {
      finalPrice: listPrice,
      listPrice,
      discountPercent: 0,
      savingsAmount: 0,
      promotionLabel: null,
      badge: product.badge || null,
      compareAtPrice: null,
      promotionId: null,
      campaignId: null,
    };
  }

  // Ordenar por prioridad de campaña (desc) y prioridad de promoción (desc)
  const sorted = [...eligiblePromotions].sort((a, b) => {
    const campPriorityA = a.campaignId ? campaignMap.get(a.campaignId)?.priority || 0 : 0;
    const campPriorityB = b.campaignId ? campaignMap.get(b.campaignId)?.priority || 0 : 0;
    if (campPriorityB !== campPriorityA) return campPriorityB - campPriorityA;
    return (b.priority || 0) - (a.priority || 0);
  });

  // Evaluar promociones: separar en acumulables y no acumulables
  const nonStackable = sorted.filter((p) => !p.stackable);
  const stackable = sorted.filter((p) => p.stackable);

  // Calcular el mejor descuento entre las no acumulables
  let bestNonStackable = null;
  let bestDiscountAmount = 0;

  for (const promo of nonStackable) {
    let unitDiscount = 0;
    const rawVal = Number(promo.value || 0);

    if (promo.kind === 'PERCENT') {
      unitDiscount = (listPrice * rawVal) / 100;
    } else if (promo.kind === 'FIXED_AMOUNT') {
      unitDiscount = Math.min(listPrice, rawVal);
    } else if (promo.kind === 'FIXED_PRICE') {
      unitDiscount = Math.max(0, listPrice - rawVal);
    }

    if (promo.maxDiscountAmount != null) {
      unitDiscount = Math.min(unitDiscount, Number(promo.maxDiscountAmount));
    }

    unitDiscount = roundARS(unitDiscount);

    if (unitDiscount > bestDiscountAmount) {
      bestDiscountAmount = unitDiscount;
      bestNonStackable = promo;
    }
  }

  let finalPrice = listPrice;
  let appliedPromo = null;

  if (stackable.length > 0) {
    // Si hay acumulables, aplicar secuencialmente
    let currentPrice = listPrice;
    let promoLabels = [];

    // Si además la mejor no acumulable da un buen piso, comparamos o incluimos
    for (const promo of stackable) {
      const rawVal = Number(promo.value || 0);
      let disc = 0;
      if (promo.kind === 'PERCENT') {
        disc = (currentPrice * rawVal) / 100;
      } else if (promo.kind === 'FIXED_AMOUNT') {
        disc = Math.min(currentPrice, rawVal);
      } else if (promo.kind === 'FIXED_PRICE') {
        disc = Math.max(0, currentPrice - rawVal);
      }

      if (promo.maxDiscountAmount != null) {
        disc = Math.min(disc, Number(promo.maxDiscountAmount));
      }

      disc = roundARS(disc);
      currentPrice = Math.max(0, currentPrice - disc);
      promoLabels.push(promo.name);
    }

    const stackableDiscount = listPrice - currentPrice;
    if (bestDiscountAmount > stackableDiscount) {
      finalPrice = Math.max(0, listPrice - bestDiscountAmount);
      appliedPromo = bestNonStackable;
    } else {
      finalPrice = currentPrice;
      appliedPromo = stackable[0];
    }
  } else if (bestNonStackable) {
    finalPrice = Math.max(0, listPrice - bestDiscountAmount);
    appliedPromo = bestNonStackable;
  }

  finalPrice = roundARS(finalPrice);
  const savingsAmount = Math.max(0, listPrice - finalPrice);
  const discountPercent = listPrice > 0 ? Math.round((savingsAmount / listPrice) * 100) : 0;

  // Validación de honestidad para compareAtPrice
  let compareAtPrice = null;
  if (savingsAmount > 0) {
    compareAtPrice = validateCompareAtPrice({
      productId: product.id,
      variantId: variant?.id || null,
      listPrice,
      priceHistory,
      days: historyDays,
      now,
    });
  }

  return {
    finalPrice,
    listPrice,
    discountPercent,
    savingsAmount,
    promotionLabel: appliedPromo ? appliedPromo.name : null,
    badge: appliedPromo ? appliedPromo.name : product.badge || null,
    compareAtPrice,
    promotionId: appliedPromo ? appliedPromo.id : null,
    campaignId: appliedPromo ? appliedPromo.campaignId || null : null,
  };
};

/**
 * Cotiza el carrito completo siguiendo estrictamente el orden de aplicación:
 * 1. Base unit price (variante o producto)
 * 2. Item-level promotions (mejor automática por ítem o acumulable)
 * 3. Cart-level promotions (BUY_X_PAY_Y, BUNDLE_PRICE, TIERED)
 * 4. Cupones (PERCENT, FIXED_AMOUNT, FREE_SHIPPING) con validación de límites y acumulabilidad
 * 5. Descuento por método de pago (ej. Transferencia bancaria)
 * 6. Costo de envío (con validación de envío gratis por monto o beneficio de cupón/promo)
 */
export const quoteCart = (cart = { items: [] }, options = {}) => {
  const {
    couponCode = null,
    paymentMethod = null,
    customerEmail = null,
    customerPhone = null,
    shippingContext = {},
    promotions = [],
    campaigns = [],
    coupons = [],
    couponRedemptions = [],
    priceHistory = [],
    now = new Date(),
    historyDays = DEFAULT_PRICE_HISTORY_DAYS,
    freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
    baseShippingCost = DEFAULT_SHIPPING_COST,
    transferDiscountPercent = DEFAULT_TRANSFER_DISCOUNT_PERCENT,
  } = options;

  const rawItems = Array.isArray(cart.items) ? cart.items : [];
  const campaignMap = new Map((campaigns || []).map((c) => [c.id, c]));

  // 1 & 2. Cotización y promociones a nivel ítem
  let subtotal = 0;
  let subtotalAfterItemDiscounts = 0;
  let totalItemSavings = 0;
  const quotedItems = [];

  for (const rawItem of rawItems) {
    const product = rawItem.product || rawItem;
    const variant = rawItem.variant || null;
    const quantity = Math.max(1, Number(rawItem.quantity || 1));

    const itemPricing = getItemPricing(
      { product, variant, quantity },
      { promotions, campaigns, priceHistory, now, historyDays }
    );

    const itemSubtotal = roundARS(itemPricing.finalPrice * quantity);
    const itemListSubtotal = roundARS(itemPricing.listPrice * quantity);
    const itemTotalDiscount = roundARS(itemPricing.savingsAmount * quantity);

    subtotal += itemListSubtotal;
    subtotalAfterItemDiscounts += itemSubtotal;
    totalItemSavings += itemTotalDiscount;

    quotedItems.push({
      product,
      variant,
      productId: product.id,
      variantId: variant?.id || rawItem.variantId || null,
      variantDescription: rawItem.variantDescription || null,
      productName: product.name,
      sku: variant?.sku || product.sku || null,
      quantity,
      originalUnitPrice: itemPricing.listPrice,
      unitPrice: itemPricing.finalPrice,
      discountAmount: itemPricing.savingsAmount,
      subtotal: itemSubtotal,
      promotionId: itemPricing.promotionId,
      campaignId: itemPricing.campaignId,
      promotionLabel: itemPricing.promotionLabel,
      badge: itemPricing.badge,
      compareAtPrice: itemPricing.compareAtPrice,
    });
  }

  // 3. Promociones de Carrito (BUY_X_PAY_Y, BUNDLE_PRICE, TIERED)
  let cartDiscountsTotal = 0;
  const appliedPromotions = [];

  const cartKinds = ['BUY_X_PAY_Y', 'BUNDLE_PRICE', 'TIERED'];
  const activeCartPromos = promotions.filter((promo) => {
    if (!promo || !cartKinds.includes(promo.kind)) return false;

    if (promo.campaignId) {
      const camp = campaignMap.get(promo.campaignId);
      if (camp && !isPeriodActive(camp, now)) return false;
    }

    const effectivePromo = {
      ...promo,
      startsAt: promo.startsAt || (promo.campaignId ? campaignMap.get(promo.campaignId)?.startsAt : null),
      endsAt: promo.endsAt || (promo.campaignId ? campaignMap.get(promo.campaignId)?.endsAt : null),
    };
    if (!isPeriodActive(effectivePromo, now)) return false;
    if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) return false;
    if (promo.minOrderAmount != null && subtotalAfterItemDiscounts < Number(promo.minOrderAmount)) return false;

    return true;
  });

  // Ordenar por prioridad
  activeCartPromos.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const promo of activeCartPromos) {
    if (promo.kind === 'BUY_X_PAY_Y') {
      const buy = Number(promo.buyQuantity || 2);
      const pay = Number(promo.payQuantity || 1);

      if (buy > pay && buy > 0) {
        // Encontrar ítems aplicables a esta promo
        const eligibleUnits = [];
        for (const it of quotedItems) {
          if (isPromotionApplicableToItem(promo, it)) {
            for (let i = 0; i < it.quantity; i++) {
              eligibleUnits.push(it.unitPrice);
            }
          }
        }

        const totalUnits = eligibleUnits.length;
        if (totalUnits >= buy) {
          // Ordenar precios de menor a mayor: las unidades bonificadas son las de menor valor
          eligibleUnits.sort((a, b) => a - b);
          const setsCount = Math.floor(totalUnits / buy);
          const freeUnitsCount = setsCount * (buy - pay);

          let promoDiscount = 0;
          for (let i = 0; i < freeUnitsCount; i++) {
            promoDiscount += eligibleUnits[i] || 0;
          }

          if (promo.maxDiscountAmount != null) {
            promoDiscount = Math.min(promoDiscount, Number(promo.maxDiscountAmount));
          }

          promoDiscount = roundARS(promoDiscount);
          if (promoDiscount > 0) {
            cartDiscountsTotal += promoDiscount;
            appliedPromotions.push({
              id: promo.id,
              name: promo.name,
              kind: promo.kind,
              discount: promoDiscount,
            });
          }
        }
      }
    } else if (promo.kind === 'BUNDLE_PRICE') {
      // Combo de productos: verifica si todos los bundleSkus o targets están presentes
      let bundleSkus = [];
      try {
        bundleSkus = Array.isArray(promo.bundleSkus)
          ? promo.bundleSkus
          : JSON.parse(promo.bundleSkus || '[]');
      } catch {
        bundleSkus = String(promo.bundleSkus || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (bundleSkus.length > 0) {
        const hasAllSkus = bundleSkus.every((sku) =>
          quotedItems.some((it) => it.sku === sku || it.productId === sku)
        );

        if (hasAllSkus) {
          // Sumar precio actual de los componentes del bundle
          let regularBundleTotal = 0;
          for (const sku of bundleSkus) {
            const found = quotedItems.find((it) => it.sku === sku || it.productId === sku);
            if (found) regularBundleTotal += found.unitPrice;
          }

          const targetBundlePrice = Number(promo.value || 0);
          if (regularBundleTotal > targetBundlePrice) {
            let discount = regularBundleTotal - targetBundlePrice;
            if (promo.maxDiscountAmount != null) {
              discount = Math.min(discount, Number(promo.maxDiscountAmount));
            }
            discount = roundARS(discount);
            cartDiscountsTotal += discount;
            appliedPromotions.push({
              id: promo.id,
              name: promo.name,
              kind: promo.kind,
              discount,
            });
          }
        }
      }
    } else if (promo.kind === 'TIERED') {
      // Escalonado por cantidad
      let tiers = [];
      try {
        tiers = Array.isArray(promo.tiers) ? promo.tiers : JSON.parse(promo.tiers || '[]');
      } catch {
        tiers = [];
      }

      if (tiers.length > 0) {
        // Cantidad total de ítems aplicables
        const matchingItems = quotedItems.filter((it) => isPromotionApplicableToItem(promo, it));
        const totalQty = matchingItems.reduce((acc, it) => acc + it.quantity, 0);

        // Ordenar escalones por cantidad mínima descendente
        const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
        const achievedTier = sortedTiers.find((t) => totalQty >= t.minQuantity);

        if (achievedTier) {
          const matchingSubtotal = matchingItems.reduce((acc, it) => acc + it.subtotal, 0);
          let tierDiscount = 0;
          if (achievedTier.discountPercent) {
            tierDiscount = (matchingSubtotal * Number(achievedTier.discountPercent)) / 100;
          } else if (achievedTier.fixedAmount) {
            tierDiscount = Number(achievedTier.fixedAmount);
          }

          if (promo.maxDiscountAmount != null) {
            tierDiscount = Math.min(tierDiscount, Number(promo.maxDiscountAmount));
          }

          tierDiscount = roundARS(tierDiscount);
          if (tierDiscount > 0) {
            cartDiscountsTotal += tierDiscount;
            appliedPromotions.push({
              id: promo.id,
              name: promo.name,
              kind: promo.kind,
              discount: tierDiscount,
            });
          }
        }
      }
    }
  }

  let subtotalAfterCartDiscounts = Math.max(0, subtotalAfterItemDiscounts - cartDiscountsTotal);

  // 4. Cupones de descuento
  let couponDiscount = 0;
  let appliedCoupon = null;
  let couponError = null;
  let isFreeShippingFromCoupon = false;

  const hasAnyPromotionApplied = totalItemSavings > 0 || cartDiscountsTotal > 0;

  if (couponCode && String(couponCode).trim()) {
    const searchCode = String(couponCode).trim().toUpperCase();
    const matchedCoupon = (coupons || []).find(
      (c) => String(c.code).trim().toUpperCase() === searchCode
    );

    if (!matchedCoupon) {
      couponError = 'El cupón ingresado no existe o no es válido.';
    } else if (!isPeriodActive(matchedCoupon, now)) {
      couponError = 'El cupón ha vencido o todavía no está vigente.';
    } else if (matchedCoupon.usageLimitTotal != null && matchedCoupon.usedCount >= matchedCoupon.usageLimitTotal) {
      couponError = 'El cupón alcanzó su límite de usos disponibles.';
    } else if (matchedCoupon.minOrderAmount != null && subtotalAfterCartDiscounts < Number(matchedCoupon.minOrderAmount)) {
      couponError = `El monto mínimo para aplicar este cupón es de $${roundARS(matchedCoupon.minOrderAmount).toLocaleString('es-AR')}.`;
    } else if (!matchedCoupon.stackableWithPromotions && hasAnyPromotionApplied) {
      couponError = 'Este cupón no es acumulable con otras promociones vigentes.';
    } else {
      // Validar límite por cliente
      const customerKey = normalizeCustomerKey({ email: customerEmail, phone: customerPhone });
      let customerLimitExceeded = false;

      if (matchedCoupon.usageLimitPerCustomer != null && customerKey) {
        const previousUses = (couponRedemptions || []).filter(
          (r) => r.couponId === matchedCoupon.id && r.customerKey === customerKey
        ).length;

        if (previousUses >= matchedCoupon.usageLimitPerCustomer) {
          customerLimitExceeded = true;
          couponError = 'Ya utilizaste este cupón el número máximo de veces permitido.';
        }
      }

      if (!customerLimitExceeded) {
        const couponVal = Number(matchedCoupon.value || 0);
        const k = String(matchedCoupon.kind || matchedCoupon.type || '').toUpperCase();

        if (k === 'PERCENT' || k === 'PERCENTAGE') {
          let disc = (subtotalAfterCartDiscounts * couponVal) / 100;
          if (matchedCoupon.maxDiscountAmount != null) {
            disc = Math.min(disc, Number(matchedCoupon.maxDiscountAmount));
          }
          couponDiscount = roundARS(disc);
        } else if (k === 'FIXED' || k === 'FIXED_AMOUNT') {
          couponDiscount = roundARS(Math.min(subtotalAfterCartDiscounts, couponVal));
        } else if (k === 'FREE_SHIPPING') {
          isFreeShippingFromCoupon = true;
        }

        appliedCoupon = {
          id: matchedCoupon.id,
          code: matchedCoupon.code,
          kind: matchedCoupon.kind,
          value: matchedCoupon.value,
          discount: couponDiscount,
        };
      }
    }
  }

  const subtotalAfterCoupon = Math.max(0, subtotalAfterCartDiscounts - couponDiscount);

  // 5. Descuento por Método de Pago (ej. Transferencia bancaria)
  let paymentMethodDiscount = 0;
  const isTransfer =
    String(paymentMethod || '').trim().toUpperCase() === 'TRANSFER' ||
    String(paymentMethod || '').toLowerCase().includes('transfer');

  if (isTransfer && transferDiscountPercent > 0) {
    paymentMethodDiscount = roundARS((subtotalAfterCoupon * transferDiscountPercent) / 100);
  }

  const subtotalAfterPayment = Math.max(0, subtotalAfterCoupon - paymentMethodDiscount);

  // 6. Costo y descuento de envío
  const isPickup =
    String(shippingContext.deliveryMethod || '').toUpperCase() === 'PICKUP';

  let initialShippingCost = isPickup ? 0 : roundARS(baseShippingCost);
  let shippingDiscount = 0;

  // Promoción de envío gratis automático (por superar monto)
  const qualifiesForFreeShippingByAmount =
    !isPickup && freeShippingThreshold != null && subtotalAfterItemDiscounts >= freeShippingThreshold;

  // O por cupón FREE_SHIPPING
  if (isPickup) {
    shippingDiscount = 0;
    initialShippingCost = 0;
  } else if (isFreeShippingFromCoupon || qualifiesForFreeShippingByAmount) {
    shippingDiscount = initialShippingCost;
  }

  const finalShippingCost = Math.max(0, initialShippingCost - shippingDiscount);

  // 7. Total Final
  const total = roundARS(subtotalAfterPayment + finalShippingCost);
  const totalSavings = roundARS(
    totalItemSavings +
      cartDiscountsTotal +
      couponDiscount +
      paymentMethodDiscount +
      shippingDiscount
  );

  return {
    items: quotedItems,
    subtotal: roundARS(subtotal),
    itemDiscountsTotal: roundARS(totalItemSavings),
    cartDiscountsTotal: roundARS(cartDiscountsTotal),
    subtotalAfterPromotions: roundARS(subtotalAfterCartDiscounts),
    couponDiscount: roundARS(couponDiscount),
    coupon: appliedCoupon,
    couponError,
    paymentMethod: paymentMethod || null,
    paymentMethodDiscount: roundARS(paymentMethodDiscount),
    shipping: {
      deliveryMethod: isPickup ? 'PICKUP' : 'DELIVERY',
      baseCost: initialShippingCost,
      discount: shippingDiscount,
      finalCost: finalShippingCost,
      isFree: !isPickup && finalShippingCost === 0,
      freeShippingThreshold: freeShippingThreshold || null,
    },
    totalSavings,
    total,
    appliedPromotions,
  };
};

/**
 * Enriquece un producto y sus variantes con la cotización vigente, etiquetas de promoción,
 * precio tachado verificado por PriceHistory, promociones activas y badges de catálogo.
 *
 * @param {Object} product - Producto a enriquecer
 * @param {Object} context - { promotions, campaigns, priceHistory, now, historyDays, allProducts }
 * @returns {Object} Producto enriquecido
 */
export const enrichProductWithPricing = (product, context = {}) => {
  if (!product) return product;

  const {
    promotions = [],
    campaigns = [],
    priceHistory = [],
    now = new Date(),
    historyDays = DEFAULT_PRICE_HISTORY_DAYS,
    allProducts = [],
  } = context;

  // 1. Calcular precio base del producto
  const basePricing = getItemPricing(product, {
    promotions,
    campaigns,
    priceHistory,
    now,
    historyDays,
  });

  // 2. Calcular precio individual para cada variante
  const variants = Array.isArray(product.variants)
    ? product.variants.map((v) => {
        const vPricing = getItemPricing(
          { product, variant: v },
          { promotions, campaigns, priceHistory, now, historyDays }
        );
        return {
          ...v,
          pricing: vPricing,
        };
      })
    : [];

  // Si tiene variantes, la visualización de cabecera toma la variante con menor precio final
  let displayPricing = { ...basePricing };
  if (variants.length > 0) {
    const sortedVars = [...variants].sort((a, b) => a.pricing.finalPrice - b.pricing.finalPrice);
    const lowestVar = sortedVars[0];
    if (lowestVar) {
      displayPricing = {
        ...lowestVar.pricing,
        promotionLabel: lowestVar.pricing.promotionLabel || basePricing.promotionLabel,
        badge: lowestVar.pricing.badge || basePricing.badge,
        hasMultiplePrices: variants.some((v) => v.pricing.finalPrice !== lowestVar.pricing.finalPrice),
      };
    }
  }

  // 3. Badges automáticos por reglas reales
  // - "Nuevo": creado dentro de los últimos 30 días
  const createdAtMs = new Date(product.createdAt || 0).getTime();
  const nowMs = new Date(now).getTime();
  const isNew = Boolean(createdAtMs && nowMs - createdAtMs <= 30 * 24 * 60 * 60 * 1000);

  // - "Más vendido": por ventas reales (soldCount >= 2 o campo badge previo)
  const soldCount = Number(product.soldCount || 0);
  const isBestSeller = soldCount >= 2;

  // - "Últimas unidades": por stock real (1 a 3 unidades totales)
  const totalStock = variants.length > 0
    ? variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : Number(product.stock || 0);
  const isLowStock = totalStock > 0 && totalStock <= 3;

  // 4. Promociones activas que aplican a este producto (para condiciones legales y chips)
  const applicablePromotions = (promotions || [])
    .filter((promo) => {
      if (!promo || promo.active === false) return false;
      if (!isPeriodActive(promo, now)) return false;
      if (promo.campaignId) {
        const camp = (campaigns || []).find((c) => c.id === promo.campaignId);
        if (camp && !isPeriodActive(camp, now)) return false;
      }
      return isPromotionApplicableToItem(promo, product);
    })
    .map((promo) => {
      let badgeLabel = promo.name;
      if (promo.kind === 'BUY_X_PAY_Y') {
        badgeLabel = `${promo.buyQuantity}x${promo.payQuantity}`;
      } else if (promo.kind === 'PERCENT') {
        badgeLabel = `${promo.value}% OFF`;
      } else if (promo.kind === 'BUNDLE_PRICE') {
        badgeLabel = 'Combo';
      }

      return {
        id: promo.id,
        name: promo.name,
        kind: promo.kind,
        value: promo.value,
        badgeLabel,
        conditions: {
          minQuantity: promo.minQuantity || (promo.kind === 'BUY_X_PAY_Y' ? promo.buyQuantity : null),
          maxDiscountAmount: promo.maxDiscountAmount || null,
          startsAt: promo.startsAt || null,
          endsAt: promo.endsAt || null,
          usageLimit: promo.usageLimit || null,
          stockNotice: 'Hasta agotar stock disponible',
        },
      };
    });

  // 5. Combos "Comprá junto y ahorrá"
  const comboPromotions = (promotions || [])
    .filter((promo) => {
      if (promo.kind !== 'BUNDLE_PRICE' || promo.active === false) return false;
      if (!isPeriodActive(promo, now)) return false;
      let bundleSkus = [];
      try {
        bundleSkus = Array.isArray(promo.bundleSkus)
          ? promo.bundleSkus
          : JSON.parse(promo.bundleSkus || '[]');
      } catch {
        bundleSkus = String(promo.bundleSkus || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      const mySkus = [product.sku, ...variants.map((v) => v.sku), product.id].filter(Boolean);
      return bundleSkus.some((bs) => mySkus.includes(bs));
    })
    .map((promo) => {
      let bundleSkus = [];
      try {
        bundleSkus = Array.isArray(promo.bundleSkus)
          ? promo.bundleSkus
          : JSON.parse(promo.bundleSkus || '[]');
      } catch {
        bundleSkus = String(promo.bundleSkus || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      const bundleItems = (allProducts || []).filter((p) => {
        const pSkus = [p.sku, ...(p.variants || []).map((v) => v.sku), p.id].filter(Boolean);
        return bundleSkus.some((bs) => pSkus.includes(bs));
      });
      const regularTotal = bundleItems.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
      const bundlePrice = Number(promo.value || 0);
      const savings = Math.max(0, regularTotal - bundlePrice);
      return {
        id: promo.id,
        name: promo.name,
        bundlePrice,
        regularTotal,
        savings,
        items: bundleItems,
      };
    });

  return {
    ...product,
    variants,
    pricing: displayPricing,
    activePromotions: applicablePromotions,
    comboPromotions,
    isNew,
    isBestSeller,
    isLowStock,
    totalStock,
  };
};

/**
 * Presets de Temas de Campaña (Black Friday, Cyber/Hot Sale, Día de la Madre, San Valentín, Navidad, Liquidación, Neutro)
 * Diseñados estrictamente con contraste AA verificado sobre fondo oscuro (#0F0A0A / #1A1212).
 * Gráficos y texturas 100% por código (CSS/SVG), sin imágenes de internet y nada explícito.
 */
export const CAMPAIGN_THEMES = {
  'black-friday': {
    id: 'black-friday',
    name: 'Black Friday',
    accent: '#E5A93C', // Ratio > 11:1 sobre negro
    bgGradient: 'from-[#0A0708] via-[#1E1114] to-[#0A0708]',
    badgeBg: 'bg-[#E5A93C]',
    badgeText: 'text-[#0A0708] font-bold',
    accentText: 'text-[#E5A93C]',
    borderAccent: 'border-[#E5A93C]/40',
    tagText: 'BLACK FRIDAY',
    pattern: 'laser-grid',
  },
  'cyber-sale': {
    id: 'cyber-sale',
    name: 'Cyber / Hot Sale',
    accent: '#38BDF8', // Ratio > 10.5:1 sobre negro
    bgGradient: 'from-[#0B0F19] via-[#0F172A] to-[#0B0F19]',
    badgeBg: 'bg-[#38BDF8]',
    badgeText: 'text-[#0F172A] font-bold',
    accentText: 'text-[#38BDF8]',
    borderAccent: 'border-[#38BDF8]/40',
    tagText: 'CYBER SALE',
    pattern: 'cyber-glow',
  },
  'dia-de-la-madre': {
    id: 'dia-de-la-madre',
    name: 'Día de la Madre',
    accent: '#E0A899', // Ratio > 9:1 sobre #0F0A0A
    bgGradient: 'from-[#140D0F] via-[#2A161A] to-[#140D0F]',
    badgeBg: 'bg-[#5A2A2E]',
    badgeText: 'text-[#EDE4E4] font-medium border border-[#E0A899]/30',
    accentText: 'text-[#E0A899]',
    borderAccent: 'border-[#E0A899]/35',
    tagText: 'DÍA DE LA MADRE',
    pattern: 'silk-curves',
  },
  'san-valentin': {
    id: 'san-valentin',
    name: 'San Valentín',
    accent: '#FB7185', // Ratio > 9.5:1 sobre fondo oscuro
    bgGradient: 'from-[#170B10] via-[#2E101D] to-[#170B10]',
    badgeBg: 'bg-[#9F1239]',
    badgeText: 'text-[#FFE4E6] font-medium',
    accentText: 'text-[#FB7185]',
    borderAccent: 'border-[#FB7185]/40',
    tagText: 'SAN VALENTÍN',
    pattern: 'passion-waves',
  },
  navidad: {
    id: 'navidad',
    name: 'Navidad',
    accent: '#FBBF24', // Ratio > 11:1 sobre verde oscuro/negro
    bgGradient: 'from-[#0A140F] via-[#11241A] to-[#0A140F]',
    badgeBg: 'bg-[#14532D]',
    badgeText: 'text-[#FDE68A] font-medium border border-[#FBBF24]/30',
    accentText: 'text-[#FBBF24]',
    borderAccent: 'border-[#FBBF24]/40',
    tagText: 'NAVIDAD',
    pattern: 'starlight',
  },
  liquidacion: {
    id: 'liquidacion',
    name: 'Liquidación',
    accent: '#FB923C', // Ratio > 9.8:1 sobre negro
    bgGradient: 'from-[#190E08] via-[#2E180E] to-[#190E08]',
    badgeBg: 'bg-[#C2410C]',
    badgeText: 'text-[#FFEDD5] font-bold',
    accentText: 'text-[#FB923C]',
    borderAccent: 'border-[#FB923C]/40',
    tagText: 'LIQUIDACIÓN',
    pattern: 'flame-burst',
  },
  neutro: {
    id: 'neutro',
    name: 'Neutro de Marca',
    accent: '#907878',
    bgGradient: 'from-[#0F0A0A] via-[#1A1212] to-[#0F0A0A]',
    badgeBg: 'bg-[#2B1917]',
    badgeText: 'text-[#EDE4E4] font-medium border border-[#907878]/30',
    accentText: 'text-[#907878]',
    borderAccent: 'border-[#907878]/30',
    tagText: 'NOCTURNA',
    pattern: 'nocturna-smoke',
  },
};

export const getCampaignTheme = (themeKey) => {
  return CAMPAIGN_THEMES[themeKey] || CAMPAIGN_THEMES['neutro'];
};

/**
 * Plantillas sugeridas de secciones para el constructor de Portada
 */
export const getSuggestedHomeSectionsTemplate = (templateKey, campaign = null) => {
  const campEnd = campaign?.endsAt || null;

  switch (templateKey) {
    case 'black-friday':
      return [
        {
          type: 'HERO',
          order: 0,
          enabled: true,
          config: {
            headline: 'BLACK FRIDAY NOCTURNA',
            subheadline: 'Precios récord y descuentos salvajes en bienestar íntimo y lencería. Envíos 100% discretos en Córdoba.',
            ctaText: 'Ver Ofertas Exclusivas',
            ctaLink: '/ofertas',
          },
        },
        {
          type: 'COUNTDOWN',
          order: 1,
          enabled: true,
          config: {
            title: 'Cuenta Regresiva Black Friday',
            message: 'Ofertas por tiempo limitado hasta agotar stock físico.',
            targetDate: campEnd,
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Ofertas Relámpago',
            subtitle: 'Precios Exclusivos',
            filter: 'campaign',
            limit: 8,
          },
        },
        {
          type: 'BENEFITS',
          order: 3,
          enabled: true,
          config: {},
        },
        {
          type: 'FAQ',
          order: 4,
          enabled: true,
          config: {},
        },
      ];

    case 'dia-de-la-madre':
      return [
        {
          type: 'CAMPAIGN_BANNER',
          order: 0,
          enabled: true,
          config: {
            title: 'Especial Día de la Madre',
            subtitle: '15% OFF en Lencería Fina y 2x1 en Cosmética Sensorial',
            badge: 'Edición Limitada',
            ctaText: 'Ver Colección Completa',
            ctaLink: campaign?.slug ? `/campanas/${campaign.slug}` : '/ofertas',
          },
        },
        {
          type: 'COUNTDOWN',
          order: 1,
          enabled: true,
          config: {
            title: 'La campaña finaliza en:',
            message: 'Aprovechá los descuentos antes de que terminen.',
            targetDate: campEnd,
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Destacados Día de la Madre',
            subtitle: 'Selección con descuento',
            filter: 'campaign',
            limit: 6,
          },
        },
        {
          type: 'CATEGORY_GRID',
          order: 3,
          enabled: true,
          config: {
            title: 'Categorías de la Colección',
          },
        },
        {
          type: 'BENEFITS',
          order: 4,
          enabled: true,
          config: {},
        },
        {
          type: 'FAQ',
          order: 5,
          enabled: true,
          config: {},
        },
      ];

    case 'cyber-sale':
    case 'hot-sale':
      return [
        {
          type: 'HERO',
          order: 0,
          enabled: true,
          config: {
            headline: 'CYBER SALE NOCTURNA',
            subheadline: 'Hasta 35% OFF en productos seleccionados y 10% adicional por Transferencia.',
            ctaText: 'Aprovechar Descuentos',
            ctaLink: '/ofertas',
          },
        },
        {
          type: 'COUNTDOWN',
          order: 1,
          enabled: true,
          config: {
            title: 'Termina en pocas horas:',
            message: 'Descuentos válidos únicamente durante el Cyber Sale.',
            targetDate: campEnd,
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Más Vendidos con Descuento',
            subtitle: 'Cyber Sale',
            limit: 6,
          },
        },
        {
          type: 'BENEFITS',
          order: 3,
          enabled: true,
          config: {},
        },
      ];

    case 'base':
    default:
      return [
        {
          type: 'HERO',
          order: 0,
          enabled: true,
          config: {
            headline: 'Intimidad, diseño y placer sin tabúes.',
            subheadline: 'Una selección curada de bienestar íntimo, cosmética sensorial y lencería. Comprá con total reserva desde tu casa: envíos 100% discretos en Córdoba y atención personalizada por WhatsApp.',
            ctaText: 'Explorar Colección',
            ctaLink: '/catalogo',
          },
        },
        {
          type: 'CATEGORY_GRID',
          order: 1,
          enabled: true,
          config: {
            title: 'Categorías de la Colección',
            subtitle: 'Universo Nocturna',
          },
        },
        {
          type: 'PRODUCT_GRID',
          order: 2,
          enabled: true,
          config: {
            title: 'Seleccionados para Vos',
            subtitle: 'Curaduría',
            limit: 6,
          },
        },
        {
          type: 'TEXT_BLOCK',
          order: 3,
          enabled: true,
          config: {
            title: 'Una experiencia íntima pensada desde el respeto, la estética y la confidencialidad.',
            id: 'nosotros',
          },
        },
        {
          type: 'BENEFITS',
          order: 4,
          enabled: true,
          config: {},
        },
        {
          type: 'FAQ',
          order: 5,
          enabled: true,
          config: {
            id: 'faq',
          },
        },
      ];
  }
};

/**
 * Resuelve qué secciones deben mostrarse en la portada:
 * - Si hay preview de campaña: muestra sus secciones (o base si no tiene).
 * - Si hay campaña activa: muestra sus secciones (o base si no tiene).
 * - Si no hay campaña: muestra la portada base.
 */
export const resolveActiveHomeSections = ({
  allSections = [],
  activeCampaign = null,
  previewCampaign = null,
  activeOnly = true,
}) => {
  const targetCampaign = previewCampaign || activeCampaign;
  const isPreview = Boolean(previewCampaign);

  const filterEnabled = (list) => (activeOnly ? list.filter((s) => s.enabled !== false) : list);

  if (targetCampaign) {
    const campaignSections = filterEnabled(
      allSections.filter((s) => s.campaignId === targetCampaign.id)
    ).sort((a, b) => (a.order || 0) - (b.order || 0));

    if (campaignSections.length > 0) {
      return {
        sections: campaignSections,
        activeCampaign: targetCampaign,
        theme: getCampaignTheme(targetCampaign.theme),
        isPreview,
      };
    }
  }

  const baseSections = filterEnabled(
    allSections.filter((s) => !s.campaignId || s.campaignId === 'base')
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    sections: baseSections.length > 0 ? baseSections : getSuggestedHomeSectionsTemplate('base'),
    activeCampaign: targetCampaign || null,
    theme: targetCampaign ? getCampaignTheme(targetCampaign.theme) : getCampaignTheme('neutro'),
    isPreview,
  };
};

/**
 * computeMarketingMetrics
 * Lógica compartida para calcular métricas de campañas, cupones y atribución UTM.
 * Usada tanto por el backend real como por el adaptador demo.
 */
export const computeMarketingMetrics = ({
  orders = [],
  campaigns = [],
  coupons = [],
  range = '30d',
  start = null,
  end = null,
}) => {
  let totalRevenue = 0;
  let totalDiscounts = 0;
  let totalUnits = 0;
  const utmSourceCounts = {};
  const utmCampaignCounts = {};
  const utmMediumCounts = {};

  for (const ord of orders) {
    const rev = Number(ord.total) || 0;
    totalRevenue += rev;

    const coupDisc = Number(ord.couponDiscount) || 0;
    const payDisc = Number(ord.paymentMethodDiscount) || 0;
    const shipDisc = Number(ord.shippingDiscount) || 0;
    totalDiscounts += coupDisc + payDisc + shipDisc;

    const items = ord.items || [];
    for (const it of items) {
      totalUnits += Number(it.quantity) || 0;
      if (it.promoDiscount) {
        totalDiscounts += Number(it.promoDiscount) * (Number(it.quantity) || 1);
      }
    }

    const src = (ord.utm_source || 'directo').toLowerCase();
    if (!utmSourceCounts[src]) utmSourceCounts[src] = { orders: 0, revenue: 0 };
    utmSourceCounts[src].orders += 1;
    utmSourceCounts[src].revenue += rev;

    const camp = (ord.utm_campaign || 'sin_campana').toLowerCase();
    if (!utmCampaignCounts[camp]) utmCampaignCounts[camp] = { orders: 0, revenue: 0 };
    utmCampaignCounts[camp].orders += 1;
    utmCampaignCounts[camp].revenue += rev;

    const med = (ord.utm_medium || 'ninguno').toLowerCase();
    if (!utmMediumCounts[med]) utmMediumCounts[med] = { orders: 0, revenue: 0 };
    utmMediumCounts[med].orders += 1;
    utmMediumCounts[med].revenue += rev;
  }

  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const campaignMetrics = campaigns.map((c) => {
    const matchingOrders = orders.filter((o) => {
      if (o.utm_campaign && o.utm_campaign.toLowerCase() === (c.slug || '').toLowerCase()) {
        return true;
      }
      return false;
    });

    let campRevenue = 0;
    let campDiscounts = 0;
    let campUnits = 0;
    const productSoldMap = {};
    const sourcesMap = {};

    for (const mo of matchingOrders) {
      const rev = Number(mo.total) || 0;
      campRevenue += rev;
      campDiscounts +=
        (Number(mo.couponDiscount) || 0) +
        (Number(mo.paymentMethodDiscount) || 0) +
        (Number(mo.shippingDiscount) || 0);

      const src = (mo.utm_source || 'directo').toLowerCase();
      sourcesMap[src] = (sourcesMap[src] || 0) + 1;

      for (const item of mo.items || []) {
        const q = Number(item.quantity) || 0;
        campUnits += q;
        const pId = item.productId || item.product?.id || 'prod';
        const pName = item.product?.name || item.name || 'Producto';
        const pSku = item.product?.sku || item.sku || '';

        if (!productSoldMap[pId]) {
          productSoldMap[pId] = { id: pId, name: pName, sku: pSku, quantity: 0, revenue: 0 };
        }
        productSoldMap[pId].quantity += q;
        productSoldMap[pId].revenue += (Number(item.price) || 0) * q;
      }
    }

    const views = Number(c.views) || 0;
    const cOrders = matchingOrders.length;
    const conversionRate = views > 0 ? Number(((cOrders / views) * 100).toFixed(2)) : 0;
    const campAvgTicket = cOrders > 0 ? Math.round(campRevenue / cOrders) : 0;
    const topProducts = Object.values(productSoldMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      status: c.status,
      views,
      ordersCount: cOrders,
      unitsSold: campUnits,
      revenue: Math.round(campRevenue),
      discountsGranted: Math.round(campDiscounts),
      averageTicket: campAvgTicket,
      conversionRate,
      topProducts,
      sourcesBreakdown: sourcesMap,
    };
  });

  const couponMetrics = coupons.map((cp) => {
    const matchingOrders = orders.filter((o) => {
      if (!o.couponCode) return false;
      return o.couponCode.trim().toUpperCase() === cp.code.trim().toUpperCase();
    });

    let coupRevenue = 0;
    let coupDiscounts = 0;

    for (const mo of matchingOrders) {
      coupRevenue += Number(mo.total) || 0;
      coupDiscounts += Number(mo.couponDiscount) || 0;
    }

    const redemptions = matchingOrders.length;
    const avgTicket = redemptions > 0 ? Math.round(coupRevenue / redemptions) : 0;

    return {
      id: cp.id,
      code: cp.code,
      type: cp.type,
      value: Number(cp.value) || 0,
      active: cp.active,
      redemptionsCount: redemptions,
      totalDiscountGranted: Math.round(coupDiscounts),
      totalRevenueGenerated: Math.round(coupRevenue),
      averageTicket: avgTicket,
    };
  });

  return {
    period: {
      range,
      startDate: start instanceof Date ? start.toISOString() : start,
      endDate: end instanceof Date ? end.toISOString() : end,
    },
    overview: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      totalDiscounts: Math.round(totalDiscounts),
      averageTicket,
      totalUnits,
    },
    campaigns: campaignMetrics,
    coupons: couponMetrics,
    utmAttribution: {
      bySource: Object.entries(utmSourceCounts).map(([source, data]) => ({
        source,
        orders: data.orders,
        revenue: Math.round(data.revenue),
        averageTicket: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
      })),
      byCampaign: Object.entries(utmCampaignCounts).map(([campaign, data]) => ({
        campaign,
        orders: data.orders,
        revenue: Math.round(data.revenue),
      })),
      byMedium: Object.entries(utmMediumCounts).map(([medium, data]) => ({
        medium,
        orders: data.orders,
        revenue: Math.round(data.revenue),
      })),
    },
  };
};
