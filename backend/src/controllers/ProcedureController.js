const prisma = require('../utils/prisma');

exports.getAll = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { ativo: true };
    const procedures = await prisma.procedure.findMany({
      where: filter,
      select: {
        id: true,
        nome: true,
        preco: true,
        duracao: true,
        ativo: true,
        criado_em: true,
        atualizado_em: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar procedimentos.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nome, preco, duracao } = req.body;
    const procedure = await prisma.procedure.create({
      data: { 
        nome, 
        preco: parseFloat(preco), 
        duracao: parseInt(duracao) || 60,
        ativo: true
      }
    });
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar procedimento.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, duracao } = req.body;
    const procedure = await prisma.procedure.update({
      where: { id: parseInt(id) },
      data: { nome, preco: parseFloat(preco), duracao: parseInt(duracao) || 60 }
    });
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar procedimento.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica agendamentos vinculados
    const appointments = await prisma.appointment.findFirst({
      where: { procedureId: parseInt(id) },
      select: { id: true }
    });

    if (appointments) {
      // Inativação lógica
      const procedure = await prisma.procedure.update({
        where: { id: parseInt(id) },
        data: { ativo: false }
      });
      return res.json({ message: 'Procedimento inativado pois possui agendamentos vinculados.', procedure, softDeleted: true });
    }

    // Exclusão física
    await prisma.procedure.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Procedimento deletado com sucesso.', softDeleted: false });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar procedimento.' });
  }
};
