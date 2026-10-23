# Créditos y Licencias de Imágenes — Nocturna SexShop

Este documento registra el origen, autoría y licencia de la fotografía de marca utilizada en el Hero de la tienda online, conforme a las políticas de licenciamiento comercial del proyecto.

---

## 1. Imagen Principal del Hero (`hero.webp` / `hero-mobile.webp`)

| Campo | Detalle |
|-------|---------|
| **Archivo en el repositorio** | `frontend/public/images/brand/hero.webp` (`1400x1050 px`, `14.3 KB`) y `frontend/public/images/brand/hero-mobile.webp` (`800x600 px`, `5.1 KB`) |
| **Título original** | *Close-up Photo of a Red Silk Satin Fabric* |
| **Banco de imágenes** | **Pexels** |
| **URL de la página de origen** | https://www.pexels.com/photo/close-up-photo-of-a-red-silk-satin-fabric-4863069/ |
| **URL directa del archivo CDN** | https://images.pexels.com/photos/4863069/pexels-photo-4863069.jpeg |
| **Autora / Fotógrafa** | **Karolina Grabowska** (`Kaboompics` — https://www.pexels.com/@karolina-grabowska/) |
| **Tipo de licencia** | **Pexels License** (https://www.pexels.com/license/) — Uso gratuito comercial y no comercial, sin atribución obligatoria y con permiso explícito para modificar/editar la imagen. |
| **Fecha de descarga** | 23 de octubre de 2026 |
| **Tratamiento aplicado** | Ajuste de tono/luminosidad a paleta bordó oscuro (`#2B1917`, `#5A2A2E`) y viñeteado suave hacia `#0F0A0A` mediante `sharp` (`frontend/scripts/build-brand-images.js`). Fotografía puramente textil (seda/satén), sin personas, rostros, texto ni marcas de agua. |

---

## 2. Imágenes Generadas por Código (Propias del Proyecto)

- **Open Graph / Redes Sociales (`frontend/public/images/brand/og-image.png` y `frontend/public/og-image.png`):** Generada programáticamente en `1200x630 px` desde SVG a PNG mediante `sharp` con el wordmark de **Nocturna SexShop** y ondas vectoriales en la paleta oficial (`#0F0A0A`, `#2B1917`, `#5A2A2E`, `#907878`).
- **Logos, Favicons e Ilustraciones de Categorías / Estados Vacíos:** Vectores SVG y texturas CSS propias del repositorio (`frontend/public/brand/`, `frontend/src/components/`).
- **Imágenes de Productos:** No se descargan ni utilizan fotografías de productos de terceros ni generadas por IA; todas las fotos de productos se procesan exclusivamente a partir de la carpeta local `images-source/products/` mediante `npm run images:build`.
