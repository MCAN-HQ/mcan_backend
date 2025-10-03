// Simple test script to create SUPER_ADMIN user
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// This is a simple test script to manually create the SUPER_ADMIN user
// Run this on the production server if the seed didn't work

async function createSuperAdmin() {
  try {
    // You would need to run this with proper database connection
    console.log('Creating SUPER_ADMIN user...');
    
    const superAdminId = uuidv4();
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    
    console.log('SUPER_ADMIN user details:');
    console.log('ID:', superAdminId);
    console.log('Email: admin@mcan.org.ng');
    console.log('Password: Admin123!');
    console.log('Password Hash:', passwordHash);
    console.log('Role: SUPER_ADMIN');
    
    // Insert into database (you would need to run this with proper DB connection)
    console.log('\nTo create this user in the database, run:');
    console.log('INSERT INTO users (id, email, full_name, phone, password_hash, role, state_code, deployment_state, service_year, is_active, is_email_verified, created_at, updated_at) VALUES (');
    console.log(`'${superAdminId}',`);
    console.log(`'admin@mcan.org.ng',`);
    console.log(`'MCAN Super Administrator',`);
    console.log(`'+2348000000000',`);
    console.log(`'${passwordHash}',`);
    console.log(`'SUPER_ADMIN',`);
    console.log(`'FCT',`);
    console.log(`'Federal Capital Territory',`);
    console.log(`'2024',`);
    console.log(`true,`);
    console.log(`true,`);
    console.log(`NOW(),`);
    console.log(`NOW()`);
    console.log(');');
    
  } catch (error) {
    console.error('Error creating SUPER_ADMIN:', error);
  }
}

createSuperAdmin();
