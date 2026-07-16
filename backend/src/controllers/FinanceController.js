const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    
    const dateFilterEfetiva = {};
    const dateFilterPrevista = {};

    if (startDate && endDate) {
      dateFilterEfetiva.gte = new Date(startDate);
      
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      dateFilterEfetiva.lte = endDateObj;
      
      dateFilterPrevista.gte = new Date(startDate);
      dateFilterPrevista.lte = endDateObj;
    }

    // Receita Efetiva: Atendido
    const receitaEfetivaResult = await prisma.appointment.aggregate({
      _sum: { valor_cobrado: true },
      where: {
        status: 'Atendido',
        ...(Object.keys(dateFilterEfetiva).length > 0 && { data_atendimento: dateFilterEfetiva })
      }
    });

    // Receita Prevista: Agendado dentro do período do filtro (independente de ser futuro ou passado)
    const receitaPrevistaResult = await prisma.appointment.aggregate({
      _sum: { valor_cobrado: true },
      where: {
        status: 'Agendado',
        ...(Object.keys(dateFilterPrevista).length > 0 && { data_atendimento: dateFilterPrevista })
      }
    });

    res.json({
      receita_efetiva: receitaEfetivaResult._sum.valor_cobrado || 0,
      receita_prevista: receitaPrevistaResult._sum.valor_cobrado || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo financeiro.' });
  }
};
