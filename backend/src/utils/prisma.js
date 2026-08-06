const { PrismaClient } = require('@prisma/client');
const { encrypt, decrypt } = require('./crypto');

const basePrisma = new PrismaClient();

const prisma = basePrisma.$extends({
  query: {
    customer: {
      async create({ args, query }) {
        if (args.data) {
          if (args.data.telefone) args.data.telefone = encrypt(args.data.telefone);
          if (args.data.endereco) args.data.endereco = encrypt(args.data.endereco);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data) {
          if (args.data.telefone) args.data.telefone = encrypt(args.data.telefone);
          if (args.data.endereco) args.data.endereco = encrypt(args.data.endereco);
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create) {
          if (args.create.telefone) args.create.telefone = encrypt(args.create.telefone);
          if (args.create.endereco) args.create.endereco = encrypt(args.create.endereco);
        }
        if (args.update) {
          if (args.update.telefone) args.update.telefone = encrypt(args.update.telefone);
          if (args.update.endereco) args.update.endereco = encrypt(args.update.endereco);
        }
        return query(args);
      }
    }
  },
  result: {
    customer: {
      telefone: {
        needs: { telefone: true },
        compute(customer) {
          return decrypt(customer.telefone);
        }
      },
      endereco: {
        needs: { endereco: true },
        compute(customer) {
          return decrypt(customer.endereco);
        }
      }
    }
  }
});

module.exports = prisma;
