const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Valida token JWT via cookie
module.exports = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Anexa dados do usuário na requisição
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};
