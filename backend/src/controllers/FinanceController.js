const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    
    const dateFilterEfetiva = {};
    const dateFilterPrevista = { gte: now }; // By default, prevista is from now onwards

    if (startDate && endDate) {
      dateFilterEfetiva.gte = new Date(startDate);
      dateFilterEfetiva.lte = new Date(endDate);
      
      dateFilterPrevista.gte = new Date(startDate) > now ? new Date(startDate) : now;
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

    // Receita Prevista: Pendente ou Agendado e data no futuro (e opcionalmente dentro do filtro)
    const previstaResult = await prisma.appointment.aggregate({
      _sum: { valor_cobrado: true },
      where: { 
        status: { in: ['Pendente', 'Agendado'] },
        data_atendimento: dateFilterPrevista
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
