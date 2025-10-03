// User and Authentication Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  stateCode?: string;
  stateOfOrigin?: string;
  deploymentState?: string;
  serviceYear?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  profilePicture?: string;
  biometricData?: BiometricData;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'NATIONAL_ADMIN'
  | 'STATE_AMEER'
  | 'STATE_SECRETARY'
  | 'MCLO_AMEER'
  | 'MEMBER';

export interface BiometricData {
  fingerprint?: string;
  faceId?: string;
  signature?: string;
}

// Authentication Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  stateCode?: string;
  stateOfOrigin?: string;
  deploymentState?: string;
  serviceYear?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Member Management Types
export interface Member {
  id: string;
  userId: string;
  user: User;
  stateCode: string;
  deploymentState: string;
  serviceYear: string;
  registrationDate: Date;
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';
  paymentStatus: 'CURRENT' | 'OVERDUE' | 'EXEMPT';
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  eidCard?: EIDCard;
  createdAt: Date;
  updatedAt: Date;
}

export interface EIDCard {
  id: string;
  memberId: string;
  cardNumber: string;
  qrCode: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  currency: 'NGN';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'BANK_TRANSFER' | 'CARD' | 'USSD' | 'ALLOWANCE_DEDUCTION';
  transactionReference: string;
  flutterwaveReference?: string;
  paymentDate: Date;
  description: string;
  consentGiven: boolean;
  consentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentConsent {
  id: string;
  memberId: string;
  monthlyAmount: number;
  consentGiven: boolean;
  consentDate: Date;
  paymentMethod: string;
  bankDetails?: BankDetails;
  autoDeduction: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

// Property Management Types
export interface Property {
  id: string;
  name: string;
  description: string;
  type: 'MOSQUE' | 'OFFICE' | 'HALL' | 'SCHOOL' | 'OTHER';
  location: PropertyLocation;
  photos: string[];
  ownershipDocument: string;
  status: 'ACTIVE' | 'UNDER_MAINTENANCE' | 'AVAILABLE' | 'OCCUPIED';
  stateChapter: string;
  addedBy: string;
  addedDate: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  gpsCoordinates: {
    latitude: number;
    longitude: number;
  };
}

// Marketplace Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  currency: 'NGN';
  images: string[];
  stock: number;
  isAvailable: boolean;
  vendor: string;
  rating: number;
  reviews: ProductReview[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 
  | 'FOOD_PACKAGES'
  | 'BASIC_ITEMS'
  | 'ISLAMIC_BOOKS'
  | 'CLOTHING'
  | 'ELECTRONICS'
  | 'OTHER';

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface Order {
  id: string;
  memberId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: 'NGN';
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingAddress: ShippingAddress;
  orderDate: Date;
  deliveryDate?: Date;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  propertiesCount: number;
  ordersCount: number;
  pendingOrders: number;
  newMembersThisMonth: number;
  revenueGrowth: number;
  memberGrowth: number;
}

export interface StateStats {
  stateCode: string;
  stateName: string;
  memberCount: number;
  revenue: number;
  propertiesCount: number;
  lastUpdated: Date;
}

// Islamic Content Types
export interface PrayerTime {
  id: string;
  state: string;
  city: string;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface IslamicEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'HOLIDAY' | 'LECTURE' | 'PROGRAM' | 'COMMUNITY_SERVICE';
  location?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// File Upload Types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Request with User
import type { Request as ExpressRequest } from 'express';

export interface AuthenticatedRequest extends ExpressRequest {
  user?: User;
  files?: any;
}

// Database Query Options
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Email Template Types
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// SMS Template Types
export interface SMSTemplate {
  message: string;
  to: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// System Configuration Types
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
