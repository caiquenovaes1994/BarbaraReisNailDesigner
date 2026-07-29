/**
 * Script de validação automatizada das correções de cibersegurança.
 * 
 * Verifica se todas as correções do relatório de auditoria foram aplicadas.
 * 
 * USO: node backend/src/scripts/validate-security.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../../..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    if (detail) console.log(`     → ${detail}`);
    failed++;
  }
}

console.log('');
console.log('🔒 Validação de Cibersegurança — Barbara Reis Nail Designer');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// ── 1. Variáveis hardcoded ─────────────────────────────────────────────────
console.log('1️⃣  Variáveis/Segredos Hardcoded');
console.log('───────────────────────────────────────');

const cryptoFile = fs.readFileSync(path.join(BACKEND, 'src/utils/crypto.js'), 'utf-8');

check(
  'Sem fallback de chave hardcoded',
  !cryptoFile.includes('chave_padrao_super_secreta_32byte'),
  'Ainda há fallback hardcoded em crypto.js'
);

check(
  'Sem salt estático hardcoded',
  !cryptoFile.includes("scryptSync(secret, 'salt'"),
  'Salt "salt" ainda é usado literalmente em crypto.js'
);

check(
  'Validação fatal de ENCRYPTION_KEY/JWT_SECRET',
  cryptoFile.includes('throw new Error') && cryptoFile.includes('ENCRYPTION_KEY'),
  'crypto.js deve lançar erro se chave não estiver definida'
);

check(
  'Validação fatal de ENCRYPTION_SALT',
  cryptoFile.includes('ENCRYPTION_SALT') && cryptoFile.includes('throw new Error'),
  'crypto.js deve lançar erro se salt não estiver definido'
);

// Verifica .env tem ENCRYPTION_SALT
const envFile = fs.readFileSync(path.join(BACKEND, '.env'), 'utf-8');
check(
  'ENCRYPTION_SALT definido no .env',
  envFile.includes('ENCRYPTION_SALT=') && !envFile.includes('ENCRYPTION_SALT=""'),
  '.env deve ter ENCRYPTION_SALT com um valor'
);

// Verifica .env.example tem ENCRYPTION_SALT
const envExample = fs.readFileSync(path.join(BACKEND, '.env.example'), 'utf-8');
check(
  'ENCRYPTION_SALT documentado no .env.example',
  envExample.includes('ENCRYPTION_SALT'),
  '.env.example deve documentar ENCRYPTION_SALT'
);

// Verifica certificado não está no Git
try {
  const trackedCerts = execSync('git ls-files -- "*.crt" "*.pem" "*.key"', { cwd: ROOT }).toString().trim();
  check(
    'Nenhum certificado/chave rastreado pelo Git',
    trackedCerts.length === 0,
    `Arquivos ainda rastreados: ${trackedCerts}`
  );
} catch {
  check('Nenhum certificado/chave rastreado pelo Git', false, 'Erro ao executar git ls-files');
}

console.log('');

// ── 2. Variáveis públicas VITE_ ────────────────────────────────────────────
console.log('2️⃣  Variáveis Públicas do Frontend (VITE_)');
console.log('───────────────────────────────────────');

const apiFile = fs.readFileSync(path.join(FRONTEND, 'src/utils/api.js'), 'utf-8');
const viteVars = apiFile.match(/import\.meta\.env\.VITE_\w+/g) || [];

check(
  'Apenas VITE_API_URL exposta (URL, não segredo)',
  viteVars.every(v => v.includes('VITE_API_URL')),
  `Variáveis VITE_ encontradas: ${viteVars.join(', ')}`
);

console.log('');

// ── 3. Sourcemap ────────────────────────────────────────────────────────────
console.log('3️⃣  Proteção de Sourcemap');
console.log('───────────────────────────────────────');

const viteConfig = fs.readFileSync(path.join(FRONTEND, 'vite.config.js'), 'utf-8');
check(
  'sourcemap: false explícito no vite.config.js',
  viteConfig.includes('sourcemap: false') || viteConfig.includes('sourcemap:false'),
  'vite.config.js deve ter sourcemap: false explícito'
);

// Verifica ausência de .map no dist
const distAssets = path.join(FRONTEND, 'dist/assets');
if (fs.existsSync(distAssets)) {
  const mapFiles = fs.readdirSync(distAssets).filter(f => f.endsWith('.map'));
  check(
    'Nenhum .map no dist/assets/',
    mapFiles.length === 0,
    `Sourcemaps encontrados: ${mapFiles.join(', ')}`
  );
} else {
  check('Nenhum .map no dist/assets/', true); // dist não existe, OK
}

console.log('');

// ── 4. Cookies / Storage ────────────────────────────────────────────────────
console.log('4️⃣  Cookies HTTP-Only / localStorage / sessionStorage');
console.log('───────────────────────────────────────');

const authController = fs.readFileSync(path.join(BACKEND, 'src/controllers/AuthController.js'), 'utf-8');

check(
  'Cookies são httpOnly: true',
  authController.includes('httpOnly: true'),
  'AuthController deve definir httpOnly: true'
);

check(
  'Cookies são secure em produção',
  authController.includes("secure: process.env.NODE_ENV === 'production'"),
  'AuthController deve definir secure condicional'
);

check(
  'sameSite não é "none" em produção',
  !authController.includes("? 'none'"),
  'sameSite deve ser "lax" ou "strict" em produção, não "none"'
);

// Verifica localStorage/sessionStorage no frontend src
try {
  const grepResult = execSync(
    'git grep -r -l "localStorage\\|sessionStorage" -- "frontend/src/"',
    { cwd: ROOT, encoding: 'utf-8' }
  ).trim();
  check(
    'Zero uso de localStorage/sessionStorage no frontend',
    grepResult.length === 0,
    `Arquivos com storage: ${grepResult}`
  );
} catch {
  // git grep retorna exit code 1 quando não encontra nada — isso é o resultado positivo
  check('Zero uso de localStorage/sessionStorage no frontend', true);
}

console.log('');

// ── 5. CORS e CSP ───────────────────────────────────────────────────────────
console.log('5️⃣  CORS e CSP');
console.log('───────────────────────────────────────');

const indexJs = fs.readFileSync(path.join(BACKEND, 'src/index.js'), 'utf-8');

check(
  'CORS não usa origin: true',
  !indexJs.includes('origin: true'),
  'index.js ainda tem origin: true (aceita qualquer domínio)'
);

check(
  'CORS usa whitelist de origens',
  indexJs.includes('allowedOrigins'),
  'index.js deve usar uma lista de origens permitidas'
);

check(
  'Domínio de produção na whitelist',
  indexJs.includes('barbarareisnaildesigner.onrender.com'),
  'Whitelist deve incluir o domínio de produção'
);

check(
  'Helmet está configurado com CSP personalizada',
  indexJs.includes('helmet(') && indexJs.includes('contentSecurityPolicy'),
  'index.js deve usar helmet com contentSecurityPolicy customizado'
);

check(
  'Authorization removido dos allowedHeaders',
  !indexJs.includes("'Authorization'") && !indexJs.includes('"Authorization"'),
  'allowedHeaders não deve conter Authorization (auth é via cookie)'
);

// Verifica CSP no frontend
const frontendHtml = fs.readFileSync(path.join(FRONTEND, 'index.html'), 'utf-8');
check(
  'CSP meta tag presente no index.html do frontend',
  frontendHtml.includes('Content-Security-Policy'),
  'index.html do frontend deve ter meta tag de CSP'
);

console.log('');

// ── Resumo ──────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  ✅ Passed: ${passed}/${passed + failed}`);
console.log(`  ❌ Failed: ${failed}/${passed + failed}`);
console.log('═══════════════════════════════════════════════════════════════');

if (failed > 0) {
  console.log('');
  console.log('⚠️  Algumas verificações falharam. Revise os itens acima.');
  process.exit(1);
} else {
  console.log('');
  console.log('🎉 Todas as verificações de segurança passaram!');
  process.exit(0);
}
