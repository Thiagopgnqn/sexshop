import demoSeedData from './demo-data.json';
import {
  quoteCart,
  enrichProductWithPricing,
  normalizeCustomerKey,
  getEffectiveCampaignStatus,
  getCampaignTheme,
  getSuggestedHomeSectionsTemplate,
  resolveActiveHomeSections,
  computeMarketingMetrics,
  DEFAULT_PRICE_HISTORY_DAYS,
  DEFAULT_SHIPPING_COST,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_TRANSFER_DISCOUNT_PERCENT,
} from '../../pricing-engine/index.js';

export const DEMO_STATE_KEY = 'nocturna-demo-state';
export const CURRENT_DEMO_VERSION = 6;
export const DEMO_ADMIN_EMAIL = 'admin@nocturna.demo';
export const DEMO_ADMIN_PASSWORD = 'demo1234';

export const isDemoMode = () =>
  String(import.meta.env.VITE_DEMO_MODE || '').toLowerCase() === 'true';

export const getDemoWhatsappPhone = () =>
  String(import.meta.env.VITE_DEMO_WHATSAPP || '5493517572841').replace(/\D/g, '');

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const buildSampleOrders = (products = []) => {
  const p1 = products[0];
  const p2 = products[1] || p1;
  const p3 = products[2] || p1;
  const p4 = products[3] || p1;
  if (!p1) return [];

  return [
    {
      id: 'demo_ord_0001',
      customerName: 'Valentina Gómez (Ejemplo Demo)',
      customerEmail: 'valentina@ejemplo.com',
      customerPhone: '351 555 0192',
      customerAddress: 'Av. Hipólito Yrigoyen 450, Nueva Córdoba, CP 5000, Córdoba',
      customerProvince: 'Córdoba',
      customerCity: 'Córdoba Capital',
      customerPostalCode: '5000',
      deliveryMethod: 'SHIPPING',
      comments: 'Entregar en recepción en sobre cerrado sin logos.',
      status: 'PENDING',
      total: Math.round(Number(p1.price || 32000) * 0.8),
      couponCode: 'BLACKFRIDAY',
      couponDiscount: Math.round(Number(p1.price || 32000) * 0.1),
      paymentMethodDiscount: Math.round(Number(p1.price || 32000) * 0.1),
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'black-friday',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      items: [
        {
          id: 'demo_ord_item_1',
          productId: p1.id,
          variantId: null,
          variantDescription: null,
          quantity: 1,
          price: Number(p1.price || 32000),
          product: { id: p1.id, name: p1.name, sku: p1.sku, price: p1.price },
        },
      ],
    },
    {
      id: 'demo_ord_0002',
      customerName: 'Camila Rodríguez',
      customerEmail: 'camila.r@ejemplo.com',
      customerPhone: '351 618 4420',
      customerAddress: 'Bv. San Juan 820, Güemes, Córdoba',
      customerProvince: 'Córdoba',
      customerCity: 'Córdoba Capital',
      customerPostalCode: '5000',
      deliveryMethod: 'SHIPPING',
      comments: 'Timbre 4B, paquete discreto.',
      status: 'CONFIRMED',
      adminNotes: 'Abonó por transferencia MercadoPago',
      total: Number(p2.price || 28000) * 2,
      utm_source: 'whatsapp',
      utm_medium: 'chat',
      utm_campaign: 'black-friday',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      items: [
        {
          id: 'demo_ord_item_2',
          productId: p2.id,
          variantId: null,
          variantDescription: null,
          quantity: 2,
          price: Number(p2.price || 28000),
          product: { id: p2.id, name: p2.name, sku: p2.sku, price: p2.price },
        },
      ],
    },
    {
      id: 'demo_ord_0003',
      customerName: 'Lucía Fernández',
      customerEmail: 'lucia.f@ejemplo.com',
      customerPhone: '351 492 8810',
      customerAddress: 'Retiro acordado por punto de entrega',
      customerProvince: 'Córdoba',
      customerCity: 'Córdoba Capital',
      customerPostalCode: '5000',
      deliveryMethod: 'PICKUP',
      comments: 'Pasa a retirar por la tarde.',
      status: 'DELIVERED',
      total: Number(p3.price || 39500) + Number(p1.price || 32000),
      utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: 'dia-de-la-madre',
      createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),
      items: [
        {
          id: 'demo_ord_item_3a',
          productId: p3.id,
          variantId: null,
          variantDescription: null,
          quantity: 1,
          price: Number(p3.price || 39500),
          product: { id: p3.id, name: p3.name, sku: p3.sku, price: p3.price },
        },
        {
          id: 'demo_ord_item_3b',
          productId: p1.id,
          variantId: null,
          variantDescription: null,
          quantity: 1,
          price: Number(p1.price || 32000),
          product: { id: p1.id, name: p1.name, sku: p1.sku, price: p1.price },
        },
      ],
    },
    {
      id: 'demo_ord_0004',
      customerName: 'Martina Sosa',
      customerEmail: 'martina.s@ejemplo.com',
      customerPhone: '351 701 3391',
      customerAddress: 'Recta Martinolli 6100, Argüello, Córdoba',
      customerProvince: 'Córdoba',
      customerCity: 'Córdoba Capital',
      customerPostalCode: '5021',
      deliveryMethod: 'SHIPPING',
      comments: '',
      status: 'DELIVERED',
      total: Number(p4.price || 16000) * 3,
      createdAt: new Date(Date.now() - 86400000 * 55).toISOString(), // Este año (hace 55 días)
      items: [
        {
          id: 'demo_ord_item_4',
          productId: p4.id,
          variantId: null,
          variantDescription: null,
          quantity: 3,
          price: Number(p4.price || 16000),
          product: { id: p4.id, name: p4.name, sku: p4.sku, price: p4.price },
        },
      ],
    },
  ];
};

const createInitialState = () => {
  const categories = clone(demoSeedData.categories || []);
  const products = clone(demoSeedData.products || []);
  const campaigns = clone(demoSeedData.campaigns || []);
  const promotions = clone(demoSeedData.promotions || []);
  const coupons = clone(demoSeedData.coupons || []);
  const tags = clone(demoSeedData.tags || []);
  const collections = clone(demoSeedData.collections || []);
  const priceHistory = clone(demoSeedData.priceHistory || []);
  const subscribers = clone(demoSeedData.subscribers || []);

  const users = [
    {
      id: 'demo_user_admin',
      name: 'Admin Nocturna (Demo)',
      email: DEMO_ADMIN_EMAIL,
      phone: '+54 9 3517 57-2841',
      role: 'ADMIN',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];

  const orders = buildSampleOrders(products);

  return {
    version: CURRENT_DEMO_VERSION,
    initializedAt: new Date().toISOString(),
    settings: clone(demoSeedData.settings || {
      shippingCost: 4500,
      freeShippingThreshold: 45000,
      freePickupEnabled: true,
      transferDiscountPercent: 10,
      transferDiscountEnabled: true,
      priceHistoryDays: 30,
      generalTermsText: 'Envíos 100% discretos en empaque neutro sin identificación del contenido.',
      shippingNoticeText: 'Envío gratis a todo el país superando el monto mínimo de compra.',
      bankTransferInstructions: 'Transferencia bancaria. Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp.',
    }),
    categories,
    products,
    campaigns,
    promotions,
    coupons,
    tags,
    collections,
    homeSections: clone(demoSeedData.homeSections || []),
    couponRedemptions: [],
    subscribers,
    priceHistory,
    users,
    orders,
    cart: [],
    session: null,
  };
};

export const loadDemoState = () => {
  try {
    const raw = localStorage.getItem(DEMO_STATE_KEY);
    if (!raw) {
      const initial = createInitialState();
      saveDemoState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      const initial = createInitialState();
      saveDemoState(initial);
      return initial;
    }

    let needsSave = false;

    // Migración automática si la versión es anterior
    if (!parsed.version || parsed.version < CURRENT_DEMO_VERSION) {
      parsed.version = CURRENT_DEMO_VERSION;
      // Actualizar campañas, promociones y secciones a la nueva versión con Black Friday activo y combo a $22.000
      parsed.campaigns = clone(demoSeedData.campaigns || []);
      parsed.promotions = clone(demoSeedData.promotions || []);
      parsed.homeSections = clone(demoSeedData.homeSections || []);
      parsed.priceHistory = clone(demoSeedData.priceHistory || []);
      parsed.settings = clone(demoSeedData.settings || null);
      needsSave = true;
    }

    if (!parsed.settings || typeof parsed.settings !== 'object') {
      parsed.settings = clone(demoSeedData.settings || null);
      needsSave = true;
    }

    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.categories)) {
      const initial = createInitialState();
      saveDemoState(initial);
      return initial;
    }

    if (!Array.isArray(parsed.cart)) {
      parsed.cart = [];
      needsSave = true;
    }
    if (!Array.isArray(parsed.subscribers)) {
      parsed.subscribers = clone(demoSeedData.subscribers || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.campaigns) || parsed.campaigns.length === 0) {
      parsed.campaigns = clone(demoSeedData.campaigns || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.promotions)) {
      parsed.promotions = clone(demoSeedData.promotions || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.coupons)) {
      parsed.coupons = clone(demoSeedData.coupons || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.tags)) {
      parsed.tags = clone(demoSeedData.tags || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.collections)) {
      parsed.collections = clone(demoSeedData.collections || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.homeSections) || parsed.homeSections.length === 0) {
      parsed.homeSections = clone(demoSeedData.homeSections || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.couponRedemptions)) {
      parsed.couponRedemptions = [];
      needsSave = true;
    }
    if (!Array.isArray(parsed.priceHistory) || parsed.priceHistory.length === 0) {
      parsed.priceHistory = clone(demoSeedData.priceHistory || []);
      needsSave = true;
    }
    if (!Array.isArray(parsed.orders)) {
      parsed.orders = buildSampleOrders(parsed.products);
      needsSave = true;
    }
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [
        {
          id: 'demo_user_admin',
          name: 'Admin Nocturna (Demo)',
          email: DEMO_ADMIN_EMAIL,
          phone: '+54 9 3517 57-2841',
          role: 'ADMIN',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ];
      needsSave = true;
    }

    if (needsSave) {
      saveDemoState(parsed);
    }
    return parsed;
  } catch (err) {
    console.warn('[DemoMode] Error parseando estado local, reiniciando a inicial:', err);
    const initial = createInitialState();
    saveDemoState(initial);
    return initial;
  }
};

