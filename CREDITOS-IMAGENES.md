# Créditos y Licencias de Imágenes — Nocturna SexShop

Este documento registra el origen, autoría y licencia de la fotografía de marca utilizada en el Hero de la tienda online, conforme a las políticas de licenciamiento comercial del proyecto.

---

## 1. Imagen Principal del Hero (`hero.webp` / `hero-mobile.webp`)

| Campo | Detalle |
|-------|---------|
| **Archivo en el repositorio** | `frontend/public/images/brand/hero.webp` (`1800x1000 px`, `56.0 KB`) y `frontend/public/images/brand/hero-mobile.webp` (`900x750 px`, `20.8 KB`) |
| **Título original** | *Photograph of a Woman Posing with Red Led Lights* |
| **Banco de imágenes** | **Pexels** |
| **URL de la página de origen** | https://www.pexels.com/photo/photograph-of-a-woman-posing-with-red-led-lights-10229385/ |
| **URL directa del archivo CDN** | https://images.pexels.com/photos/10229385/pexels-photo-10229385.jpeg |
| **ID de referencia en Pexels** | `10229385` |
| **Tipo de licencia** | **Pexels License** (https://www.pexels.com/license/) — Uso gratuito comercial y no comercial, sin atribución obligatoria y con permiso explícito para modificar/editar la imagen. |
| **Fecha de descarga** | 23 de octubre de 2026 |
| **Tratamiento aplicado** | Encuadre panorámico full-bleed (`1800x1000 px`) y móvil (`900x750 px`) optimizado a WebP mediante `sharp` (`frontend/scripts/build-brand-images.js`), preservando la iluminación roja/ámbar sobre fondo oscuro para que la fotografía abarque todo el ancho del Hero con lectura nítida de los textos a la izquierda. |

---

## 2. Imágenes Generadas por Código (Propias del Proyecto)

- **Open Graph / Redes Sociales (`frontend/public/images/brand/og-image.png` y `frontend/public/og-image.png`):** Generada programáticamente en `1200x630 px` desde SVG a PNG mediante `sharp` con el wordmark de **Nocturna SexShop** y ondas vectoriales en la paleta oficial (`#0F0A0A`, `#2B1917`, `#5A2A2E`, `#907878`).
- **Logos, Favicons e Ilustraciones de Categorías / Estados Vacíos:** Vectores SVG y texturas CSS propias del repositorio (`frontend/public/brand/`, `frontend/src/components/`).
- **Imágenes de Productos:** No se descargan ni utilizan fotografías de productos de terceros ni generadas por IA; todas las fotos de productos se procesan exclusivamente a partir de la carpeta local `images-source/products/` mediante `npm run images:build`.
