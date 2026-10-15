const fs = require('fs');
const path = require('path');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

const BACKUP_DIR = path.join(__dirname, '../../backups');
const MAX_BACKUPS = 10;

/**
 * Executa o backup lógico completo do banco de dados PostgreSQL.
 * Exporta clientes (com dados sensíveis criptografados preservados),
 * procedimentos, agendamentos e metadados de usuários para um arquivo JSON estruturado.
 */
async function performBackup() {
  const startTime = Date.now();
  logger.info('[Backup] Iniciando backup lógico do banco de dados (PostgreSQL)...');

  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const client = prisma.basePrisma || prisma;

    const [customers, procedures, appointments, users] = await Promise.all([
      client.customer.findMany({ orderBy: { id: 'asc' } }),
      client.procedure.findMany({ orderBy: { id: 'asc' } }),
      client.appointment.findMany({ orderBy: { id: 'asc' } }),
      client.user.findMany({
        select: {
          id: true,
          username: true,
          nome: true,
          criado_em: true,
          atualizado_em: true,
        },
        orderBy: { id: 'asc' },
      }),
    ]);

    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-') + '_' + [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('-');

    const backupPayload = {
      metadata: {
        version: '1.0',
        engine: 'postgresql',
        createdAt: now.toISOString(),
        durationMs: Date.now() - startTime,
        counts: {
          customers: customers.length,
          procedures: procedures.length,
          appointments: appointments.length,
          users: users.length,
        },
      },
      data: {
        customers,
        procedures,
        appointments,
        users,
      },
    };

    const backupFileName = `pg_backup_${timestamp}.json`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');
    logger.info(`[Backup] Backup concluído com sucesso: ${backupFileName}`, backupPayload.metadata.counts);

    // Rotação dos arquivos para manter apenas os últimos MAX_BACKUPS
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('pg_backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        logger.info(`[Backup] Arquivo antigo removido na rotação: ${file.name}`);
      }
    }

    return {
      success: true,
      fileName: backupFileName,
      filePath: backupFilePath,
      metadata: backupPayload.metadata,
    };
  } catch (error) {
    logger.error('[Backup] Erro ao realizar o backup do banco de dados:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  performBackup,
};
