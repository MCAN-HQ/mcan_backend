import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { User, RegisterData } from '../types';

const USERS_TABLE = 'users';

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const user = await db<User>(USERS_TABLE).where({ email }).first();
    return user || null;
  },

  async findById(id: string): Promise<User | null> {
    const user = await db<User>(USERS_TABLE).where({ id }).first();
    return user || null;
  },

  async createUser(data: RegisterData): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const newUser: any = {
      id: uuidv4(),
      email: data.email,
      full_name: data.fullName,
      phone: data.phone,
      password_hash: passwordHash,
      role: data.role || 'MEMBER',
      state_code: data.stateCode || null,
      state_of_origin: data.stateOfOrigin || null,
      deployment_state: data.deploymentState || null,
      service_year: data.serviceYear || null,
      is_active: true,
      is_email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db(USERS_TABLE).insert(newUser);

    return this.mapRowToUser(newUser);
  },

  mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      role: row.role,
      stateCode: row.state_code || undefined,
      stateOfOrigin: row.state_of_origin || undefined,
      deploymentState: row.deployment_state || undefined,
      serviceYear: row.service_year || undefined,
      isActive: row.is_active,
      isEmailVerified: row.is_email_verified,
      profilePicture: row.profile_picture || undefined,
      biometricData: row.biometric_data || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};

export default userService;


