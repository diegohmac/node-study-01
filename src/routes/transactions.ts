import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { knex } from '../database';

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/balance', async () => {
    const balance = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first();

    return balance;
  });

  app.get('/', async () => {
    const transactions = await knex('transactions').select();

    return {
      transactions,
    };
  });

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transactions = await knex('transactions').where('id', id).first();

    return {
      transactions,
    };
  });

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['income', 'outcome']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'outcome' ? amount * -1 : amount,
    });

    return reply.status(201).send();
  });
}
