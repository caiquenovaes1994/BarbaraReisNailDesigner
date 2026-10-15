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
const { initCronJobs } = require('./scripts/cronJobs');
const logger = require('./utils/logger');

const app = express();
// Habilita trust proxy para proxies reversos (Render, Cloudflare)
app.set('trust proxy', 1);

// Headers de segurança com CSP personalizada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://barbarareisnaildesigner.onrender.com',
  'http://localhost:5174',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permite qualquer IP de rede local (192.168.*, 10.*, 172.16-31.*) exclusivamente em ambiente de desenvolvimento
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isLocalNetwork = isDevelopment && (
      origin.startsWith('http://192.168.') || 
      origin.startsWith('http://10.') || 
      origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./)
    );

    if (isLocalNetwork) {
      return callback(null, true);
    }

    // Bloqueia origens não autorizadas de forma limpa (sem disparar exceção 500)
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
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

// Rate limiting global para proteção contra abuso e flooding (300 requisições / 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Limite de requisições excedido. Por favor, tente novamente mais tarde.' }
});

app.use('/api/login', authLimiter);
app.use('/api', apiLimiter);
app.use('/api', routes);



// Handler para rotas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Middleware global de tratamento centralizado de erros (500)
app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.status || err.statusCode || 500;

  logger.error('[GLOBAL_ERROR_HANDLER]', {
    method: req.method,
    url: req.originalUrl,
    status,
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });

  res.status(status).json({
    error: isProduction && status === 500
      ? 'Erro interno do servidor. Por favor, tente novamente mais tarde.'
      : err.message || 'Erro interno do servidor.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3001;

// Inicia as rotinas automáticas de background
initCronJobs();

// Proteção contra falhas fatais no processo
process.on('unhandledRejection', (reason, promise) => {
  logger.error('[PROCESS_UNHANDLED_REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('[PROCESS_UNCAUGHT_EXCEPTION]', err);
});

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} (TZ: ${process.env.TZ})`);
});

