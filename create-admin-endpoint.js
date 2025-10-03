// Emergency endpoint to create SUPER_ADMIN user
// This can be called directly to create the admin user

const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// This endpoint should be called once to create the SUPER_ADMIN user
app.post('/create-admin', async (req, res) => {
  try {
    // You would need to connect to your production database here
    // This is just a template - you need to replace with actual DB connection
    
    const superAdminId = uuidv4();
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    
    const adminUser = {
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
    };
    
    console.log('SUPER_ADMIN user created:', adminUser);
    
    res.json({
      success: true,
      message: 'SUPER_ADMIN user created successfully',
      data: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }
    });
    
  } catch (error) {
    console.error('Error creating SUPER_ADMIN:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SUPER_ADMIN user',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Admin creation server running on port ${PORT}`);
  console.log('Call POST /create-admin to create the SUPER_ADMIN user');
});
