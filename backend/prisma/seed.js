import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error(
      'Faltan ADMIN_EMAIL o ADMIN_PASSWORD en las variables de entorno. Configuralos antes de ejecutar el seed.'
    );
  }

  const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      email: env.ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      name: 'Admin Nocturna',
      role: 'ADMIN',
    },
  });

  console.log(`Usuario administrador configurado: ${admin.email}`);
  console.log('Para importar el catálogo de productos y categorías ejecutá: npm run import:catalog');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
