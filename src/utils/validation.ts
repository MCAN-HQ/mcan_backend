import Joi from 'joi';

export const authValidation = {
  register: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    stateCode: Joi.string().optional(),
    stateOfOrigin: Joi.string().optional(),
    deploymentState: Joi.string().optional(),
    serviceYear: Joi.string().optional(),
    role: Joi.string().valid('MEMBER').optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),
};

export const userValidation = {
  updateUser: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    stateCode: Joi.string().optional(),
    stateOfOrigin: Joi.string().optional(),
    deploymentState: Joi.string().optional(),
    serviceYear: Joi.string().optional(),
  }),
};

export const memberValidation = {
  createMember: Joi.object({
    userId: Joi.string().uuid().required(),
    stateCode: Joi.string().required(),
    deploymentState: Joi.string().required(),
    serviceYear: Joi.string().required(),
  }),

  updateMember: Joi.object({
    stateCode: Joi.string().optional(),
    deploymentState: Joi.string().optional(),
    serviceYear: Joi.string().optional(),
    membershipStatus: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED').optional(),
  }),
};

export const paymentValidation = {
  createPaymentConsent: Joi.object({
    monthlyAmount: Joi.number().positive().required(),
    paymentMethod: Joi.string().required(),
    autoDeduction: Joi.boolean().required(),
    bankDetails: Joi.object({
      bankName: Joi.string().required(),
      accountNumber: Joi.string().required(),
      accountName: Joi.string().required(),
      bankCode: Joi.string().required(),
    }).optional(),
  }),

  initializePayment: Joi.object({
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CARD', 'USSD', 'ALLOWANCE_DEDUCTION').required(),
    description: Joi.string().required(),
  }),

  verifyPayment: Joi.object({
    transactionReference: Joi.string().required(),
  }),
};

export const propertyValidation = {
  createProperty: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).required(),
    type: Joi.string().valid('MOSQUE', 'OFFICE', 'HALL', 'SCHOOL', 'OTHER').required(),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      gpsCoordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
      }).required(),
    }).required(),
    stateChapter: Joi.string().required(),
    ownershipDocument: Joi.string().optional(),
  }),

  updateProperty: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid('MOSQUE', 'OFFICE', 'HALL', 'SCHOOL', 'OTHER').optional(),
    location: Joi.object({
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      gpsCoordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional(),
      }).optional(),
    }).optional(),
    status: Joi.string().valid('ACTIVE', 'UNDER_MAINTENANCE', 'AVAILABLE', 'OCCUPIED').optional(),
  }),
};

export const marketplaceValidation = {
  createOrder: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().positive().required(),
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      fullName: Joi.string().required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().optional(),
    }).required(),
  }),

  addToCart: Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().positive().required(),
  }),
};

export const adminValidation = {
  createUser: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    role: Joi.string().valid('MEMBER', 'MCLO_AMEER', 'STATE_SECRETARY', 'STATE_AMEER', 'NATIONAL_ADMIN').required(),
    stateCode: Joi.string().optional(),
    deploymentState: Joi.string().optional(),
    serviceYear: Joi.string().optional(),
    password: Joi.string().min(6).optional(),
  }),

  updateUser: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: Joi.string().valid('MEMBER', 'MCLO_AMEER', 'STATE_SECRETARY', 'STATE_AMEER', 'NATIONAL_ADMIN').optional(),
    stateCode: Joi.string().optional(),
    deploymentState: Joi.string().optional(),
    serviceYear: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),

  resetPassword: Joi.object({
    newPassword: Joi.string().min(6).required(),
  }),
};

export default {
  authValidation,
  userValidation,
  memberValidation,
  paymentValidation,
  propertyValidation,
  marketplaceValidation,
};
