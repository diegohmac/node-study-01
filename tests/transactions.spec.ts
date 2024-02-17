import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';

import { app } from '../src/app';

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 100,
      type: 'income',
    });

    expect(response.statusCode).toBe(201);
  });

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 100,
        type: 'income',
      });

    const cookies = createTransactionResponse.get('set-cookie');

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    expect(listTransactionResponse.statusCode).toBe(200);
    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 100,
      }),
    ]);
  });

  it('should be able to get transaction by ID', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 100,
        type: 'income',
      });

    const cookies = createTransactionResponse.get('set-cookie');

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    const transactionId = listTransactionResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies);

    expect(getTransactionResponse.statusCode).toBe(200);
    expect(getTransactionResponse.body.transactions).toEqual(
      expect.objectContaining({
        title: 'New Transaction',
        amount: 100,
      })
    );
  });

  it('should be able to get current balance', async () => {
    const incomeTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 100.0,
        type: 'income',
      });

    const cookies = incomeTransactionResponse.get('set-cookie');

    const outcomeTransactionResponse = await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'New Transaction',
        amount: 25.0,
        type: 'outcome',
      });

    const cookies2 = outcomeTransactionResponse.get('set-cookie');

    const balanceResponse = await request(app.server)
      .get('/transactions/balance')
      .set('Cookie', cookies);

    expect(balanceResponse.statusCode).toBe(200);
    expect(balanceResponse.body.amount).toBe(75);
  });
});
