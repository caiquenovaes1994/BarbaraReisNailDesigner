const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const LOGS_DIR = path.join(__dirname, '../../logs');
const APP_LOG_PATH = path.join(LOGS_DIR, 'app.log');
const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // Tamanho máximo do arquivo

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
  } catch (e) {
    // Ignora erros ao criar diretório
  }
}

function rotateFileIfNeeded(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size >= MAX_LOG_SIZE) {
        const rotated = `${filePath}.1`;
        if (fs.existsSync(rotated)) {
          fs.unlinkSync(rotated);
        }
        fs.renameSync(filePath, rotated);
      }
    }
  } catch (e) {
    // Ignora erros na rotação
  }
}

function writeToFile(filePath, line) {
  try {
    ensureLogDir();
    rotateFileIfNeeded(filePath);
    fs.appendFileSync(filePath, line + '\n', 'utf-8');
  } catch (e) {
    // Ignora erros na gravação
  }
}

// Formata mensagens de log
function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  let metaStr = '';

  if (meta !== undefined && meta !== null) {
    if (meta instanceof Error) {
      metaStr = ` ${JSON.stringify({
        name: meta.name,
        message: meta.message,
        stack: isProduction ? undefined : meta.stack
      })}`;
    } else if (typeof meta === 'object') {
      try {
        metaStr = ` ${JSON.stringify(meta, (key, value) => {
          if (['password', 'token', 'authorization', 'secret', 'key'].includes(key.toLowerCase())) {
            return '[REDACTED]';
          }
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: isProduction ? undefined : value.stack
            };
          }
          return value;
        })}`;
      } catch (e) {
        metaStr = ` [Circular or Non-Serializable Object]`;
      }
    } else {
      metaStr = ` ${String(meta)}`;
    }
  }

  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

const logger = {
  info(message, meta) {
    const formatted = formatMessage('info', message, meta);
    console.log(formatted);
    writeToFile(APP_LOG_PATH, formatted);
  },
  warn(message, meta) {
    const formatted = formatMessage('warn', message, meta);
    console.warn(formatted);
    writeToFile(APP_LOG_PATH, formatted);
  },
  error(message, errorOrMeta) {
    const formatted = formatMessage('error', message, errorOrMeta);
    console.error(formatted);
    writeToFile(APP_LOG_PATH, formatted);
    writeToFile(ERROR_LOG_PATH, formatted);
  },
  debug(message, meta) {
    if (!isProduction) {
      const formatted = formatMessage('debug', message, meta);
      console.log(formatted);
      writeToFile(APP_LOG_PATH, formatted);
    }
  }
};

module.exports = logger;
