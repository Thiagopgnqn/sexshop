# Nocturna SexShop — Tienda Online en Córdoba

Ecommerce oficial de **Nocturna SexShop** (`@nocturna.sexshop.cba`, Córdoba, Argentina). Diseñado con estética de boutique íntima nocturna, control de mayoría de edad (`+18`), catálogo jerárquico con categorías y subcategorías, soporte completo de variantes por producto, carrito persistente, checkout confidencial por WhatsApp, integración privada con Píxel de Meta + API de Conversiones (CAPI), panel de administración y **Modo Demo autónomo en el navegador (`VITE_DEMO_MODE=true`)** listo para publicar en Vercel sin servidor ni base de datos online.

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

## Modo Demo en Vercel (Sin Backend ni Base de Datos Online)

La tienda cuenta con un **Modo Demostración 100% client-side** (`VITE_DEMO_MODE=true`) implementado como un adaptador de Axios en `frontend/src/api/demo/demoAdapter.js`. Cuando está activo, intercepta todas las llamadas de `frontend/src/api/client.js` y las resuelve en el navegador usando `frontend/src/api/demo/demo-data.json` y `localStorage` (`nocturna-demo-state`).

### Características del Modo Demo
- **Catálogo de demostración (`demo-data.json`):** Generado a partir de `catalogo_demo.csv` mediante `npm run demo:build-data` (30 productos activos, 6 marcados como destacados para la Home, 54 variantes con stock inicial de 10 unidades por variante y `ProductPlaceholder` de marca).
- **Persistencia local (`nocturna-demo-state`):** Los productos creados o editados, categorías, pedidos realizados, sesión activa y carrito se guardan en `localStorage` del navegador.
- **Restablecer demo:** Botón **"Restablecer demo"** disponible en el banner fijo inferior, en el pie de página (`Footer`) y en la cabecera/barra lateral del panel `/admin` para borrar el estado local y volver a los datos originales de `demo-data.json`.
- **Credenciales del Panel Admin (`/admin`) en Modo Demo:**
  - **Usuario:** `admin@nocturna.demo`
  - **Contraseña:** `demo1234`
- **Subida de imágenes en el Admin Demo:** Acepta archivos de imagen desde el navegador y los redimensiona automáticamente en un `<canvas>` (máx. `800px`, JPEG calidad `0.78`) guardándolos como Data URL liviana para no saturar `localStorage`.
- **Checkout a WhatsApp:** Guarda el pedido en el estado local (visible en `/admin/pedidos` con cambio de estado), descuenta el stock de la variante elegida y genera el link a WhatsApp usando `VITE_DEMO_WHATSAPP` (por defecto `5493517572841`).
- **Meta Pixel y CAPI desactivados:** En modo demo no se inyecta `fbevents.js` ni se emiten eventos publicitarios.

### Cómo desplegar la Demo en Vercel

