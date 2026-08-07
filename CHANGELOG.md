<!-- markdownlint-disable MD024 -->
# Release Notes - Bárbara Reis Nail Designer

## [v1.3.1] - 2026-08-07

### ⚡ Performance e Otimização de Build (Code Splitting)

- **Particionamento Inteligente de Chunks (*Manual Chunks*) no Vite**:
  - Implementação de divisão de pacotes no `vite.config.js` isolando dependências de terceiros por domínio de responsabilidade:
    - `vendor-react`: React, ReactDOM, React Router e Axios.
    - `vendor-pdf`: jsPDF e jsPDF-Autotable.
    - `vendor-charts`: Recharts e helpers D3.
    - `vendor-ui`: Lucide React, React Hot Toast e React Google Autocomplete.
  - Redução drástica do bundle principal da aplicação de ~1.2 MB para apenas **129 kB (27.9 kB gzip)**.
  - Otimização do tempo de carregamento inicial (*First Contentful Paint*), especialmente em dispositivos móveis.
  - Habilitação de cache de longa duração (*Long-Term Caching*) no navegador das clientes.
  - Eliminação completa de avisos de compilação (*chunkSizeWarningLimit*) durante o build e deploy no Render.

### 🎨 Refinamentos de Interface (UI/UX)

- **Padronização de Rótulos em Clientes**:
  - Ajuste no formulário de cadastro e edição de clientes (`Clients.jsx`) padronizando a exibição do campo de endereço.

---

## [v1.3.0] - 2026-08-06

### 🚀 Novidades e Funcionalidades (Features)

- **Novo Relatório de Aniversariantes do Mês (`/reports/aniversariantes`)**:
  - Filtro intuitivo por mês e ano para identificação de aniversariantes com ordenação cronológica por dia.
  - Cruzamento de dados em tempo real com agendamentos do mês selecionado, sinalizando visualmente clientes agendadas (*com data e horário*) vs. clientes sem horário marcado.
  - Botão de envio rápido de WhatsApp com mensagem de felicitações personalizada contendo o primeiro nome da cliente, emojis e quebras de linha adequadas.
  - Exportação em PDF oficial formatado em **Space Mono** com layout tabular e cabeçalho institucional.
  - Integração do card de acesso direto na central de relatórios (`ReportsList.jsx`).

- **Tipografia Space Mono 100% em Todos os Relatórios PDF**:
  - Integração de fontes TrueType oficiais (`SpaceMono-Regular.ttf` e `SpaceMono-Bold.ttf`) via VFS do `jsPDF`.
  - Migração de todos os relatórios (`AppointmentsReport.jsx`, `StatisticsReport.jsx`, `BirthdaysReport.jsx`) para estética monoespaçada, proporcionando alinhamento contábil e tabular de alta precisão.
  - Painel de estatísticas e totais fixado permanentemente no rodapé da página com grade de 4 colunas (Total Faturado, Pendente, Potencial e Registros).
  - Data e hora de emissão padronizadas em 2 linhas independentes alinhadas à direita superior.

- **Acessibilidade e Ergonomia no Menu Contextual de Agendamentos**:
  - Detecção automática de limites da tela (*collision detection*) para evitar que o menu transborde no PC ou Mobile.
  - Suporte completo à navegação por teclado (tecla `Escape` para fechar, setas `ArrowDown` / `ArrowUp` e auto-foco).
  - Fechamento inteligente por clique fora (*click outside*).
  - Suporte a semântica WAI-ARIA (`role="menu"`, `role="menuitem"`, `aria-label`).
  - Ícones visuais de status (`Clock` para Agendado, `CheckCircle2` para Atendido e `XCircle` para Cancelado).

### 🐛 Correções de Bugs (Bug Fixes)

- **Padronização de Fuso Horário de Brasília (Offset -03:00)**:
  - Criação do utilitário nativo `dateUtils.js` com `getStartOfDayBRT`, `getEndOfDayBRT` e `getMonthRangeBRT`.
  - Eliminação definitiva de cortes indevidos de agendamentos noturnos (entre 21h00 e 23h59) que ocorriam nos relatórios e filtros financeiros do `FinanceController.js` e `AppointmentController.js`.
- **Contraste de Ícone em Inputs Nativos**:
  - Ajuste global via CSS (`input[type="time"]::-webkit-calendar-picker-indicator`) para manter o ícone do relógio 100% branco (`#ffffff`) sobre tema escuro na tela de Procedimentos.

### 🔐 Segurança e Banco de Dados (Security & Database)

- **Criptografia Transparente via Prisma Client Extensions (`$extends`)**:
  - Criptografia automática de dados sensíveis (`telefone`, `endereco`) nas operações de escrita (`create`, `update`, `upsert`).
  - Descriptografia computada na leitura (`result.customer.compute`), eliminando a necessidade de chamadas manuais espalhadas nos controllers.
