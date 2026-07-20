# Bárbara Reis — Nail Designer

> Sistema de gerenciamento interno para agenda, clientes, procedimentos e financeiro.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## 📑 Índice

- [📋 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
  - [🗓️ Agenda](#️-agenda)
  - [👥 Clientes](#-clientes)
  - [📄 Relatórios PDF](#-relatórios-pdf)
  - [💅 Procedimentos](#-procedimentos)
  - [🏠 Início (Dashboard)](#-início-dashboard)
  - [💰 Financeiro](#-financeiro)
  - [🔔 Notificações de Retorno](#-notificações-de-retorno)
  - [📱 Experiência de Usuário e PWA](#-experiência-de-usuário-e-pwa)
  - [🔐 Autenticação](#-autenticação)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [🔒 Segurança](#-segurança)
- [📊 Modelo de Dados](#-modelo-de-dados)
- [📄 Licença](#-licença)
- [📬 Contato](#-contato)

---

## 📋 Visão Geral

Aplicação full-stack desenvolvida sob demanda para gerenciar as operações do estúdio **Bárbara Reis Nail Designer**. O sistema centraliza o controle de agendamentos, histórico de clientes, catálogo de procedimentos e resumo financeiro em uma interface moderna, responsiva e pronta para ser instalada como aplicativo (PWA). Conta com relatórios em PDF, modais customizados e feedback visual rico.

---

## ✨ Funcionalidades

### 🗓️ Agenda

- Visualização semanal em grade de horários (calendário interativo) com destaque visual automático para dias que já passaram
- Criação, edição e exclusão de agendamentos
- Alteração de status via menu de contexto (botão direito): **Pendente → Agendado → Atendido → Cancelado**
- Navegação entre semanas com retorno rápido ao dia atual
- Formulário com busca de cliente por nome (com suporte a acentuação), seleção de procedimento, data/hora, valor e tempo de duração

### 👥 Clientes

- Cadastro completo com nome, telefone internacional (DDI + máscara), data de nascimento
- Busca por nome ou telefone com paginação configurável
- Histórico completo de atendimentos por cliente
- Link direto para WhatsApp a partir do número cadastrado
- Inativação automática de clientes com agendamentos vinculados (soft delete)
- Toggle para exibir/ocultar clientes inativos
- Exclusão via modal customizado integrado com interface de carregamento (spinner)

### 📄 Relatórios PDF

- Geração de relatórios analíticos no próprio navegador via `jsPDF` sem sobrecarregar o servidor
- Relatórios Estatísticos e de Atendimentos detalhados por período
- Design sofisticado incluindo logo SVG e tipografia especial (*Imperial Script*) embutidos
- Cabeçalhos centralizados, tabelas organizadas e totais calculados dinamicamente

### 💅 Procedimentos

- Cadastro com nome, preço e duração (HH:mm)
- Busca e paginação
- Inativação automática quando o procedimento já foi usado em agendamentos
- Toggle para exibir/ocultar procedimentos inativos

### 🏠 Início (Dashboard)

- Visão geral rápida com métricas de clientes diários
- Saudação dinâmica personalizada
- Navegador de datas interativo (`<` `>`) para explorar agendamentos e atendimentos de dias anteriores ou futuros
- Tabelas interativas de Agendamentos Previstos e Atendidos integradas e responsivas à data selecionada
- Acesso completo de edição e alteração de status (via clique e botão direito) nos agendamentos sem sair da tela inicial

### 💰 Financeiro

- Filtro por período (intervalo de datas)
- **Faturamento Efetivo**: soma dos agendamentos com status `Atendido`
- **Faturamento Agendado**: soma dos agendamentos futuros com status `Agendado`
- **Faturamento Potencial**: efetivo + agendado
- Gráfico de barras comparativo

### 🔔 Notificações de Retorno

- Alerta automático quando um cliente está próximo da data de retorno recomendada (≤ 5 dias)
- Indicação de urgência com diferença de dias
- Opção de dispensar notificação individualmente
- Clique direto na notificação abre o formulário de agendamento pré-preenchido com o cliente

### 📱 Experiência de Usuário e PWA

- Layout interativo em `glassmorphism`
- Transição da UI (Sidebar com toggle recolhível para otimizar espaço de tela e animações suaves)
- Substituição de popups nativos por `Toasts` estilizados (`react-hot-toast`)
- Suporte a instalação via tela inicial de dispositivos móveis com Manifest e ícone customizado

### 🔐 Autenticação

- Login com usuário e senha (bcrypt + JWT)
- Rate limiting de 20 tentativas por IP a cada 15 minutos
- Token JWT armazenado de forma segura em Cookie HTTP-Only com expiração de 24 horas (mitigação de XSS)
- Verificação de sessão automática via `/api/auth/me` e redirecionamento em caso de token expirado

### 📖 Histórico de Versões (Changelog)

- Tela dedicada com design amigável para visualizar as novidades, melhorias e correções (Release Notes) de cada versão do sistema.
- Acesso rápido pelo botão de versão no menu lateral e cabeçalho.

---

## 🏗️ Arquitetura

```text
BarbaraReisNailDesigner/
├── backend/                  # API REST — Node.js + Express
│   ├── src/
│   │   ├── controllers/      # Lógica de negócio por entidade
│   │   ├── middleware/       # Autenticação JWT via Cookie
│   │   ├── routes.js         # Definição de rotas
│   │   └── index.js          # Ponto de entrada do servidor
│   └── prisma/
│       ├── schema.prisma     # Modelo de dados (PostgreSQL/Supabase)
│       └── migrations/       # Histórico de migrações
└── frontend/                 # SPA — React + Vite + Tailwind CSS
    └── src/
        ├── components/       # Header, Sidebar
        ├── pages/            # Dashboard, Clients, Procedures, Schedule, Finance, Login
        └── utils/            # Instância axios com withCredentials, lista de países
```

---

## 🛠️ Stack Tecnológica

### Backend

| Tecnologia         | Versão | Uso                          |
| ------------------ | ------ | ---------------------------- |
| Node.js            | ≥ 18   | Runtime                      |
| Express            | ^5     | Framework HTTP               |
| Prisma             | ^5     | ORM / Migrations             |
| PostgreSQL         | —      | Banco de dados (Supabase)    |
| bcryptjs           | ^3     | Hash de senhas               |
| jsonwebtoken       | ^9     | Autenticação JWT             |
| cookie-parser      | ^1     | Leitura de Cookies HTTP-Only |
| helmet             | ^8     | Headers de segurança HTTP    |
| express-rate-limit | ^8     | Proteção contra brute-force  |
| cors               | ^2     | Controle de origem (CORS)    |
| dotenv             | ^17    | Variáveis de ambiente        |

### Frontend

| Tecnologia      | Versão | Uso                              |
| --------------- | ------ | -------------------------------- |
| React           | ^19    | UI Framework                     |
| Vite            | ^8     | Build tool / Dev server          |
| Tailwind CSS    | ^3     | Estilização utilitária           |
| React Router DOM| ^7     | Roteamento SPA                   |
| Axios           | ^1     | Cliente HTTP (withCredentials)   |
| Recharts        | ^3     | Gráficos financeiros             |
| Lucide React    | ^1     | Ícones                           |
| jsPDF           | ^4     | Geração de Relatórios PDF        |
| react-hot-toast | ^2     | Notificações (Toasts) visuais    |

---

## 🚀 Deploy

A aplicação está configurada para deploy em um ambiente distribuído:

- **Banco de Dados**: PostgreSQL hospedado no [Supabase](https://supabase.com/).
- **Backend (API)**: Web Service no [Render](https://render.com/).
- **Frontend (SPA)**: Static Site no [Render](https://render.com/).

### Scripts Úteis

- **Backend**: `npm run build` faz a geração do client do Prisma e sincroniza o banco remoto (`prisma generate && prisma db push`). O comando `npm start` inicia a API.
- **Frontend**: `npm run build` cria os arquivos estáticos na pasta `dist/`.

---

## 🔒 Segurança

- Todas as rotas da API (exceto `/login`) são protegidas por JWT validado via **Cookie HTTP-Only**
- Sem armazenamento de tokens no `localStorage`, mitigando severamente ataques de roubo de sessão via XSS
- Senhas hasheadas com bcrypt (salt rounds padrão)
- Rate limiting de 20 req/15min na rota de autenticação
- CORS restrito à origem do frontend configurada via variável de ambiente
- Headers de segurança HTTP gerenciados pelo Helmet
- Variáveis sensíveis isoladas em `.env` (nunca versionadas)
- Proteção contra DoS via bcrypt: senhas com mais de 128 caracteres são rejeitadas
- Redirecionamento automático ao login em respostas 401/403

---

## 📊 Modelo de Dados

```text
users        → autenticação do sistema
customers    → clientes da nail designer
procedures   → serviços oferecidos (nome, preço, duração)
appointments → agendamentos (cliente × procedimento × data × status × valor)
```

**Padrão de Nomenclatura:** Todas as tabelas internas foram mapeadas para `snake_case` minúsculas (via `@@map` no Prisma) para garantir total compatibilidade com PostgreSQL no Supabase, evitando bugs de capitalização comuns.

**Status de agendamento:** `Agendado` | `Atendido` | `Cancelado`

**Soft delete:** Clientes e procedimentos com agendamentos vinculados são **inativados** (campo `ativo = false`) em vez de excluídos permanentemente, preservando o histórico.

---

## 📄 Licença

Este projeto é software proprietário. © 2026 Caique Novaes — Todos os direitos reservados.
Consulte o arquivo [LICENSE](./LICENSE) para os termos completos.

---

## 📬 Contato

[![GitHub](https://img.shields.io/badge/GitHub-caiquenovaes1994-181717?style=flat&logo=github&logoColor=white)](https://github.com/caiquenovaes1994)
[![Gmail](https://img.shields.io/badge/Gmail-caiquenovaes1994%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:caiquenovaes1994@gmail.com)
