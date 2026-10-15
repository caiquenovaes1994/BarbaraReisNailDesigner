require('dotenv').config();
const { performBackup } = require('../services/backupService');

async function run() {
  console.log('--- Executando Backup Manual ---');
  const result = await performBackup();
  if (result.success) {
    console.log(`Sucesso! Arquivo salvo em: ${result.filePath}`);
    process.exit(0);
  } else {
    console.error(`Falha no backup: ${result.error}`);
    process.exit(1);
  }
}

run();
