import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const requiredInProd = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'WHATSAPP_PHONE',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

if (isProduction) {
  const missing = requiredInProd.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length > 0) {
    throw new Error(
      `[CONFIG ERROR] Faltan variables de entorno críticas en producción: ${missing.join(', ')}. Configuralas antes de iniciar el servidor.`
    );
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE,
  PORT: process.env.PORT || 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  META_PIXEL_ID: process.env.META_PIXEL_ID || '',
  META_CAPI_ACCESS_TOKEN: process.env.META_CAPI_ACCESS_TOKEN || '',
};
