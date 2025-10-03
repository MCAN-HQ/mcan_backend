import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  // Check if SUPER_ADMIN already exists
  const existingAdmin = await knex('users').where('role', 'SUPER_ADMIN').first();
  
  if (existingAdmin) {
    console.log('SUPER_ADMIN already exists, skipping seed...');
    return;
  }

  // Create SUPER_ADMIN user
  const superAdminId = uuidv4();
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  await knex('users').insert({
    id: superAdminId,
    email: 'admin@mcan.org.ng',
    full_name: 'MCAN Super Administrator',
    phone: '+2348000000000',
    password_hash: passwordHash,
    role: 'SUPER_ADMIN',
    state_code: 'FCT',
    deployment_state: 'Federal Capital Territory',
    service_year: '2024',
    is_active: true,
    is_email_verified: true,
    created_at: new Date(),
    updated_at: new Date(),
  });

  console.log('SUPER_ADMIN user created successfully!');
  console.log('Email: admin@mcan.org.ng');
  console.log('Password: Admin123!');
}
