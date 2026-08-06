/**
 * dateUtils.js
 * Funções utilitárias nativas e leves para cálculos de fuso horário de Brasília (UTC-3 / America/Sao_Paulo).
 * Garante que filtros de data em servidores UTC (como Render) incluam atendimentos até as 23:59:59.999 BRT.
 */

/**
 * Converte uma string de data 'YYYY-MM-DD' para o início exato do dia em Horário de Brasília (00:00:00.000-03:00)
 * @param {string|Date} dateInput - Ex: '2026-08-14' ou '2026-08-14T10:00:00Z'
 * @returns {Date|null} Objeto Date UTC correspondente ao início do dia em BRT
 */
function getStartOfDayBRT(dateInput) {
  if (!dateInput) return null;
  const dateStr = typeof dateInput === 'string' 
    ? dateInput.split('T')[0] 
    : dateInput.toISOString().split('T')[0];
  
  return new Date(`${dateStr}T00:00:00.000-03:00`);
}

/**
 * Converte uma string de data 'YYYY-MM-DD' para o final exato do dia em Horário de Brasília (23:59:59.999-03:00)
 * @param {string|Date} dateInput - Ex: '2026-08-14' ou '2026-08-14T10:00:00Z'
 * @returns {Date|null} Objeto Date UTC correspondente ao final do dia em BRT
 */
function getEndOfDayBRT(dateInput) {
  if (!dateInput) return null;
  const dateStr = typeof dateInput === 'string' 
    ? dateInput.split('T')[0] 
    : dateInput.toISOString().split('T')[0];
  
  return new Date(`${dateStr}T23:59:59.999-03:00`);
}

/**
 * Retorna o intervalo inicial e final de um mês específico em Horário de Brasília.
 * @param {number} year - Ano com 4 dígitos (Ex: 2026)
 * @param {number} month - Mês de 1 a 12 (Ex: 8 para Agosto)
 * @returns {{ start: Date, end: Date }}
 */
function getMonthRangeBRT(year, month) {
  const pad = (n) => String(n).padStart(2, '0');
  const startStr = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // Último dia do mês
  const endStr = `${year}-${pad(month)}-${pad(lastDay)}`;
  
  return {
    start: getStartOfDayBRT(startStr),
    end: getEndOfDayBRT(endStr)
  };
}

module.exports = {
  getStartOfDayBRT,
  getEndOfDayBRT,
  getMonthRangeBRT
};
