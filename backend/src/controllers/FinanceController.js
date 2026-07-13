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
      dateFilterEfetiva.lte = new Date(endDate);
      
      dateFilterPrevista.gte = new Date(startDate);
      dateFilterPrevista.lte = new Date(endDate);
    }

    // Receita Efetiva: Atendido ou Concluido
    const efetivaResult = await prisma.appointment.aggregate({
      _sum: { valor_cobrado: true },
      where: { 
        status: { in: ['Atendido', 'Concluido'] },
        ...(Object.keys(dateFilterEfetiva).length > 0 && { data_atendimento: dateFilterEfetiva })
      }
    });

    // Receita Prevista: Pendente ou Agendado dentro do período do filtro (independente de ser futuro ou passado)
    const previstaResult = await prisma.appointment.aggregate({
      _sum: { valor_cobrado: true },
      where: { 
        status: { in: ['Pendente', 'Agendado'] },
        ...(Object.keys(dateFilterPrevista).length > 0 && { data_atendimento: dateFilterPrevista })
      }
    });

    res.json({
      receita_efetiva: efetivaResult._sum.valor_cobrado || 0,
      receita_prevista: previstaResult._sum.valor_cobrado || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo financeiro.' });
  }
};
