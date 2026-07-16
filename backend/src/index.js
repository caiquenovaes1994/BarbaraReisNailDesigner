// Carregar variáveis de ambiente ANTES de qualquer outra coisa
require('dotenv').config();

// Definir timezone para Horário de Brasília
process.env.TZ = process.env.TZ || 'America/Sao_Paulo';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const backupService = require('./services/backupService');

const app = express();

app.use(helmet());
app.use(cors({
  origin: true, // Reflete o header Origin da requisição para compatibilidade com credenciais
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Limite de 20 requisições por IP a cada 15 minutos
  message: { error: 'Muitas requisições originadas deste IP, por favor tente novamente após 15 minutos' }
});

app.use('/api/login', authLimiter);

// Aplica o middleware de backup para monitorar as alterações de dados
app.use(backupService.backupMiddleware);

app.use('/api', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} (TZ: ${process.env.TZ})`);
});
