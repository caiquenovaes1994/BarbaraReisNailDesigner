const prisma = require('../utils/prisma');

exports.getNotifications = async (req, res) => {
  try {
    // Buscar todos os atendimentos com retorno > 0 e não dispensados
    const appointments = await prisma.appointment.findMany({
      where: {
        dias_para_retorno: { gt: 0 },
        retorno_dispensado: false,
        status: 'Atendido'
      },
      include: { customer: true, procedure: true }
    });

    if (appointments.length === 0) {
      return res.json([]);
    }

    const now = new Date();

    // Filtrar apenas os que estão dentro da janela de 5 dias
    const relevantAppts = appointments.filter(appt => {
      const targetDate = new Date(appt.data_atendimento);
      targetDate.setDate(targetDate.getDate() + appt.dias_para_retorno);
      const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 5;
    });

    if (relevantAppts.length === 0) {
      return res.json([]);
    }

    // Buscar o próximo agendamento de cada cliente relevante em UMA única query (evita N+1)
    const customerIds = [...new Set(relevantAppts.map(a => a.customerId))];
    const nextAppointments = await prisma.appointment.findMany({
      where: {
        customerId: { in: customerIds },
        data_atendimento: { gt: relevantAppts.reduce((min, a) => a.data_atendimento < min ? a.data_atendimento : min, relevantAppts[0].data_atendimento) }
      },
      orderBy: { data_atendimento: 'asc' }
    });

    // Indexar por customerId para lookup O(1)
    const nextApptByCustomer = {};
    for (const appt of nextAppointments) {
      // Pega apenas o mais antigo após a data do atendimento original
      if (!nextApptByCustomer[appt.customerId]) {
        nextApptByCustomer[appt.customerId] = appt;
      }
    }

    const notifications = [];

    for (const appt of relevantAppts) {
      const targetDate = new Date(appt.data_atendimento);
      targetDate.setDate(targetDate.getDate() + appt.dias_para_retorno);
      const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

      // Verificar se já tem agendamento posterior a este atendimento
      const next = nextApptByCustomer[appt.customerId];
      const hasNextAppointment = next && new Date(next.data_atendimento) > new Date(appt.data_atendimento);

      if (!hasNextAppointment) {
        notifications.push({
          appointmentId: appt.id,
          customerId: appt.customerId,
          customerName: appt.customer.nome,
          procedureName: appt.procedure.nome,
          originalDate: appt.data_atendimento,
          targetDate: targetDate,
          daysLeft: diffDays
        });
      }
    }

    // Ordenar do mais urgente para o menos urgente
    notifications.sort((a, b) => a.daysLeft - b.daysLeft);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações.' });
  }
};
