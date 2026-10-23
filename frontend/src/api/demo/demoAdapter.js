import demoSeedData from './demo-data.json';

export const DEMO_STATE_KEY = 'nocturna-demo-state';
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

const createInitialState = () => {
  const categories = clone(demoSeedData.categories || []);
  const products = clone(demoSeedData.products || []);

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

  const sampleProduct = products[0];
  const orders = sampleProduct
    ? [
        {
          id: 'demo_ord_0001',
          customerName: 'Valentina Gómez (Ejemplo Demo)',
          customerEmail: 'valentina@ejemplo.com',
          customerPhone: '351 555 0192',
          customerAddress: 'Av. Hipólito Yrigoyen 450, Nueva Córdoba, CP 5000, Córdoba',
          customerProvince: 'Córdoba',
          customerCity: 'Córdoba Capital',
          customerPostalCode: '5000',
          deliveryMethod: 'DELIVERY',
          comments: 'Entregar en recepción en sobre cerrado sin logos.',
          status: 'PENDING',
          total: Number(sampleProduct.price || 32000),
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          items: [
            {
              id: 'demo_ord_item_1',
              productId: sampleProduct.id,
              variantId: null,
              variantDescription: null,
              quantity: 1,
              price: Number(sampleProduct.price || 32000),
              product: {
                id: sampleProduct.id,
                name: sampleProduct.name,
                sku: sampleProduct.sku,
                price: sampleProduct.price,
              },
            },
          ],
        },
      ]
    : [];

  return {
    version: 1,
    initializedAt: new Date().toISOString(),
    categories,
    products,
    users,
    orders,
    cart: [],
    session: null,
  };
};

export const loadDemoState = () => {
  try {
    const raw = localStorage.getItem(DEMO_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        if (!Array.isArray(parsed.cart)) parsed.cart = [];
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[DemoMode] Error leyendo localStorage, usando estado inicial:', err);
  }

  const initial = createInitialState();
  saveDemoState(initial);
  return initial;
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
    const subtotal = (Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('es-AR');
    lines.push(`• ${item.quantity}x ${prodName}${variantPart}${skuPart} — $${subtotal}`);
  }

  lines.push(
    '',
    `*Total estimado:* $${Number(order.total || 0).toLocaleString('es-AR')}`,
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

    if (sort === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'best_selling') {
      list.sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0));
    } else if (sort === 'newest' || includeInactive) {
      list.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } else {
      // Orden por defecto: Destacados primero
      list.sort((a, b) => {
        const aFeat = a.featured || a.badge === 'Destacado' ? 1 : 0;
        const bFeat = b.featured || b.badge === 'Destacado' ? 1 : 0;
        if (bFeat !== aFeat) return bFeat - aFeat;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }

    const total = list.length;
    const skip = (page - 1) * limit;
    return makeResponse(config, 200, {
      products: list.slice(skip, skip + limit),
      total,
      page,
      limit,
    });
  }

  if (pathname.startsWith('/products/') && method === 'get') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const found = state.products.find((p) => p.id === id);
    if (!found) throw makeError(config, 404, { error: 'Producto no encontrado' });
    return makeResponse(config, 200, found);
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
        body.badge === 'Destacado'
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
  // 4. ORDERS (/orders/*)
  // =========================================================================
  if (pathname === '/orders' && method === 'post') {
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      throw makeError(config, 400, { error: 'El pedido no contiene productos.' });
    }

    let orderTotal = 0;
    const populatedItems = [];

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

      const unitPrice = variant ? Number(variant.price) : Number(product.price);
      orderTotal += unitPrice * qty;

      // Descontar stock en el estado local
      if (variant) {
        variant.stock = Math.max(0, Number(variant.stock || 0) - qty);
        product.stock = (product.variants || []).reduce(
          (s, v) => s + Number(v.stock || 0),
          0
        );
      } else {
        product.stock = Math.max(0, Number(product.stock || 0) - qty);
      }
      product.soldCount = Number(product.soldCount || 0) + qty;

      populatedItems.push({
        id: `demo_ord_item_${Date.now()}_${populatedItems.length}`,
        productId: product.id,
        variantId: variant?.id || null,
        variantDescription: item.variantDescription || null,
        quantity: qty,
        price: unitPrice,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
        },
        variant: variant
          ? {
              id: variant.id,
              sku: variant.sku,
            }
          : null,
      });
    }

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
      total: orderTotal,
      createdAt: new Date().toISOString(),
      items: populatedItems,
    };

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

    order.status = nextStatus;
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

  throw makeError(config, 404, { error: `Endpoint no soportado en modo demo: ${method.toUpperCase()} ${pathname}` });
};
