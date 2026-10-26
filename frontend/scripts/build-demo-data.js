import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootCsvPath = path.resolve(__dirname, '../../catalogo_demo.csv');
const localCsvPath = path.resolve(__dirname, '../catalogo_demo.csv');
const outputPath = path.resolve(__dirname, '../src/api/demo/demo-data.json');

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content) {
  const clean = content.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = { _rowNumber: index + 2 };
    headers.forEach((h, i) => {
      row[h] = values[i] !== undefined ? values[i] : '';
    });
    return row;
  });
}

const FEATURED_GROUPS = new Set([
  'Baby Doll Venecia',
  'Body Marley',
  'Aceite comestible Love Potion',
  'Vela de masaje 30 g',
  'Perfume Hot Inevitable',
  'Safary',
]);

function buildDemoData() {
  const csvPath = fs.existsSync(rootCsvPath) ? rootCsvPath : localCsvPath;
  if (!fs.existsSync(csvPath)) {
    throw new Error(`No se encontró catalogo_demo.csv en ${rootCsvPath} ni en ${localCsvPath}`);
  }

  const rawCsv = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(rawCsv);

  // 1. Construir árbol de categorías y subcategorías
  const parentMap = new Map();
  const subMap = new Map();
  const categories = [];
  let parentOrder = 1;

  for (const row of rows) {
    const parentName = (row.categoria || 'General').trim();
    const subName = (row.subcategoria || '').trim();

    if (!parentMap.has(parentName)) {
      const parentCat = {
        id: `cat_${slugify(parentName)}`,
        name: parentName,
        slug: slugify(parentName),
        parentId: null,
        order: parentOrder++,
        children: [],
      };
      parentMap.set(parentName, parentCat);
      categories.push(parentCat);
    }

    if (subName) {
      const parentCat = parentMap.get(parentName);
      const subKey = `${parentName}:::${subName}`;
      if (!subMap.has(subKey)) {
        const subSlug = `${parentCat.slug}-${slugify(subName)}`;
        const subCat = {
          id: `sub_${subSlug}`,
          name: subName,
          slug: subSlug,
          parentId: parentCat.id,
          order: parentCat.children.length + 1,
          parent: {
            id: parentCat.id,
            name: parentCat.name,
            slug: parentCat.slug,
          },
          children: [],
        };
        subMap.set(subKey, subCat);
        parentCat.children.push(subCat);
        categories.push(subCat);
      }
    }
  }

  // 2. Agrupar filas por "grupo"
  const groupsMap = new Map();
  for (const row of rows) {
    const groupKey = (row.grupo || row.nombre).trim();
    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, []);
    }
    groupsMap.get(groupKey).push(row);
  }

  const usedSkus = new Set();
  let autoSkuCounter = 1;
  const ensureUniqueSku = (rawSku) => {
    let base = (rawSku || '').trim();
    if (!base) {
      while (true) {
        const candidate = `DEMO-${String(autoSkuCounter++).padStart(4, '0')}`;
        if (!usedSkus.has(candidate)) {
          usedSkus.add(candidate);
          return candidate;
        }
      }
    }
    if (!usedSkus.has(base)) {
      usedSkus.add(base);
      return base;
    }
    let suffix = 2;
    while (usedSkus.has(`${base}-${suffix}`)) {
      suffix += 1;
    }
    const resolved = `${base}-${suffix}`;
    usedSkus.add(resolved);
    return resolved;
  };

  // 3. Construir productos y variantes
  const products = [];
  let prodIndex = 1;
  let varIndex = 1;

  for (const [groupName, groupRows] of groupsMap.entries()) {
    const first = groupRows[0];
    const parentName = (first.categoria || 'General').trim();
    const subName = (first.subcategoria || '').trim();
    const parentCat = parentMap.get(parentName);
    const assignedCat = subName ? subMap.get(`${parentName}:::${subName}`) : parentCat;

    const hasVariantAttrs = (r) =>
      Boolean(
        r.variante_tipo ||
          r.variante_talle ||
          r.variante_color ||
          r.variante_sabor_aroma ||
          r.variante_volumen_medida
      );

    const isMultiVariant = groupRows.length > 1 || hasVariantAttrs(first);
    const productId = `demo_prod_${String(prodIndex).padStart(3, '0')}_${slugify(groupName)}`;
    const isFeatured = FEATURED_GROUPS.has(groupName);

    const variants = [];
    if (isMultiVariant) {
      for (const r of groupRows) {
        const vSku = ensureUniqueSku(r.sku);
        const vPrice = Number(r.precio_ars || 15000);
        const inferredSize =
          r.variante_talle ||
          (subName === 'Línea Free Size'
            ? 'Free Size'
            : parentName === 'Lencería'
            ? 'Talle Único'
            : null);

        variants.push({
          id: `demo_var_${String(varIndex++).padStart(3, '0')}`,
          productId,
          sku: vSku,
          type: r.variante_tipo || null,
          size: inferredSize,
          color: r.variante_color || null,
          flavor: r.variante_sabor_aroma || null,
          volume: r.variante_volumen_medida || null,
          price: vPrice,
          stock: 10,
          active: true,
        });
      }
    }

    const basePrice =
      variants.length > 0
        ? Math.min(...variants.map((v) => v.price))
        : Number(first.precio_ars || 15000);

    const productSku =
      variants.length > 0
        ? first.sku
          ? `${first.sku.trim()}-GRP`
          : ensureUniqueSku('')
        : ensureUniqueSku(first.sku);

    const totalStock = variants.length > 0 ? variants.length * 10 : 10;

    const defaultDesc =
      first.descripcion ||
      `${groupName} — Selección ${parentName}${subName ? ` (${subName})` : ''}. Empaque 100% discreto.`;

    products.push({
      id: productId,
      name: groupName,
      description: defaultDesc,
      sku: productSku,
      price: basePrice,
      transferPrice: Math.round(basePrice * 0.9),
      stock: totalStock,
      imageUrl: null,
      badge: isFeatured ? 'Destacado' : null,
      featured: isFeatured,
      brand: 'Nocturna',
      categoryId: assignedCat.id,
      category: {
        id: assignedCat.id,
        name: assignedCat.name,
        slug: assignedCat.slug,
        parentId: assignedCat.parentId,
        parent: assignedCat.parent || null,
      },
      active: true,
      soldCount: isFeatured ? 25 - prodIndex : 5,
      createdAt: new Date(Date.now() - prodIndex * 3600 * 1000).toISOString(),
      variants,
    });

    prodIndex += 1;
  }

  // 3. Historial de precios inicial (registrado con 45 días de antigüedad para validar compareAtPrice)
  const priceHistory = [];
  const seedTimestamp = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

  for (const prod of products) {
    priceHistory.push({
      id: `demo_ph_${prod.id}_base`,
      productId: prod.id,
      variantId: null,
      oldPrice: prod.price,
      newPrice: prod.price,
      changedAt: seedTimestamp,
      changedBy: 'DEMO_SEED',
      reason: 'PRECIO_INICIAL_CATALOGO',
    });

    for (const v of prod.variants || []) {
      priceHistory.push({
        id: `demo_ph_${v.id}`,
        productId: prod.id,
        variantId: v.id,
        oldPrice: v.price,
        newPrice: v.price,
        changedAt: seedTimestamp,
        changedBy: 'DEMO_SEED',
        reason: 'PRECIO_INICIAL_VARIANTE',
      });
    }
  }

  // 4. Campañas demo iniciales (con fechas relativas y Black Friday como activa)
  const campaigns = [
    {
      id: 'demo_camp_blackfriday',
      name: 'Black Friday',
      slug: 'black-friday',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 86400000).toISOString(), // Empezó ayer
      endsAt: new Date(Date.now() + 7 * 86400000).toISOString(), // Termina en 7 días
      priority: 20,
      active: true,
      headline: 'Black Friday Nocturna: Descuentos de Temporada',
      subheadline: 'Hasta 30% OFF en productos seleccionados y promociones por tiempo limitado con envíos confidenciales.',
      description: 'Campaña activa de Black Friday con promociones de temporada y combos de ahorro.',
      theme: 'black-friday',
      announcementText: '⚡ Black Friday: Hasta 30% OFF en productos seleccionados + Envíos discretos',
      announcementLink: '/campanas/black-friday',
      conditionsText: 'Válido durante el período de Black Friday o hasta agotar stock disponible. Descuentos no acumulables con otros cupones. Envíos 100% discretos en Córdoba.',
      showCountdown: true,
      landingEnabled: true,
      seoTitle: 'Black Friday Nocturna | Ofertas Exclusivas',
      seoDescription: 'Aprovechá las promociones destacadas en boutique íntima con envíos confidenciales.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo_camp_cyberweek',
      name: 'Cyber Week',
      slug: 'cyber-week',
      status: 'SCHEDULED',
      startsAt: new Date(Date.now() + 15 * 86400000).toISOString(), // Empieza en 15 días
      endsAt: new Date(Date.now() + 22 * 86400000).toISOString(), // Termina en 22 días
      priority: 15,
      active: true,
      headline: 'Cyber Week: Anticipo de Promociones Online',
      subheadline: 'Próximamente beneficios exclusivos y combos para parejas.',
      description: 'Campaña programada de Cyber Week.',
      theme: 'cyber-sale',
      announcementText: '🚀 Próximamente: Cyber Week con beneficios exclusivos',
      announcementLink: '/campanas/cyber-week',
      conditionsText: 'Promoción programada. Envíos discretos a todo el país.',
      showCountdown: true,
      landingEnabled: true,
      seoTitle: 'Cyber Week en Nocturna | Próximamente',
      seoDescription: 'Anticipate a las ofertas de Cyber Week en Nocturna SexShop.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo_camp_navidad',
      name: 'Navidad',
      slug: 'navidad',
      status: 'DRAFT',
      startsAt: null, // Borrador sin fechas
      endsAt: null,
      priority: 5,
      active: false,
      headline: 'Regalos íntimos para estas fiestas',
      subheadline: 'Borrador de campaña navideña y fin de año.',
      description: 'Borrador de campaña navideña y fin de año.',
      theme: 'navidad',
      announcementText: '✨ Anticipo de Navidad: Sets exclusivos para regalar',
      announcementLink: '/campanas/navidad',
      conditionsText: 'Promoción especial para las fiestas. Entregas programadas en Córdoba.',
      showCountdown: true,
      landingEnabled: true,
      seoTitle: 'Navidad en Nocturna | Regalos Íntimos',
      seoDescription: 'Encontrá el regalo ideal para estas fiestas con empaque 100% neutro.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo_camp_madre',
      name: 'Día de la Madre',
      slug: 'dia-de-la-madre',
      status: 'ENDED',
      startsAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      endsAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      priority: 0,
      active: false,
      headline: 'Especial Día de la Madre',
      subheadline: 'Promociones pasadas de la temporada.',
      description: 'Campaña finalizada / plantilla.',
      theme: 'dia-de-la-madre',
      announcementText: '🌸 Campaña finalizada',
      announcementLink: '/campanas/dia-de-la-madre',
      conditionsText: 'Campaña finalizada.',
      showCountdown: false,
      landingEnabled: false,
      seoTitle: 'Especial Día de la Madre | Nocturna Sexshop',
      seoDescription: 'Campaña de archivo.',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];

  // 5. Promociones demo iniciales (Combo Aceite + Vela a $22.000 con ahorro real frente a $25.000)
  const pCosm1 =
    products.find((p) => p.name.includes('Love Potion') || p.name.includes('Aceite')) ||
    products.find((p) => p.categoryId === 'cat_cosmetica-intima') ||
    products[0];
  const pCosm2 =
    products.find((p) => (p.name.includes('Vela') || p.name.includes('Soja')) && p.id !== pCosm1.id) ||
    products.find((p) => p.categoryId === 'cat_cosmetica-intima' && p.id !== pCosm1.id) ||
    products[1];

  const promotions = [
    {
      id: 'demo_promo_bf_lenceria',
      campaignId: 'demo_camp_blackfriday',
      name: '20% OFF en Lencería',
      kind: 'PERCENT',
      value: 20,
      stackable: true,
      startsAt: null,
      endsAt: null,
      active: true,
      priority: 5,
      targets: [{ targetType: 'CATEGORY', targetId: 'cat_lenceria', excluded: false }],
    },
    {
      id: 'demo_promo_2x1_cosmetica',
      campaignId: 'demo_camp_blackfriday',
      name: '2x1 en Cosmética íntima',
      kind: 'BUY_X_PAY_Y',
      buyQuantity: 2,
      payQuantity: 1,
      stackable: false,
      startsAt: null,
      endsAt: null,
      active: true,
      priority: 8,
      targets: [{ targetType: 'CATEGORY', targetId: 'cat_cosmetica-intima', excluded: false }],
    },
    {
      id: 'demo_promo_combo_parejas',
      campaignId: 'demo_camp_blackfriday',
      name: 'Combo Sensorial: Aceite + Vela a $22.000',
      kind: 'BUNDLE_PRICE',
      bundleSkus: JSON.stringify([pCosm1.sku, pCosm2.sku]),
      value: 22000,
      stackable: false,
      active: true,
      priority: 9,
      targets: [
        { targetType: 'PRODUCT', targetId: pCosm1.id, excluded: false },
        { targetType: 'PRODUCT', targetId: pCosm2.id, excluded: false },
      ],
    },
    {
      id: 'demo_promo_tiered',
      campaignId: 'demo_camp_blackfriday',
      name: 'Descuento Escalonado por Cantidad',
      kind: 'TIERED',
      stackable: true,
      active: true,
      priority: 3,
      tiers: JSON.stringify([
        { minQuantity: 3, discountPercent: 10 },
        { minQuantity: 5, discountPercent: 20 },
      ]),
      targets: [{ targetType: 'ALL', excluded: false }],
    },
  ];

  // 6. Cupones demo iniciales
  const coupons = [
    {
      id: 'demo_coupon_bienvenida10',
      code: 'BIENVENIDA10',
      kind: 'PERCENT',
      value: 10,
      minOrderAmount: 20000,
      maxDiscountAmount: 10000,
      startsAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      endsAt: new Date(Date.now() + 60 * 86400000).toISOString(),
      usageLimitTotal: 100,
      usageLimitPerCustomer: 1,
      usedCount: 3,
      active: true,
      stackableWithPromotions: true,
      campaignId: 'demo_camp_madre',
      appliesTo: 'ALL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo_coupon_enviogratis',
      code: 'ENVIOGRATIS',
      kind: 'FREE_SHIPPING',
      value: 0,
      minOrderAmount: 15000,
      startsAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      endsAt: new Date(Date.now() + 45 * 86400000).toISOString(),
      usageLimitTotal: 200,
      usageLimitPerCustomer: 2,
      usedCount: 1,
      active: true,
      stackableWithPromotions: true,
      campaignId: null,
      appliesTo: 'ALL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo_coupon_vip5000',
      code: 'VIP5000',
      kind: 'FIXED_AMOUNT',
      value: 5000,
      minOrderAmount: 40000,
      maxDiscountAmount: 5000,
      startsAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      endsAt: new Date(Date.now() + 20 * 86400000).toISOString(),
      usageLimitTotal: 30,
      usageLimitPerCustomer: 1,
      usedCount: 0,
      active: true,
      stackableWithPromotions: true,
      campaignId: 'demo_camp_madre',
      appliesTo: 'ALL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 7. Tags y Colecciones demo
  const tags = [
    { id: 'tag_imperdible', name: 'Imperdible', slug: 'imperdible' },
    { id: 'tag_favorito', name: 'Favorito', slug: 'favorito' },
    { id: 'tag_nuevo', name: 'Nuevo', slug: 'nuevo' },
    { id: 'tag_sensual', name: 'Sensual', slug: 'sensual' },
    { id: 'tag_edicion_limitada', name: 'Edición Limitada', slug: 'edicion-limitada' },
  ];

  const collections = [
    {
      id: 'coll_regalos_ella',
      name: 'Regalos para ella',
      slug: 'regalos-para-ella',
      description: 'Lencería, prendas seductoras y aromas cautivantes',
      active: true,
      products: products.slice(0, 4).map((p, idx) => ({
        collectionId: 'coll_regalos_ella',
        productId: p.id,
        order: idx,
      })),
    },
    {
      id: 'coll_parejas',
      name: 'Para parejas',
      slug: 'para-parejas',
      description: 'Juegos, geles y cosmética para disfrutar de a dos',
      active: true,
      products: products.slice(4, 8).map((p, idx) => ({
        collectionId: 'coll_parejas',
        productId: p.id,
        order: idx,
      })),
    },
    {
      id: 'coll_novedades',
      name: 'Novedades',
      slug: 'novedades',
      description: 'Los últimos ingresos de la temporada',
      active: true,
      products: products.slice(8, 12).map((p, idx) => ({
        collectionId: 'coll_novedades',
        productId: p.id,
        order: idx,
      })),
    },
  ];

  // 8. Secciones de Portada (HomeSections)
  const homeSections = [
    // Portada Base (campaignId: null)
    {
      id: 'sec_base_01',
      campaignId: null,
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
      id: 'sec_base_02',
      campaignId: null,
      type: 'CATEGORY_GRID',
      order: 1,
      enabled: true,
      config: {
        title: 'Categorías de la Colección',
        subtitle: 'Universo Nocturna',
      },
    },
    {
      id: 'sec_base_03',
      campaignId: null,
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
      id: 'sec_base_04',
      campaignId: null,
      type: 'TEXT_BLOCK',
      order: 3,
      enabled: true,
      config: {
        title: 'Una experiencia íntima pensada desde el respeto, la estética y la confidencialidad.',
        id: 'nosotros',
      },
    },
    {
      id: 'sec_base_05',
      campaignId: null,
      type: 'BENEFITS',
      order: 4,
      enabled: true,
      config: {},
    },
    {
      id: 'sec_base_06',
      campaignId: null,
      type: 'FAQ',
      order: 5,
      enabled: true,
      config: {
        id: 'faq',
      },
    },

    // Campaña Activa: Black Friday
    {
      id: 'sec_bf_01',
      campaignId: 'demo_camp_blackfriday',
      type: 'HERO',
      order: 0,
      enabled: true,
      config: {
        headline: 'BLACK FRIDAY NOCTURNA',
        subheadline: 'Promociones de temporada en bienestar íntimo y lencería. Envíos 100% discretos en Córdoba.',
        ctaText: 'Aprovechar Ofertas',
        ctaLink: '/campanas/black-friday',
      },
    },
    {
      id: 'sec_bf_02',
      campaignId: 'demo_camp_blackfriday',
      type: 'COUNTDOWN',
      order: 1,
      enabled: true,
      config: {
        title: 'La campaña de Black Friday finaliza en:',
        message: 'Promociones válidas por tiempo limitado o hasta agotar stock físico.',
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    },
    {
      id: 'sec_bf_03',
      campaignId: 'demo_camp_blackfriday',
      type: 'PRODUCT_GRID',
      order: 2,
      enabled: true,
      config: {
        title: 'Ofertas Destacadas de Black Friday',
        subtitle: 'Hasta 30% OFF en productos seleccionados',
        filter: 'campaign',
        limit: 8,
      },
    },
    {
      id: 'sec_bf_04',
      campaignId: 'demo_camp_blackfriday',
      type: 'BENEFITS',
      order: 3,
      enabled: true,
      config: {},
    },

    // Campaña Finalizada: Día de la Madre
    {
      id: 'sec_madre_01',
      campaignId: 'demo_camp_madre',
      type: 'CAMPAIGN_BANNER',
      order: 0,
      enabled: false,
      config: {
        title: 'Especial Día de la Madre',
        subtitle: '15% OFF en Lencería y 2x1 en Cosmética íntima con envíos discretos en Córdoba.',
        badge: 'Campaña Finalizada',
        ctaText: 'Ver Colección',
        ctaLink: '/campanas/dia-de-la-madre',
      },
    },
  ];

  const settings = {
    shippingCost: 4500,
    freeShippingThreshold: 45000,
    freePickupEnabled: true,
    transferDiscountPercent: 10,
    transferDiscountEnabled: true,
    priceHistoryDays: 30,
    generalTermsText: 'Envíos 100% discretos en empaque neutro sin identificación del contenido.',
    shippingNoticeText: 'Envío gratis a todo el país superando el monto mínimo de compra.',
    bankTransferInstructions: 'Transferencia bancaria. Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp.',
  };

  const outputData = {
    generatedAt: new Date().toISOString(),
    settings,
    categories,
    products,
    priceHistory,
    campaigns,
    promotions,
    coupons,
    tags,
    collections,
    homeSections,
    couponRedemptions: [],
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(
    `[demo:build-data] Generado ${outputPath}: ${products.length} productos (${
      products.filter((p) => p.featured).length
    } destacados), ${products.reduce((s, p) => s + p.variants.length, 0)} variantes, ${
      categories.filter((c) => !c.parentId).length
    } categorías principales.`
  );
}

buildDemoData();
