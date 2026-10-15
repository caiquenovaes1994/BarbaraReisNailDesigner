const cron = require('node-cron');
const { performBackup } = require('../services/backupService');
const logger = require('../utils/logger');

// Inicializa todos os Cron Jobs da aplicação
function initCronJobs() {
  logger.info('[CronJobs] Inicializando rotinas em background...');

  // Backup automático diário às 03:00 da madrugada (Horário de Brasília)
  cron.schedule('0 3 * * *', async () => {
    logger.info('[CronJobs] Executando rotina diária de backup programado...');
    await performBackup();
  }, {
    timezone: process.env.TZ || 'America/Sao_Paulo'
  });
}

module.exports = { initCronJobs };

