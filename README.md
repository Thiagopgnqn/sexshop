# Nocturna SexShop — Tienda Online en Córdoba

Ecommerce oficial de **Nocturna SexShop** (`@nocturna.sexshop.cba`, Córdoba, Argentina). Diseñado con estética de boutique íntima nocturna, control de mayoría de edad (`+18`), catálogo jerárquico con categorías y subcategorías, soporte completo de variantes por producto, carrito persistente, checkout confidencial por WhatsApp, integración privada con Píxel de Meta + API de Conversiones (CAPI) y panel de administración.

---

## Datos del Negocio y Configuración de Marca

- **Nombre comercial:** Nocturna SexShop
- **Instagram:** [@nocturna.sexshop.cba](https://www.instagram.com/nocturna.sexshop.cba/)
- **WhatsApp de pedidos y atención:** `+54 9 3517 57-2841` (formato `wa.me` y variable `WHATSAPP_PHONE`: `5493517572841`)
- **Ubicación:** Córdoba, Argentina
- **Placeholders pendientes de confirmar con el cliente** (centralizados en `frontend/src/config/theme.js`):
  - `[EMAIL]` — Correo electrónico de contacto
  - `[HORARIOS]` — Días y horarios de atención / entregas
  - `[ZONA DE ENTREGA]` — Cobertura de cadetería en Córdoba y alrededores
  - `[RAZÓN SOCIAL]` — Titular o razón social para facturación y legales

---

## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite 4, TailwindCSS 3, React Router v6, Axios, React Icons |
| **Backend** | Node.js (ESM), Express, Prisma ORM, Zod, Helmet, Express Rate Limit, Multer |
| **Base de Datos** | PostgreSQL (`prisma/schema.prisma`) + fallback automático de lectura en `prisma/catalog-snapshot.json` |
| **Almacenamiento** | Cloudinary (`folder: nocturna-sexshop`) |
| **Analítica / Ads** | Meta Pixel (navegador) + Meta Conversions API / CAPI (servidor) en modo privacidad estricta |

---

## Sistema de Diseño y Paleta (Tema Oscuro)

Los colores están definidos como tokens semánticos en `frontend/tailwind.config.js` y `frontend/src/index.css`:

| Token Tailwind | Hex | Uso |
|----------------|-----|-----|
| `canvas` | `#0F0A0A` | Fondo principal del sitio |
| `surface` | `#1A1212` | Superficies, tarjetas, modales y tablas |
| `surface-elevated` / `brand-deep` | `#2B1917` | Bordó oscuro para cabeceras, badges e inputs |
| `brand` | `#5A2A2E` | Vino profundo para botones primarios y acentos |
| `mauve` / `border` | `#907878` | Rosa viejo/malva para detalles, estados hover y bordes |
| `content` | `#F2EDE8` | Texto principal (contraste AA sobre fondos oscuros) |
| `content-secondary` | `#B8ABA6` | Texto secundario y descripciones |

- **Tipografías:** **Jost** (pesos 300/400/500, `letter-spacing` amplio para títulos y wordmark) y **DM Sans** (400/500/600 para cuerpo de texto y controles). Sin fuentes serif.
- **Activos de marca:** Logos vectoriales (`frontend/public/brand/logo-horizontal.svg`, `logo-vertical.svg`, `favicon.svg`), referencia (`instagram-profile.jpg`) e íconos PWA/favicons regenerados en `frontend/public/`.

---

## Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **PostgreSQL** v14 o superior

---

## Instalación y Puesta en Marcha

### 1. Variables de entorno

Copiar el archivo `.env.example` de la raíz a `backend/.env`:

```bash
cp .env.example backend/.env
```

#### Variables de `backend/.env`

| Variable | Descripción | Ejemplo / Valor |
|----------|-------------|-----------------|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/nocturna_db?schema=public` |
| `JWT_ACCESS_SECRET` | Secreto JWT de acceso (obligatorio en producción) | `[GENERAR_STRING_ALEATORIO_SEGURO]` |
| `JWT_REFRESH_SECRET` | Secreto JWT de refresco (obligatorio en producción) | `[GENERAR_STRING_ALEATORIO_SEGURO]` |
| `JWT_ACCESS_EXPIRATION` | Duración del access token | `15m` |
| `JWT_REFRESH_EXPIRATION` | Duración del refresh token | `7d` |
| `WHATSAPP_PHONE` | Número de WhatsApp receptor de órdenes | `5493517572841` |
| `PORT` | Puerto del servidor backend | `3001` |
| `CORS_ORIGIN` | Origen permitido del frontend | `http://localhost:5173` |
| `ADMIN_EMAIL` | Email del usuario administrador inicial | `[ADMIN_EMAIL]` |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | `[ADMIN_PASSWORD]` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | `[CLOUDINARY_CLOUD_NAME]` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `[CLOUDINARY_API_KEY]` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | `[CLOUDINARY_API_SECRET]` |
| `META_PIXEL_ID` | ID del Píxel de Meta para CAPI (opcional) | `[META_PIXEL_ID]` |
| `META_CAPI_ACCESS_TOKEN` | Token de API de Conversiones (opcional) | `[META_CAPI_ACCESS_TOKEN]` |

> **Nota de seguridad:** `backend/src/config/env.js` no contiene credenciales ni teléfonos hardcodeados. Si faltan secretos críticos o `WHATSAPP_PHONE` cuando `NODE_ENV=production`, el servidor aborta el inicio informando exactamente qué variables faltan.

#### Variables de `frontend/.env` (Opcional)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend (por defecto usa `/api` vía proxy) | `http://localhost:3001/api` |
| `VITE_META_PIXEL_ID` | ID del Píxel de Meta en navegador (si falta, no carga `fbevents.js`) | `[META_PIXEL_ID]` |

---

### 2. Instalación de dependencias, migración y carga del catálogo

```bash
# 1. Instalar dependencias de raíz, backend y frontend
npm run install:all

# 2. Generar cliente Prisma y aplicar migraciones en PostgreSQL
cd backend
npx prisma generate
npx prisma migrate deploy

# 3. Crear usuario administrador inicial (usa ADMIN_EMAIL y ADMIN_PASSWORD)
npm run seed

# 4. Importar el catálogo desde catalogo_nocturna.csv
npm run import:catalog
cd ..
```

---

### 3. Ejecución en Desarrollo y Producción

Abrir dos terminales:

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Para compilar el frontend para producción:

```bash
cd frontend
npm run build
```

---

## Importación del Catálogo (`npm run import:catalog`)

El script `backend/scripts/import-catalog.js` lee `catalogo_nocturna.csv` y aplica las siguientes reglas de negocio:

1. **Agrupación por producto y variantes:** Cada valor único de `grupo` genera un `Product`. Cuando el grupo tiene múltiples filas o atributos de variante (`variante_tipo`, `variante_talle`, `variante_color`, `variante_sabor_aroma`, `variante_volumen_medida`), cada fila se registra como un `ProductVariant` con su propio SKU, precio y stock.
2. **Precio base:** En productos con variantes, el `price` base del producto se calcula automáticamente como el menor precio entre sus variantes.
3. **Jerarquía de categorías:** Crea automáticamente las categorías principales (`categoria`) y subcategorías (`subcategoria`) con sus `slug` sin duplicarlas.
4. **Borradores automáticos (`active = false`):**
   - Filas con `estado = revisar`.
   - Filas sin precio (`precio_ars` vacío), incluso si tienen `estado = ok`.
5. **Normalización de SKUs:**
   - SKUs duplicados (`144`, `138`, `153`, `109`, `C02`) reciben sufijos incrementales (`-2`, `-3`) para garantizar unicidad.
   - Filas sin SKU reciben un código interno secuencial (`NOC-0001` a `NOC-0064`).
6. **Idempotencia y Snapshot:** Puede ejecutarse múltiples veces sin duplicar productos ni categorías. Además, actualiza `backend/prisma/catalog-snapshot.json` y genera el reporte `REVISAR.md` en la raíz del proyecto.

---

## Estructura del Proyecto

```text
sexshop/
├── backend/
│   ├── prisma/
│   │   ├── migrations/                    # Migración limpia PostgreSQL (init_nocturna)
│   │   ├── schema.prisma                  # Modelos User, Category, Product, ProductVariant, Order, OrderItem
│   │   ├── seed.js                        # Creación segura del usuario ADMIN desde variables de entorno
│   │   └── catalog-snapshot.json          # Snapshot generado por import-catalog.js
│   ├── scripts/
│   │   └── import-catalog.js              # Importador idempotente de catalogo_nocturna.csv + generador de REVISAR.md
│   ├── src/
│   │   ├── config/env.js                  # Validación de entorno sin fallbacks inseguros
│   │   ├── controllers/                   # Controladores HTTP (auth, category, product, order, user)
│   │   ├── middleware/                    # JWT auth, validación de rol admin, rateLimiter, Zod validate, errorHandler
│   │   ├── routes/                        # Rutas Express (/api/auth, /api/categories, /api/products, /api/orders, /api/upload, /api/users)
│   │   ├── services/                      # Lógica de negocio + Meta CAPI (meta.service.js)
│   │   ├── utils/                         # JWT helpers y generador de mensaje de WhatsApp con variantes y SKU
│   │   ├── validators/                    # Esquemas Zod (sin mínimo de unidades, soporte de variantes)
│   │   └── index.js                       # Servidor Express principal
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── brand/                         # Logos SVG (horizontal/vertical) y foto de referencia de Instagram
│   │   ├── favicon.svg / favicon.ico      # Favicons e íconos de aplicación
│   │   ├── site.webmanifest               # Web App Manifest con colores de Nocturna (#0F0A0A / #5A2A2E)
│   │   ├── robots.txt                     # Reglas de indexación
│   │   └── sitemap.xml                    # Sitemap de las secciones públicas
│   ├── src/
│   │   ├── api/client.js                  # Cliente Axios con refresh automático de JWT
│   │   ├── components/
│   │   │   ├── admin/                     # AdminSidebar, ProductForm (con variantes), ProductTable, OrderTable, UserTable, UserForm
│   │   │   ├── auth/                      # LoginForm y RegisterForm
│   │   │   ├── cart/                      # CartDrawer, CartItem (con variante), CartSummary (sin mínimo de compra)
│   │   │   ├── catalog/                   # SearchBar (<search>), FilterSidebar (categorías, precio, talle, color, aroma), ProductCard, ProductGrid
│   │   │   ├── checkout/                  # CheckoutForm (Envío a domicilio / Retiro acordado + WhatsApp)
│   │   │   ├── layout/                    # Layout, Header, Footer, AgeGateModal (+18), ErrorBoundary
│   │   │   └── ui/                        # Logo, ProductPlaceholder, Button, Input, Select, Modal, Badge, Toast, Skeleton, Spinner
│   │   ├── config/theme.js                # Configuración centralizada de marca, navegación, FAQ, contacto y textos legales
│   │   ├── context/                       # AuthContext y CartContext (clave compuesta productId + variantId)
│   │   ├── hooks/                         # useAuth, useCart, useProducts, useSEO
│   │   ├── pages/
│   │   │   ├── admin/                     # DashboardPage, ProductsPage, CategoriesPage, OrdersPage, UsersPage
│   │   │   ├── HomePage.jsx               # Hero con textura humo CSS, categorías, destacados, sobre nosotros, beneficios y FAQ
│   │   │   ├── CatalogPage.jsx            # Catálogo con filtros combinados y paginación
│   │   │   ├── ProductPage.jsx            # Ficha de producto con selector interactivo de variantes
│   │   │   ├── CartPage.jsx               # Carrito detallado con avisos de discreción
│   │   │   ├── CheckoutPage.jsx           # Confirmación de orden y derivación a WhatsApp
│   │   │   ├── LegalPage.jsx              # Sobre nosotros, Envíos discretos, Política de cambios, Privacidad y Términos (+18)
│   │   │   ├── LoginPage.jsx              # Inicio de sesión
│   │   │   ├── RegisterPage.jsx           # Registro de cuenta
│   │   │   └── NotFoundPage.jsx           # Página 404
│   │   ├── utils/metaPixel.js             # Píxel de Meta en navegador (solo IDs/SKUs)
│   │   ├── App.jsx                        # Rutas públicas y rutas protegidas de administración
│   │   ├── index.css                      # Variables y utilidades Tailwind + texturas CSS
│   │   └── main.jsx                       # Punto de entrada React
│   └── package.json
│
├── catalogo_nocturna.csv                  # Catálogo fuente normalizado (400 filas)
├── REVISAR.md                             # Reporte de ítems en borrador, sin precio y SKUs normalizados
├── reporte_verificacion_meta.txt          # Documentación de auditoría de privacidad de Meta Pixel y CAPI
├── .env.example                           # Plantilla de variables de entorno
└── README.md
```

---

## Endpoints de la API

### Categorías (`/api/categories`)
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/` | Público | Lista categorías jerárquicas (`?flat=true` devuelve lista plana) |
| `POST` | `/` | Admin | Crea una categoría o subcategoría (`parentId` opcional) |
| `PUT` | `/:id` | Admin | Actualiza nombre, `slug`, `parentId` u `order` |
| `DELETE` | `/:id` | Admin | Elimina una categoría sin subcategorías ni productos activos |

### Productos (`/api/products`)
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/` | Público | Lista productos paginados (`category`, `subcategory`, `size`, `color`, `flavor`, `minPrice`, `maxPrice`, `search`, `sort`) |
| `GET` | `/filters` | Público | Devuelve talles, colores y sabores/aromas disponibles en variantes activas |
| `GET` | `/:id` | Público | Detalle de un producto con su categoría y sus variantes |
| `POST` | `/` | Admin | Crea un producto junto con sus variantes |
| `PUT` | `/:id` | Admin | Actualiza un producto y sincroniza sus variantes |
| `DELETE` | `/:id` | Admin | Desactiva un producto (baja lógica `active: false`) |

### Pedidos (`/api/orders`)
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/` | Público | Registra pedido (valida stock de producto o variante), emite evento `Purchase` por CAPI y devuelve `whatsappLink` |
| `GET` | `/` | Admin | Lista todos los pedidos recibidos |
| `GET` | `/:id` | Admin | Detalle de un pedido y sus ítems/variantes |
| `PATCH` | `/:id/status` | Admin | Actualiza estado (`PENDING`, `CONFIRMED`, `DELIVERED`, `CANCELLED`, reintegrando stock si se cancela) |

### Autenticación (`/api/auth`), Usuarios (`/api/users`) e Imágenes (`/api/upload`)
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id` (solo Admin)
- `POST /api/upload/image` (solo Admin, subida a Cloudinary en carpeta `nocturna-sexshop`)

---

## Privacidad en Meta Pixel y API de Conversiones (CAPI)

Para proteger la privacidad de los clientes y cumplir con las políticas publicitarias de Meta en el rubro bienestar íntimo (`+18`):
- **Carga condicional:** Si `VITE_META_PIXEL_ID` no está configurada, el script del Píxel no se inyecta en el navegador. Si `META_PIXEL_ID` o `META_CAPI_ACCESS_TOKEN` no están en el backend, CAPI no realiza envíos.
- **Sin nombres ni categorías:** Ningún evento (`ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`) incluye `content_name`, descripciones ni nombres de categorías.
- **Solo identificadores técnicos:** Solo se envía `content_ids` (SKU o ID), `content_type: 'product'`, `value`, `currency: 'ARS'` y `num_items`. Ver detalle completo en `reporte_verificacion_meta.txt`.
