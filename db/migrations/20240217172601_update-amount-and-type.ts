import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.renameColumn('value', 'amount');
    table.enum('type', ['income', 'outcome']).after('title');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.renameColumn('amount', 'value');
    table.dropColumn('type');
  });
}
