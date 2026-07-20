# Release Notes - Bárbara Reis Nail Designer

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
