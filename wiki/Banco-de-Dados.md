# Estrutura do Banco de Dados 🗄️

O sistema utiliza **PostgreSQL** com a camada de abstração do **Prisma ORM**. Todas as tabelas internas foram mapeadas com letras minúsculas (snake_case) para garantir estabilidade e evitar erros de permissão ou capitalização de colunas.

Abaixo estão descritos os modelos (tabelas) e as suas relações.

---

## 🧑‍🤝‍🧑 Clientes (`customers`)

Armazena a base de dados de quem é atendido pelo estúdio.

- **id**: Identificador único (Chave Primária).
- **nome**: Nome completo da pessoa.
- **ddi**: Código do país (ex: 55).
- **telefone**: Número de contato direto (WhatsApp).
- **data_nascimento**: Data de aniversário, guardada sem fuso horário.
- **ativo**: Status se o cliente continua sendo atendido (booleano).
- *Relacionamentos*: Um cliente pode ter vários **Agendamentos** atrelados a ele.

---

## 💅 Procedimentos (`procedures`)

Define os serviços oferecidos e seus valores padrão.

- **id**: Identificador único (Chave Primária).
- **nome**: Nome do serviço (ex: Alongamento de Gel, Esmaltação).
- **preco**: Valor sugerido do serviço.
- **duracao**: Tempo padrão que o procedimento dura (em minutos).
- **ativo**: Status (se continuar ativo, aparecerá na lista de agendamentos).
- *Relacionamentos*: Um procedimento pode aparecer em diversos **Agendamentos**.

---

## 📅 Agendamentos (`appointments`)

Tabela transacional. Guarda os registros que unem um Cliente, um Procedimento, uma Data e o Financeiro.

- **id**: Identificador único.
- **data_atendimento**: A data e horário (Timestamp ISO) do atendimento.
- **status**: Pode ser *Agendado*, *Atendido*, ou *Cancelado*.
- **valor_cobrado**: Valor exato que será pago neste agendamento específico.
- **notification_dismissed**: Flag para esconder o alerta de retorno (Booleano).
- *Relacionamentos*:
  - Pertence a um **Cliente** (Foreign Key `customer_id`).
  - Pertence a um **Procedimento** (Foreign Key `procedure_id`).

---

## 🔒 Usuários (`users`)

Onde ficam armazenadas as credenciais de acesso para a Dashboard do sistema.

- **id**: Identificador único.
- **username**: O login utilizado.
- **nome**: Nome de exibição interno.
- **password**: A senha do usuário (devidamente criptografada com `bcrypt`, **nunca gravada em plain text**).
