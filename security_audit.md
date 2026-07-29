# 🔒 Relatório de Auditoria de Cibersegurança

**Projeto:** Barbara Reis Nail Designer  
**Data:** 29/07/2026  
**Stack:** Vite + React (frontend) · Express + Prisma (backend)

---

## Sumário Executivo

| # | Ponto Verificado | Severidade | Status |
|---|---|---|---|
| 1 | Variáveis/segredos injetados diretamente no código | 🔴 **CRÍTICO** | Vulnerabilidades encontradas |
| 2 | Variáveis públicas do frontend (NEXT_PUBLIC / VITE_) | 🟢 **OK** | Sem problemas |
| 3 | Proteção de Sourcemap | 🟡 **ATENÇÃO** | Configuração ausente |
| 4 | Cookies HTTP-Only / localStorage / sessionStorage | 🟢 **OK** | Implementação correta |
| 5 | CORS e CSP | 🔴 **CRÍTICO** | CORS permissivo / CSP não personalizada |

---

## 1. Variáveis/Segredos Injetados Diretamente no Código

### 🔴 Constatações — 3 problemas encontrados

#### 1.1 Fallback de chave de criptografia hardcoded

Em [crypto.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/utils/crypto.js#L4):

```javascript
const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'chave_padrao_super_secreta_32byte';
```

> [!CAUTION]
> Se nenhuma das variáveis de ambiente for definida, a aplicação usa uma chave **fixa e previsível** para criptografar dados sensíveis de clientes (telefone, endereço, data de nascimento). Qualquer pessoa com acesso ao código-fonte pode descriptografar todos os dados.

#### 1.2 Salt estático na derivação de chave

Em [crypto.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/utils/crypto.js#L7):

```javascript
const ENCRYPTION_KEY = crypto.scryptSync(secret, 'salt', 32);
```

> [!WARNING]
> O salt `'salt'` é um valor literal hardcoded. Isso enfraquece significativamente a derivação da chave — o salt deveria ser único e armazenado em variável de ambiente.

#### 1.3 Certificado SSL versionado no Git

O arquivo `prod-ca-2021.crt` está **rastreado pelo Git** (confirmado via `git ls-files`). Embora certificados CA públicos não sejam segredos, é uma **má prática** versionar arquivos de infraestrutura SSL no repositório.

### ✅ Pontos positivos

- O `.env` do backend está corretamente no `.gitignore` e **não** está versionado.
- O `JWT_SECRET` é carregado via `process.env` e há validação crítica em [AuthController.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/controllers/AuthController.js#L7-L9) que lança erro se não estiver definido.
- Credenciais de banco de dados estão somente no `.env`.
- Existe um `.env.example` com valores placeholder — boa prática.

### 📋 Boas Práticas a Seguir

```diff
- const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'chave_padrao_super_secreta_32byte';
- const ENCRYPTION_KEY = crypto.scryptSync(secret, 'salt', 32);
+ if (!process.env.ENCRYPTION_KEY && !process.env.JWT_SECRET) {
+   throw new Error('ERRO CRÍTICO: ENCRYPTION_KEY ou JWT_SECRET não definido no .env');
+ }
+ const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
+ const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT;
+ if (!ENCRYPTION_SALT) {
+   throw new Error('ERRO CRÍTICO: ENCRYPTION_SALT não definido no .env');
+ }
+ const ENCRYPTION_KEY = crypto.scryptSync(secret, ENCRYPTION_SALT, 32);
```

- Adicionar `ENCRYPTION_KEY` e `ENCRYPTION_SALT` ao `.env.example` com instruções de geração.
- Remover `prod-ca-2021.crt` do Git com `git rm --cached prod-ca-2021.crt` e adicioná-lo ao `.gitignore`.
- Considerar usar ferramentas como **`dotenv-vault`** ou **`sops`** para gerenciamento seguro de secrets.

---

## 2. Variáveis Públicas do Frontend (NEXT_PUBLIC / VITE_)

### 🟢 Constatações — Sem problemas

O projeto usa **Vite** (não Next.js), portanto variáveis `NEXT_PUBLIC_*` não se aplicam.

Quanto a variáveis `VITE_*`, foi encontrada apenas uma referência em [api.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/frontend/src/utils/api.js#L9):

```javascript
baseURL: import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : `http://${window.location.hostname}:3001/api`,
```

> [!NOTE]
> Esta variável é usada apenas para configurar a URL da API, o que é seguro e esperado. Nenhum segredo, token, ou chave de API está sendo exposto via variáveis públicas do Vite.

### ✅ Pontos positivos

- Nenhum segredo vaza para o client-side via `import.meta.env`.
- O fallback usa `window.location.hostname` dinamicamente — abordagem razoável para dev.

### 📋 Boas Práticas a Seguir

- Para produção, definir `VITE_API_URL` no ambiente de build apontando para o domínio de produção com HTTPS.
- **Nunca** armazenar tokens de API, chaves de serviço ou credenciais em variáveis `VITE_*` — elas ficam embarcadas no bundle JS e são 100% públicas.

---

## 3. Proteção de Sourcemap

### 🟡 Constatações — Configuração explícita ausente

A configuração do Vite em [vite.config.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/frontend/vite.config.js) **não define** a propriedade `build.sourcemap`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174
  }
  // ⚠️ Nenhuma configuração de sourcemap
})
```

**Comportamento padrão do Vite:** sourcemaps estão **desabilitados** no build de produção por padrão. Confirmado pela ausência de arquivos `.map` na pasta `dist/assets/`.

> [!NOTE]
> O build atual no `dist/` **não** contém sourcemaps (apenas `index-DnrCYwJ1.js` e `index-DZl_A9fX.css`, sem `.map`). Portanto, no estado atual, o código fonte **não** está exposto.

### 📋 Boas Práticas a Seguir

Tornar a configuração **explícita** para evitar regressões acidentais:

```diff
 export default defineConfig({
   plugins: [react()],
+  build: {
+    sourcemap: false, // Nunca gerar sourcemaps em produção
+  },
   server: {
     host: true,
     port: 5174
   }
 })
```

- Se precisar de sourcemaps para debugging de produção, use `sourcemap: 'hidden'` — gera os arquivos `.map` mas não inclui a referência `//# sourceMappingURL` no bundle, impedindo que navegadores de terceiros os carreguem.
- **Nunca** faça deploy com `sourcemap: true` — isso expõe toda a estrutura do código fonte, lógica de negócio e comentários internos.

---

## 4. Cookies HTTP-Only / localStorage / sessionStorage

### 🟢 Constatações — Implementação correta

#### Cookies

Todas as operações de cookie em [AuthController.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/controllers/AuthController.js#L37-L42) estão configuradas corretamente:

```javascript
res.cookie('token', token, {
  httpOnly: true,                                          // ✅ Não acessível via JavaScript
  secure: process.env.NODE_ENV === 'production',           // ✅ HTTPS apenas em produção
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // ✅ Proteção CSRF
  maxAge: 24 * 60 * 60 * 1000                             // ✅ Expiração definida
});
```

Essa mesma configuração é replicada consistentemente em:
- Login do admin local (linha 37)
- Login do banco de dados (linha 63)  
- Logout / `clearCookie` (linha 90)

#### localStorage / sessionStorage

**Zero ocorrências** de `localStorage` ou `sessionStorage` em todo o frontend. O token **nunca** é armazenado no client-side — flui exclusivamente via cookies HTTP-Only.

#### Verificação de autenticação

O frontend em [App.jsx](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/frontend/src/App.jsx#L29-L41) verifica a sessão chamando `/auth/me` (que depende do cookie) em vez de ler tokens do storage:

```javascript
const checkSession = async () => {
  try {
    await api.get('/auth/me'); // Cookie enviado automaticamente via withCredentials
    setIsAuthenticated(true);
  } catch (err) {
    setIsAuthenticated(false);
  }
};
```

### ✅ Pontos positivos

- Padrão seguro de autenticação via cookie HTTP-Only.
- `withCredentials: true` configurado no Axios para envio automático.
- Sem tokens em headers `Authorization` no frontend.
- Sem qualquer uso de Web Storage APIs.

### 📋 Boas Práticas a Seguir

> [!IMPORTANT]
> O `sameSite: 'none'` em produção exige `secure: true` (o que já está implementado). Porém, `sameSite: 'none'` é o nível **mais permissivo** e só deve ser usado quando frontend e backend estão em **domínios diferentes**. Se estiverem no mesmo domínio, usar `sameSite: 'strict'` ou `'lax'` em produção também.

- Considerar adicionar flag `Path: '/api'` ao cookie para limitar seu envio apenas às rotas da API.
- Manter o `maxAge` razoável (1 dia está adequado para esta aplicação).

---

## 5. CORS e CSP

### 🔴 Constatações — CORS permissivo demais / CSP genérica

#### CORS

Em [index.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/index.js#L18-L23):

```javascript
app.use(cors({
  origin: true, // ⚠️ REFLETE QUALQUER ORIGIN — PERIGOSO!
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

> [!CAUTION]
> **`origin: true`** reflete o header `Origin` de qualquer requisição de volta como `Access-Control-Allow-Origin`. Combinado com `credentials: true`, isso permite que **qualquer site na internet** faça requisições autenticadas à sua API, usando os cookies do usuário logado. Isso é uma vulnerabilidade de **CSRF via CORS**.
>
> **Exemplo de ataque:** Um site malicioso pode fazer `fetch('https://sua-api.com/api/customers', { credentials: 'include' })` e roubar os dados de clientes usando a sessão do usuário.

A variável `FRONTEND_URL` existe no `.env` mas **não está sendo usada** na configuração do CORS.

#### CSP (Content Security Policy)

O `helmet()` está sendo chamado **sem configuração personalizada**, o que aplica apenas os headers padrão:

```javascript
app.use(helmet()); // Aplica defaults — CSP genérica
```

> [!WARNING]
> O CSP padrão do Helmet é restritivo (`default-src 'self'`), o que é bom para a API backend. Porém, **o frontend é servido pelo Vite/servidor estático separado**, então o CSP do backend não protege a aplicação frontend em produção. Não há CSP configurada para o frontend.

### 📋 Boas Práticas a Seguir

#### Correção do CORS — URGENTE

```diff
 app.use(cors({
-  origin: true,
+  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true,
 }));
```

Para múltiplas origens permitidas:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5174',  // dev
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: mobile, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Bloqueado pela política CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
```

#### Configuração de CSP para o Frontend

Adicionar meta tag de CSP no [index.html](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/frontend/index.html) do frontend:

```html
<meta http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob:;
    connect-src 'self' https://sua-api.com;
  "
>
```

#### Configuração avançada do Helmet

```javascript
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
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
```

---

## Resumo de Ações Prioritárias

| Prioridade | Ação | Arquivo |
|---|---|---|
| 🔴 P0 | Corrigir CORS — substituir `origin: true` por whitelist | [index.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/index.js) |
| 🔴 P0 | Remover fallback hardcoded da chave de criptografia | [crypto.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/utils/crypto.js) |
| 🔴 P0 | Substituir salt estático por salt via variável de ambiente | [crypto.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/utils/crypto.js) |
| 🟡 P1 | Tornar `sourcemap: false` explícito no Vite config | [vite.config.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/frontend/vite.config.js) |
| 🟡 P1 | Configurar CSP personalizada no Helmet e no frontend | [index.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/index.js) / [index.html](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/frontend/index.html) |
| 🟡 P1 | Remover `prod-ca-2021.crt` do Git tracking | Raiz do projeto |
| 🟢 P2 | Avaliar `sameSite` do cookie para produção | [AuthController.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/controllers/AuthController.js) |
| 🟢 P2 | Remover `Authorization` dos `allowedHeaders` do CORS (não é usado) | [index.js](file:///c:/Users/caiqu/.gemini/antigravity/scratch/BarbaraReisNailDesigner/backend/src/index.js) |
