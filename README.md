# Bárbara Reis — Nail Designer

> Sistema de gerenciamento interno para agenda, clientes, procedimentos e financeiro.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## 📋 Visão Geral

Aplicação full-stack desenvolvida sob demanda para gerenciar as operações do estúdio **Bárbara Reis Nail Designer**. O sistema centraliza o controle de agendamentos, histórico de clientes, catálogo de procedimentos e resumo financeiro em uma interface moderna e responsiva.

---

## ✨ Funcionalidades

### 🗓️ Agenda

- Visualização semanal em grade de horários (calendário interativo)
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

### 💅 Procedimentos

- Cadastro com nome, preço e duração (HH:mm)
- Busca e paginação
- Inativação automática quando o procedimento já foi usado em agendamentos
- Toggle para exibir/ocultar procedimentos inativos

### 💰 Financeiro

- Filtro por período (intervalo de datas)
- **Faturamento Efetivo**: soma dos agendamentos com status `Atendido`
- **Faturamento Agendado**: soma dos agendamentos futuros com status `Pendente` ou `Agendado`
- **Faturamento Potencial**: efetivo + agendado
- Gráfico de barras comparativo

### 🔔 Notificações de Retorno

- Alerta automático quando um cliente está próximo da data de retorno recomendada (≤ 5 dias)
- Indicação de urgência com diferença de dias
- Opção de dispensar notificação individualmente
- Clique direto na notificação abre o formulário de agendamento pré-preenchido com o cliente

### 🔐 Autenticação

- Login com usuário e senha (bcrypt + JWT)
- Rate limiting de 20 tentativas por IP a cada 15 minutos
- Token JWT armazenado de forma segura em Cookie HTTP-Only com expiração de 24 horas (mitigação de XSS)
- Verificação de sessão automática via `/api/auth/me` e redirecionamento em caso de token expirado

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
│       ├── schema.prisma     # Modelo de dados (SQLite)
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
| SQLite             | —      | Banco de dados               |
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
User        → autenticação do sistema
Customer    → clientes da nail designer
Procedure   → serviços oferecidos (nome, preço, duração)
Appointment → agendamentos (cliente × procedimento × data × status × valor)
```

**Status de agendamento:** `Pendente` | `Agendado` | `Atendido` | `Cancelado`

**Soft delete:** Clientes e procedimentos com agendamentos vinculados são **inativados** (campo `ativo = false`) em vez de excluídos permanentemente, preservando o histórico.

---

## 🌍 Configuração de Ambiente

O arquivo `backend/.env` deve conter:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="<string-aleatoria-longa-e-segura>"
TZ="America/Sao_Paulo"
FRONTEND_URL="http://localhost:5174"
```

> ⚠️ O arquivo `.env` **nunca deve ser versionado**. Consulte `.env.example` como referência.

---

## 📄 Licença

Este projeto é software proprietário. © 2026 Caique Novaes — Todos os direitos reservados.
Consulte o arquivo [LICENSE](./LICENSE) para os termos completos.

---

## 📬 Contato

[![GitHub](https://img.shields.io/badge/GitHub-caiquenovaes1994-181717?style=flat&logo=github&logoColor=white)](https://github.com/caiquenovaes1994)
[![Gmail](https://img.shields.io/badge/Gmail-caiquenovaes1994%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:caiquenovaes1994@gmail.com)
