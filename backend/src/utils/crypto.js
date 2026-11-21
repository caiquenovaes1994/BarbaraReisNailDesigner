const crypto = require('crypto');

// Valida chave de criptografia
if (!process.env.ENCRYPTION_KEY && !process.env.JWT_SECRET) {
  throw new Error('ERRO CRÍTICO: ENCRYPTION_KEY ou JWT_SECRET não definido no .env');
}
const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;

// Valida salt de criptografia
if (!process.env.ENCRYPTION_SALT) {
  throw new Error('ERRO CRÍTICO: ENCRYPTION_SALT não definido no .env');
}

// Deriva chave para AES-256-CBC
const ENCRYPTION_KEY = crypto.scryptSync(secret, process.env.ENCRYPTION_SALT, 32);
const IV_LENGTH = 16; // Tamanho do IV

function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Erro crítico na criptografia de dados sensíveis:', err);
    throw new Error('Falha na criptografia de dados sensíveis. Operação abortada por segurança.');
  }
}

function decrypt(text) {
  if (!text) return text;
  try {
    let textParts = text.split(':');
    // Valida formato do texto criptografado
    if (textParts.length !== 2) return text;
    
    let iv = Buffer.from(textParts[0], 'hex');
    // Valida tamanho do IV
    if (iv.length !== 16) return text;
    
    let encryptedText = Buffer.from(textParts[1], 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // Fallback para texto original em caso de erro
    console.error('Erro na descriptografia:', err);
    return text;
  }
}

module.exports = { encrypt, decrypt };
