const crypto = require('crypto');

// Valida que uma chave de criptografia está definida — sem fallbacks inseguros
if (!process.env.ENCRYPTION_KEY && !process.env.JWT_SECRET) {
  throw new Error('ERRO CRÍTICO: ENCRYPTION_KEY ou JWT_SECRET não definido no .env');
}
const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;

// Valida que o salt de derivação está definido — sem valores hardcoded
if (!process.env.ENCRYPTION_SALT) {
  throw new Error('ERRO CRÍTICO: ENCRYPTION_SALT não definido no .env');
}

// Deriva uma chave de 32 bytes (256 bits) para o AES-256-CBC
const ENCRYPTION_KEY = crypto.scryptSync(secret, process.env.ENCRYPTION_SALT, 32);
const IV_LENGTH = 16; // AES blocksize

function encrypt(text) {
  if (!text) return text;
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Erro na criptografia:', err);
    return text;
  }
}

function decrypt(text) {
  if (!text) return text;
  try {
    let textParts = text.split(':');
    // Se não tiver duas partes, não é um texto criptografado por nós, retorna original
    if (textParts.length !== 2) return text;
    
    let iv = Buffer.from(textParts[0], 'hex');
    // Se o IV não tiver 16 bytes, provavelmente não foi criptografado
    if (iv.length !== 16) return text;
    
    let encryptedText = Buffer.from(textParts[1], 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // Se falhar (por exemplo, texto legado que não é criptografado) ou chave errada, retornamos o texto original.
    console.error('Erro na descriptografia:', err);
    return text;
  }
}

module.exports = { encrypt, decrypt };