- **Auditoria de Banco de Dados**:
  - Adição dos campos `criado_em` (`@default(now())`) e `atualizado_em` (`@updatedAt`) no modelo `Customer` do Prisma.
  - Padronização do campo `data_nascimento` em formato texto claro (`YYYY-MM-DD`).

---

## [v1.2.0] - 2026-08-05

### 🚀 Novidades e Funcionalidades (Features)

- **Preenchimento Automático de Endereço com Google Places**:
  - Integração com a API do Google Places Autocomplete em todos os fluxos que utilizam endereço no sistema.
  - Sugestões automáticas e completas de logradouro, número, bairro, cidade e CEP em tempo real conforme o usuário digita.
  - Restrição geográfica inteligente para o Brasil (`country: 'br'`) e idioma em português (`pt-BR`).
  - Dropdown com estilização exclusiva em Dark Theme e glassmorphism, totalmente integrada à identidade visual da aplicação.
- **Edição e Gestão de Endereço no Modal de Agendamentos**:
  - Exibição de campo de endereço do cliente selecionado diretamente no modal de agendamento (somente leitura por padrão).
  - Ícone de lápis para habilitar edição rápida do endereço com suporte nativo ao Google Places Autocomplete.
  - Botão de confirmação de edição ("Salvar Endereço") que sincroniza e atualiza imediatamente os dados do cliente no banco de dados.
  - Botão "Ir" integrado para navegação GPS rápida (Google Maps, Waze e Uber).
- **Endereço no Sub-modal de Novo Cliente no Agendamento**:
  - Possibilidade de preencher o endereço com autocomplete ao cadastrar um novo cliente diretamente pelo fluxo de criação de agendamentos.
- **Autocomplete no Módulo de Clientes**:
  - Atualização do formulário de criação e edição da tela de Clientes com o novo componente integrado do Google Places.

### 🔐 Segurança e Performance (Security & Performance)

- **Content Security Policy (CSP) Atualizada**:
  - Atualizadas diretivas de CSP no `index.html` para permitir scripts (`maps.googleapis.com`), conexões, imagens (`maps.gstatic.com`) e fontes (`use.typekit.net`) estritamente autorizadas.
- **Componente Nativo com Carregamento Assíncrono (`loading=async`)**:
  - Criação do componente `GoogleAddressAutocomplete.jsx` com padrão Singleton e carregamento assíncrono do script, compatível com React 19 e Vite sem dependências externas obsoletas.
- **CORS Local**:
  - Inclusão da porta `http://localhost:5173` na lista de origens autorizadas pelo backend.

---

## [v1.1.1] - 2026-07-30

### 🐛 Correções de Bugs (Bug Fixes)

- **Correção de Logout Inesperado**: Resolvido problema em que o sistema deslogava o usuário a cada clique no menu. A configuração do cookie JWT (`SameSite` e `path`) foi ajustada para suportar a comunicação cruzada (cross-site) no ambiente de produção do Render, restabelecendo a comunicação contínua com o banco de dados Supabase.
- **CSP (Content Security Policy)**: Corrigido bloqueio de carregamento de fontes adicionando permissão para data URIs.

## [v1.1.0] - 2026-07-29

### 🚀 Novidades e Funcionalidades (Features)

- **Campo Endereço no Cadastro de Clientes**: Novo campo de endereço completo no formulário de cadastro/edição de clientes.
- **Botão "Ir" para Navegação GPS**: Botão estilizado com ícone de seta ao lado do endereço do cliente:
  - **Desktop**: Abre o Google Maps diretamente no navegador.
  - **Mobile**: Exibe opções de navegação via Uber, Waze e Google Maps, conforme apps instalados no dispositivo.
- **Indicadores de Campos Obrigatórios**: Asterisco vermelho (`*`) com tooltip informativo nos campos Nome e Telefone, sinalizando obrigatoriedade visual.

### 🔐 Segurança (Security)

