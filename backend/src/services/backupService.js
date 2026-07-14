const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const DB_PATH = path.join(__dirname, '../../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../../backups');
const MAX_BACKUPS = 10;

function performBackup() {
  console.log('[Backup] Iniciando backup do banco de dados...');

  if (!fs.existsSync(DB_PATH)) {
    console.error('[Backup] Erro: Banco de dados não encontrado em', DB_PATH);
    return;
  }

  // Cria a pasta de backups se não existir
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Formata o timestamp (ex: 2026-07-14_12-00-00)
  const now = new Date();
  const timestamp = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') + '-' +
    String(now.getMinutes()).padStart(2, '0') + '-' +
    String(now.getSeconds()).padStart(2, '0');

  const backupFileName = `dev_${timestamp}.db`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  try {
    // Copia o arquivo do banco de dados
    fs.copyFileSync(DB_PATH, backupFilePath);
    console.log(`[Backup] Backup concluído com sucesso: ${backupFileName}`);

    // Gerencia a quantidade de backups para manter apenas os últimos MAX_BACKUPS
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('dev_') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Ordena do mais recente para o mais antigo

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`[Backup] Arquivo antigo removido: ${file.name}`);
      });
    }

  } catch (error) {
    console.error('[Backup] Erro ao realizar o backup:', error);
  }
}

function initBackupJob() {
  // Dispara diariamente às 12:00 (Brasília)
  // O fuso horário de Brasília está configurado no próprio cron job
  cron.schedule('0 12 * * *', () => {
    performBackup();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });

  console.log('[Backup] Serviço de backup diário configurado para as 12:00 (Horário de Brasília).');
}

module.exports = {
  performBackup,
  initBackupJob
};
