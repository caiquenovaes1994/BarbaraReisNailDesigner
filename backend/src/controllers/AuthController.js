const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
  throw new Error('ERRO CRÍTICO: JWT_SECRET não está definido nas variáveis de ambiente. Defina-o no arquivo .env.');
}
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    // Proteção contra DoS via bcrypt com senhas longas
    if (password.length > 128) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    // Usando queryRaw para contornar o cache do Prisma Client (EPERM lock)
    const users = await prisma.$queryRaw`SELECT * FROM User WHERE username = ${username} LIMIT 1`;
    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, nome: user.nome }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    });

    res.json({ username: user.username, nome: user.nome });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};

exports.me = (req, res) => {
  // req.user é populado pelo middleware de autenticação
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.json({
    id: req.user.id,
    username: req.user.username,
    nome: req.user.nome
  });
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout efetuado com sucesso' });
};