1. Subí este repositorio a GitHub.
2. En [Vercel](https://vercel.com), creá un nuevo proyecto (**Add New → Project**) e importá el repositorio.
3. Configurá los parámetros de compilación del proyecto:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. En **Environment Variables**, agregá:
   - `VITE_DEMO_MODE` = `true`
   - `VITE_DEMO_WHATSAPP` = `5493517572841` *(opcional, ya toma `5493517572841` por defecto)*
5. Hacé clic en **Deploy**. `frontend/vercel.json` ya incluye las reglas de `rewrites` hacia `/index.html` para que todas las rutas de React Router (`/catalogo`, `/producto/:id`, `/admin`, etc.) funcionen al recargar.

### Cómo regenerar los datos de la Demo (`demo-data.json`)

Si modificás el archivo `catalogo_demo.csv` en la raíz del proyecto, regenerá `frontend/src/api/demo/demo-data.json` ejecutando:

```bash
npm run demo:build-data
```

### Cómo pasar luego de Modo Demo a Modo Producción Real

Cuando el cliente apruebe la tienda y se despliegue el backend real (`Express + Prisma + PostgreSQL`):

1. En las variables de entorno del proyecto en Vercel (**Settings → Environment Variables**):
   - Eliminá `VITE_DEMO_MODE` (o cambiala a `false`).
   - Definí `VITE_API_URL` con la URL pública del backend (por ejemplo, `https://api.nocturnasexshop.com/api`).
   - *(Opcional)* Definí `VITE_META_PIXEL_ID` si se desea activar el Píxel de Meta en navegador.
2. Hacé un **Redeploy** en Vercel. Sin `VITE_DEMO_MODE=true`, `frontend/src/api/client.js` deja de usar el adaptador de demo y se conecta directamente a la API real sin tocar una sola línea de código.

---

## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite 4, TailwindCSS 3, React Router v6, Axios, React Icons |
| **Backend** | Node.js (ESM), Express, Prisma ORM, Zod, Helmet, Express Rate Limit, Multer |
| **Base de Datos** | PostgreSQL (`prisma/schema.prisma`) + `docker-compose.yml` para entorno local |
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

## Correr el Backend Real y Base de Datos en Local (Docker + Prisma)

Si querés probar el backend completo (`Express + Prisma + PostgreSQL`) en tu computadora sin depender de servicios externos:

### 1. Levantar PostgreSQL local con Docker

El repositorio incluye un archivo `docker-compose.yml` en la raíz con PostgreSQL 16:

```bash
docker compose up -d
```

Esto inicia un contenedor `nocturna-postgres` en `localhost:5432` con:
- **Usuario:** `nocturna`
- **Contraseña:** `nocturna_local_dev`
- **Base de datos:** `nocturna_sexshop`

### 2. Configurar variables de entorno del Backend (`backend/.env`)

Copiá `.env.example` a `backend/.env`:

```bash
cp .env.example backend/.env
```

Y configurá `DATABASE_URL` para apuntar al contenedor de Docker:

```env
DATABASE_URL="postgresql://nocturna:nocturna_local_dev@localhost:5432/nocturna_sexshop?schema=public"
JWT_ACCESS_SECRET="secreto_local_desarrollo_access_123456"
JWT_REFRESH_SECRET="secreto_local_desarrollo_refresh_123456"
WHATSAPP_PHONE="5493517572841"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
ADMIN_EMAIL="admin@nocturna.local"
ADMIN_PASSWORD="admin_local_password"
```

### 3. Instalar dependencias, migrar, crear admin e importar el catálogo

```bash
# 1. Instalar dependencias de raíz, backend y frontend
npm run install:all

# 2. Generar cliente Prisma y aplicar migraciones en PostgreSQL
cd backend
npx prisma generate
npx prisma migrate deploy

# 3. Crear usuario administrador inicial (usa ADMIN_EMAIL y ADMIN_PASSWORD de backend/.env)
npm run seed

# 4. Importar el catálogo completo (400 filas de catalogo_nocturna.csv)
npm run import:catalog
cd ..
```

### 4. Iniciar Backend y Frontend en modo real

Asegurate de que `VITE_DEMO_MODE` **no** esté en `true` en `frontend/.env` y abrí dos terminales:

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

---

## Variables de Entorno de Referencia

### `frontend/.env.example`

| Variable | Descripción | Valor por defecto / Ejemplo |
|----------|-------------|-----------------------------|
| `VITE_DEMO_MODE` | Activa el Modo Demo sin backend (`true` / `false`) | `true` (en demo Vercel) / sin definir en modo real |
| `VITE_DEMO_WHATSAPP` | Número de WhatsApp receptor en Modo Demo | `5493517572841` |
| `VITE_API_URL` | URL base del backend real (cuando no está en modo demo) | `/api` o `http://localhost:3001/api` |
| `VITE_META_PIXEL_ID` | ID del Píxel de Meta (ignorado en modo demo) | `""` |

### `.env.example` (para `backend/.env`)

| Variable | Descripción | Ejemplo / Valor |
|----------|-------------|-----------------|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://nocturna:nocturna_local_dev@localhost:5432/nocturna_sexshop?schema=public` |
| `JWT_ACCESS_SECRET` | Secreto JWT de acceso (obligatorio en producción) | `[GENERAR_SECRETO_JWT_ACCESS_SEGURO]` |
| `JWT_REFRESH_SECRET` | Secreto JWT de refresco (obligatorio en producción) | `[GENERAR_SECRETO_JWT_REFRESH_SEGURO]` |
| `JWT_ACCESS_EXPIRATION` | Duración del access token | `15m` |
| `JWT_REFRESH_EXPIRATION` | Duración del refresh token | `7d` |
| `WHATSAPP_PHONE` | Número de WhatsApp receptor de órdenes | `5493517572841` |
| `PORT` | Puerto del servidor backend | `3001` |
| `CORS_ORIGIN` | Origen permitido del frontend | `http://localhost:5173` |
| `ADMIN_EMAIL` | Email del usuario administrador inicial | `[EMAIL_ADMIN]` |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | `[PASSWORD_ADMIN_SEGURO]` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | `[CLOUDINARY_CLOUD_NAME]` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `[CLOUDINARY_API_KEY]` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | `[CLOUDINARY_API_SECRET]` |
| `META_PIXEL_ID` | ID del Píxel de Meta para CAPI (opcional) | `""` |
| `META_CAPI_ACCESS_TOKEN` | Token de API de Conversiones (opcional) | `""` |

---

## Estructura del Proyecto

```text
sexshop/
├── backend/
│   ├── prisma/
│   │   ├── migrations/                    # Migración PostgreSQL (init_nocturna)
│   │   ├── schema.prisma                  # Modelos User, Category, Product, ProductVariant, Order, OrderItem
│   │   ├── seed.js                        # Creación segura del usuario ADMIN desde variables de entorno
│   │   └── catalog-snapshot.json          # Snapshot generado por import-catalog.js
│   ├── scripts/
│   │   └── import-catalog.js              # Importador idempotente de catalogo_nocturna.csv + generador de REVISAR.md
│   └── src/                               # Servidor Express, controladores, servicios, validadores Zod y Meta CAPI
│
├── frontend/
│   ├── public/                            # Logos SVG, favicons, site.webmanifest, robots.txt, sitemap.xml
│   ├── scripts/
│   │   └── build-demo-data.js             # Generador de src/api/demo/demo-data.json desde catalogo_demo.csv
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js                  # Cliente Axios (conecta a demoAdapter si VITE_DEMO_MODE=true)
│   │   │   └── demo/
│   │   │       ├── demoAdapter.js         # Adaptador Axios client-side completo con localStorage (nocturna-demo-state)
│   │   │       └── demo-data.json         # Datos semilla de la demo (30 productos, 6 destacados, 54 variantes)
│   │   ├── components/
│   │   │   ├── layout/DemoBanner.jsx      # Banner fijo de Modo Demo con credenciales Admin y botón Restablecer demo
│   │   │   └── ...                        # Componentes de catálogo, carrito, checkout, admin y UI
│   │   ├── config/theme.js                # Configuración centralizada de marca, navegación, FAQ, contacto y legales
│   │   └── pages/                         # Home, Catálogo, Producto, Carrito, Checkout, Legal, Login y Panel Admin
│   ├── .env.example                       # Variables de entorno de ejemplo del frontend (incluye VITE_DEMO_MODE)
│   └── vercel.json                        # Rewrites SPA para despliegue en Vercel
│
├── catalogo_demo.csv                      # Catálogo reducido de demostración (54 filas / 30 productos)
├── catalogo_nocturna.csv                  # Catálogo completo normalizado (400 filas)
├── docker-compose.yml                     # Contenedor PostgreSQL 16 local para probar el backend real
├── REVISAR.md                             # Reporte de ítems en borrador, sin precio y SKUs normalizados
├── reporte_verificacion_meta.txt          # Documentación de auditoría de privacidad de Meta Pixel y CAPI
├── .env.example                           # Plantilla de variables de entorno del backend
└── README.md
```
