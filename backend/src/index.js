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
    // Permite qualquer IP de rede local (192.168.*, 10.*, 172.16-31.*) para facilitar testes no celular
    const isLocalNetwork = origin && (
      origin.startsWith('http://192.168.') || 
      origin.startsWith('http://10.') || 
      origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./)
    );
    
    if (!origin || allowedOrigins.includes(origin) || isLocalNetwork) {
      return callback(null, true);
    }
    callback(new Error('Bloqueado pela política CORS'));
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

app.use('/api/login', authLimiter);

// Aplica o middleware de backup para monitorar as alterações de dados
app.use(backupService.backupMiddleware);

app.use('/api', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} (TZ: ${process.env.TZ})`);
});
