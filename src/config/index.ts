/**
 * Configuration constants and settings
 */

export const config = {
  // App
  app: {
    name: 'POS SaaS',
    description: 'Production-grade PWA-based Point of Sale System',
    version: '0.1.0',
  },

  // URLs
  urls: {
    home: '/',
    login: '/login',
    signup: '/signup',
    dashboard: '/dashboard',
  },

  // API Endpoints
  api: {
    auth: {
      signup: '/api/auth/signup',
      signin: '/api/auth/signin',
      signout: '/api/auth/signout',
      profile: '/api/auth/profile',
    },
    users: '/api/users',
    businesses: '/api/businesses',
  },

  // Session
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Features (flags for future use)
  features: {
    multiTenant: false, // Coming in Phase 3
    crypto: false, // Coming in Phase 4
    blockchain: false, // Coming in Phase 4
    onlineStore: false, // Coming in Phase 4
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Rate Limiting
  rateLimit: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // Max 5 login attempts
    },
  },

  // Cookies
  cookies: {
    sessionToken: 'next-auth.session-token',
    callbackUrl: 'next-auth.callback-url',
    csrfToken: 'next-auth.csrf-token',
  },

  // Roles
  roles: {
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
    MANAGER: 'MANAGER', // For future multi-business
    OWNER: 'OWNER', // For future multi-business
  },

  // Error messages
  errors: {
    auth: {
      invalidCredentials: 'Invalid email or password',
      emailExists: 'Email already registered',
      userNotFound: 'User not found',
      sessionExpired: 'Session expired. Please login again.',
      unauthorized: 'You are not authorized to perform this action',
    },
    validation: {
      invalidEmail: 'Invalid email address',
      passwordTooShort: 'Password must be at least 8 characters',
      nameTooShort: 'Name must be at least 2 characters',
    },
    server: {
      internal: 'An error occurred. Please try again later.',
      database: 'Database connection error',
      unknown: 'An unexpected error occurred',
    },
  },

  // Success messages
  success: {
    signupComplete: 'Account created successfully',
    loginSuccess: 'Logged in successfully',
    logoutSuccess: 'Logged out successfully',
    profileUpdated: 'Profile updated successfully',
  },
};

export default config;
