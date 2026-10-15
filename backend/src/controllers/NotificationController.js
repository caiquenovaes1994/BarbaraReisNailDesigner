const prisma = require('../utils/prisma');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = [];

    // 1. NOTIFICAÇÕES DE RETORNO DE ATENDIMENTO
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          dias_para_retorno: { gt: 0 },
          retorno_dispensado: false,
          status: 'Atendido'
        },
        select: {
          id: true,
          customerId: true,
          procedureId: true,
          data_atendimento: true,
          dias_para_retorno: true,
          customer: {
            select: {
              id: true,
              nome: true
            }
          },
          procedure: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      if (appointments.length > 0) {
        const now = new Date();

        // Filtrar apenas os que estão dentro da janela de 5 dias
        const relevantAppts = appointments.filter(appt => {
          const targetDate = new Date(appt.data_atendimento);
          targetDate.setDate(targetDate.getDate() + appt.dias_para_retorno);
          const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
          return diffDays <= 5;
        });

        if (relevantAppts.length > 0) {
          // Buscar o próximo agendamento de cada cliente relevante em UMA única query (evita N+1)
          const customerIds = [...new Set(relevantAppts.map(a => a.customerId))];
          const minDate = relevantAppts.reduce((min, a) => a.data_atendimento < min ? a.data_atendimento : min, relevantAppts[0].data_atendimento);

          const nextAppointments = await prisma.appointment.findMany({
            where: {
              customerId: { in: customerIds },
              data_atendimento: { gt: minDate }
            },
            select: {
              id: true,
              customerId: true,
              data_atendimento: true
            },
            orderBy: { data_atendimento: 'asc' }
          });

          // Indexar por customerId para lookup O(1)
          const nextApptByCustomer = {};
          for (const appt of nextAppointments) {
            if (!nextApptByCustomer[appt.customerId]) {
              nextApptByCustomer[appt.customerId] = appt;
            }
          }

          for (const appt of relevantAppts) {
            const targetDate = new Date(appt.data_atendimento);
            targetDate.setDate(targetDate.getDate() + appt.dias_para_retorno);
            const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

            // Verificar se já tem agendamento posterior a este atendimento
            const next = nextApptByCustomer[appt.customerId];
            const hasNextAppointment = next && new Date(next.data_atendimento) > new Date(appt.data_atendimento);

            if (!hasNextAppointment) {
              notifications.push({
                type: 'return',
                id: `return-${appt.id}`,
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
        }
      }
    } catch (err) {
      console.error('Error calculating return notifications:', err);
    }

    // 2. NOTIFICAÇÕES DE ANIVERSARIANTES (7 dias antes e no dia do aniversário)
    try {
      const birthdayCustomers = await prisma.customer.findMany({
        where: {
          ativo: true,
          data_nascimento: { not: null }
        },
        select: {
          id: true,
          nome: true,
          ddi: true,
          telefone: true,
          data_nascimento: true
        }
      });

      if (birthdayCustomers.length > 0) {
        // Obter data atual no fuso de Brasília (America/Sao_Paulo)
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
        const [tY, tM, tD] = todayStr.split('-').map(Number);
        const todayDate = new Date(tY, tM - 1, tD);
        const msPerDay = 1000 * 60 * 60 * 24;

        for (const customer of birthdayCustomers) {
          if (!customer.data_nascimento) continue;
          const parts = customer.data_nascimento.split('-').map(Number);
          if (parts.length < 3 || isNaN(parts[1]) || isNaN(parts[2])) continue;
          const [bY, bM, bD] = parts;

          // Próximo aniversário
          let nextBdayYear = tY;
          let nextBday = new Date(tY, bM - 1, bD);
          if (nextBday < todayDate) {
            nextBdayYear = tY + 1;
            nextBday = new Date(nextBdayYear, bM - 1, bD);
          }

          const diffDays = Math.round((nextBday - todayDate) / msPerDay);

          // Janela de 7 dias antes até o dia do aniversário (0 a 7 dias)
          if (diffDays >= 0 && diffDays <= 7) {
            const isToday = diffDays === 0;
            const padDay = String(bD).padStart(2, '0');
            const padMonth = String(bM).padStart(2, '0');
            const formattedBirthDate = `${padDay}/${padMonth}`;

            notifications.push({
              type: 'birthday',
              id: `bday-${isToday ? 'today' : 'advance'}-${customer.id}-${nextBdayYear}`,
              notificationSubtype: isToday ? 'today' : 'advance',
              year: nextBdayYear,
              customerId: customer.id,
              customerName: customer.nome,
              customerDdi: customer.ddi || '55',
              customerPhone: customer.telefone || '',
              birthDate: customer.data_nascimento,
              formattedBirthDate,
              daysLeft: diffDays,
              isToday
            });
          }
        }
      }
    } catch (err) {
      console.error('Error calculating birthday notifications:', err);
    }

    // Ordenar: primeiro o que for para hoje (daysLeft === 0 ou isToday), depois por dias restantes
    notifications.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return a.daysLeft - b.daysLeft;
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações.' });
  }
};

