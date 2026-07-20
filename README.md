# 💅 Bárbara Reis — Nail Designer

> Sistema de gestão interna para estúdio de nail design
>
> Agendamentos · Clientes · Procedimentos · Financeiro · Relatórios

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## Sobre o Projeto

Aplicação **full-stack** desenvolvida sob demanda para o estúdio **Bárbara Reis Nail Designer**. Centraliza o controle de agendamentos, histórico de clientes, catálogo de procedimentos e resumo financeiro em uma interface moderna com glassmorphism, totalmente responsiva e instalável como **PWA**.

> **Versão atual:** `v1.0.0` — Consulte o [Changelog](./CHANGELOG.md) para detalhes.

---

## Funcionalidades

### 🗓️ Agenda

- Grade semanal interativa com destaque para dias passados
- Criação, edição e exclusão de agendamentos
- Alteração de status via menu de contexto: **Agendado → Atendido → Cancelado**
- Navegação entre semanas com retorno rápido ao dia atual
- Busca de cliente por nome (com suporte a acentuação)

### 👥 Clientes

- Cadastro com telefone internacional (DDI + máscara) e data de nascimento
- Busca por nome ou telefone com paginação configurável
- Histórico completo de atendimentos por cliente
- Link direto para WhatsApp a partir do número cadastrado
- Soft delete com toggle de exibição de clientes inativos

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
- Relatórios Estatísticos e de Atendimentos detalhados por período
- Design sofisticado com logo SVG e tipografia *Imperial Script* embutidos

### 🔔 Notificações de Retorno

- Alerta automático quando um cliente está ≤ 5 dias da data de retorno
- Indicação de urgência com diferença de dias
- Opção de dispensar notificação individualmente
- Clique direto abre formulário de agendamento pré-preenchido

### 📱 PWA e Experiência de Usuário

- Layout com glassmorphism e animações suaves
- Sidebar recolhível com transições de UI
- Toasts estilizados via `react-hot-toast` (substitui popups nativos)
- Instalável como aplicativo via tela inicial de dispositivos móveis

### 📖 Changelog

- Tela dedicada com design amigável para visualizar release notes de cada versão
- Acesso rápido pelo botão de versão no menu lateral e cabeçalho

---

## Arquitetura

```text
BarbaraReisNailDesigner/
├── backend/                    API REST — Node.js · Express · Prisma
│   ├── src/
│   │   ├── controllers/        Lógica de negócio por entidade
│   │   ├── middleware/         Autenticação JWT via Cookie HTTP-Only
│   │   ├── routes.js           Definição centralizada de rotas
│   │   └── index.js            Entry point do servidor
│   └── prisma/
│       ├── schema.prisma       Modelo de dados (PostgreSQL)
│       └── migrations/         Histórico de migrações
│
└── frontend/                   SPA — React · Vite · Tailwind CSS
    └── src/
        ├── components/         Header, Sidebar, Modais
        ├── pages/              Dashboard, Clients, Procedures, Schedule, Finance, Login, Changelog
        └── utils/              Axios (withCredentials), helpers
```

---

## Stack Tecnológica

### Backend

| Tecnologia | Uso |
| --- | --- |
| **Node.js** ≥ 18 | Runtime JavaScript |
| **Express** 5 | Framework HTTP |
| **Prisma** 5 | ORM e migrações de schema |
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

---

## Infraestrutura de Produção

A aplicação opera em um ambiente distribuído na nuvem:

| Camada | Provedor | Tipo |
| --- | --- | --- |
| **Banco de Dados** | [Supabase](https://supabase.com/) | PostgreSQL gerenciado |
| **Backend (API)** | [Render](https://render.com/) | Web Service |
| **Frontend (SPA)** | [Render](https://render.com/) | Static Site |

---

## Segurança

| Medida | Detalhes |
| --- | --- |
| **Autenticação** | JWT armazenado em Cookie HTTP-Only (expiração de 24h) |
| **Proteção XSS** | Sem tokens no `localStorage`; cookies inacessíveis via JavaScript |
| **Hashing de Senhas** | bcrypt com salt rounds padrão; limite de 128 caracteres |
| **Rate Limiting** | 20 requisições / 15 min na rota de autenticação |
| **CORS** | Origem restrita ao domínio do frontend (variável de ambiente) |
| **Headers HTTP** | Gerenciados pelo Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| **Variáveis Sensíveis** | Isoladas em `.env`, nunca versionadas |
| **Sessão Expirada** | Redirecionamento automático ao login em respostas 401/403 |

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

## Licença

Este projeto é **software proprietário**. © 2026 Caique Novaes — Todos os direitos reservados.
Consulte o arquivo [LICENSE](./LICENSE) para os termos completos.

---

## Contato

[![GitHub](https://img.shields.io/badge/GitHub-caiquenovaes1994-181717?style=flat&logo=github&logoColor=white)](https://github.com/caiquenovaes1994)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-caiquenovaes-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/caiquenovaes/)
[![Gmail](https://img.shields.io/badge/Gmail-caiquenovaes1994%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:caiquenovaes1994@gmail.com)
