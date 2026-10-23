/**
 * CONFIGURACIÓN CENTRAL DE MARCA Y TEMA — NOCTURNA SEXSHOP
 * Boutique íntima online en Córdoba, Argentina.
 */

const DISCREET_NOTICE =
  'Envío y empaque 100% discreto, sin logos ni referencias al contenido. [Confirmar la redacción con el cliente.]';

const RETURNS_POLICY_NOTICE =
  'Política de cambios: los productos de uso íntimo e higiene no tienen cambio salvo falla de fábrica. [Confirmar con el cliente.]';

const AGE_DISCLAIMER =
  '+18 · Sitio exclusivo para mayores de 18 años. Prohibida la venta a menores de edad.';

const FAQ_ITEMS = [
  {
    question: '¿Cómo es el empaque de los pedidos?',
    answer:
      'Todos los pedidos se entregan en bolsas o cajas totalmente neutras, cerradas y sin cintas publicitarias, logos ni menciones a Nocturna SexShop. Nadie, ni siquiera quien transporta el paquete, conoce su contenido.',
  },
  {
    question: '¿Cómo funcionan los envíos y retiros en Córdoba?',
    answer:
      'Realizamos envíos discretos en Córdoba, Argentina ([ZONA DE ENTREGA]) y también ofrecemos punto de retiro previa coordinación por WhatsApp en el horario de [HORARIOS]. Al finalizar tu pedido coordinamos el día y la franja horaria que mejor te quede.',
  },
  {
    question: '¿Qué medios de pago aceptan y qué aparece en el comprobante?',
    answer:
      'Aceptamos transferencia bancaria y efectivo al retirar. En las transferencias figura únicamente el titular personal o razón social ([RAZÓN SOCIAL]), nunca el nombre comercial del sexshop.',
  },
  {
    question: '¿Cómo elijo el talle adecuado en lencería y fantasías?',
    answer:
      'Muchas de nuestras prendas en microtul y red son elastizadas (talle único / Free Size, adaptables aproximadamente de S a L), y contamos con líneas específicas en talle XL y Línea Queen. Si tenés dudas con las medidas de un modelo, escribinos por WhatsApp antes de confirmar.',
  },
  {
    question: '¿Cuál es la política de cambios y garantía?',
    answer:
      'Por normas de higiene y cuidado íntimo, los artículos de uso íntimo, cosmética y lencería no admiten cambios ni devoluciones una vez entregados, salvo que presenten una falla de fábrica verificable al momento de recibirlos.',
  },
];