- **Criptografia de Dados Sensíveis (AES-256-CBC)**: Telefone, data de nascimento e endereço dos clientes agora são criptografados no banco de dados, protegendo informações pessoais em repouso.
- **Remoção de Chave Hardcoded**: Eliminado o fallback inseguro `'chave_padrao_super_secreta_32byte'` do módulo de criptografia; o servidor agora recusa iniciar sem `ENCRYPTION_KEY` ou `JWT_SECRET` definidos.
- **Salt Dinâmico na Derivação de Chave**: Substituído o salt estático `'salt'` por valor configurável via variável de ambiente `ENCRYPTION_SALT`, fortalecendo a derivação da chave AES.
- **Correção de CORS**: Substituída a configuração permissiva `origin: true` (que aceitava qualquer domínio) por whitelist restrita ao domínio de produção e localhost.
- **Content Security Policy (CSP)**: Adicionada CSP personalizada via Helmet no backend e meta tag no frontend, restringindo origens de scripts, estilos, fontes e conexões.
- **Sourcemap Desabilitado**: Configuração explícita `sourcemap: false` no Vite para impedir exposição do código-fonte em produção.
- **Cookie SameSite Reforçado**: Alterada política de `sameSite` dos cookies de `'none'` para `'lax'` em produção, melhorando proteção contra CSRF.
- **Certificado SSL Removido do Git**: Arquivo `prod-ca-2021.crt` removido do versionamento e adicionado ao `.gitignore`.
- **Header Authorization Removido do CORS**: Removido `Authorization` dos `allowedHeaders` do CORS (autenticação é exclusivamente via cookie HTTP-Only).

### 🛠 Alterações Técnicas (Technical Changes)

- **Script de Migração de Criptografia** (`migrate-encryption.js`): Script para re-criptografar dados existentes quando o salt de derivação é alterado.
- **Script de Validação de Segurança** (`validate-security.js`): Script automatizado com 20 verificações que valida todas as configurações de segurança do projeto.
- **Novo `.gitignore` na Raiz**: Criado para ignorar certificados (`*.crt`, `*.pem`, `*.key`).
- **`.env.example` Atualizado**: Documentação de `ENCRYPTION_SALT` e `ENCRYPTION_KEY` com instruções de geração.

---

## [v1.0.0] - 2026-07-20

### 🚀 Novidades e Funcionalidades (Features)

- **Dashboard Interativo**: Tela inicial com uma visão geral rápida do número de clientes previstos para o dia, clientes já atendidos, e listagem rápida com acesso aos agendamentos e notificações de retorno.
- **Agenda Semanal (Grade)**: Nova interface de agendamentos com visão semanal clara, facilitando o encaixe de novos clientes.
- **Bloqueio de Datas Passadas**: Implementada restrição visual e sistêmica que impede a criação de agendamentos em datas retroativas.
- **Gestão de Clientes**: Cadastro completo de clientes com histórico de procedimentos realizados e datas de aniversário.
- **Gestão de Procedimentos**: Cadastro dinâmico de serviços oferecidos com configuração de preço e duração padrão.
- **Painel Financeiro**: Módulo financeiro que exibe o faturamento total diário, semanal, e mensal, além de projeções com base na agenda futura.
- **Relatórios Exportáveis (PDF)**:
  - **Relatório de Atendimentos**: Filtro de agendamentos por período e status, exportável para PDF com layout limpo e profissional (via `html2pdf`).
  - **Relatório Estatístico**: Gráficos e métricas de desempenho de procedimentos mais procurados.
- **Autenticação Segura**: Sistema de login protegido com JWT e Cookies HTTP-Only, garantindo segurança na sessão do usuário contra ataques XSS.
- **Histórico de Versões (Changelog)**: Nova tela dedicada para acompanhar as novidades de cada versão do sistema, acessível pelo botão no cabeçalho ou rodapé do menu.

### 🛠 Alterações Técnicas (Technical Changes)

- **Migração de Banco de Dados**: Substituição do SQLite local por PostgreSQL (Supabase) visando alta disponibilidade e escalabilidade na nuvem.
- **Hospedagem em Nuvem (Deploy)**:
  - Frontend otimizado com Vite hospedado como Static Site.
  - Backend Node.js/Express hospedado como Web Service.
- **Correções de Segurança e CORS**:
  - Ajustes avançados na política de `SameSite` e `Secure` de cookies para comunicação cruzada (Cross-Origin) entre o frontend e backend na nuvem.
  - Resolução de problemas de Mixed Content garantindo tráfego 100% HTTPS.
- **Padronização de Tabelas (PostgreSQL)**: Renomeação e mapeamento (`@@map`) das tabelas do Prisma para padrão snake_case (minúsculas), evitando falhas de concorrência com palavras reservadas.
- **Script de Migração (Data Import)**: Criação de scripts `export_csv.js` para migrar dados retroativos do SQLite para as novas tabelas PostgreSQL.

### 🐛 Correções de Bugs (Fixes)

- Correção no salvamento de datas de atendimento que caíam no erro de *timezone* e horários retroativos.
- Ajuste no redirecionamento do menu "Sair" (Logout), limpando adequadamente os cookies de sessão e redirecionando o usuário para a tela de login.
- Remoção do raw query (`queryRaw`) na rota de login, prevenindo falha de "relation does not exist" após a migração do banco.
