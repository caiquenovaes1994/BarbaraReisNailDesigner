const cron = require('node-cron');
const { performBackup } = require('../services/backupService');
const logger = require('../utils/logger');

// Inicializa tarefas agendadas
function initCronJobs() {
  logger.info('[CronJobs] Inicializando rotinas em background...');

  // Agendamento diário de backup
  cron.schedule('0 3 * * *', async () => {
    logger.info('[CronJobs] Executando rotina diária de backup programado...');
    await performBackup();
  }, {
    timezone: process.env.TZ || 'America/Sao_Paulo'
  });
}

module.exports = { initCronJobs };

