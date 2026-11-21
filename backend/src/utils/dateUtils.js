// Utilitários de data em Horário de Brasília

// Início do dia em BRT
function getStartOfDayBRT(dateInput) {
  if (!dateInput) return null;
  const dateStr = typeof dateInput === 'string' 
    ? dateInput.split('T')[0] 
    : dateInput.toISOString().split('T')[0];
  
  return new Date(`${dateStr}T00:00:00.000-03:00`);
}

// Fim do dia em BRT
function getEndOfDayBRT(dateInput) {
  if (!dateInput) return null;
  const dateStr = typeof dateInput === 'string' 
    ? dateInput.split('T')[0] 
    : dateInput.toISOString().split('T')[0];
  
  return new Date(`${dateStr}T23:59:59.999-03:00`);
}

// Intervalo mensal em BRT
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
