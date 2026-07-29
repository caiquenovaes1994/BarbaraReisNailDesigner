/**
 * Script de migração para re-criptografar dados existentes.
 * 
 * Quando o salt de derivação de chave é alterado (de 'salt' hardcoded para um 
 * valor via variável de ambiente), todos os dados criptografados com a chave 
 * antiga precisam ser descriptografados e re-criptografados com a nova chave.
 * 
 * USO:
 *   node backend/src/scripts/migrate-encryption.js
 * 
 * IMPORTANTE: 
 *   - Faça backup do banco de dados ANTES de executar
 *   - Execute apenas UMA VEZ após alterar o salt
 *   - O .env deve conter JWT_SECRET e o novo ENCRYPTION_SALT
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IV_LENGTH = 16;

// ── Chave ANTIGA (com salt hardcoded 'salt') ──────────────────────────────────
const oldSecret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
if (!oldSecret) {
  console.error('❌ ENCRYPTION_KEY ou JWT_SECRET não definido no .env');
  process.exit(1);
}
const OLD_KEY = crypto.scryptSync(oldSecret, 'salt', 32);

// ── Chave NOVA (com salt da variável de ambiente) ─────────────────────────────
const newSalt = process.env.ENCRYPTION_SALT;
if (!newSalt) {
  console.error('❌ ENCRYPTION_SALT não definido no .env');
  process.exit(1);
}
const NEW_KEY = crypto.scryptSync(oldSecret, newSalt, 32);

function decryptWithKey(text, key) {
  if (!text) return text;
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return text;
    const iv = Buffer.from(parts[0], 'hex');
    if (iv.length !== 16) return text;
    const encrypted = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // Não é um texto criptografado ou chave errada
    return text;
  }
}

function encryptWithKey(text, key) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Erro na criptografia:', err);
    return text;
  }
}

async function migrate() {
  console.log('🔐 Iniciando migração de criptografia...');
  console.log('');

  const customers = await prisma.customer.findMany();
  console.log(`📋 ${customers.length} clientes encontrados para migração.`);
  console.log('');

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const customer of customers) {
    try {
      // Descriptografa com a chave antiga
      const telefone = decryptWithKey(customer.telefone, OLD_KEY);
      const data_nascimento = decryptWithKey(customer.data_nascimento, OLD_KEY);
      const endereco = decryptWithKey(customer.endereco, OLD_KEY);

      // Re-criptografa com a chave nova
      const newTelefone = encryptWithKey(telefone, NEW_KEY);
      const newDataNascimento = encryptWithKey(data_nascimento, NEW_KEY);
      const newEndereco = encryptWithKey(endereco, NEW_KEY);

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          telefone: newTelefone,
          data_nascimento: newDataNascimento,
          endereco: newEndereco,
        },
      });

      migrated++;
      console.log(`  ✅ Cliente #${customer.id} (${customer.nome}) — migrado`);
    } catch (err) {
      errors++;
      console.error(`  ❌ Cliente #${customer.id} (${customer.nome}) — ERRO: ${err.message}`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`  ✅ Migrados: ${migrated}`);
  console.log(`  ⏭️  Ignorados: ${skipped}`);
  console.log(`  ❌ Erros: ${errors}`);
  console.log(`  📊 Total: ${customers.length}`);
  console.log('═══════════════════════════════════════════');

  if (errors > 0) {
    console.log('');
    console.log('⚠️  Houve erros na migração. Verifique os registros acima.');
    console.log('   Considere restaurar o backup e tentar novamente.');
  } else {
    console.log('');
    console.log('🎉 Migração concluída com sucesso!');
    console.log('   Os dados agora estão criptografados com o novo salt.');
  }

  await prisma.$disconnect();
}

migrate().catch((err) => {
  console.error('❌ Erro fatal na migração:', err);
  process.exit(1);
});