export const saveDemoState = (state) => {
  try {
    localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[DemoMode] No se pudo guardar en localStorage:', err);
  }
};

export const resetDemoState = () => {
  try {
    localStorage.removeItem(DEMO_STATE_KEY);
    localStorage.removeItem('nocturna_cart');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('nocturna_utm_attribution');
  } catch (err) {
    console.warn('[DemoMode] Error al restablecer estado demo:', err);
  }
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

const buildDemoWhatsAppLink = (order) => {
  const phone = getDemoWhatsappPhone();
  const lines = [
    'Hola *Nocturna SexShop*! Quiero confirmar mi pedido online:',
    '',
    `*Pedido:* #${String(order.id).slice(-6).toUpperCase()}`,
    `*Cliente:* ${order.customerName}`,
    `*Teléfono:* ${order.customerPhone}`,
    `*Modalidad:* ${
      order.deliveryMethod === 'PICKUP'
        ? 'Retiro a coordinar'
        : 'Envío discreto a domicilio'
    }`,
  ];

  if (order.customerAddress) {
    lines.push(`*Dirección / Punto:* ${order.customerAddress}`);
  }
  if (order.comments) {
    lines.push(`*Indicaciones:* ${order.comments}`);
  }

  lines.push('', '*Detalle del pedido:*');
  for (const item of order.items || []) {
    const prodName = item.product?.name || item.name || 'Producto';
    const variantPart = item.variantDescription ? ` (${item.variantDescription})` : '';
    const skuPart = item.variant?.sku || item.product?.sku ? ` [SKU: ${item.variant?.sku || item.product?.sku}]` : '';
    const unitPrice = Number(item.unitPrice || item.price || 0);
    const subtotal = (unitPrice * Number(item.quantity || 1)).toLocaleString('es-AR');
    lines.push(`• ${item.quantity}x ${prodName}${variantPart}${skuPart} — $${subtotal}`);
  }

  lines.push('');
  const subtotalVal = Number(order.subtotal || order.total || 0);
  lines.push(`*Subtotal de productos:* $${subtotalVal.toLocaleString('es-AR')}`);

  // Descuentos en productos
  const itemDiscounts = (order.items || []).reduce(
    (sum, it) => sum + Number(it.discountAmount || 0) * Number(it.quantity || 1),
    0
  );
  if (itemDiscounts > 0) {
    lines.push(`• Descuentos en productos: -$${itemDiscounts.toLocaleString('es-AR')}`);
  }

  // Descuentos a nivel carrito (ej. 2x1, combos)
  if (order.cartDiscountsTotal > 0) {
    lines.push(`• Promociones aplicadas: -$${Number(order.cartDiscountsTotal).toLocaleString('es-AR')}`);
  }

  // Cupón
  if (order.couponCode && order.couponDiscount > 0) {
    lines.push(`• Cupón ${order.couponCode}: -$${Number(order.couponDiscount).toLocaleString('es-AR')}`);
  }

  // Descuento Transferencia
  if (order.paymentMethodDiscount > 0) {
    lines.push(`• Bonificación Transferencia (10% OFF): -$${Number(order.paymentMethodDiscount).toLocaleString('es-AR')}`);
  }

  // Envío
  if (order.deliveryMethod === 'PICKUP') {
    lines.push(`• Retiro: Sin costo`);
  } else if (order.shippingTotal === 0 || order.shippingDiscount > 0) {
    lines.push(`• Envío a domicilio: ¡Gratis!`);
  } else {
    lines.push(`• Envío a domicilio: $${Number(order.shippingTotal || DEFAULT_SHIPPING_COST).toLocaleString('es-AR')}`);
  }

  lines.push(
    '',
    `*Total final a abonar:* $${Number(order.total || 0).toLocaleString('es-AR')}`
  );

  const totalAhorro = Number(order.totalSavings || 0) || (itemDiscounts + Number(order.cartDiscountsTotal || 0) + Number(order.couponDiscount || 0) + Number(order.paymentMethodDiscount || 0) + Number(order.shippingDiscount || 0));
  if (totalAhorro > 0) {
    lines.push(`*¡Ahorro total:* $${totalAhorro.toLocaleString('es-AR')}!*`);
  }

  lines.push(
    '',
    '_Solicito empaque 100% discreto sin logos. Quedo a la espera para coordinar pago y entrega._'
  );

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
};

const resizeImageToDataUrl = (file, maxDim = 800, quality = 0.78) =>
  new Promise((resolve, reject) => {
    if (!file || typeof FileReader === 'undefined') {
      reject(new Error('Archivo de imagen inválido.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo.'));
    reader.readAsDataURL(file);
  });

const parseBody = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
};

const makeResponse = (config, status, data) => ({
  data,
  status,
  statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
  headers: { 'content-type': 'application/json', 'x-demo-mode': 'true' },
  config,
  request: {},
});

const makeError = (config, status, data) => {
  const err = new Error(data?.error || data?.message || `HTTP Error ${status}`);
  err.config = config;
  err.response = makeResponse(config, status, data);
  return err;
};

export const demoAxiosAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const baseURL = config.baseURL || '';
  let rawUrl = config.url || '';
  if (baseURL && rawUrl.startsWith(baseURL)) {
    rawUrl = rawUrl.slice(baseURL.length);
  }
  rawUrl = rawUrl.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/api(?=\/|$)/i, '');
  if (!rawUrl.startsWith('/')) rawUrl = `/${rawUrl}`;

  const [pathname, queryString] = rawUrl.split('?');
  const searchParams = new URLSearchParams(queryString || '');
  if (config.params && typeof config.params === 'object') {
    Object.entries(config.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.set(k, String(v));
      }
    });
  }

  const state = loadDemoState();
  const body = parseBody(config.data);

  // =========================================================================
  // 1. AUTH (/auth/*)
  // =========================================================================
  if (pathname === '/auth/login' && method === 'post') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    const user = state.users.find((u) => u.email.toLowerCase() === email);
    const isDemoAdmin =
      email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD;
    const isCustomUser = user && user.password && user.password === password;

    if (!user || (!isDemoAdmin && !isCustomUser)) {
      throw makeError(config, 401, {
        message: `Credenciales inválidas. Para ingresar como Admin en la demo usá ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`,
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    };
    const accessToken = `demo-access-token::${user.id}`;
    const refreshToken = `demo-refresh-token::${user.id}`;
    state.session = { user: safeUser, accessToken, refreshToken };
    saveDemoState(state);

    return makeResponse(config, 200, {
      user: safeUser,
      accessToken,
      refreshToken,
    });
  }

  if (pathname === '/auth/register' && method === 'post') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !body.name || !body.password) {
      throw makeError(config, 400, { message: 'Completá nombre, email y contraseña.' });
    }
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      throw makeError(config, 400, { message: 'Ya existe una cuenta con ese correo.' });
    }

    const newUser = {
      id: `demo_user_${Date.now()}`,
      name: String(body.name).trim(),
      email,
      phone: body.phone ? String(body.phone).trim() : '',
      password: String(body.password),
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };
    state.users.push(newUser);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    };
    const accessToken = `demo-access-token::${newUser.id}`;
    const refreshToken = `demo-refresh-token::${newUser.id}`;
    state.session = { user: safeUser, accessToken, refreshToken };
    saveDemoState(state);

    return makeResponse(config, 201, {
      user: safeUser,
      accessToken,
      refreshToken,
    });
  }

  if (pathname === '/auth/refresh' && method === 'post') {
    const token = String(body.token || '');
    const userId = token.split('::')[1] || 'demo_user_admin';
    return makeResponse(config, 200, {
      accessToken: `demo-access-token::${userId}`,
    });
  }

  if (pathname === '/auth/logout' && method === 'post') {
    state.session = null;
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Sesión cerrada' });
  }

  if (pathname === '/auth/me' && method === 'get') {
    const authHeader =
      config.headers?.Authorization || config.headers?.authorization || '';
    const token = String(authHeader).replace(/^Bearer\s+/i, '').trim();
    if (!token.startsWith('demo-access-token')) {
      throw makeError(config, 401, { message: 'Token inválido' });
    }
    const userId = token.split('::')[1] || 'demo_user_admin';
    const user =
      state.users.find((u) => u.id === userId) || state.users[0];
    if (!user) {
      throw makeError(config, 401, { message: 'Usuario no encontrado' });
    }
    return makeResponse(config, 200, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
  }

  // =========================================================================
  // 2. CATEGORIES (/categories/*)
  // =========================================================================
  if (pathname === '/categories' && method === 'get') {
    const flat = searchParams.get('flat') === 'true';
    const countMap = new Map();
    for (const p of state.products) {
      if (p.active !== false && p.categoryId) {
        countMap.set(p.categoryId, (countMap.get(p.categoryId) || 0) + 1);
      }
    }

    const parents = state.categories
      .filter((c) => !c.parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const enrichedParents = parents.map((parent) => {
      const children = state.categories
        .filter((c) => c.parentId === parent.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((sub) => {
          const subCount = countMap.get(sub.id) || 0;
          return {
            ...sub,
            parent: { id: parent.id, name: parent.name, slug: parent.slug },
            productCount: subCount,
            _count: { products: subCount },
          };
        });

      const directCount = countMap.get(parent.id) || 0;
      const childrenCount = children.reduce((s, c) => s + c.productCount, 0);
      const totalCount = directCount + childrenCount;

      return {
        ...parent,
        children,
        directProductCount: directCount,
        productCount: totalCount,
        _count: { products: totalCount },
      };
    });

    if (flat) {
      const flatList = [];
      for (const p of enrichedParents) {
        flatList.push(p);
        for (const sub of p.children || []) {
          flatList.push(sub);
        }
      }
      return makeResponse(config, 200, flatList);
    }

    return makeResponse(config, 200, enrichedParents);
  }

  if (pathname === '/categories' && method === 'post') {
    const name = String(body.name || '').trim();
    if (!name) throw makeError(config, 400, { error: 'El nombre es obligatorio.' });
    const parentId = body.parentId || null;
    const parent = parentId ? state.categories.find((c) => c.id === parentId) : null;
    const slug = parent ? `${parent.slug}-${slugify(name)}` : slugify(name);

    const newCat = {
      id: `${parent ? 'sub' : 'cat'}_${slug}_${Date.now()}`,
      name,
      slug,
      parentId,
      order: Number(body.order || 0),
      parent: parent ? { id: parent.id, name: parent.name, slug: parent.slug } : null,
      children: [],
    };
    state.categories.push(newCat);
    saveDemoState(state);
    return makeResponse(config, 201, newCat);
  }

  if (pathname.startsWith('/categories/') && method === 'put') {
    const id = pathname.split('/')[2];
    const idx = state.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Categoría no encontrada.' });

    const current = state.categories[idx];
    const updatedName = body.name !== undefined ? String(body.name).trim() : current.name;
    const updatedParentId =
      body.parentId !== undefined ? body.parentId || null : current.parentId;
    const parent = updatedParentId
      ? state.categories.find((c) => c.id === updatedParentId)
      : null;

    state.categories[idx] = {
      ...current,
      name: updatedName,
      parentId: updatedParentId,
      order: body.order !== undefined ? Number(body.order) : current.order,
      parent: parent ? { id: parent.id, name: parent.name, slug: parent.slug } : null,
    };
    saveDemoState(state);
    return makeResponse(config, 200, state.categories[idx]);
  }

  if (pathname.startsWith('/categories/') && method === 'delete') {
    const id = pathname.split('/')[2];
    const hasChildren = state.categories.some((c) => c.parentId === id);
    if (hasChildren) {
      throw makeError(config, 400, {
        error: 'No se puede eliminar una categoría que tiene subcategorías.',
      });
    }
    state.categories = state.categories.filter((c) => c.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Categoría eliminada' });
  }

  // =========================================================================
  // 3. PRODUCTS (/products/*)
  // =========================================================================
  if (pathname === '/products/filters' && method === 'get') {
    const sizesSet = new Set();
    const colorsSet = new Set();
    const flavorsSet = new Set();

    for (const p of state.products) {
      if (p.active === false) continue;
      for (const v of p.variants || []) {
        if (v.active === false) continue;
        if (v.size && String(v.size).trim()) sizesSet.add(String(v.size).trim());
        if (v.color && String(v.color).trim()) colorsSet.add(String(v.color).trim());
        if (v.flavor && String(v.flavor).trim()) flavorsSet.add(String(v.flavor).trim());
      }
    }

    return makeResponse(config, 200, {
      sizes: Array.from(sizesSet).sort(),
      colors: Array.from(colorsSet).sort(),
      flavors: Array.from(flavorsSet).sort(),
    });
  }

  if (pathname === '/products' && method === 'get') {
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const size = searchParams.get('size') || searchParams.get('talle');
    const color = searchParams.get('color');
    const flavor = searchParams.get('flavor') || searchParams.get('sabor');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12', 10));

    let list = state.products.filter((p) => (includeInactive ? true : p.active !== false));

    if (category) {
      const rawCats = category
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) => {
        const cat = p.category;
        if (!cat) return false;
        return rawCats.some(
          (rc) =>
            cat.id?.toLowerCase() === rc ||
            cat.slug?.toLowerCase() === rc ||
            cat.name?.toLowerCase() === rc ||
            cat.parentId?.toLowerCase() === rc ||
            cat.parent?.slug?.toLowerCase() === rc ||
            cat.parent?.name?.toLowerCase() === rc
        );
      });
    }

    if (subcategory) {
      const rawSubs = subcategory
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) => {
        const cat = p.category;
        if (!cat) return false;
        return rawSubs.some(
          (rs) =>
            cat.id?.toLowerCase() === rs ||
            cat.slug?.toLowerCase() === rs ||
            cat.name?.toLowerCase() === rs
        );
      });
    }

    if (size) {
      const sizes = size
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) =>
        (p.variants || []).some(
          (v) => v.active !== false && v.size && sizes.includes(String(v.size).toLowerCase())
        )
      );
    }

    if (color) {
      const colors = color
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) =>
        (p.variants || []).some(
          (v) =>
            v.active !== false &&
            v.color &&
            colors.some((c) => String(v.color).toLowerCase().includes(c))
        )
      );
    }

    if (flavor) {
      const flavors = flavor
        .split(',')
        .map((f) => f.trim().toLowerCase())
        .filter(Boolean);
      list = list.filter((p) =>
        (p.variants || []).some(
          (v) =>
            v.active !== false &&
            v.flavor &&
            flavors.some((f) => String(v.flavor).toLowerCase().includes(f))
        )
      );
    }

    if (minPrice) {
      list = list.filter((p) => Number(p.price) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      list = list.filter((p) => Number(p.price) <= parseFloat(maxPrice));
    }

    if (search) {
      const q = search.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.category?.name?.toLowerCase().includes(q) ||
            (p.variants || []).some(
              (v) =>
                v.sku?.toLowerCase().includes(q) ||
                v.flavor?.toLowerCase().includes(q) ||
                v.color?.toLowerCase().includes(q) ||
                v.type?.toLowerCase().includes(q)
            )
        );
      }
    }

    // Enriquecer productos con cotización de precios, historial de precios, promociones activas y combos
    const now = new Date();
    let enrichedList = list.map((p) =>
      enrichProductWithPricing(p, {
        promotions: state.promotions || [],
        campaigns: state.campaigns || [],
        priceHistory: state.priceHistory || [],
        now,
        allProducts: state.products || [],
      })
    );

    // Filtro "Solo ofertas"
    const onlyOffers =
      searchParams.get('onlyOffers') === 'true' || searchParams.get('onSale') === 'true';
    if (onlyOffers) {
      enrichedList = enrichedList.filter(
        (p) =>
          (p.pricing && p.pricing.savingsAmount > 0) ||
          (Array.isArray(p.activePromotions) && p.activePromotions.length > 0)
      );
    }

    if (sort === 'discount_desc') {
      enrichedList.sort(
        (a, b) =>
          (Number(b.pricing?.discountPercent || 0) - Number(a.pricing?.discountPercent || 0)) ||
          (Number(b.pricing?.savingsAmount || 0) - Number(a.pricing?.savingsAmount || 0))
      );
    } else if (sort === 'price_asc') {
      enrichedList.sort(
        (a, b) => Number(a.pricing?.finalPrice || a.price) - Number(b.pricing?.finalPrice || b.price)
      );
    } else if (sort === 'price_desc') {
      enrichedList.sort(
        (a, b) => Number(b.pricing?.finalPrice || b.price) - Number(a.pricing?.finalPrice || a.price)
      );
    } else if (sort === 'best_selling') {
      enrichedList.sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0));
    } else if (sort === 'newest' || includeInactive) {
      enrichedList.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } else {
      // Orden por defecto: Destacados primero
      enrichedList.sort((a, b) => {
        const aFeat = a.featured || a.badge === 'Destacado' ? 1 : 0;
        const bFeat = b.featured || b.badge === 'Destacado' ? 1 : 0;
        if (bFeat !== aFeat) return bFeat - aFeat;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }

    const total = enrichedList.length;
    const skip = (page - 1) * limit;
    return makeResponse(config, 200, {
      products: enrichedList.slice(skip, skip + limit),
      total,
      page,
      limit,
    });
  }

  if (pathname.startsWith('/products/') && method === 'get') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const found = state.products.find((p) => p.id === id);
    if (!found) throw makeError(config, 404, { error: 'Producto no encontrado' });
    const enriched = enrichProductWithPricing(found, {
      promotions: state.promotions || [],
      campaigns: state.campaigns || [],
      priceHistory: state.priceHistory || [],
      now: new Date(),
      allProducts: state.products || [],
    });
    return makeResponse(config, 200, enriched);
  }

  if (pathname === '/products' && method === 'post') {
    const productId = `demo_prod_${Date.now()}`;
    const cat = state.categories.find((c) => c.id === body.categoryId) || state.categories[0];
    const parentCat = cat?.parentId
      ? state.categories.find((c) => c.id === cat.parentId)
      : null;

    const variants = Array.isArray(body.variants)
      ? body.variants.map((v, idx) => ({
          id: v.id || `demo_var_${Date.now()}_${idx}`,
          productId,
          sku: String(v.sku || `SKU-${Date.now()}-${idx}`).trim(),
          type: v.type || null,
          size: v.size || null,
          color: v.color || null,
          flavor: v.flavor || null,
          volume: v.volume || null,
          price: Number(v.price || body.price || 0),
          stock: Number(v.stock ?? 10),
          active: v.active !== false,
        }))
      : [];

    const basePrice =
      variants.length > 0
        ? Math.min(...variants.map((v) => v.price))
        : Number(body.price || 0);

    const totalStock =
      variants.length > 0
        ? variants.reduce((s, v) => s + Number(v.stock || 0), 0)
        : Number(body.stock ?? 10);

    const newProduct = {
      id: productId,
      name: String(body.name || 'Nuevo Producto').trim(),
      description: String(body.description || '').trim(),
      sku: body.sku ? String(body.sku).trim() : `DEMO-${Date.now().toString().slice(-4)}`,
      price: basePrice,
      transferPrice: body.transferPrice ? Number(body.transferPrice) : null,
      stock: totalStock,
      imageUrl: body.imageUrl || null,
      badge: body.badge || null,
      featured: body.badge === 'Destacado' || Boolean(body.featured),
      brand: body.brand || 'Nocturna',
      categoryId: cat?.id || null,
      category: cat
        ? {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
            parent: parentCat
              ? { id: parentCat.id, name: parentCat.name, slug: parentCat.slug }
              : cat.parent || null,
          }
        : null,
      active: body.active !== false,
      soldCount: 0,
      createdAt: new Date().toISOString(),
      variants,
    };

    state.products.unshift(newProduct);

    if (!Array.isArray(state.priceHistory)) state.priceHistory = [];
    state.priceHistory.push({
      id: `demo_ph_${productId}_base`,
      productId,
      variantId: null,
      oldPrice: basePrice,
      newPrice: basePrice,
      changedAt: new Date().toISOString(),
      changedBy: 'DEMO_ADMIN',
      reason: 'DEMO_PRODUCT_CREATION',
    });
    for (const v of variants) {
      state.priceHistory.push({
        id: `demo_ph_${v.id}`,
        productId,
        variantId: v.id,
        oldPrice: v.price,
        newPrice: v.price,
        changedAt: new Date().toISOString(),
        changedBy: 'DEMO_ADMIN',
        reason: 'DEMO_VARIANT_CREATION',
      });
    }

    saveDemoState(state);
    return makeResponse(config, 201, newProduct);
  }

  if (pathname.startsWith('/products/') && method === 'put') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const idx = state.products.findIndex((p) => p.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Producto no encontrado' });

    const current = state.products[idx];
    const catId = body.categoryId !== undefined ? body.categoryId : current.categoryId;
    const cat = state.categories.find((c) => c.id === catId) || current.category;
    const parentCat = cat?.parentId
      ? state.categories.find((c) => c.id === cat.parentId)
      : null;

    const variants = Array.isArray(body.variants)
      ? body.variants.map((v, vIdx) => ({
          id: v.id || `demo_var_${Date.now()}_${vIdx}`,
          productId: id,
          sku: String(v.sku || `SKU-${Date.now()}-${vIdx}`).trim(),
          type: v.type || null,
          size: v.size || null,
          color: v.color || null,
          flavor: v.flavor || null,
          volume: v.volume || null,
          price: Number(v.price || body.price || current.price || 0),
          stock: Number(v.stock ?? 0),
          active: v.active !== false,
        }))
      : current.variants || [];

    const basePrice =
      variants.length > 0
        ? Math.min(...variants.map((v) => v.price))
        : Number(body.price ?? current.price ?? 0);

    const totalStock =
      variants.length > 0
        ? variants.reduce((s, v) => s + Number(v.stock || 0), 0)
        : Number(body.stock ?? current.stock ?? 0);

    const updated = {
      ...current,
      name: body.name !== undefined ? String(body.name).trim() : current.name,
      description:
        body.description !== undefined ? String(body.description).trim() : current.description,
      sku: body.sku !== undefined ? body.sku : current.sku,
      price: basePrice,
      transferPrice:
        body.transferPrice !== undefined ? body.transferPrice : current.transferPrice,
      stock: totalStock,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : current.imageUrl,
      badge: body.badge !== undefined ? body.badge : current.badge,
      featured:
        body.featured !== undefined
          ? Boolean(body.featured)
          : body.badge === 'Destacado'
          ? true
          : body.badge === null
          ? false
          : current.featured,
      brand: body.brand !== undefined ? body.brand : current.brand,
      categoryId: cat?.id || null,
      category: cat
        ? {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
            parent: parentCat
              ? { id: parentCat.id, name: parentCat.name, slug: parentCat.slug }
              : cat.parent || null,
          }
        : null,
      active: body.active !== undefined ? Boolean(body.active) : current.active,
      variants,
    };

    state.products[idx] = updated;

    if (!Array.isArray(state.priceHistory)) state.priceHistory = [];
    if (basePrice !== current.price) {
      state.priceHistory.push({
        id: `demo_ph_${id}_${Date.now()}`,
        productId: id,
        variantId: null,
        oldPrice: current.price,
        newPrice: basePrice,
        changedAt: new Date().toISOString(),
        changedBy: 'DEMO_ADMIN',
        reason: 'DEMO_PRICE_UPDATE',
      });
    }

    saveDemoState(state);
    return makeResponse(config, 200, updated);
  }

  if (pathname.startsWith('/products/') && method === 'delete') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.products = state.products.filter((p) => p.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Producto eliminado' });
  }

  // =========================================================================
  // 3.5. CART QUOTE (/cart/quote)
  // =========================================================================
  if (pathname === '/cart/quote' && method === 'post') {
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      throw makeError(config, 400, { error: 'El carrito no contiene productos.' });
    }

    const preparedItems = rawItems.map((raw) => {
      const prod = state.products.find((p) => p.id === raw.productId);
      if (!prod) throw makeError(config, 404, { error: `Producto ${raw.productId} no encontrado` });
      let variant = null;
      if (raw.variantId && Array.isArray(prod.variants)) {
        variant = prod.variants.find((v) => v.id === raw.variantId) || null;
      }
      return {
        productId: prod.id,
        variantId: variant?.id || null,
        variantDescription: raw.variantDescription || null,
        quantity: Math.max(1, Number(raw.quantity || 1)),
        product: prod,
        variant,
      };
    });

    const quote = quoteCart(
      { items: preparedItems },
      {
        couponCode: body.couponCode,
        paymentMethod: body.paymentMethod,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingContext: body.shippingContext || {},
        promotions: state.promotions || [],
        campaigns: state.campaigns || [],
        coupons: state.coupons || [],
        couponRedemptions: state.couponRedemptions || [],
        priceHistory: state.priceHistory || [],
        now: new Date(),
        historyDays: state.settings?.priceHistoryDays ?? 30,
        freeShippingThreshold: state.settings?.freeShippingThreshold ?? 45000,
        baseShippingCost: state.settings?.shippingCost ?? 4500,
        transferDiscountPercent: state.settings?.transferDiscountEnabled !== false ? (state.settings?.transferDiscountPercent ?? 10) : 0,
      }
    );

    return makeResponse(config, 200, quote);
  }

  // =========================================================================
  // 4. ORDERS (/orders/*)
  // =========================================================================
  if (pathname === '/orders' && method === 'post') {
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      throw makeError(config, 400, { error: 'El pedido no contiene productos.' });
    }

    const preparedItems = [];
    for (const item of rawItems) {
      const product = state.products.find((p) => p.id === item.productId);
      if (!product) {
        throw makeError(config, 400, { error: 'Uno de los productos ya no existe.' });
      }
      const qty = Math.max(1, Number(item.quantity || 1));
      let variant = null;

      if (item.variantId && Array.isArray(product.variants)) {
        variant = product.variants.find((v) => v.id === item.variantId) || null;
      }

      const availableStock = variant ? Number(variant.stock || 0) : Number(product.stock || 0);
      if (qty > availableStock) {
        throw makeError(config, 400, {
          error: `Stock insuficiente para ${product.name}. Disponible: ${availableStock} un.`,
        });
      }

      preparedItems.push({
        productId: product.id,
        variantId: variant?.id || null,
        variantDescription: item.variantDescription || null,
        quantity: qty,
        product,
        variant,
      });
    }

    // AUTORIDAD EN MODO DEMO: Recalcula con quoteCart idéntico al backend real
    const quote = quoteCart(
      { items: preparedItems },
      {
        couponCode: body.couponCode,
        paymentMethod: body.paymentMethod,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingContext: {
          deliveryMethod: body.deliveryMethod,
          postalCode: body.customerPostalCode,
          province: body.customerProvince,
        },
        promotions: state.promotions || [],
        campaigns: state.campaigns || [],
        coupons: state.coupons || [],
        couponRedemptions: state.couponRedemptions || [],
        priceHistory: state.priceHistory || [],
        now: new Date(),
        historyDays: state.settings?.priceHistoryDays ?? 30,
        freeShippingThreshold: state.settings?.freeShippingThreshold ?? 45000,
        baseShippingCost: state.settings?.shippingCost ?? 4500,
        transferDiscountPercent: state.settings?.transferDiscountEnabled !== false ? (state.settings?.transferDiscountPercent ?? 10) : 0,
      }
    );

    if (body.couponCode && quote.couponError) {
      throw makeError(config, 400, { error: `Cupón inválido: ${quote.couponError}` });
    }

    // Descontar stock local
    for (const quotedItem of quote.items) {
      const product = state.products.find((p) => p.id === quotedItem.productId);
      if (product) {
        if (quotedItem.variantId && Array.isArray(product.variants)) {
          const v = product.variants.find((varItem) => varItem.id === quotedItem.variantId);
          if (v) {
            v.stock = Math.max(0, Number(v.stock || 0) - quotedItem.quantity);
            product.stock = product.variants.reduce((s, it) => s + Number(it.stock || 0), 0);
          }
        } else {
          product.stock = Math.max(0, Number(product.stock || 0) - quotedItem.quantity);
        }
        product.soldCount = Number(product.soldCount || 0) + quotedItem.quantity;
      }
    }

    const populatedItems = quote.items.map((it, idx) => ({
      id: `demo_ord_item_${Date.now()}_${idx}`,
      productId: it.productId,
      variantId: it.variantId,
      variantDescription: it.variantDescription || null,
      quantity: it.quantity,
      originalUnitPrice: it.originalUnitPrice,
      discountAmount: it.discountAmount,
      unitPrice: it.unitPrice,
      price: it.unitPrice, // retrocompatibilidad
      subtotal: it.subtotal,
      promotionId: it.promotionId || null,
      campaignId: it.campaignId || null,
      product: {
        id: it.productId,
        name: it.productName,
        sku: it.sku,
        price: it.unitPrice,
      },
      variant: it.variantId
        ? {
            id: it.variantId,
            sku: it.sku,
          }
        : null,
    }));

    const newOrder = {
      id: `demo_ord_${String(state.orders.length + 1).padStart(4, '0')}_${Date.now()
        .toString()
        .slice(-4)}`,
      customerName: String(body.customerName || 'Cliente Demo').trim(),
      customerEmail: String(body.customerEmail || '').trim(),
      customerPhone: String(body.customerPhone || '').trim(),
      customerAddress: String(body.customerAddress || 'Córdoba').trim(),
      customerProvince: String(body.customerProvince || 'Córdoba').trim(),
      customerCity: String(body.customerCity || 'Córdoba Capital').trim(),
      customerPostalCode: String(body.customerPostalCode || '5000').trim(),
      deliveryMethod: body.deliveryMethod || 'DELIVERY',
      comments: body.comments ? String(body.comments).trim() : null,
      status: 'PENDING',
      subtotal: quote.subtotal,
      couponCode: quote.coupon ? quote.coupon.code : null,
      couponDiscount: quote.couponDiscount,
      paymentMethodDiscount: quote.paymentMethodDiscount,
      shippingDiscount: quote.shipping.discount,
      shippingTotal: quote.shipping.finalCost,
      total: quote.total,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      createdAt: new Date().toISOString(),
      items: populatedItems,
    };

    // Registrar redención de cupón si aplica
    if (quote.coupon) {
      const c = (state.coupons || []).find((cp) => cp.id === quote.coupon.id);
      if (c) c.usedCount = (c.usedCount || 0) + 1;
      const custKey = normalizeCustomerKey({ email: body.customerEmail, phone: body.customerPhone });
      if (custKey) {
        if (!Array.isArray(state.couponRedemptions)) state.couponRedemptions = [];
        state.couponRedemptions.push({
          id: `demo_red_${Date.now()}`,
          couponId: quote.coupon.id,
          orderId: newOrder.id,
          customerKey: custKey,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const whatsappLink = buildDemoWhatsAppLink(newOrder);
    newOrder.whatsappLink = whatsappLink;

    state.orders.unshift(newOrder);
    saveDemoState(state);

    return makeResponse(config, 201, newOrder);
  }

  if (pathname === '/orders' && method === 'get') {
    return makeResponse(config, 200, {
      orders: state.orders,
      total: state.orders.length,
    });
  }

  if (pathname.match(/^\/orders\/[^/]+\/status$/) && method === 'patch') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const order = state.orders.find((o) => o.id === id);
    if (!order) throw makeError(config, 404, { error: 'Pedido no encontrado' });

    const prevStatus = order.status;
    const nextStatus = String(body.status || 'PENDING').toUpperCase();

    // Si pasa a CANCELLED, reintegrar stock
    if (prevStatus !== 'CANCELLED' && nextStatus === 'CANCELLED') {
      for (const item of order.items || []) {
        const prod = state.products.find((p) => p.id === item.productId);
        if (prod) {
          if (item.variantId && Array.isArray(prod.variants)) {
            const v = prod.variants.find((va) => va.id === item.variantId);
            if (v) v.stock = Number(v.stock || 0) + Number(item.quantity || 1);
            prod.stock = prod.variants.reduce((s, va) => s + Number(va.stock || 0), 0);
          } else {
            prod.stock = Number(prod.stock || 0) + Number(item.quantity || 1);
          }
        }
      }
    }

    if (body.status !== undefined) {
      order.status = nextStatus;
    }
    if (body.adminNotes !== undefined) {
      order.adminNotes = String(body.adminNotes || '').trim();
    }
    saveDemoState(state);
    return makeResponse(config, 200, order);
  }

  if (pathname.startsWith('/orders/') && method === 'get') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const order = state.orders.find((o) => o.id === id);
    if (!order) throw makeError(config, 404, { error: 'Pedido no encontrado' });
    return makeResponse(config, 200, order);
  }

  // =========================================================================
  // 5. USERS (/users/*)
  // =========================================================================
  if (pathname === '/users' && method === 'get') {
    const usersWithOrders = state.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      createdAt: u.createdAt,
      _count: {
        orders: state.orders.filter(
          (o) => o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase()
        ).length,
      },
    }));
    return makeResponse(config, 200, { users: usersWithOrders });
  }

  if (pathname.startsWith('/users/') && method === 'put') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Usuario no encontrado' });
    state.users[idx] = {
      ...state.users[idx],
      name: body.name ?? state.users[idx].name,
      email: body.email ?? state.users[idx].email,
      phone: body.phone ?? state.users[idx].phone,
      role: body.role ?? state.users[idx].role,
    };
    saveDemoState(state);
    return makeResponse(config, 200, state.users[idx]);
  }

  if (pathname.startsWith('/users/') && method === 'delete') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.users = state.users.filter((u) => u.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Usuario eliminado' });
  }

  // =========================================================================
  // 6. UPLOAD (/upload/image)
  // =========================================================================
  if (pathname === '/upload/image' && method === 'post') {
    const formData = config.data;
    const file =
      formData && typeof formData.get === 'function' ? formData.get('image') : null;
    if (!file) {
      throw makeError(config, 400, { error: 'No se recibió ningún archivo de imagen.' });
    }
    const dataUrl = await resizeImageToDataUrl(file, 800, 0.78);
    return makeResponse(config, 200, { url: dataUrl });
  }

  // =========================================================================
  // 7. CAMPAIGNS (/campaigns/*)
  // =========================================================================
  
  if ((pathname.match(/^\/campaigns\/[^/]+\/view$/) || pathname.match(/^\/campaigns\/view\/[^/]+$/)) && method === 'post') {
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    const parts = pathname.split('/');
    const idOrSlug = parts[2] === 'view' ? decodeURIComponent(parts[3]) : decodeURIComponent(parts[2]);
    const camp = state.campaigns.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (camp) {
      camp.views = (Number(camp.views) || 0) + 1;
      saveDemoState(state);
      return makeResponse(config, 200, { success: true, views: camp.views });
    }
    return makeResponse(config, 200, { success: false, views: 0 });
  }

  if (pathname === '/campaigns/active' && method === 'get') {
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    const params = new URL(config.url, 'http://localhost').searchParams;
    const previewId = params.get('preview');
    const now = new Date();

    if (previewId) {
      const previewCamp = state.campaigns.find(c => c.id === previewId || c.slug === previewId);
      if (previewCamp) {
        return makeResponse(config, 200, {
          ...previewCamp,
          effectiveStatus: getEffectiveCampaignStatus(previewCamp, now),
          isPreview: true,
        });
      }
    }

    const activeList = state.campaigns
      .map(c => ({ ...c, effectiveStatus: getEffectiveCampaignStatus(c, now) }))
      .filter(c => c.effectiveStatus === 'ACTIVE' && c.active !== false)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return makeResponse(config, 200, activeList[0] || null);
  }

  if (pathname.match(/^\/campaigns\/public\/[^/]+$/) && method === 'get') {
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    const slug = decodeURIComponent(pathname.split('/')[3]);
    const params = new URL(config.url, 'http://localhost').searchParams;
    const previewId = params.get('preview');
    const now = new Date();

    const camp = state.campaigns.find(c => c.slug === slug || c.id === slug);
    if (!camp) throw makeError(config, 404, { error: 'Campaña no encontrada' });

    const isPreview = previewId && (previewId === camp.id || previewId === camp.slug || previewId === 'true');
    const effectiveStatus = getEffectiveCampaignStatus(camp, now);

    if (!isPreview && effectiveStatus !== 'ACTIVE') {
      return makeResponse(config, 200, { ...camp, inactive: true, effectiveStatus });
    }

    const promotions = (state.promotions || []).filter(p => p.campaignId === camp.id && p.active !== false);

    // Obtener y cotizar productos asociados a la campaña
    const enrichedProducts = (state.products || [])
      .filter(p => p.active !== false)
      .map(p => enrichProductWithPricing(p, {
        promotions: state.promotions || [],
        campaigns: state.campaigns || [],
        priceHistory: state.priceHistory || [],
        now,
      }))
      .filter(p => {
        // Filtrar productos que apliquen a las promociones de la campaña
        return (p.activePromotions || []).some(ap => ap.campaignId === camp.id);
      });

    return makeResponse(config, 200, {
      ...camp,
      effectiveStatus,
      promotions,
      products: enrichedProducts,
      themeConfig: getCampaignTheme(camp.theme),
      isPreview: Boolean(isPreview),
    });
  }

  if (pathname === '/campaigns' && method === 'get') {
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    const params = new URL(config.url, 'http://localhost').searchParams;
    const statusFilter = params.get('status');
    const searchFilter = (params.get('search') || '').toLowerCase().trim();

    const now = new Date();
    let list = state.campaigns.map((c) => {
      const promotions = (state.promotions || []).filter((p) => p.campaignId === c.id);
      return {
        ...c,
        promotions,
        effectiveStatus: getEffectiveCampaignStatus(c, now),
      };
    });

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter((c) => c.status === statusFilter || c.effectiveStatus === statusFilter);
    }
    if (searchFilter) {
      list = list.filter((c) =>
        c.name.toLowerCase().includes(searchFilter) ||
        (c.headline && c.headline.toLowerCase().includes(searchFilter))
      );
    }

    list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return makeResponse(config, 200, list);
  }

  if (pathname.match(/^\/campaigns\/[^/]+$/) && method === 'get') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const camp = (state.campaigns || []).find((c) => c.id === id);
    if (!camp) throw makeError(config, 404, { error: 'Campaña no encontrada' });
    const promotions = (state.promotions || []).filter((p) => p.campaignId === id);
    return makeResponse(config, 200, {
      ...camp,
      promotions,
      effectiveStatus: getEffectiveCampaignStatus(camp, new Date()),
    });
  }

  if (pathname === '/campaigns' && method === 'post') {
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    if (!Array.isArray(state.promotions)) state.promotions = [];

    const newId = `demo_camp_${Date.now()}`;
    const slug = body.slug ? slugify(body.slug) : `${slugify(body.name)}-${Date.now().toString().slice(-4)}`;

    const newCamp = {
      id: newId,
      name: String(body.name || 'Nueva Campaña').trim(),
      slug,
      status: body.status || 'DRAFT',
      startsAt: body.startsAt || null,
      endsAt: body.endsAt || null,
      priority: Number(body.priority || 0),
      active: body.active !== false,
      headline: body.headline || null,
      subheadline: body.subheadline || null,
      description: body.description || null,
      bannerUrl: body.bannerUrl || null,
      bannerImage: body.bannerImage || body.bannerUrl || null,
      theme: body.theme || 'neutro',
      themeConfig: body.themeConfig || null,
      announcementText: body.announcementText || null,
      announcementLink: body.announcementLink || null,
      conditionsText: body.conditionsText || null,
      showCountdown: Boolean(body.showCountdown),
      landingEnabled: body.landingEnabled !== false,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      promotions: [],
    };

    if (Array.isArray(body.promotions) && body.promotions.length > 0) {
      body.promotions.forEach((p, idx) => {
        const promoId = `demo_promo_${newId}_${idx}`;
        const createdPromo = {
          id: promoId,
          campaignId: newId,
          name: String(p.name || 'Promoción').trim(),
          kind: p.kind || 'PERCENT',
          value: p.value != null ? Number(p.value) : null,
          minQuantity: p.minQuantity != null ? Number(p.minQuantity) : null,
          minOrderAmount: p.minOrderAmount != null ? Number(p.minOrderAmount) : null,
          maxDiscountAmount: p.maxDiscountAmount != null ? Number(p.maxDiscountAmount) : null,
          tiers: p.tiers ? (typeof p.tiers === 'string' ? p.tiers : JSON.stringify(p.tiers)) : null,
          buyQuantity: p.buyQuantity != null ? Number(p.buyQuantity) : null,
          payQuantity: p.payQuantity != null ? Number(p.payQuantity) : null,
          bundleSkus: p.bundleSkus ? (typeof p.bundleSkus === 'string' ? p.bundleSkus : JSON.stringify(p.bundleSkus)) : null,
          paymentMethod: p.paymentMethod || null,
          stackable: Boolean(p.stackable),
          startsAt: newCamp.startsAt,
          endsAt: newCamp.endsAt,
          active: true,
          targets: Array.isArray(p.targets) ? p.targets : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.promotions.push(createdPromo);
        newCamp.promotions.push(createdPromo);
      });
    }

    state.campaigns.unshift(newCamp);
    saveDemoState(state);
    return makeResponse(config, 201, {
      ...newCamp,
      effectiveStatus: getEffectiveCampaignStatus(newCamp, new Date()),
    });
  }

  if (pathname.match(/^\/campaigns\/[^/]+$/) && method === 'put') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const idx = (state.campaigns || []).findIndex((c) => c.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Campaña no encontrada' });

    const current = state.campaigns[idx];
    const updated = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    state.campaigns[idx] = updated;
    saveDemoState(state);
    return makeResponse(config, 200, {
      ...updated,
      effectiveStatus: getEffectiveCampaignStatus(updated, new Date()),
    });
  }

  if (pathname.match(/^\/campaigns\/[^/]+$/) && method === 'delete') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.campaigns = (state.campaigns || []).filter((c) => c.id !== id);
    state.promotions = (state.promotions || []).filter((p) => p.campaignId !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Campaña eliminada' });
  }

  if (pathname.match(/^\/campaigns\/[^/]+\/duplicate$/) && method === 'post') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const original = (state.campaigns || []).find((c) => c.id === id);
    if (!original) throw makeError(config, 404, { error: 'Campaña no encontrada' });

    const newId = `demo_camp_${Date.now()}`;
    const duplicated = {
      ...clone(original),
      id: newId,
      name: `${original.name} (Copia)`,
      slug: `${original.slug}-copia-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      promotions: [],
    };

    const originalPromos = (state.promotions || []).filter((p) => p.campaignId === id);
    originalPromos.forEach((p, idx) => {
      const duplicatedPromo = {
        ...clone(p),
        id: `demo_promo_${newId}_${idx}`,
        campaignId: newId,
        name: `${p.name} (Copia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.promotions.push(duplicatedPromo);
      duplicated.promotions.push(duplicatedPromo);
    });

    state.campaigns.unshift(duplicated);
    saveDemoState(state);
    return makeResponse(config, 201, duplicated);
  }

  if (pathname.match(/^\/campaigns\/[^/]+\/status$/) && method === 'patch') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const camp = (state.campaigns || []).find((c) => c.id === id);
    if (!camp) throw makeError(config, 404, { error: 'Campaña no encontrada' });
    camp.status = body.status || camp.status;
    camp.updatedAt = new Date().toISOString();
    saveDemoState(state);
    return makeResponse(config, 200, camp);
  }

  if (pathname.match(/^\/campaigns\/[^/]+\/end$/) && method === 'patch') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const camp = (state.campaigns || []).find((c) => c.id === id);
    if (!camp) throw makeError(config, 404, { error: 'Campaña no encontrada' });
    camp.status = 'ENDED';
    camp.endsAt = new Date().toISOString();
    camp.updatedAt = new Date().toISOString();
    saveDemoState(state);
    return makeResponse(config, 200, camp);
  }

  if (pathname.match(/^\/campaigns\/[^/]+\/archive$/) && method === 'patch') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const camp = (state.campaigns || []).find((c) => c.id === id);
    if (!camp) throw makeError(config, 404, { error: 'Campaña no encontrada' });
    camp.status = 'ARCHIVED';
    camp.active = false;
    camp.updatedAt = new Date().toISOString();
    saveDemoState(state);
    return makeResponse(config, 200, camp);
  }

  // =========================================================================
  // 8. PROMOTIONS (/promotions/*)
  // =========================================================================
  if (pathname === '/promotions' && method === 'get') {
    if (!Array.isArray(state.promotions)) state.promotions = [];
    const params = new URL(config.url, 'http://localhost').searchParams;
    const campId = params.get('campaignId');
    const kind = params.get('kind');
    const activeFilter = params.get('active');

    let list = state.promotions.map((p) => {
      const camp = (state.campaigns || []).find((c) => c.id === p.campaignId) || null;
      return { ...p, campaign: camp };
    });

    if (campId) list = list.filter((p) => p.campaignId === campId);
    if (kind) list = list.filter((p) => p.kind === kind);
    if (activeFilter !== null && activeFilter !== undefined && activeFilter !== '') {
      const b = activeFilter === 'true';
      list = list.filter((p) => Boolean(p.active) === b);
    }
    return makeResponse(config, 200, list);
  }

  if (pathname.match(/^\/promotions\/[^/]+$/) && method === 'get') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const promo = (state.promotions || []).find((p) => p.id === id);
    if (!promo) throw makeError(config, 404, { error: 'Promoción no encontrada' });
    const camp = (state.campaigns || []).find((c) => c.id === promo.campaignId) || null;
    return makeResponse(config, 200, { ...promo, campaign: camp });
  }

  if (pathname === '/promotions' && method === 'post') {
    if (!Array.isArray(state.promotions)) state.promotions = [];
    const newPromo = {
      id: `demo_promo_${Date.now()}`,
      campaignId: body.campaignId || null,
      name: String(body.name || 'Promoción').trim(),
      kind: body.kind,
      value: body.value != null ? Number(body.value) : null,
      minQuantity: body.minQuantity != null ? Number(body.minQuantity) : null,
      minOrderAmount: body.minOrderAmount != null ? Number(body.minOrderAmount) : null,
      maxDiscountAmount: body.maxDiscountAmount != null ? Number(body.maxDiscountAmount) : null,
      tiers: body.tiers ? (typeof body.tiers === 'string' ? body.tiers : JSON.stringify(body.tiers)) : null,
      buyQuantity: body.buyQuantity != null ? Number(body.buyQuantity) : null,
      payQuantity: body.payQuantity != null ? Number(body.payQuantity) : null,
      bundleSkus: body.bundleSkus ? (typeof body.bundleSkus === 'string' ? body.bundleSkus : JSON.stringify(body.bundleSkus)) : null,
      paymentMethod: body.paymentMethod || null,
      stackable: Boolean(body.stackable),
      startsAt: body.startsAt || null,
      endsAt: body.endsAt || null,
      active: body.active !== false,
      usageLimit: body.usageLimit != null ? Number(body.usageLimit) : null,
      priority: Number(body.priority || 0),
      targets: Array.isArray(body.targets) ? body.targets : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.promotions.unshift(newPromo);
    saveDemoState(state);
    return makeResponse(config, 201, newPromo);
  }

  if (pathname.match(/^\/promotions\/[^/]+$/) && method === 'put') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const idx = (state.promotions || []).findIndex((p) => p.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Promoción no encontrada' });
    const current = state.promotions[idx];
    const updated = {
      ...current,
      ...body,
      targets: Array.isArray(body.targets) ? body.targets : current.targets,
      updatedAt: new Date().toISOString(),
    };
    state.promotions[idx] = updated;
    saveDemoState(state);
    return makeResponse(config, 200, updated);
  }

  if (pathname.match(/^\/promotions\/[^/]+$/) && method === 'delete') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.promotions = (state.promotions || []).filter((p) => p.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Promoción eliminada' });
  }

  if (pathname.match(/^\/promotions\/[^/]+\/toggle$/) && method === 'patch') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const promo = (state.promotions || []).find((p) => p.id === id);
    if (!promo) throw makeError(config, 404, { error: 'Promoción no encontrada' });
    promo.active = !promo.active;
    promo.updatedAt = new Date().toISOString();
    saveDemoState(state);
    return makeResponse(config, 200, promo);
  }

  // =========================================================================
  // 9. COUPONS (/coupons/*)
  // =========================================================================
  if (pathname === '/coupons/export/csv' && method === 'get') {
    const coupons = state.coupons || [];
    const headers = [
      'Código',
      'Tipo',
      'Valor',
      'Compra Mínima',
      'Tope Descuento',
      'Usos Actuales',
      'Límite Total',
      'Límite Por Cliente',
      'Acumulable con Promos',
      'Estado',
    ];
    const rows = coupons.map((c) => [
      `"${c.code}"`,
      `"${c.kind}"`,
      c.value,
      c.minOrderAmount || '',
      c.maxDiscountAmount || '',
      c.usedCount || 0,
      c.usageLimitTotal || 'Ilimitado',
      c.usageLimitPerCustomer || 'Ilimitado',
      c.stackableWithPromotions ? 'Sí' : 'No',
      c.active ? 'Activo' : 'Inactivo',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return makeResponse(config, 200, csvContent, {
      'content-type': 'text/csv; charset=utf-8',
    });
  }

  if (pathname === '/coupons' && method === 'get') {
    if (!Array.isArray(state.coupons)) state.coupons = [];
    const params = new URL(config.url, 'http://localhost').searchParams;
    const search = (params.get('search') || '').toUpperCase().trim();
    const activeFilter = params.get('active');

    let list = state.coupons.map((c) => {
      const redemptionsCount = (state.couponRedemptions || []).filter((r) => r.couponId === c.id).length;
      return {
        ...c,
        _count: { redemptions: redemptionsCount },
      };
    });

    if (search) list = list.filter((c) => c.code.toUpperCase().includes(search));
    if (activeFilter !== null && activeFilter !== undefined && activeFilter !== '') {
      const b = activeFilter === 'true';
      list = list.filter((c) => Boolean(c.active) === b);
    }
    return makeResponse(config, 200, list);
  }

  if (pathname.match(/^\/coupons\/[^/]+$/) && method === 'get') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const coupon = (state.coupons || []).find((c) => c.id === id);
    if (!coupon) throw makeError(config, 404, { error: 'Cupón no encontrado' });
    const redemptions = (state.couponRedemptions || []).filter((r) => r.couponId === id);
    return makeResponse(config, 200, { ...coupon, redemptions });
  }

  if (pathname === '/coupons' && method === 'post') {
    if (!Array.isArray(state.coupons)) state.coupons = [];
    const normalizedCode = String(body.code || '').trim().toUpperCase();
    if (!normalizedCode) throw makeError(config, 400, { error: 'El código es requerido' });

    const exists = state.coupons.some((c) => c.code.toUpperCase() === normalizedCode);
    if (exists) throw makeError(config, 400, { error: 'Ya existe un cupón con ese código' });

    const newCoupon = {
      id: `demo_coupon_${Date.now()}`,
      code: normalizedCode,
      kind: body.kind,
      value: Number(body.value || 0),
      minOrderAmount: body.minOrderAmount != null ? Number(body.minOrderAmount) : null,
      maxDiscountAmount: body.maxDiscountAmount != null ? Number(body.maxDiscountAmount) : null,
      startsAt: body.startsAt || null,
      endsAt: body.endsAt || null,
      usageLimitTotal: body.usageLimitTotal != null ? Number(body.usageLimitTotal) : null,
      usageLimitPerCustomer: body.usageLimitPerCustomer != null ? Number(body.usageLimitPerCustomer) : null,
      usedCount: 0,
      active: body.active !== false,
      campaignId: body.campaignId || null,
      appliesTo: body.appliesTo || 'ALL',
      stackableWithPromotions: Boolean(body.stackableWithPromotions),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.coupons.unshift(newCoupon);
    saveDemoState(state);
    return makeResponse(config, 201, newCoupon);
  }

  if (pathname.match(/^\/coupons\/[^/]+$/) && method === 'put') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const idx = (state.coupons || []).findIndex((c) => c.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Cupón no encontrado' });
    const current = state.coupons[idx];
    const updated = {
      ...current,
      ...body,
      code: body.code ? String(body.code).trim().toUpperCase() : current.code,
      updatedAt: new Date().toISOString(),
    };
    state.coupons[idx] = updated;
    saveDemoState(state);
    return makeResponse(config, 200, updated);
  }

  if (pathname.match(/^\/coupons\/[^/]+$/) && method === 'delete') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.coupons = (state.coupons || []).filter((c) => c.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Cupón eliminado' });
  }

  if (pathname.match(/^\/coupons\/[^/]+\/toggle$/) && method === 'patch') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const coupon = (state.coupons || []).find((c) => c.id === id);
    if (!coupon) throw makeError(config, 404, { error: 'Cupón no encontrado' });
    coupon.active = !coupon.active;
    coupon.updatedAt = new Date().toISOString();
    saveDemoState(state);
    return makeResponse(config, 200, coupon);
  }

  // =========================================================================
  // 10. COLLECTIONS (/collections/*)
  // =========================================================================
  if (pathname === '/collections' && method === 'get') {
    if (!Array.isArray(state.collections)) state.collections = [];
    const populated = state.collections.map((coll) => {
      const items = (coll.products || []).map((cp) => {
        const prod = state.products.find((p) => p.id === cp.productId);
        return {
          ...cp,
          product: prod ? { id: prod.id, name: prod.name, sku: prod.sku, price: prod.price, imageUrl: prod.imageUrl } : null,
        };
      });
      return { ...coll, products: items };
    });
    return makeResponse(config, 200, populated);
  }

  if (pathname.match(/^\/collections\/[^/]+$/) && method === 'get') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const coll = (state.collections || []).find((c) => c.id === id);
    if (!coll) throw makeError(config, 404, { error: 'Colección no encontrada' });
    const items = (coll.products || []).map((cp) => {
      const prod = state.products.find((p) => p.id === cp.productId);
      return { ...cp, product: prod };
    });
    return makeResponse(config, 200, { ...coll, products: items });
  }

  if (pathname === '/collections' && method === 'post') {
    if (!Array.isArray(state.collections)) state.collections = [];
    const newId = `demo_coll_${Date.now()}`;
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);
    const pIds = Array.isArray(body.productIds) ? body.productIds : [];

    const newColl = {
      id: newId,
      name: String(body.name || 'Colección').trim(),
      slug,
      description: body.description || null,
      active: body.active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products: pIds.map((pId, idx) => ({
        collectionId: newId,
        productId: pId,
        order: idx,
      })),
    };
    state.collections.unshift(newColl);
    saveDemoState(state);
    return makeResponse(config, 201, newColl);
  }

  if (pathname.match(/^\/collections\/[^/]+$/) && method === 'put') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const idx = (state.collections || []).findIndex((c) => c.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Colección no encontrada' });
    const current = state.collections[idx];
    const pIds = Array.isArray(body.productIds) ? body.productIds : (current.products || []).map((p) => p.productId);

    const updated = {
      ...current,
      name: body.name !== undefined ? String(body.name).trim() : current.name,
      slug: body.slug ? slugify(body.slug) : current.slug,
      description: body.description !== undefined ? body.description : current.description,
      active: body.active !== undefined ? Boolean(body.active) : current.active,
      updatedAt: new Date().toISOString(),
      products: pIds.map((pId, order) => ({
        collectionId: id,
        productId: pId,
        order,
      })),
    };
    state.collections[idx] = updated;
    saveDemoState(state);
    return makeResponse(config, 200, updated);
  }

  if (pathname.match(/^\/collections\/[^/]+$/) && method === 'delete') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.collections = (state.collections || []).filter((c) => c.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Colección eliminada' });
  }

  // =========================================================================
  // 11. TAGS (/tags/*)
  // =========================================================================
  if (pathname === '/tags' && method === 'get') {
    if (!Array.isArray(state.tags)) state.tags = [];
    const populated = state.tags.map((t) => {
      const count = (state.products || []).filter((p) =>
        (p.tags || []).some((pt) => pt.id === t.id || pt === t.name)
      ).length;
      return {
        ...t,
        _count: { products: count },
      };
    });
    return makeResponse(config, 200, populated);
  }

  if (pathname === '/tags' && method === 'post') {
    if (!Array.isArray(state.tags)) state.tags = [];
    const name = String(body.name || '').trim();
    if (!name) throw makeError(config, 400, { error: 'Nombre requerido' });
    const slug = body.slug ? slugify(body.slug) : slugify(name);
    const existing = state.tags.find((t) => t.slug === slug || t.name.toLowerCase() === name.toLowerCase());
    if (existing) return makeResponse(config, 200, existing);

    const newTag = {
      id: `demo_tag_${Date.now()}`,
      name,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.tags.push(newTag);
    saveDemoState(state);
    return makeResponse(config, 201, newTag);
  }

  if (pathname.match(/^\/tags\/[^/]+$/) && method === 'delete') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.tags = (state.tags || []).filter((t) => t.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { message: 'Etiqueta eliminada' });
  }

  if (pathname === '/tags/assign' && method === 'post') {
    const { productId, tagIds = [] } = body;
    const prod = (state.products || []).find((p) => p.id === productId);
    if (!prod) throw makeError(config, 404, { error: 'Producto no encontrado' });
    const matched = (state.tags || []).filter((t) => tagIds.includes(t.id));
    prod.tags = matched;
    saveDemoState(state);
    return makeResponse(config, 200, prod);
  }

  // =========================================================================
  // 12. AUDIT (/audit/*)
  // =========================================================================
  
  if (pathname === '/audit/marketing' && method === 'get') {
    if (!Array.isArray(state.orders)) state.orders = [];
    if (!Array.isArray(state.campaigns)) state.campaigns = [];
    if (!Array.isArray(state.coupons)) state.coupons = [];

    const params = new URL(config.url, 'http://localhost').searchParams;
    const range = params.get('range') || '30d';
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    const now = new Date();
    let start = null;
    let end = endDate ? new Date(endDate) : null;

    if (startDate) {
      start = new Date(startDate);
    } else if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (range === '7d') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const filteredOrders = state.orders.filter((ord) => {
      if (ord.status === 'CANCELLED') return false;
      const d = new Date(ord.createdAt);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    const metrics = computeMarketingMetrics({
      orders: filteredOrders,
      campaigns: state.campaigns,
      coupons: state.coupons,
      range,
      start,
      end,
    });

    return makeResponse(config, 200, metrics);
  }

  if (pathname === '/audit/price-history' && method === 'get') {
    if (!Array.isArray(state.priceHistory)) state.priceHistory = [];
    const params = new URL(config.url, 'http://localhost').searchParams;
    const productId = params.get('productId');
    const variantId = params.get('variantId');
    const page = Number(params.get('page') || 1);
    const limit = Number(params.get('limit') || 50);

    let list = state.priceHistory.map((ph) => {
      const prod = (state.products || []).find((p) => p.id === ph.productId);
      let variant = null;
      if (ph.variantId && prod && Array.isArray(prod.variants)) {
        variant = prod.variants.find((v) => v.id === ph.variantId) || null;
      }
      return {
        ...ph,
        product: prod ? { id: prod.id, name: prod.name, sku: prod.sku } : null,
        variant: variant ? { id: variant.id, sku: variant.sku, size: variant.size, color: variant.color } : null,
      };
    });

    if (productId) list = list.filter((ph) => ph.productId === productId);
    if (variantId) list = list.filter((ph) => ph.variantId === variantId);

    list.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    const skip = (page - 1) * limit;

    return makeResponse(config, 200, {
      items: list.slice(skip, skip + limit),
      total: list.length,
      page,
      limit,
    });
  }

  // =========================================================================
  // 13. HOME SECTIONS (/home-sections/*)
  // =========================================================================
  if (pathname === '/home-sections' && method === 'get') {
    if (!Array.isArray(state.homeSections)) state.homeSections = [];
    const params = new URL(config.url, 'http://localhost').searchParams;
    const campaignId = params.get('campaignId');
    const preview = params.get('preview');
    const activeOnly = params.get('activeOnly') === 'true';

    // 13.1 Solicitud explícita para una campaña (usada por /admin/portada)
    if (campaignId !== null && campaignId !== undefined) {
      const targetCampId = (campaignId === 'base' || campaignId === '' || campaignId === 'null') ? null : campaignId;
      const filtered = state.homeSections
        .filter((s) => (s.campaignId || null) === targetCampId && (!activeOnly || s.enabled !== false))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      return makeResponse(config, 200, {
        sections: filtered,
        activeCampaign: null,
      });
    }

    // 13.2 Solicitud pública (con o sin vista previa ?preview=<id>)
    const now = new Date();
    const previewCampaign = preview
      ? (state.campaigns || []).find((c) => c.id === preview || c.slug === preview)
      : null;

    const activeList = (state.campaigns || [])
      .map((c) => ({ ...c, effectiveStatus: getEffectiveCampaignStatus(c, now) }))
      .filter((c) => c.effectiveStatus === 'ACTIVE' && c.active !== false)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const activeCampaign = activeList[0] || null;

    const resolved = resolveActiveHomeSections({
      allSections: state.homeSections,
      activeCampaign,
      previewCampaign,
      activeOnly: true,
    });

    return makeResponse(config, 200, resolved);
  }

  if (pathname === '/home-sections' && method === 'post') {
    if (!Array.isArray(state.homeSections)) state.homeSections = [];
    const targetCampId = (body.campaignId === 'base' || !body.campaignId) ? null : body.campaignId;

    const newSection = {
      id: `demo_sec_${Date.now()}`,
      campaignId: targetCampId,
      type: body.type,
      order: Number(body.order || 0),
      enabled: body.enabled !== false,
      config: typeof body.config === 'object' ? body.config : JSON.parse(body.config || '{}'),
      startsAt: body.startsAt || null,
      endsAt: body.endsAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.homeSections.push(newSection);
    saveDemoState(state);
    return makeResponse(config, 201, newSection);
  }

  if (pathname === '/home-sections/reorder' && method === 'put') {
    if (!Array.isArray(state.homeSections)) state.homeSections = [];
    const items = Array.isArray(body.items) ? body.items : [];
    const orderMap = new Map(items.map((it) => [it.id, Number(it.order)]));

    state.homeSections.forEach((s) => {
      if (orderMap.has(s.id)) {
        s.order = orderMap.get(s.id);
        s.updatedAt = new Date().toISOString();
      }
    });

    saveDemoState(state);
    return makeResponse(config, 200, { success: true, count: items.length });
  }

  if (pathname === '/home-sections/apply-template' && method === 'post') {
    if (!Array.isArray(state.homeSections)) state.homeSections = [];
    const targetCampId = (body.campaignId === 'base' || !body.campaignId) ? null : body.campaignId;
    const campaign = targetCampId ? (state.campaigns || []).find((c) => c.id === targetCampId) : null;
    const suggested = getSuggestedHomeSectionsTemplate(body.templateKey, campaign);

    // Remover anteriores
    state.homeSections = state.homeSections.filter((s) => (s.campaignId || null) !== targetCampId);

    // Agregar nuevas
    suggested.forEach((s, idx) => {
      state.homeSections.push({
        id: `demo_sec_tmpl_${Date.now()}_${idx}`,
        campaignId: targetCampId,
        type: s.type,
        order: s.order,
        enabled: s.enabled !== false,
        config: s.config || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    saveDemoState(state);

    const updated = state.homeSections
      .filter((s) => (s.campaignId || null) === targetCampId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return makeResponse(config, 200, {
      sections: updated,
      activeCampaign: campaign,
    });
  }

  if (pathname.match(/^\/home-sections\/[^/]+$/) && method === 'put') {
    if (!Array.isArray(state.homeSections)) state.homeSections = [];
    const id = decodeURIComponent(pathname.split('/')[2]);
    const idx = state.homeSections.findIndex((s) => s.id === id);
    if (idx === -1) throw makeError(config, 404, { error: 'Sección no encontrada' });

    const current = state.homeSections[idx];
    const updated = {
      ...current,
      ...body,
      config: typeof body.config === 'object' ? body.config : (body.config !== undefined ? JSON.parse(body.config || '{}') : current.config),
      updatedAt: new Date().toISOString(),
    };
    state.homeSections[idx] = updated;
    saveDemoState(state);
    return makeResponse(config, 200, updated);
  }

  if (pathname.match(/^\/home-sections\/[^/]+$/) && method === 'delete') {
    if (!Array.isArray(state.homeSections)) state.homeSections = [];
    const id = decodeURIComponent(pathname.split('/')[2]);
    state.homeSections = state.homeSections.filter((s) => s.id !== id);
    saveDemoState(state);
    return makeResponse(config, 200, { success: true });
  }

  
  // =========================================================================
  // 14. NEWSLETTER (/newsletter/*)
  // =========================================================================
  if (pathname === '/newsletter/subscribe' && method === 'post') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    const email = String(body.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      throw makeError(config, 400, { error: 'Ingresá un correo electrónico válido' });
    }
    if (body.consentGiven !== true) {
      throw makeError(config, 400, { error: 'Debés aceptar el consentimiento explícito (Ley 25.326)' });
    }

    const existing = state.subscribers.find((s) => s.email === email);
    const nowIso = new Date().toISOString();

    if (existing) {
      if (existing.active) {
        return makeResponse(config, 200, {
          message: 'Ya estás suscripto al newsletter de Tienda Nocturna.',
          subscriber: existing,
          alreadySubscribed: true,
        });
      }
      existing.active = true;
      existing.consentGiven = true;
      existing.consentDate = nowIso;
      existing.unsubscribedAt = null;
      saveDemoState(state);
      return makeResponse(config, 200, {
        message: '¡Reactivamos tu suscripción al newsletter con éxito!',
        subscriber: existing,
        reactivated: true,
      });
    }

    const newSub = {
      id: `demo_sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      email,
      consentGiven: true,
      consentDate: nowIso,
      active: true,
      unsubscribedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    state.subscribers.push(newSub);
    saveDemoState(state);

    return makeResponse(config, 201, {
      message: '¡Te suscribiste exitosamente al newsletter de Tienda Nocturna!',
      subscriber: newSub,
      created: true,
    });
  }

  if (pathname === '/newsletter/unsubscribe' && method === 'post') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    const email = String(body.email || '').toLowerCase().trim();
    const existing = state.subscribers.find((s) => s.email === email);
    if (existing) {
      existing.active = false;
      existing.unsubscribedAt = new Date().toISOString();
      saveDemoState(state);
    }
    return makeResponse(config, 200, {
      message: 'Te diste de baja del newsletter de Tienda Nocturna exitosamente.',
      success: true,
    });
  }

  if ((pathname === '/newsletter/admin/subscribers' || pathname === '/newsletter/subscribers') && method === 'get') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    return makeResponse(config, 200, {
      subscribers: state.subscribers,
      total: state.subscribers.length,
    });
  }

  if ((pathname === '/newsletter/admin/export' || pathname === '/newsletter/export') && method === 'get') {
    if (!Array.isArray(state.subscribers)) state.subscribers = [];
    const activeSubs = state.subscribers.filter((s) => s.active !== false);
    const bom = '\uFEFF';
    const header = ['Email', 'Consentimiento Ley 25.326', 'Fecha Consentimiento', 'Estado', 'Fecha Suscripcion'].join(';');
    const rows = activeSubs.map((s) => {
      const email = `"${s.email.replace(/"/g, '""')}"`;
      const consent = s.consentGiven ? 'SI (Explícito)' : 'NO';
      const consentDate = s.consentDate || '';
      const status = s.active ? 'Activo' : 'Baja';
      const createdAt = s.createdAt || '';
      return [email, consent, consentDate, status, createdAt].join(';');
    });
    const csvContent = bom + [header, ...rows].join('\r\n');
    return makeResponse(config, 200, csvContent, {
      'content-type': 'text/csv; charset=utf-8',
    });
  }

  if (pathname === '/settings' && method === 'get') {
    const s = state.settings || {
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
    return makeResponse(config, 200, s);
  }

  if (pathname === '/settings' && method === 'put') {
    state.settings = {
      ...(state.settings || {}),
      ...(body || {}),
      updatedAt: new Date().toISOString(),
    };
    saveDemoState(state);
    return makeResponse(config, 200, state.settings);
  }

  throw makeError(config, 404, { error: `Endpoint no soportado en modo demo: ${method.toUpperCase()} ${pathname}` });
};
