const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { decrypt } = require('../utils/crypto');

exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, customerId, procedureId } = req.query;
    
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.data_atendimento = {
        gte: new Date(startDate),
        lte: new Date(endDate)
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
      include: { customer: true, procedure: true },
      orderBy: { data_atendimento: 'asc' }
    });
    
    const decryptedAppointments = appointments.map(appt => {
      if (appt.customer) {
        if (appt.customer.endereco) appt.customer.endereco = decrypt(appt.customer.endereco);
        if (appt.customer.telefone) appt.customer.telefone = decrypt(appt.customer.telefone);
        if (appt.customer.data_nascimento) appt.customer.data_nascimento = decrypt(appt.customer.data_nascimento);
      }
      return appt;
    });
    
    res.json(decryptedAppointments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { customerId, procedureId, data_atendimento, status, valor_cobrado, dias_para_retorno, duracao } = req.body;
    
    let diasRetorno = parseInt(dias_para_retorno);
    if (isNaN(diasRetorno)) diasRetorno = 0;

    const appointment = await prisma.appointment.create({
      data: {
        customer: { connect: { id: parseInt(customerId) } },
        procedure: { connect: { id: parseInt(procedureId) } },
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
    const { customerId, procedureId, data_atendimento, valor_cobrado, dias_para_retorno, duracao } = req.body;
    
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        customer: { connect: { id: parseInt(customerId) } },
        procedure: { connect: { id: parseInt(procedureId) } },
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
