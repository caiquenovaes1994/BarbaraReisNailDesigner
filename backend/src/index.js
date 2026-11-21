// Carrega variáveis de ambiente
require('dotenv').config();

// Define timezone da aplicação
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
// Configura proxy reverso
app.set('trust proxy', 1);

// Configura headers de segurança
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
    // Permite requisições sem origin
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permite rede local em desenvolvimento
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isLocalNetwork = isDevelopment && (
      origin.startsWith('http://192.168.') || 
      origin.startsWith('http://10.') || 
      origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./)
    );

    if (isLocalNetwork) {
      return callback(null, true);
    }

    // Bloqueia origens não autorizadas
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Rate limit para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 min
  max: 20, // Máximo de requisições
  message: { error: 'Muitas requisições originadas deste IP, por favor tente novamente após 15 minutos' }
});

// Rate limit global
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Limite de requisições excedido. Por favor, tente novamente mais tarde.' }
});

app.use('/api/login', authLimiter);
app.use('/api', apiLimiter);
app.use('/api', routes);



// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Tratamento global de erros
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

// Inicia tarefas agendadas
initCronJobs();

// Captura erros não tratados do processo
process.on('unhandledRejection', (reason, promise) => {
  logger.error('[PROCESS_UNHANDLED_REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('[PROCESS_UNCAUGHT_EXCEPTION]', err);
});

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} (TZ: ${process.env.TZ})`);
});

