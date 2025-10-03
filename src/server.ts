import express from 'express';
import type { Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import configurations
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import memberRoutes from './routes/members';
import paymentRoutes from './routes/payments';
import propertyRoutes from './routes/properties';
import marketplaceRoutes from './routes/marketplace';
import dashboardRoutes from './routes/dashboard';
import adminRoutes from './routes/admin';
import eidRoutes from './routes/eid';
import type { AuthenticatedRequest } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy for rate limiting (required for Render)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MCAN API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation
if (process.env.API_DOCS_ENABLED === 'true') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MCAN National Website API',
        version: '1.0.0',
        description: 'API documentation for Muslim Corpers Association of Nigeria',
        contact: {
          name: 'MCAN Technical Team',
          email: 'tech@mcan.org.ng',
        },
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MCAN API Documentation',
  }));
}

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/eid', eidRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/members', memberRoutes);
// app.use('/api/v1/payments', paymentRoutes);
// app.use('/api/v1/properties', propertyRoutes);
// app.use('/api/v1/marketplace', marketplaceRoutes);
// app.use('/api/v1/dashboard', dashboardRoutes);

// Contact form endpoint
app.post('/api/v1/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }
    
    // TODO: Implement email sending logic here
    console.log('Contact form submission:', { name, email, phone, message });
    
    return res.json({
      success: true,
      message: 'Thank you for contacting MCAN. We will respond shortly.'
    });
    
  } catch (error: any) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
});

// Temporary endpoint to create SUPER_ADMIN user (remove after use)
app.post('/api/v1/create-super-admin', async (req, res) => {
  try {
    const { db } = await import('./config/database');
    const bcrypt = await import('bcryptjs');
    const { v4: uuidv4 } = await import('uuid');
    
    // Check if SUPER_ADMIN already exists
    const existingAdmin = await db('users').where('role', 'SUPER_ADMIN').first();
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'SUPER_ADMIN already exists',
        data: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }
    
    // Create SUPER_ADMIN user
    const superAdminId = uuidv4();
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    
    const newAdmin = {
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
    
    await db('users').insert(newAdmin);
    
    return res.json({
      success: true,
      message: 'SUPER_ADMIN user created successfully',
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
    
  } catch (error: any) {
    console.error('Error creating SUPER_ADMIN:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create SUPER_ADMIN user',
      error: error.message
    });
  }
});

// Auth and authorization middleware
import { authenticate } from './middleware/auth';
import { authorize } from './middleware/authorize';

// File upload setup (memory storage; replace with Cloudinary/S3 later)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Temporary simple auth endpoint for testing
app.post('/api/v1/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration successful - database setup in progress',
    data: {
      user: {
        id: 'temp-id-' + Date.now(),
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        role: 'MEMBER',
        stateCode: req.body.stateCode,
        nyscNumber: req.body.nyscNumber,
        deploymentState: req.body.deploymentState,
        serviceYear: req.body.serviceYear,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'temp-token-' + Date.now()
    }
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful - database setup in progress',
    data: {
      user: {
        id: 'temp-id-' + Date.now(),
        fullName: 'Test User',
        email: req.body.email,
        phone: '1234567890',
        role: 'MEMBER',
        stateCode: 'LA',
        nyscNumber: 'LA/2024/123456',
        deploymentState: 'Lagos',
        serviceYear: '2024',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'temp-token-' + Date.now()
    }
  });
});

