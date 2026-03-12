# System Architecture & Design

This document explains the architecture, design patterns, and key decisions in the POS SaaS application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Clean Architecture Layers](#clean-architecture-layers)
3. [Authentication Flow](#authentication-flow)
4. [Data Flow](#data-flow)
5. [Directory Structure](#directory-structure)
6. [Design Patterns](#design-patterns)
7. [Security Architecture](#security-architecture)
8. [Scalability Considerations](#scalability-considerations)
9. [Future Expansion](#future-expansion)

## Architecture Overview

The POS SaaS follows a **clean architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/PWA)                     │
│  React Components, Forms, User Interface                    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  Next.js Pages, API Routes, Middleware                      │
│  - Route handlers                                           │
│  - Request/Response management                              │
│  - Session handling                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                             │
│  Business Logic, Authentication, Validation                │
│  - authService.ts (Authentication logic)                   │
│  - userService.ts (User operations)                        │
│  - Password hashing, JWT tokens                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  REPOSITORY LAYER                           │
│  Data Access Abstraction, Database Queries                 │
│  - userRepository.ts                                       │
│  - Prisma ORM queries                                      │
│  - SQL generation                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                │
│  PostgreSQL Database                                        │
│  - Users table                                             │
│  - Businesses table (future)                               │
│  - UserBusinesses table (future)                           │
│  - Products table (future)                                 │
│  - Transactions table (future)                             │
└─────────────────────────────────────────────────────────────┘
```

## Clean Architecture Layers

### 1. Presentation Layer (`/app`, `/components`)

**Responsibility**: Handle HTTP requests/responses and UI rendering

**Key Files**:
- `src/app/api/*` - API route handlers
- `src/app/(auth)/` - Authentication pages
- `src/app/(dashboard)/` - Protected pages
- `src/components/` - Reusable React components

**Characteristics**:
- Minimal business logic
- Form validation (client-side only)
- API calls to service layer
- Session management integration

**Example**:
```typescript
// src/app/api/auth/signup/route.ts
- Receives HTTP request
- Calls authService.signup()
- Returns HTTP response
```

### 2. Service Layer (`/services`)

**Responsibility**: Implement business logic and core operations

**Key Files**:
- `src/services/authService.ts` - Authentication operations
- `src/services/userService.ts` - User management (future)

**Characteristics**:
- Pure business logic
- No HTTP concerns
- Database-agnostic (uses repositories)
- Reusable across multiple endpoints

**Example**:
```typescript
// src/services/authService.ts
export class AuthService {
  async signup(input: SignupInput) {
    // 1. Validate input
    // 2. Check if user exists
    // 3. Hash password
    // 4. Create user
    // 5. Return result
  }
}
```

### 3. Repository Layer (`/repositories`)

**Responsibility**: Abstract database operations

**Key Files**:
- `src/repositories/userRepository.ts` - User CRUD operations

**Characteristics**:
- Database-specific queries
- Prisma ORM operations
- Single responsibility principle
- Easy to test (mockable)

**Example**:
```typescript
// src/repositories/userRepository.ts
export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
  
  async create(data: CreateUserInput) {
    return prisma.user.create({ data });
  }
}
```

### 4. Data Layer (`/prisma`)

**Responsibility**: Database schema and ORM configuration

**Key Files**:
- `prisma/schema.prisma` - Database models

**Characteristics**:
- Defines data structure
- Type-safe database access
- Migration management

## Authentication Flow

### Signup Flow

```
User Input
  │
  ▼
FormInput Validation (Client-side)
  │
  ▼
POST /api/auth/signup
  │
  ▼
Route Handler (Presentation)
  ├─ Parse JSON
  ├─ Zod Validation (Server-side)
  │
  ▼
authService.signup() (Service)
  ├─ Check duplicate email
  ├─ Hash password (bcryptjs)
  ├─ Validate business rules
  │
  ▼
userRepository.create() (Repository)
  ├─ Prisma query
  ├─ SQL execution
  │
  ▼
User Record Created in DB
  │
  ▼
Return User Data (without password)
  │
  ▼
HTTP 201 Response to Client
  │
  ▼
Display Success Message
```

### Login Flow

```
User Credentials
  │
  ▼
POST /api/auth/signin (via Next Auth)
  │
  ▼
Auth.js Middleware
  ├─ Zod Validation
  │
  ▼
authService.login() (Service)
  ├─ Find user by email
  ├─ Compare password (bcryptjs)
  │
  ▼
Create JWT Token
  │
  ▼
Set HTTP-only Cookie
  │
  ▼
Redirect to Dashboard
  │
  ▼
Session Established
```

### Protected Route Access

```
Request to /dashboard
  │
  ▼
Middleware Check
  ├─ Verify JWT in cookie
  ├─ Check token expiry
  │
  ▼
Session Valid?
  ├─ Yes: Allow access to page
  ├─ No: Redirect to /login
  │
  ▼
Server Component
  ├─ Call auth()
  ├─ Get user from session
  │
  ▼
Render Protected Page
```

## Data Flow

### API Request Flow

```
1. CLIENT SIDE
   - React component → fetch() or signIn()
   - User input validation
   - Loading state management

2. NETWORK
   - HTTPS request
   - POST/GET to /api/...

3. SERVER SIDE
   - Next.js route handler
   - Parse request body
   - Create context object

4. VALIDATION LAYER
   - Zod schema validation
   - Input sanitization
   - Return errors if invalid

5. BUSINESS LOGIC
   - Service layer processing
   - Rules enforcement
   - Data transformation

6. DATA ACCESS
   - Repository queries
   - Prisma ORM operation
   - SQL execution

7. DATABASE
   - Execute SQL
   - ACID compliance
   - Return results

8. RESPONSE
   - Transform data
   - Remove sensitive fields
   - Send HTTP response

9. CLIENT
   - Parse JSON
   - Update UI state
   - Show success/error
```

## Directory Structure

```
pwa-point-of-sale/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group - Public
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page UI
│   │   │   ├── signup/
│   │   │   │   └── page.tsx          # Signup page UI
│   │   │   └── layout.tsx            # Auth layout
│   │   ├── (dashboard)/              # Route group - Protected
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Dashboard page
│   │   │   └── layout.tsx            # Dashboard layout
│   │   ├── api/                      # API Routes
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/
│   │   │       │   └── route.ts      # Auth.js handler
│   │   │       ├── signup/
│   │   │       │   └── route.ts      # Signup endpoint
│   │   │       └── profile/
│   │   │           └── route.ts      # User profile
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home (redirector)
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # Reusable UI Components
│   │   ├── FormInput.tsx             # Form input field
│   │   ├── Button.tsx                # Button component
│   │   ├── Alert.tsx                 # Alert/notification
│   │   ├── LoginForm.tsx             # Login form
│   │   └── SignupForm.tsx            # Signup form
│   │
│   ├── lib/                          # Utilities & Config
│   │   ├── prisma.ts                 # Prisma singleton
│   │   ├── auth.ts                   # Auth.js config
│   │   ├── validations.ts            # Zod schemas
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── services/                     # Business Logic
│   │   ├── authService.ts            # Auth operations
│   │   └── userService.ts            # User operations (future)
│   │
│   ├── repositories/                 # Data Access
│   │   ├── userRepository.ts         # User database ops
│   │   └── businessRepository.ts     # Business ops (future)
│   │
│   ├── types/                        # TypeScript Types
│   │   ├── auth.ts                   # Auth types
│   │   └── user.ts                   # User types (future)
│   │
│   └── middleware.ts                 # Route protection
│
├── prisma/
│   └── schema.prisma                 # Database schema
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── robots.txt                    # SEO robots
│   └── icons/                        # PWA icons (to add)
│
├── Configuration Files
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── next.config.js                # Next.js config
│   ├── tailwind.config.ts            # Tailwind config
│   ├── postcss.config.js             # PostCSS config
│   ├── .eslintrc.json                # ESLint config
│   ├── .env.example                  # Env template
│   └── .gitignore                    # Git ignore
│
└── Documentation
    ├── README.md                     # Project overview
    ├── SETUP_GUIDE.md                # Installation guide
    └── ARCHITECTURE.md               # This file
```

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract database access

```typescript
// Instead of:
const user = await prisma.user.findUnique(...)  // Tied to Prisma

// We do:
const user = await userRepository.findById(id)  // Abstracted
```

**Benefits**:
- Easy to swap database implementations
- Testable with mocks
- Centralized query logic

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic

```typescript
// Instead of mixing logic in route handlers
export async function POST(req) {
  const hash = await bcryptjs.hash(password, 10);  // ❌ Too much in one place
}

// We separate concerns
export class AuthService {
  async signup(input: SignupInput) {
    // All auth logic here
  }
}
```

### 3. Dependency Injection

**Purpose**: Loose coupling

```typescript
// Services depend on repositories
export class AuthService {
  constructor(private userRepository: UserRepository) {}
  
  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    // ...
  }
}
```

### 4. Singleton Pattern

**Purpose**: Single database connection

```typescript
// Only one Prisma client instance
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 5. Validation Schema Pattern

**Purpose**: Type-safe validation

```typescript
// Declare schema once, use everywhere
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

// Validation + type inference
const validated = signupSchema.parse(input);
type SignupInput = z.infer<typeof signupSchema>;
```

## Security Architecture

### 1. Authentication

```
                Client                        Server
                  │                             │
    User submits credentials
                  ├────────────────────────────►│
                  │                             │
                  │         Validate with       │
                  │         Auth.js             │
                  │                             │
                  │      Check credentials  ────┤
                  │      in authService         │
                  │                             │
                  │    Create JWT token    ────┤
                  │                             │
                  │◄────────────────────────────┤
    Receive JWT in HTTP-only cookie
                  │
    Stored in browser (secure)
```

### 2. Password Security

```
User Password
    │
    ├─ Client-side validation (UX)
    │  └─ Min 8 chars, uppercase, lowercase, number, special char
    │
    ├─ Transmitted via HTTPS (encrypted in transit)
    │
    ├─ Server validates again
    │
    ├─ Hash with bcryptjs (salt rounds: 10)
    │  └─ ~2^7 iterations per computation
    │  └─ Takes ~100ms to hash
    │  └─ Protects against brute force
    │
    └─ Stored in database (hashed, not reversible)

Login Process:
    User Password (input)
         │
         ├─ receive via HTTPS
         │
         ├─ bcryptjs.compare(input, storedHash)
         │
         ├─ Returns boolean true/false
         │
         └─ Never store or log plaintext
```

### 3. Session Security

```
├─ JWT Token
│  └─ Contains: { id, email, role }
│  └─ Signed with NEXTAUTH_SECRET
│  └─ Tamper-proof
│  └─ Time-limited (30 days)
│
├─ Storage: HTTP-only cookie
│  └─ Cannot be accessed by JavaScript
│  └─ Automatically sent with requests
│  └─ Protected against XSS
│
├─ Transmission: HTTPS
│  └─ Encrypted in transit
│  └─ Protected against MITM
│
└─ Validation
   └─ Server verifies token on each request
   └─ Checks signature
   └─ Checks expiration
   └─ Extracts user information
```

### 4. Input Validation

```
Client Input
    │
    ├─ Browser validation (FormInput component)
    │  └─ HTML5 input types
    │  └─ Real-time feedback
    │
    ├─ Network transmission (HTTPS)
    │
    ├─ Server-side validation (Zod)
    │  ├─ Type checking
    │  ├─ Length constraints
    │  ├─ Format validation
    │  ├─ Custom rules
    │
    ├─ ORM Protection (Prisma)
    │  ├─ Prepared statements
    │  ├─ SQL injection prevention
    │
    └─ Database storage
       └─ Type enforcement
       └─ Constraints
       └─ Indexes
```

### 5. CORS & CSRF Protection

```
├─ CORS Handled by Next.js (same origin)
│
├─ CSRF Protection via Auth.js
│  └─ CSRF token in session
│  └─ Verified on state-changing operations
│
└─ Middleware checks
   └─ Verifies session before protected routes
```

## Scalability Considerations

### 1. Database

**Current Approach**:
- PostgreSQL with Prisma ORM
- Normalization for consistency

**Scalability Plan**:
- Read replicas for queries
- Connection pooling (PgBouncer)
- Sharding by business ID (multi-tenant)
- Archive old transactions

### 2. Caching

**Current Implementation**:
- Session caching in JWT
- Client-side caching in Next.js

**Future**:
- Redis for session store (if needed)
- Redis for business data (frequent reads)
- CDN for static assets
- API response caching

### 3. API Rate Limiting

**Current**:
- Database-level constraints

**Future**:
- Rate limiting middleware
- Throttling per user/IP
- Gradual backoff

### 4. Background Jobs

**Current**:
- None (not needed)

**Future**:
- Send emails (Bull/Redis)
- Generate reports (Cron jobs)
- Sync inventory (Background workers)

### 5. Monitoring & Logging

**Current**:
- Console.error for exceptions

**Future**:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for performance
- CloudWatch for logs

## Future Expansion

### Phase 2: POS Core

```
Authentication ✅
     │
     ▼
Multi-User Roles (basic)
     │
     ▼
Point of Sale Interface
     │
     ├─ Product scanning
     ├─ Cart management
     ├─ Payment processing
     ├─ Receipt printing
     │
     ▼
Inventory Management
     │
     ├─ Stock tracking
     ├─ Low stock alerts
     ├─ Product master data
```

### Phase 3: Multi-Business SaaS

```
Multi-Tenant Architecture
     │
     ├─ Business isolation
     ├─ Data segregation
     ├─ Separate databases or schemas
     │
     ├─ UserBusiness mapping
     ├─ Role-based access control (RBAC)
     │
     └─ Team management
        ├─ Invite team members
        ├─ Assign roles
        ├─ Activity logging
```

### Phase 4: Advanced Features

```
├─ Payment Integrations
│  ├─ Stripe
│  ├─ Cryptocurrency
│  └─ Mobile money
│
├─ Loyalty Program
│  ├─ Point system
│  ├─ Rewards
│  └─ Referrals
│
├─ Online Store
│  ├─ E-commerce integration
│  ├─ Inventory sync
│  └─ Customer portal
│
└─ Blockchain
   ├─ Crypto payments
   ├─ Smart contracts
   └─ Token rewards
```

### Database Evolution

```
Current Schema:
├─ User
├─ Business
└─ UserBusiness

Phase 2:
├─ Product
├─ Category
├─ Inventory
└─ Transaction

Phase 3:
├─ Order
├─ OrderItem
├─ Customer
└─ LoyaltyPoint

Phase 4:
├─ CryptoTransaction
├─ RewardToken
├─ OnlineStore
└─ Subscription
```

---

## Summary

The POS SaaS architecture is designed with:

✅ **Clean Separation of Concerns**
- Presentation, Service, Repository, Data layers

✅ **Security First**
- Password hashing, validation, session management

✅ **Type Safety**
- TypeScript throughout, Zod validation

✅ **Testability**
- Dependency injection, mocked repositories

✅ **Scalability**
- Multi-tenant ready, optimized queries

✅ **Maintainability**
- Clear structure, easy to extend

✅ **Performance**
- Optimized queries, proper indexing

This architecture supports the complete roadmap from authentication to full multi-tenant POS SaaS with blockchain integration.
