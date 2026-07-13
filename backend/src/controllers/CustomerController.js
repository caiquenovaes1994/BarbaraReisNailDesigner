const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

exports.create = async (req, res) => {
  try {
    const { nome, telefone, ddi, data_nascimento } = req.body;
    const customer = await prisma.customer.create({
      data: { nome, telefone, ddi: ddi || '55', data_nascimento, ativo: true }
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
    const { nome, telefone, ddi, data_nascimento } = req.body;
    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { nome, telefone, ddi: ddi || '55', data_nascimento }
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