// Temporary properties endpoints for UI integration
app.get('/api/v1/properties', (req, res) => {
  const { state, type, q } = req.query as { state?: string; type?: string; q?: string };

  const sample = [
    {
      id: 'p-1',
      name: 'MCAN Lodge - Ikeja',
      type: 'LODGE',
      state: 'Lagos',
      location: '12 Unity Street, Ikeja, Lagos',
      capacity: 60,
      condition: 'GOOD',
      manager: 'AbdulRahman Yusuf',
      status: 'ACTIVE',
      ownership: 'MCAN',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'p-2',
      name: 'MCAN Community Masjid - Kano',
      type: 'MASJID',
      state: 'Kano',
      location: 'Hadejia Road, Kano City',
      status: 'ACTIVE',
      ownership: 'DONATED',
      condition: 'EXCELLENT',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'p-3',
      name: 'MCAN State Bus - Kaduna',
      type: 'BUS',
      state: 'Kaduna',
      location: 'Kaduna Secretariat',
      status: 'UNDER_MAINTENANCE',
      ownership: 'MCAN',
      manager: 'Zainab S.',
      lastUpdated: new Date().toISOString(),
    },
  ];

  let filtered = sample;
  if (state) filtered = filtered.filter((p) => p.state.toLowerCase() === String(state).toLowerCase());
  if (type) filtered = filtered.filter((p) => p.type.toLowerCase() === String(type).toLowerCase());
  if (q) {
    const term = String(q).toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term) || p.location.toLowerCase().includes(term));
  }

  res.json({ success: true, message: 'Properties fetched', data: filtered });
});

// Create property (protected: State/National roles)
app.post(
  '/api/v1/properties',
  authenticate,
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY']),
  express.json(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { db } = await import('./config/database');
      const payload = req.body || {};
      // State-bound enforcement: state users can only create in their state
      const requesterState = req.user?.deploymentState || req.user?.stateCode;
      if (req.user?.role?.startsWith('STATE') && payload.state && requesterState && payload.state !== requesterState) {
        return res.status(403).json({ success: false, message: 'Cannot create properties outside your state' });
      }
      const [created] = await db('properties')
        .insert({
          name: payload.name,
          type: payload.type || 'OTHER',
          state: payload.state || requesterState,
          location: payload.location,
          capacity: payload.capacity,
          condition: payload.condition,
          manager: payload.manager,
          status: payload.status || 'ACTIVE',
          ownership: payload.ownership || 'MCAN',
        })
        .returning(['id', 'name', 'type', 'state', 'location', 'capacity', 'condition', 'manager', 'status', 'ownership', 'created_at', 'updated_at']);
      return res.json({ success: true, message: 'Property created', data: created });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to create property' });
    }
  }
);

// Update property (protected)
app.put(
  '/api/v1/properties/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY']),
  express.json(),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { db } = await import('./config/database');
      const id = req.params.id;
      const updates = req.body || {};
      // Enforce state scoping
      if (req.user?.role?.startsWith('STATE')) {
        const prop = await db('properties').where({ id }).first();
        const requesterState = req.user?.deploymentState || req.user?.stateCode;
        if (!prop || prop.state !== requesterState) {
          return res.status(403).json({ success: false, message: 'Cannot update properties outside your state' });
        }
      }
      const [updated] = await db('properties')
        .where({ id })
        .update({
          name: updates.name,
          type: updates.type,
          state: updates.state,
          location: updates.location,
          capacity: updates.capacity,
          condition: updates.condition,
          manager: updates.manager,
          status: updates.status,
          ownership: updates.ownership,
          updated_at: db.fn.now(),
        })
        .returning(['id', 'name', 'type', 'state', 'location', 'capacity', 'condition', 'manager', 'status', 'ownership', 'created_at', 'updated_at']);
      return res.json({ success: true, message: 'Property updated', data: updated });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to update property' });
    }
  }
);

