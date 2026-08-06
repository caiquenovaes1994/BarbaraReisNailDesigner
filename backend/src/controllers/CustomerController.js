const prisma = require('../utils/prisma');
const { getMonthRangeBRT } = require('../utils/dateUtils');

exports.getAll = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { ativo: true };
    const customers = await prisma.customer.findMany({
      where: filter
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
};

exports.getBirthdaysReport = async (req, res) => {
  try {
    const targetMonth = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const targetYear = parseInt(req.query.year) || new Date().getFullYear();
    const padMonth = String(targetMonth).padStart(2, '0');

    // 1. Buscar todos os clientes ativos com data de nascimento cadastrada
    const allCustomers = await prisma.customer.findMany({
      where: {
        ativo: true,
        data_nascimento: { not: null }
      }
    });

    // 2. Filtrar apenas os aniversariantes do mês selecionado (ignora o ano)
    const birthdayCustomers = allCustomers
      .filter(c => {
        if (!c.data_nascimento) return false;
        const parts = c.data_nascimento.split('-');
        if (parts.length >= 2) {
          // Formato YYYY-MM-DD -> parts[1] é o mês
          return parts[1] === padMonth;
        }
        return false;
      })
      .map(c => {
        const parts = c.data_nascimento.split('-');
        const day = parseInt(parts[2]) || 1;
        return {
          ...c,
          dia_aniversario: day,
          data_formatada: `${String(day).padStart(2, '0')}/${padMonth}`
        };
      });

    // Ordenar pelo dia do aniversário (crescente)
    birthdayCustomers.sort((a, b) => a.dia_aniversario - b.dia_aniversario);

    if (birthdayCustomers.length === 0) {
      return res.json([]);
    }

    // 3. Buscar agendamentos desses clientes no mês e ano selecionados
    const { start, end } = getMonthRangeBRT(targetYear, targetMonth);
    const customerIds = birthdayCustomers.map(c => c.id);

    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: { in: customerIds },
        data_atendimento: {
          gte: start,
          lte: end
        },
        status: { not: 'Cancelado' }
      },
      include: {
        procedure: true
      },
      orderBy: {
        data_atendimento: 'asc'
      }
    });

    // 4. Mapear agendamentos por cliente
    const apptsByCustomer = {};
    for (const appt of appointments) {
      if (!apptsByCustomer[appt.customerId]) {
        apptsByCustomer[appt.customerId] = [];
      }
      apptsByCustomer[appt.customerId].push(appt);
    }

    const reportData = birthdayCustomers.map(c => {
      const clientAppts = apptsByCustomer[c.id] || [];
      const hasAppointment = clientAppts.length > 0;

      return {
        id: c.id,
        nome: c.nome,
        ddi: c.ddi || '55',
        telefone: c.telefone,
        data_nascimento: c.data_nascimento,
        dia_aniversario: c.dia_aniversario,
        mes_aniversario: targetMonth,
        data_formatada: c.data_formatada,
        hasAppointment,
        appointments: clientAppts.map(a => ({
          id: a.id,
          data: a.data_atendimento,
          procedimento: a.procedure?.nome,
          status: a.status,
          duracao: a.duracao,
          valor: a.valor_cobrado
        }))
      };
    });

    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de aniversariantes:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de aniversariantes.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nome, telefone, ddi, data_nascimento, endereco } = req.body;
    const customer = await prisma.customer.create({
      data: { 
        nome, 
        telefone, 
        ddi: ddi || '55', 
        data_nascimento: data_nascimento || null, 
        endereco, 
        ativo: true 
      }
    });
    res.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, ddi, data_nascimento, endereco } = req.body;
    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { 
        nome, 
        telefone, 
        ddi: ddi || '55', 
        data_nascimento: data_nascimento || null, 
        endereco 
      }
    });
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for appointments
    const appointments = await prisma.appointment.findFirst({
      where: { customerId: parseInt(id) }
    });

    if (appointments) {
      // Has appointments, so we inactivate (soft delete)
      const customer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: { ativo: false }
      });
      return res.json({ message: 'Cliente inativado pois possui agendamentos vinculados.', customer, softDeleted: true });
    }

    // No appointments, physically delete
    await prisma.customer.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Cliente deletado com sucesso.', softDeleted: false });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cliente.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await prisma.appointment.findMany({
      where: { customerId: parseInt(id) },
      include: { procedure: true },
      orderBy: { data_atendimento: 'desc' }
    });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico do cliente.' });
  }
};