export const themeConfig = {
  brand: {
    name: 'Nocturna',
    subtitle: 'SexShop',
    fullName: 'NOCTURNA SEXSHOP',
    tagline: 'Boutique íntima en Córdoba · Envíos 100% discretos',
    logo: '/brand/logo-horizontal.svg',
    logoVertical: '/brand/logo-vertical.svg',
    profileImage: '/brand/instagram-profile.jpg',
    ogImage: '/images/brand/og-image.png',
    favicon: '/favicon.svg',
    description:
      'Boutique íntima online en Córdoba, Argentina. Lencería, cosmética sensorial, juegos y bienestar íntimo con asesoramiento cercano y envíos 100% discretos.',
    currencySymbol: '$',
    currencyCode: 'ARS',
    unitName: 'artículo',
    unitNamePlural: 'artículos',
  },

  navigation: [
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Lencería', href: '/catalogo?category=lenceria' },
    { label: 'Cosmética', href: '/catalogo?category=cosmetica-intima' },
    { label: 'Juguetes', href: '/catalogo?category=dilatadores-consoladores-y-vibradores' },
    { label: 'Fantasías', href: '/catalogo?category=fantasias' },
    { label: 'Juegos & BDSM', href: '/catalogo?category=bdsm-y-arneses' },
    { label: 'FAQ', href: '/#faq' },
  ],

  benefits: [
    {
      id: 'privacy',
      title: 'Envío 100% discreto',
      description:
        'Empaque cerrado y neutro, sin logos ni referencias al contenido ni al remitente.',
    },
    {
      id: 'payment',
      title: 'Compra segura y privada',
      description:
        'Coordinación directa por transferencia o efectivo, con total reserva en el resumen de pago.',
    },
    {
      id: 'support',
      title: 'Atención por WhatsApp',
      description:
        'Asesoramiento cercano, respetuoso y confidencial sobre talles, materiales y cuidados.',
    },
    {
      id: 'cordoba',
      title: 'Entregas en Córdoba',
      description:
        'Envíos ágiles en Córdoba Capital y alrededores ([ZONA DE ENTREGA]) o retiro coordinado.',
    },
  ],

  featuredCategories: [
    {
      id: 'lenceria',
      slug: 'lenceria',
      title: 'Lencería',
      subtitle: 'Baby dolls, bodys, vestidos y conjuntos',
      description:
        'Encajes, microtul y vinilo diseñados para realzar la silueta con delicadeza y carácter.',
      iconType: 'lingerie',
    },
    {
      id: 'cosmetica-intima',
      slug: 'cosmetica-intima',
      title: 'Cosmética Íntima',
      subtitle: 'Geles, aceites comestibles y velas de masaje',
      description:
        'Fórmulas sensoriales, efectos térmicos y aromas envolventes para el cuidado y el masaje.',
      iconType: 'cosmetics',
    },
    {
      id: 'dilatadores-consoladores-y-vibradores',
      slug: 'dilatadores-consoladores-y-vibradores',
      title: 'Bienestar & Juguetes',
      subtitle: 'Vibradores, consoladores y dilatadores',
      description:
        'Selección curada para explorar en solitario o en pareja con materiales seguros.',
      iconType: 'toys',
    },
    {
      id: 'fantasias',
      slug: 'fantasias',
      title: 'Fantasías',
      subtitle: 'Línea Pasionel, Free Size y Queen',
      description:
        'Conjuntos temáticos y propuestas de rol en talles adaptables y líneas especiales.',
      iconType: 'fantasies',
    },
    {
      id: 'perfumes-y-feromonas',
      slug: 'perfumes-y-feromonas',
      title: 'Perfumes & Feromonas',
      subtitle: 'Fragancias íntimas y body splash',
      description:
        'Notas envolventes y extractos con feromonas pensados para acompañar momentos cercanos.',
      iconType: 'perfumes',
    },
    {
      id: 'bdsm-y-arneses',
      slug: 'bdsm-y-arneses',
      title: 'BDSM & Arneses',
      subtitle: 'Esposas, antifaces, fustas y kits',
      description:
        'Accesorios de sujeción suave, antifaces de satén y kits coordinados para explorar.',
      iconType: 'bdsm',
    },
    {
      id: 'anillos-y-estimuladores',
      slug: 'anillos-y-estimuladores',
      title: 'Anillos & Estimuladores',
      subtitle: 'Anillos con vibración y texturas',
      description:
        'Complementos compactos y silenciosos diseñados para prolongar y potenciar el placer.',
      iconType: 'rings',
    },
    {
      id: 'juegos',
      slug: 'juegos',
      title: 'Juegos para Parejas',
      subtitle: 'Dados, naipes y juegos de mesa',
      description:
        'Dinámicas lúdicas y desafíos pensados para romper la rutina y conectar desde el juego.',
      iconType: 'games',
    },
    {
      id: 'linea-masculina',
      slug: 'linea-masculina',
      title: 'Línea Masculina',
      subtitle: 'Prendas y diseños masculinos',
      description:
        'Cortes anatómicos y telas elastizadas con estilo nocturno y ajuste cómodo.',
      iconType: 'mens',
    },
  ],

  privacyNotice: DISCREET_NOTICE,
  returnPolicyNotice: RETURNS_POLICY_NOTICE,

  faq: FAQ_ITEMS,
  faqs: FAQ_ITEMS,

  contact: {
    city: 'Córdoba, Argentina',
    deliveryZone: '[ZONA DE ENTREGA]',
    phone: '+54 9 3517 57-2841',
    phoneDisplay: '+54 9 3517 57-2841',
    whatsapp: '5493517572841',
    whatsappNumber: '5493517572841',
    whatsappDefaultMessage:
      'Hola Nocturna! Quería hacer una consulta sobre el catálogo.',
    hours: '[HORARIOS]',
    schedule: '[HORARIOS]',
    email: '[EMAIL]',
    instagram: '@nocturna.sexshop.cba',
    instagramUrl: 'https://www.instagram.com/nocturna.sexshop.cba/',
    legalEntity: '[RAZÓN SOCIAL]',
    legalName: '[RAZÓN SOCIAL]',
  },

  legal: {
    copyright: `© ${new Date().getFullYear()} Nocturna SexShop ([RAZÓN SOCIAL]). Todos los derechos reservados.`,
    note: AGE_DISCLAIMER,
    ageDisclaimer: AGE_DISCLAIMER,
    discreetNotice: DISCREET_NOTICE,
    returnsPolicyNotice: RETURNS_POLICY_NOTICE,
  },

  developer: {
    name: 'Scroll Studio',
    url: 'https://thiagopgnqn.github.io/ScrollStudio/',
  },
};

export default themeConfig;