// Upload property files (protected)
app.post(
  '/api/v1/properties/:id/files',
  authenticate,
  authorize(['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_AMEER', 'STATE_SECRETARY']),
  upload.array('files', 5),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { db } = await import('./config/database');
      const id = req.params.id;

      // Enforce state scoping for state roles
      if (req.user?.role?.startsWith('STATE')) {
        const prop = await db('properties').where({ id }).first();
        const requesterState = req.user?.deploymentState || req.user?.stateCode;
        if (!prop || prop.state !== requesterState) {
          return res.status(403).json({ success: false, message: 'Cannot upload files for properties outside your state' });
        }
      }

      // For now, we simulate upload by generating placeholder URLs
      const files = (req.files as any) || [];
      const records = await Promise.all(
        files.map(async (f: any) => {
          const [rec] = await db('property_files')
            .insert({
              property_id: id,
              file_name: f.originalname,
              file_type: f.mimetype,
              url: `https://files.example.com/mock/${encodeURIComponent(f.originalname)}`,
              uploaded_by: req.user?.fullName || 'Unknown',
            })
            .returning(['id', 'file_name', 'file_type', 'url', 'created_at']);
          return rec;
        })
      );

      return res.json({ success: true, message: 'Files uploaded', data: records });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to upload files' });
    }
  }
);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MCAN National Website API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const { db } = await import('./config/database');
    
    // Check if users table exists
    const tableExists = await db.schema.hasTable('users');
    
    if (!tableExists) {
      logger.info('Database tables not found, creating minimal schema...');
      
      // Enable UUID extension
      await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
      // Create users table with minimal schema
      await db.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
        table.string('email', 255).unique().notNullable();
        table.string('full_name', 255).notNullable();
        table.string('phone', 20).notNullable();
        table.string('password_hash', 255).notNullable();
        table.string('role', 50).notNullable().defaultTo('MEMBER');
        table.string('state_code', 10);
        table.string('nysc_number', 20);
        table.string('deployment_state', 100);
        table.string('service_year', 10);
        table.boolean('is_active').defaultTo(true);
        table.boolean('is_email_verified').defaultTo(false);
        table.string('profile_picture', 500);
        table.jsonb('biometric_data');
        table.string('email_verification_token', 255);
        table.string('password_reset_token', 255);
        table.timestamp('password_reset_expires');
        table.timestamp('last_login');
        table.timestamps(true, true);
      });
      
      // Create members table
      await db.schema.createTable('members', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('state_code', 10).notNullable();
        table.string('nysc_number', 20).unique().notNullable();
        table.string('deployment_state', 100).notNullable();
        table.string('service_year', 10).notNullable();
        table.timestamp('registration_date').defaultTo(db.fn.now());
        table.string('membership_status', 20).defaultTo('ACTIVE');
        table.string('payment_status', 20).defaultTo('CURRENT');
        table.timestamp('last_payment_date');
        table.timestamp('next_payment_date');
        table.timestamps(true, true);
      });

      // Create properties table
      const hasProperties = await db.schema.hasTable('properties');
      if (!hasProperties) {
        await db.schema.createTable('properties', (table) => {
          table.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
          table.string('name', 255).notNullable();
          table.enu('type', ['LODGE', 'BUS', 'MASJID', 'OTHER']).notNullable().defaultTo('OTHER');
          table.string('state', 100).notNullable();
          table.string('location', 500).notNullable();
          table.integer('capacity');
          table.enu('condition', ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']);
          table.string('manager', 255);
          table.enu('status', ['ACTIVE', 'UNDER_MAINTENANCE', 'UNAVAILABLE']).notNullable().defaultTo('ACTIVE');
          table.enu('ownership', ['MCAN', 'LEASED', 'DONATED']).notNullable().defaultTo('MCAN');
          table.timestamps(true, true);
        });
      }

      // Create property_files table
      const hasPropertyFiles = await db.schema.hasTable('property_files');
      if (!hasPropertyFiles) {
        await db.schema.createTable('property_files', (table) => {
          table.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
          table.uuid('property_id').notNullable().references('id').inTable('properties').onDelete('CASCADE');
          table.string('file_name', 255).notNullable();
          table.string('file_type', 100).notNullable();
          table.string('url', 1000).notNullable();
          table.string('uploaded_by', 255);
          table.timestamps(true, true);
        });
      }
      
      logger.info('Minimal database schema created successfully');
    } else {
      logger.info('Database tables already exist');
    }
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// Start server
const startServer = async () => {
  try {
    // Start the server first
    app.listen(PORT, () => {
      logger.info(`🚀 MCAN API server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
    });

    // Connect to database (async, non-blocking)
    try {
      await connectDatabase();
      logger.info('Database connected successfully');

      // Initialize database tables
      await initializeDatabase();
      logger.info('Database initialized successfully');
    } catch (dbError) {
      logger.error('Database connection/initialization failed:', dbError);
      logger.warn('Server running without database - some features may not work');
    }

    // Connect to Redis (optional)
    const redisConnected = await connectRedis();
    if (redisConnected) {
      logger.info('Redis connected successfully');
    } else {
      logger.warn('Redis not available, continuing without caching');
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;
