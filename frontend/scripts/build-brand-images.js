import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brandDir = path.resolve(__dirname, '../public/images/brand');
const publicDir = path.resolve(__dirname, '../public');
const pexelsSourceUrl =
  'https://images.pexels.com/photos/10229385/pexels-photo-10229385.jpeg?auto=compress&cs=tinysrgb&w=1920';
const localCachedSource =
  'C:/Users/PC/.gemini/antigravity/brain/720e34ca-c04a-4f76-ac9b-eb756fc45ef2/scratch/real-candidates/pexels-10229385.jpg';

async function getHeroSourceBuffer() {
  if (fs.existsSync(localCachedSource)) {
    return fs.readFileSync(localCachedSource);
  }
  const res = await fetch(pexelsSourceUrl);
  if (!res.ok) {
    throw new Error(`No se pudo descargar imagen origen de Pexels: HTTP ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function buildHeroImages() {
  fs.mkdirSync(brandDir, { recursive: true });
  const srcBuffer = await getHeroSourceBuffer();

  const width = 1920;
  const height = 760;

  const heroPath = path.join(brandDir, 'hero.webp');
  const heroMobilePath = path.join(brandDir, 'hero-mobile.webp');

  // Escalar la figura completa (1140x760) para que entre de pies a cabeza en el Hero panorámico
  const subjectBuffer = await sharp(srcBuffer)
    .resize(1140, height, { fit: 'cover', position: 'center' })
    .modulate({
      brightness: 1.08,
      saturation: 1.1,
    })
    .toBuffer();

  // Fundir el borde izquierdo de la foto (x=660..960) con el fondo #0F0A0A del lado izquierdo
  const blendMaskSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="leftBlend" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0F0A0A" stop-opacity="1"/>
          <stop offset="34%" stop-color="#0F0A0A" stop-opacity="1"/>
          <stop offset="52%" stop-color="#0F0A0A" stop-opacity="0"/>
          <stop offset="92%" stop-color="#0F0A0A" stop-opacity="0"/>
          <stop offset="100%" stop-color="#0F0A0A" stop-opacity="0.75"/>
        </linearGradient>
        <linearGradient id="vertBlend" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0F0A0A" stop-opacity="0.45"/>
          <stop offset="15%" stop-color="#0F0A0A" stop-opacity="0"/>
          <stop offset="85%" stop-color="#0F0A0A" stop-opacity="0"/>
          <stop offset="100%" stop-color="#0F0A0A" stop-opacity="0.75"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#leftBlend)"/>
      <rect width="${width}" height="${height}" fill="url(#vertBlend)"/>
    </svg>
  `);

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 15, g: 10, b: 10 },
    },
  })
    .composite([
      { input: subjectBuffer, left: 640, top: 0 },
      { input: blendMaskSvg, left: 0, top: 0 },
    ])
    .webp({ quality: 86, effort: 5 })
    .toFile(heroPath);

  await sharp(srcBuffer)
    .resize(900, 750, { fit: 'cover', position: 'center' })
    .modulate({
      brightness: 1.05,
      saturation: 1.08,
    })
    .webp({ quality: 82, effort: 5 })
    .toFile(heroMobilePath);

  const heroSize = fs.statSync(heroPath).size;
  const mobileSize = fs.statSync(heroMobilePath).size;
  console.log(
    `[brand-images] hero.webp (${(heroSize / 1024).toFixed(1)} KB, ${width}x${height}) y hero-mobile.webp (${(
      mobileSize / 1024
    ).toFixed(1)} KB, 900x750) generados.`
  );
}

async function buildOgImage() {
  fs.mkdirSync(brandDir, { recursive: true });
  const ogSvg = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow1" cx="72%" cy="42%" r="55%">
          <stop offset="0%" stop-color="#5A2A2E" stop-opacity="0.52"/>
          <stop offset="48%" stop-color="#2B1917" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#0F0A0A" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glow2" cx="25%" cy="68%" r="50%">
          <stop offset="0%" stop-color="#2B1917" stop-opacity="0.65"/>
          <stop offset="65%" stop-color="#1A1212" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#0F0A0A" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="silkWave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#907878" stop-opacity="0.08"/>
          <stop offset="50%" stop-color="#5A2A2E" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#2B1917" stop-opacity="0.06"/>
        </linearGradient>
      </defs>

      <!-- Fondo principal -->
      <rect width="1200" height="630" fill="#0F0A0A"/>
      <rect width="1200" height="630" fill="url(#glow1)"/>
      <rect width="1200" height="630" fill="url(#glow2)"/>

      <!-- Ondas abstractas tipo seda bordó -->
      <path d="M-100,480 C260,310 540,610 920,370 C1080,270 1190,320 1300,240 L1300,680 L-100,680 Z" fill="url(#silkWave)"/>
      <path d="M-80,140 C300,290 680,40 1050,230 C1150,280 1220,240 1280,190 L1280,-40 L-80,-40 Z" fill="url(#silkWave)" opacity="0.7"/>

      <!-- Marco arquitectónico sutil -->
      <rect x="44" y="44" width="1112" height="542" rx="6" fill="none" stroke="#907878" stroke-opacity="0.24" stroke-width="1"/>
      <line x1="480" y1="450" x2="720" y2="450" stroke="#907878" stroke-opacity="0.35" stroke-width="1"/>

      <!-- Etiqueta superior -->
      <text
        x="600"
        y="195"
        text-anchor="middle"
        fill="#907878"
        font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-size="14"
        font-weight="400"
        letter-spacing="8"
      >CÓRDOBA, ARGENTINA  •  BOUTIQUE ÍNTIMA</text>

      <!-- Wordmark NOCTURNA -->
      <text
        x="600"
        y="310"
        text-anchor="middle"
        fill="#F2EDE8"
        font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-size="86"
        font-weight="300"
        letter-spacing="18"
      >Nocturna</text>

      <!-- Subtítulo SexShop -->
      <text
        x="600"
        y="366"
        text-anchor="middle"
        fill="#B8ABA6"
        font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-size="26"
        font-weight="300"
        letter-spacing="10"
      >SexShop</text>

      <!-- Propuesta de valor inferior -->
      <text
        x="600"
        y="495"
        text-anchor="middle"
        fill="#B8ABA6"
        font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-size="15"
        font-weight="400"
        letter-spacing="4"
      >BIENESTAR ÍNTIMO  •  LENCERÍA  •  COSMÉTICA SENSORIAL  •  ENVÍOS 100% DISCRETOS</text>
    </svg>
  `);

  const ogBrandPath = path.join(brandDir, 'og-image.png');
  const ogRootPath = path.join(publicDir, 'og-image.png');

  await sharp(ogSvg).png({ compressionLevel: 9 }).toFile(ogBrandPath);
  await sharp(ogSvg).png({ compressionLevel: 9 }).toFile(ogRootPath);

  const ogSize = fs.statSync(ogBrandPath).size;
  console.log(
    `[brand-images] og-image.png (${(ogSize / 1024).toFixed(1)} KB, 1200x630) generado en /images/brand/og-image.png y /og-image.png.`
  );
}

export async function buildBrandImages() {
  await buildHeroImages();
  await buildOgImage();
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  buildBrandImages().catch((err) => {
    console.error('[brand-images] Error:', err);
    process.exit(1);
  });
}
