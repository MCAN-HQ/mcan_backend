import { Knex } from 'knex';
import fs from 'fs';
import path from 'path';

export async function up(knex: Knex): Promise<void> {
  const schemaPath = path.resolve(process.cwd(), '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await knex.raw(sql);
}

export async function down(knex: Knex): Promise<void> {
  // Drop in reverse order to satisfy FKs
  const statements = [
    'DROP TABLE IF EXISTS audit_logs CASCADE;',
    'DROP TABLE IF EXISTS system_config CASCADE;',
    'DROP TABLE IF EXISTS prayer_times CASCADE;',
    'DROP TABLE IF EXISTS islamic_events CASCADE;',
    'DROP TABLE IF EXISTS notifications CASCADE;',
    'DROP TABLE IF EXISTS orders CASCADE;',
    'DROP TABLE IF EXISTS product_reviews CASCADE;',
    'DROP TABLE IF EXISTS products CASCADE;',
    'DROP TABLE IF EXISTS properties CASCADE;',
    'DROP TABLE IF EXISTS payments CASCADE;',
    'DROP TABLE IF EXISTS payment_consents CASCADE;',
    'DROP TABLE IF EXISTS eid_cards CASCADE;',
    'DROP TABLE IF EXISTS members CASCADE;',
    'DROP TABLE IF EXISTS users CASCADE;',
  ];
  for (const s of statements) {
    await knex.raw(s);
  }
}


