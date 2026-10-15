<!-- markdownlint-disable MD033 MD041 -->

<div align="center">

# 💅 Bárbara Reis — Nail Designer

> Sistema de gestão interna para estúdio de nail design
>
> [Agendamentos](#️-agenda) · [Clientes](#-clientes) · [Procedimentos](#-procedimentos) · [Financeiro](#-financeiro) · [Relatórios](#-relatórios-pdf)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## Sobre o Projeto

Aplicação **full-stack** desenvolvida sob demanda para o estúdio **Bárbara Reis Nail Designer**. Centraliza o controle de agendamentos, histórico de clientes, catálogo de procedimentos e resumo financeiro em uma interface moderna com glassmorphism, totalmente responsiva e instalável como **PWA**.

> **Versão atual:** ![Versão](https://img.shields.io/badge/versão-v1.5.0-d946ef?style=flat&logo=semver&logoColor=white) - Consulte o [Changelog](./CHANGELOG.md) para detalhes.

</div>

---

## Funcionalidades

### 🗓️ Agenda

- Múltiplas visualizações dinâmicas: Dia, Semana, Mês e Lista Contínua com identificadores visuais de volume de atendimentos
- **Agendamento Rápido por Clique no Horário**: Clique direto em blocos horários para abrir formulário pré-preenchido
- **Múltiplos Procedimentos**: Inclusão de múltiplos procedimentos no mesmo atendimento com cálculo automático da soma de preços e tempo (com edição manual preservada)
- Criação, edição e exclusão de agendamentos
- **Endereço Integrado**: Visualização do endereço do cliente no agendamento, edição inline rápida com Google Places e botão "Salvar Endereço"
- **Navegação GPS ("Ir")**: Acesso rápido a rotas via Google Maps (desktop) ou seleção de app (Uber, Waze e Maps no mobile)
- Alteração de status via menu de contexto: **Agendado → Atendido → Cancelado**
- Navegação entre semanas com retorno rápido ao dia atual
- Busca de cliente por nome (com suporte a acentuação)
- **Componentes Customizados**: Calendários (`CustomDatePicker`) e seletores de tempo (`CustomTimePicker`) no design oficial lilás e degradê diagonal preto, com suporte a digitação manual direta e proteção contra overflow

### 👥 Clientes

- Cadastro com telefone internacional (DDI + máscara), data de nascimento e endereço
- **Google Places Autocomplete**: Sugestão inteligente e preenchimento automático de logradouro, número, bairro, cidade e CEP restrito ao Brasil
- Indicadores visuais de campos obrigatórios (asterisco vermelho com tooltip)
- Botão "Ir" para navegação GPS (Google Maps no desktop; Uber, Waze e Maps no mobile)
- Busca por nome ou telefone com paginação configurável
- Histórico completo de atendimentos por cliente
- Link direto para WhatsApp a partir do número cadastrado
- Soft delete com toggle de exibição de clientes inativos

### 🎂 Aniversariantes do Mês

- Relatório com filtro dinâmico por mês e ano
- Cruzamento automático com agenda mensal (clientes atendidas/agendadas vs. sem agendamento)
- Botão de envio rápido para WhatsApp com mensagem personalizada (primeiro nome, quebras de linha e emojis)
- Exportação em PDF tabular oficial

### 💅 Procedimentos

- Cadastro com nome, preço e duração (HH:mm)
- Busca e paginação
- Inativação automática para procedimentos já utilizados em agendamentos
- Toggle para exibir/ocultar procedimentos inativos

### 🏠 Dashboard

- Métricas diárias de clientes previstos e atendidos
- Saudação dinâmica personalizada
- Navegador de datas interativo para explorar dias anteriores ou futuros
- Tabelas de Agendamentos Previstos e Atendidos integradas
- Edição e alteração de status sem sair da tela inicial

### 💰 Financeiro

- Filtro por período (intervalo de datas)
- **Faturamento Efetivo**: soma dos agendamentos com status `Atendido`
- **Faturamento Agendado**: soma dos agendamentos futuros com status `Agendado`
- **Faturamento Potencial**: efetivo + agendado
- Gráfico de barras comparativo (Recharts)

### 📄 Relatórios PDF

- Geração client-side via jsPDF (zero carga no servidor)
- Tipografia oficial **Space Mono** (Regular & Bold) em 100% dos relatórios (Atendimentos, Estatístico e Aniversariantes)
- Painel de estatísticas e faturamento fixado com precisão no rodapé da página
- Data e hora de emissão estruturadas em 2 linhas alinhadas à direita superior

### 🔔 Notificações (Retornos e Aniversariantes)

- **Retorno de Atendimento**: Alerta automático quando uma cliente está ≤ 5 dias da data prevista de retorno, com contagem de dias restantes ou status de atraso
- **Aniversariantes**: Notificação automática com 7 dias de antecedência (aviso prévio para agendamento) e destaque prioritário no dia do aniversário com badge comemorativa
- **Ações Rápidas no Painel**:
  - Envio direto de felicitação ou convite via WhatsApp com mensagem personalizada contendo o primeiro nome da cliente
  - Clique direto para agendar horário com formulário pré-preenchido
  - Opção de dispensar notificação individualmente com persistência em armazenamento local

### 📱 PWA e Experiência de Usuário

- Tela de Login com animações de feedback visual (Lock/Unlock), carrossel de mensagens motivacionais e slideshow com fotos reais dos trabalhos da cliente
- Suporte a cache e modo offline proxy dinâmico para acesso responsivo
- Layout com glassmorphism e animações suaves
- Sidebar recolhível com transições de UI
- Toasts estilizados via `react-hot-toast` (substitui popups nativos)
- Instalável como aplicativo via tela inicial de dispositivos móveis

---

## Arquitetura

```text
BarbaraReisNailDesigner/
├── backend/                    API REST — Node.js · Express · Prisma
│   ├── src/
│   │   ├── controllers/        Lógica de negócio por entidade
│   │   ├── middleware/         Autenticação JWT via Cookie HTTP-Only
│   │   ├── scripts/            Migração de criptografia e validação de segurança
│   │   ├── utils/              Criptografia AES-256-CBC de dados sensíveis
│   │   ├── routes.js           Definição centralizada de rotas
│   │   └── index.js            Entry point do servidor
│   └── prisma/
│       ├── schema.prisma       Modelo de dados (PostgreSQL)
│       └── migrations/         Histórico de migrações
│
└── frontend/                   SPA — React · Vite · Tailwind CSS
    └── src/
        ├── assets/             Logos, fontes e fotografias do slideshow
        ├── components/         Header, Sidebar, Modais
        ├── pages/              Dashboard, Clients, Procedures, Schedule, Finance, Login, Changelog
        └── utils/              Axios (withCredentials), helpers
```

---

## Stack Tecnológica

### Backend

| Tecnologia | Uso |
| --- | --- |
| **Node.js** >= 18 | Runtime JavaScript |
| **Express** 5 | Framework HTTP |
| **Prisma** 7 | ORM e migrações de schema |
| **PostgreSQL** | Banco de dados relacional |
| **bcryptjs** | Hash de senhas |
| **jsonwebtoken** | Autenticação JWT |
| **cookie-parser** | Cookies HTTP-Only |
| **helmet** | Headers de segurança HTTP |
| **express-rate-limit** | Proteção contra brute-force |
| **node-cron** | Tarefas agendadas |

### Frontend

| Tecnologia | Uso |
| --- | --- |
| **React** 19 | UI Framework |
| **Vite** 8 | Build tool e dev server |
| **Tailwind CSS** 3 | Estilização utilitária |
| **React Router** 7 | Roteamento SPA |
| **Axios** | Cliente HTTP com credentials |
| **Recharts** | Gráficos financeiros |
| **Lucide React** | Biblioteca de ícones |
| **jsPDF** | Geração de relatórios PDF |
| **react-hot-toast** | Notificações visuais (toasts) |
| **Google Places API** | Preenchimento automático de endereços |

---

## Infraestrutura de Produção

A aplicação opera em um ambiente distribuído na nuvem:

| Camada | Provedor | Tipo |
| --- | --- | --- |
| **Banco de Dados** | [Supabase](https://supabase.com/) | PostgreSQL gerenciado |
| **Backend (API)** | [Render](https://render.com/) | Web Service |
| **Frontend (SPA)** | [Render](https://render.com/) | Static Site |

---

## Segurança e Confiabilidade

| Medida | Detalhes |
| --- | --- |
| **Autenticação** | JWT armazenado em Cookie HTTP-Only (`sameSite: lax` em dev / `none` em prod, `secure: true`, expiração de 24h) |
| **Proteção XSS** | Sem tokens no `localStorage`/`sessionStorage`; cookies inacessíveis via JavaScript |
| **Criptografia de Dados** | AES-256-CBC com chave derivada via `scrypt` e salt configurável; telefone e endereço criptografados em repouso com aborto fatal em falhas |
| **Hashing de Senhas** | bcrypt com salt rounds padrão (10); limite de 128 caracteres contra DoS; seed utilitário documentado |
| **Rate Limiting** | 20 requisições / 15 min em `/api/login` e limite global de 300 requisições / 15 min em `/api` |
| **Validação de Schemas** | Middleware dedicado (`validator.js`) para validação de integridade de parâmetros numéricos `:id` e payloads de entrada |
| **CORS** | Whitelist estrita ao domínio de produção e localhost; bypass de IP local condicionado a ambiente de desenvolvimento |
| **CSP & Headers HTTP** | Content Security Policy e headers defensivos configurados via Helmet (backend) e meta tags (frontend) |
| **Tratamento Centralizado de Erros** | Middleware global JSON capturando 404/500 com omissão rigorosa de stack traces em produção |
| **Logging e Auditoria** | Logger estruturado com timestamps ISO, sanitização automática de segredos (`[REDACTED]`), console streaming e persistência local (`backend/logs/`) com rotação de 5MB |
| **Backups Automatizados** | Backup lógico do PostgreSQL via Prisma com retenção dos últimos 10 snapshots JSON e cron diário às 03:00 |
| **Otimização de Banco de Dados** | Índices estratégicos criados em `data_atendimento`, `status`, `ativo` e `nome` no PostgreSQL; consultas projetadas via `select` explícito |
| **Sourcemaps** | Desabilitados explicitamente no build de produção (`sourcemap: false`) |
| **Variáveis Sensíveis** | Isoladas em `.env`, blindadas no `.gitignore` em todos os níveis do repositório |

---

## Modelo de Dados

```text
users        →  Autenticação do sistema
customers    →  Clientes do estúdio
procedures   →  Serviços oferecidos (nome, preço, duração)
appointments →  Agendamentos (cliente × procedimento × data × status × valor)
```

- **Nomenclatura:** Tabelas mapeadas para `snake_case` via `@@map` (Prisma), garantindo compatibilidade total com PostgreSQL.
- **Status:** `Agendado` · `Atendido` · `Cancelado`
- **Soft Delete:** Clientes e procedimentos com vínculos são **inativados** (`ativo = false`) em vez de excluídos, preservando integridade referencial e histórico.

---

<div align="center">

## Licença

Este projeto é **software proprietário**. © 2026 Caique Novaes — Todos os direitos reservados.  
Consulte o arquivo [LICENSE](./LICENSE) para os termos completos.

---

## Contato

[![GitHub](https://img.shields.io/badge/GitHub-caiquenovaes1994-181717?style=flat&logo=github&logoColor=white)](https://github.com/caiquenovaes1994)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-caiquenovaes-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/caiquenovaes/)
[![Telegram](https://img.shields.io/badge/Telegram-caiquenovaes1994-26A5E4?style=flat&logo=telegram&logoColor=white)](https://t.me/caiquenovaes1994)
[![Gmail](https://img.shields.io/badge/Gmail-caiquenovaes1994%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:caiquenovaes1994@gmail.com)

---

> *"Transformando a arte de cuidar das unhas em uma experiência única de beleza,<br> sofisticação e autoestima."* ✨💅

</div>
