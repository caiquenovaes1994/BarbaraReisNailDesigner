require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/utils/prisma');

async function main() {
  console.log('Iniciando seed de banco de dados...');

  const username = process.env.SEED_ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin';
  const plainPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const nome = process.env.SEED_ADMIN_NOME || 'Administrador';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      nome,
      password: hashedPassword
    },
    create: {
      username,
      nome,
      password: hashedPassword
    }
  });

  console.log(`[SEED] Usuário '${user.username}' (${user.nome}) provisionado com hash bcrypt seguro.`);
}

main()
  .catch((e) => {
    console.error('[SEED_ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
