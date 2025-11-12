import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('email').notNullable().unique();
      table.string('full_name').notNullable();
      table.string('phone', 20).notNullable();
      table.string('password_hash').notNullable();
      table
        .enu('role', ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY', 'MCLO_AMEER', 'MEMBER'], {
          useNative: true,
          enumName: 'user_role',
        })
        .notNullable()
        .defaultTo('MEMBER');
      table.string('state_code', 20);
      table.string('state_of_origin', 100);
      table.string('deployment_state', 100);
      table.string('service_year', 10);
      table.boolean('is_active').notNullable().defaultTo(true);
      table.boolean('is_email_verified').notNullable().defaultTo(false);
      table.string('profile_picture');
      table.jsonb('biometric_data');
      table.timestamps(true, true);
      table.index(['state_code', 'role'], 'idx_users_state_role');
    });
  }

  if (!(await knex.schema.hasTable('members'))) {
    await knex.schema.createTable('members', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .unique();
      table.string('state_code', 20).notNullable();
      table.string('deployment_state', 100).notNullable();
      table.string('service_year', 10).notNullable();
      table
        .enu('membership_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED'], {
          useNative: true,
          enumName: 'membership_status',
        })
        .notNullable()
        .defaultTo('ACTIVE');
      table
        .enu('payment_status', ['CURRENT', 'OVERDUE', 'EXEMPT'], {
          useNative: true,
          enumName: 'payment_status',
        })
        .notNullable()
        .defaultTo('CURRENT');
      table.timestamp('registration_date').notNullable().defaultTo(knex.fn.now());
      table.timestamp('last_payment_date');
      table.timestamp('next_payment_date');
      table.timestamps(true, true);
      table.index(['state_code', 'membership_status'], 'idx_members_state_status');
    });
  }

  if (!(await knex.schema.hasTable('eid_cards'))) {
    await knex.schema.createTable('eid_cards', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .unique();
      table.text('svg_markup').notNullable();
      table.string('version', 20).notNullable().defaultTo('v1');
      table.timestamps(true, true);
    });
  }

  if (!(await knex.schema.hasTable('properties'))) {
    await knex.schema.createTable('properties', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.text('description').notNullable();
      table
        .enu('type', ['MOSQUE', 'OFFICE', 'HALL', 'SCHOOL', 'OTHER'], {
          useNative: true,
          enumName: 'property_type',
        })
        .notNullable();
      table.jsonb('location').notNullable().defaultTo(knex.raw(`'{}'::jsonb`));
      table.jsonb('photos').notNullable().defaultTo(knex.raw(`'[]'::jsonb`));
      table.string('ownership_document');
      table
        .enu('status', ['ACTIVE', 'UNDER_MAINTENANCE', 'AVAILABLE', 'OCCUPIED'], {
          useNative: true,
          enumName: 'property_status',
        })
        .notNullable()
        .defaultTo('ACTIVE');
      table.string('state_chapter', 100).notNullable();
      table
        .uuid('added_by')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
      table.timestamp('added_date').notNullable().defaultTo(knex.fn.now());
      table.timestamp('last_updated').notNullable().defaultTo(knex.fn.now());
      table.timestamps(true, true);
      table.index(['state_chapter', 'type', 'status'], 'idx_properties_state_type_status');
    });
  }

  if (!(await knex.schema.hasTable('payment_consents'))) {
    await knex.schema.createTable('payment_consents', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('member_id')
        .notNullable()
        .references('id')
        .inTable('members')
        .onDelete('CASCADE');
      table.decimal('monthly_amount', 12, 2).notNullable();
      table.boolean('consent_given').notNullable().defaultTo(true);
      table.timestamp('consent_date').notNullable().defaultTo(knex.fn.now());
      table.string('payment_method').notNullable();
      table.jsonb('bank_details');
      table.boolean('auto_deduction').notNullable().defaultTo(false);
      table.timestamps(true, true);
    });
  }

  if (!(await knex.schema.hasTable('payments'))) {
    await knex.schema.createTable('payments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('member_id')
        .notNullable()
        .references('id')
        .inTable('members')
        .onDelete('CASCADE');
      table.decimal('amount', 12, 2).notNullable();
      table.string('currency', 3).notNullable().defaultTo('NGN');
      table
        .enu('status', ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], {
          useNative: true,
          enumName: 'payment_status_type',
        })
        .notNullable()
        .defaultTo('PENDING');
      table
        .enu('payment_method', ['BANK_TRANSFER', 'CARD', 'USSD', 'ALLOWANCE_DEDUCTION'], {
          useNative: true,
          enumName: 'payment_method_type',
        })
        .notNullable();
      table.string('transaction_reference').notNullable().unique();
      table.string('flutterwave_reference');
      table.timestamp('payment_date').notNullable().defaultTo(knex.fn.now());
      table.string('description').notNullable();
      table.boolean('consent_given').notNullable().defaultTo(false);
      table.timestamp('consent_date');
      table.timestamps(true, true);
      table.index(['status', 'payment_method'], 'idx_payments_status_method');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .alterTable('payments', (table) => table.dropIndex(['status', 'payment_method'], 'idx_payments_status_method'))
    .catch(() => {});
  await knex.schema
    .alterTable('properties', (table) => table.dropIndex(['state_chapter', 'type', 'status'], 'idx_properties_state_type_status'))
    .catch(() => {});
  await knex.schema
    .alterTable('members', (table) => table.dropIndex(['state_code', 'membership_status'], 'idx_members_state_status'))
    .catch(() => {});
  await knex.schema
    .alterTable('users', (table) => table.dropIndex(['state_code', 'role'], 'idx_users_state_role'))
    .catch(() => {});

  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('payment_consents');
  await knex.schema.dropTableIfExists('properties');
  await knex.schema.dropTableIfExists('eid_cards');
  await knex.schema.dropTableIfExists('members');
  await knex.schema.dropTableIfExists('users');

  await knex.raw('DROP TYPE IF EXISTS payment_method_type CASCADE;');
  await knex.raw('DROP TYPE IF EXISTS payment_status_type CASCADE;');
  await knex.raw('DROP TYPE IF EXISTS property_status CASCADE;');
  await knex.raw('DROP TYPE IF EXISTS property_type CASCADE;');
  await knex.raw('DROP TYPE IF EXISTS payment_status CASCADE;');
  await knex.raw('DROP TYPE IF EXISTS membership_status CASCADE;');
  await knex.raw('DROP TYPE IF EXISTS user_role CASCADE;');
}

