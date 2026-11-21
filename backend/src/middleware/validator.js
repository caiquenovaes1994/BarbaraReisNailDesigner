// Validações de entrada da API

// Valida parâmetro ID
exports.validateId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0 || String(id) !== String(req.params.id).trim()) {
    return res.status(400).json({ error: 'Parâmetro ID inválido na rota. Deve ser um número inteiro positivo.' });
  }
  req.params.id = id;
  next();
};

// Valida dados de cliente
exports.validateCustomer = (req, res, next) => {
  const { nome, telefone, ddi, data_nascimento, endereco } = req.body;

  if (req.method === 'POST') {
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      return res.status(400).json({ error: 'Nome do cliente é obrigatório.' });
    }
    if (!telefone || typeof telefone !== 'string' || telefone.trim().length === 0) {
      return res.status(400).json({ error: 'Telefone do cliente é obrigatório.' });
    }
  }

  if (nome !== undefined && (typeof nome !== 'string' || nome.trim().length > 120)) {
    return res.status(400).json({ error: 'Nome deve ser um texto de até 120 caracteres.' });
  }

  if (telefone !== undefined && (typeof telefone !== 'string' || telefone.trim().length > 30)) {
    return res.status(400).json({ error: 'Telefone deve ser um texto de até 30 caracteres.' });
  }

  if (ddi !== undefined && (typeof ddi !== 'string' || ddi.trim().length > 6)) {
    return res.status(400).json({ error: 'DDI inválido.' });
  }

  if (data_nascimento && typeof data_nascimento === 'string') {
    // Valida formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data_nascimento)) {
      return res.status(400).json({ error: 'Data de nascimento deve estar no formato AAAA-MM-DD.' });
    }
  }

  if (endereco !== undefined && endereco !== null && typeof endereco !== 'string') {
    return res.status(400).json({ error: 'Endereço deve ser um texto válido.' });
  }

  next();
};

// Valida dados de procedimento
exports.validateProcedure = (req, res, next) => {
  const { nome, preco, duracao, ativo } = req.body;

  if (req.method === 'POST') {
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      return res.status(400).json({ error: 'Nome do procedimento é obrigatório.' });
    }
    if (preco === undefined || preco === null || isNaN(parseFloat(preco))) {
      return res.status(400).json({ error: 'Preço válido é obrigatório.' });
    }
  }

  if (nome !== undefined && (typeof nome !== 'string' || nome.trim().length > 100)) {
    return res.status(400).json({ error: 'Nome do procedimento deve ter até 100 caracteres.' });
  }

  if (preco !== undefined && (isNaN(parseFloat(preco)) || parseFloat(preco) < 0)) {
    return res.status(400).json({ error: 'Preço deve ser um valor numérico positivo.' });
  }

  if (duracao !== undefined && (isNaN(parseInt(duracao, 10)) || parseInt(duracao, 10) <= 0)) {
    return res.status(400).json({ error: 'Duração deve ser um número inteiro de minutos maior que zero.' });
  }

  if (ativo !== undefined && typeof ativo !== 'boolean') {
    return res.status(400).json({ error: 'Campo ativo deve ser booleano.' });
  }

  next();
};

// Valida dados de agendamento
exports.validateAppointment = (req, res, next) => {
  const { customerId, procedureId, data_atendimento, status, valor_cobrado, dias_para_retorno, duracao } = req.body;

  if (req.method === 'POST') {
    if (!customerId || isNaN(parseInt(customerId, 10))) {
      return res.status(400).json({ error: 'ID do cliente é obrigatório.' });
    }
    if (!procedureId || isNaN(parseInt(procedureId, 10))) {
      return res.status(400).json({ error: 'ID do procedimento é obrigatório.' });
    }
    if (!data_atendimento || isNaN(new Date(data_atendimento).getTime())) {
      return res.status(400).json({ error: 'Data de atendimento válida é obrigatória.' });
    }
  }

  if (data_atendimento !== undefined && isNaN(new Date(data_atendimento).getTime())) {
    return res.status(400).json({ error: 'Data de atendimento inválida.' });
  }

  const validStatuses = ['Agendado', 'Atendido', 'Cancelado'];
  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}.` });
  }

  if (valor_cobrado !== undefined && (isNaN(parseFloat(valor_cobrado)) || parseFloat(valor_cobrado) < 0)) {
    return res.status(400).json({ error: 'Valor cobrado deve ser um número positivo.' });
  }

  if (dias_para_retorno !== undefined && dias_para_retorno !== null && dias_para_retorno !== '' && isNaN(parseInt(dias_para_retorno, 10))) {
    return res.status(400).json({ error: 'Dias para retorno deve ser numérico.' });
  }

  if (duracao !== undefined && duracao !== null && duracao !== '' && (isNaN(parseInt(duracao, 10)) || parseInt(duracao, 10) <= 0)) {
    return res.status(400).json({ error: 'Duração deve ser maior que zero.' });
  }

  next();
};

// Valida status de agendamento
exports.validateAppointmentStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['Agendado', 'Atendido', 'Cancelado'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Deve ser um dos seguintes: ${validStatuses.join(', ')}.` });
  }

  next();
};
