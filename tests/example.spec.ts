import request from 'supertest';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { app } from '../src/app';

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test('user can create a new transaction', async () => {
  const response = await request(app.server).post('/transactions').send({
    title: 'New Transaction',
    amount: 100,
    type: 'income',
  });

  expect(response.statusCode).toBe(201);
});
