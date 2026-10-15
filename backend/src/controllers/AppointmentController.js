const prisma = require('../utils/prisma');
const { getStartOfDayBRT, getEndOfDayBRT } = require('../utils/dateUtils');

exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, customerId, procedureId } = req.query;
    
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.data_atendimento = {
        gte: getStartOfDayBRT(startDate),
        lte: getEndOfDayBRT(endDate)
      };
    }
    
    if (customerId) {
      whereClause.customerId = parseInt(customerId);
    }
    
    if (procedureId) {
      whereClause.procedureId = parseInt(procedureId);
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      select: {
        id: true,
        customerId: true,
        procedureId: true,
        extra_procedure_ids: true,
        data_atendimento: true,
        status: true,
        valor_cobrado: true,
        dias_para_retorno: true,
        duracao: true,
        retorno_dispensado: true,
        criado_em: true,
        atualizado_em: true,
        customer: {
          select: {
            id: true,
            nome: true,
            ddi: true,
            telefone: true,
            endereco: true,
            data_nascimento: true,
            ativo: true
          }
        },
        procedure: {
          select: {
            id: true,
            nome: true,
            preco: true,
            duracao: true,
            ativo: true
          }
        }
      },
      orderBy: { data_atendimento: 'asc' }
    });
    
    const extraIds = [...new Set(
      appointments.flatMap(a => {
        if (!a.extra_procedure_ids) return [];
        if (Array.isArray(a.extra_procedure_ids)) return a.extra_procedure_ids;
        try { return JSON.parse(a.extra_procedure_ids); } catch(e) { return []; }
      }).map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    )];

    let extraProcMap = {};
    if (extraIds.length > 0) {
      const extraProcs = await prisma.procedure.findMany({
        where: { id: { in: extraIds } },
        select: { id: true, nome: true, preco: true, duracao: true, ativo: true }
      });
      extraProcMap = Object.fromEntries(extraProcs.map(p => [p.id, p]));
    }

    const populated = appointments.map(appt => {
      const ids = Array.isArray(appt.extra_procedure_ids)
        ? appt.extra_procedure_ids
        : [];
      return {
        ...appt,
        extra_procedures: ids.map(id => extraProcMap[id]).filter(Boolean)
      };
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { customerId, procedureId, extra_procedure_ids, data_atendimento, status, valor_cobrado, dias_para_retorno, duracao } = req.body;
    
    let diasRetorno = parseInt(dias_para_retorno);
    if (isNaN(diasRetorno)) diasRetorno = 0;

    const sanitizedExtraIds = Array.isArray(extra_procedure_ids)
      ? extra_procedure_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      : [];

    const appointment = await prisma.appointment.create({
      data: {
        customer: { connect: { id: parseInt(customerId) } },
        procedure: { connect: { id: parseInt(procedureId) } },
        extra_procedure_ids: sanitizedExtraIds,
        data_atendimento: new Date(data_atendimento),
        status: status || 'Agendado',
        valor_cobrado: parseFloat(valor_cobrado) || 0,
        dias_para_retorno: diasRetorno,
        duracao: parseInt(duracao) || 60
      }
    });
    res.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, procedureId, extra_procedure_ids, data_atendimento, valor_cobrado, dias_para_retorno, duracao } = req.body;
    
    const sanitizedExtraIds = Array.isArray(extra_procedure_ids)
      ? extra_procedure_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      : [];

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        customer: { connect: { id: parseInt(customerId) } },
        procedure: { connect: { id: parseInt(procedureId) } },
        extra_procedure_ids: sanitizedExtraIds,
        data_atendimento: new Date(data_atendimento),
        valor_cobrado: parseFloat(valor_cobrado) || 0,
        dias_para_retorno: parseInt(dias_para_retorno) || 0,
        duracao: parseInt(duracao) || 60
      }
    });
    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(appointment);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do agendamento.' });
  }
};

exports.dismissNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { retorno_dispensado: true }
    });
    res.json(appointment);
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ error: 'Erro ao ignorar notificação.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Agendamento excluído com sucesso.' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Erro ao excluir agendamento.' });
  }
};
