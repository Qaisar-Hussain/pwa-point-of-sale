# Complete File Structure & Purpose Guide

This document provides a complete mapping of all files in the POS SaaS project with their purposes.

## 📂 Directory Structure with File Descriptions

### Root Configuration Files

```
.env.example                    Environment variables template
.eslintrc.json                 ESLint configuration for code linting
.gitignore                     Git ignore rules
next.config.js                 Next.js configuration with PWA support
package.json                   Project dependencies and scripts
postcss.config.js              PostCSS configuration for Tailwind
tailwind.config.ts             Tailwind CSS theme configuration
tsconfig.json                  TypeScript compiler configuration
README.md                      Project overview and documentation
QUICKSTART.md                  10-minute quick start guide
SETUP_GUIDE.md                 Detailed installation instructions
ARCHITECTURE.md                System architecture and design patterns
API_TESTING.md                 API testing guide with cURL examples
PROJECT_SUMMARY.md             Complete project summary
```

### Source Files (`/src`)

#### Application Layer (`/src/app`)

**Pages & Layouts:**
```
/app
├── layout.tsx                  Root layout with PWA meta tags
├── page.tsx                    Home page (redirects to login/dashboard)
├── globals.css                 Global Tailwind styles
│
├── (auth)/                     Route group for authentication pages
│   ├── login/
│   │   └── page.tsx           Login page component
│   ├── signup/
│   │   └── page.tsx           Signup page component
│   └── layout.tsx              Layout for auth pages
│
└── (dashboard)/                Route group for protected pages
    ├── dashboard/
    │   └── page.tsx           Dashboard page (protected)
    └── layout.tsx              Layout with session protection
```

**API Routes (`/app/api`):**
```
/api/auth/
├── [...nextauth]/route.ts      Auth.js handler for signin/signout
├── signup/route.ts             Signup API endpoint
└── profile/route.ts            User profile API endpoint
```

#### Components (`/src/components`)

**Reusable UI Components:**
```
FormInput.tsx                  Form input field with validation display
Button.tsx                     Customizable button with loading states
Alert.tsx                      Alert/notification component
LoginForm.tsx                  Login form with credentials
SignupForm.tsx                 Signup form with validation
```

#### Library/Utilities (`/src/lib`)

**Configuration & Utilities:**
```
prisma.ts                      Prisma client singleton
auth.ts                        Auth.js configuration
validations.ts                 Zod validation schemas
utils.ts                       API response helper functions
errors.ts                      Error classes and handling
logger.ts                       Logging utility
```

#### Services (`/src/services`)

**Business Logic Layer:**
```
authService.ts                 Authentication business logic
                              - signup()
                              - login()
                              - hashPassword()
                              - comparePassword()
                              - getUserById()

userService.ts                 User management logic
                              - getUserById()
                              - getAllUsers()
                              - updateUser()
                              - deleteUser()
                              - emailExists()
```

#### Repositories (`/src/repositories`)

**Data Access Layer:**
```
userRepository.ts              User database operations
                              - findByEmail()
                              - findById()
                              - create()
                              - update()
                              - delete()
                              - findAll()
```

#### Types (`/src/types`)

**TypeScript Type Definitions:**
```
auth.ts                        Authentication-related types
                              - AuthUser
                              - SignupInput
                              - LoginInput
                              - AuthResponse
                              - ApiError
                              - ApiResponse
```

#### Configuration (`/src/config`)

**App Configuration:**
```
index.ts                       Configuration constants
                              - App metadata
                              - URLs
                              - API endpoints
                              - Session settings
                              - Password policy
                              - Roles
                              - Error/success messages
```

#### Middleware

```
/src/middleware.ts             Route protection middleware
                              - Protects /dashboard routes
                              - Redirects unauthorized users to /login
```

### Database (`/prisma`)

```
schema.prisma                  Prisma database schema
                              Models:
                              - User (authentication)
                              - Business (multi-tenant)
                              - UserBusiness (relationships)
                              - Product (future)
                              - Transaction (future)
```

### Public Assets (`/public`)

```
manifest.json                  PWA manifest for installation
robots.txt                     SEO robots configuration
/icons/                        PWA icons (to be added)
  - icon-192.png
  - icon-512.png
  - maskable-icon-192.png
  - maskable-icon-512.png
```

### Documentation

```
README.md                      Complete project documentation
QUICKSTART.md                  10-minute setup guide
SETUP_GUIDE.md                 Detailed step-by-step setup
ARCHITECTURE.md                System design and patterns
API_TESTING.md                 API endpoint testing guide
PROJECT_SUMMARY.md             Project overview
FILE_STRUCTURE.md              This file
```

---

## 🔄 Data Flow Through Files

### User Signup Flow

```
1. UI Layer
   SignupForm.tsx
   ├─ Collect user input
   └─ Call /api/auth/signup

2. API Layer
   app/api/auth/signup/route.ts
   ├─ Parse request
   └─ Validate with Zod (validations.ts)

3. Service Layer
   services/authService.ts
   ├─ Check duplicate email
   ├─ Hash password (bcryptjs)
   └─ Call repository

4. Repository Layer
   repositories/userRepository.ts
   ├─ Call Prisma
   └─ Create user record

5. Database
   prisma/schema.prisma
   └─ User table

6. Response
   route.ts sends response back to SignupForm.tsx
```

### User Login Flow

```
1. UI Layer
   LoginForm.tsx
   ├─ Collect credentials
   └─ Call signIn() from next-auth

2. Auth Layer
   lib/auth.ts
   ├─ Validate input
   └─ Call authService.login()

3. Service Layer
   services/authService.ts
   ├─ Find user
   ├─ Compare password
   └─ Return user data

4. Auth.js
   ├─ Create JWT token
   ├─ Set HTTP-only cookie
   └─ Redirect

5. Protected Page
   app/(dashboard)/layout.tsx
   ├─ Check session
   └─ Render dashboard
```

### Protected Route Access

```
1. Middleware
   middleware.ts
   ├─ Check request path
   ├─ Verify session
   └─ Allow/deny

2. Layout Component
   app/(dashboard)/layout.tsx
   ├─ Call useSession()
   ├─ Check auth
   └─ Redirect if needed

3. Server Component
   app/(dashboard)/dashboard/page.tsx
   ├─ Call auth()
   ├─ Get user
   └─ Render content
```

---

## 📦 Dependencies & Their Purposes

### Core Framework
```
next@^14.2.1              React framework with App Router
react@^18.3.1            UI library
react-dom@^18.3.1        React DOM rendering
```

### Authentication
```
next-auth@^5.0.0          Session management & auth
bcryptjs@^2.4.3           Password hashing
```

### Database
```
prisma@^5.12.0            ORM library
@prisma/client@^5.12.0    ORM client
```

### Validation
```
zod@^3.22.4               Schema validation
```

### Styling
```
tailwindcss@^3.4.3        Utility CSS framework
autoprefixer@^10.4.19     CSS vendor prefixing
postcss@^8.4.38           CSS processing
```

### PWA
```
next-pwa@^5.6.0           Service worker & offline
```

### Development
```
typescript@^5.4.3         Type safety
eslint@^8.57.0            Code linting
@types/node@^20.12.10     Node.js type definitions
@types/react@^18.3.1      React type definitions
```

---

## 🔐 Security File Breakdown

### Password Security Files
```
services/authService.ts        bcryptjs password hashing
lib/validations.ts             Password strength requirements
lib/errors.ts                  Validation error handling
```

### Session Security Files
```
lib/auth.ts                    Auth.js configuration
middleware.ts                  Route protection
app/(dashboard)/layout.tsx     Session checking
```

### Input Validation Files
```
lib/validations.ts             Zod schemas
lib/errors.ts                  Error handling
app/api/**/*.ts                Server-side validation
```

### Data Access Security Files
```
repositories/userRepository.ts Prisma (SQL injection prevention)
lib/prisma.ts                  Prisma client config
prisma/schema.prisma           Database constraints
```

---

## 🧪 Testing-Related Files

### API Testing
```
API_TESTING.md                 Complete testing guide
app/api/auth/signup/route.ts   Tested endpoint
app/api/auth/profile/route.ts  Protected endpoint
lib/validations.ts             Validation test cases
```

### Manual Testing
```
components/LoginForm.tsx       Test login flow
components/SignupForm.tsx      Test signup flow
app/(auth)/login/page.tsx      Test UI
app/(dashboard)/dashboard/page.tsx Test protection
```

---

## 📈 Scalability-Ready Files

### Multi-Tenant Support
```
prisma/schema.prisma           Business model defined
prisma/schema.prisma           UserBusiness model defined
repositories/userRepository.ts Ready for business queries
```

### Extensible Architecture
```
services/authService.ts        Can add more services
repositories/userRepository.ts Repository pattern allows swapping
lib/**/*.ts                    Utilities for new features
```

### Future Phase Integration Points
```
prisma/schema.prisma           Product & Transaction models defined
services/                      Ready for new services
repositories/                  Ready for new repositories
app/api/                       Ready for new endpoints
```

---

## 🎨 UI/UX File Organization

### Pages
```
app/(auth)/login/page.tsx      Login interface
app/(auth)/signup/page.tsx     Signup interface
app/(dashboard)/dashboard/page.tsx User dashboard
```

### Components
```
components/FormInput.tsx       Reusable input
components/Button.tsx          Reusable button
components/Alert.tsx           Reusable alert
components/LoginForm.tsx       Login logic
components/SignupForm.tsx      Signup logic
```

### Styling
```
app/globals.css                Global Tailwind
tailwind.config.ts             Theme config
postcss.config.js              CSS processing
```

---

## 🚀 How to Add New Features

### Add New API Endpoint
```
1. Create lib/validations.ts schema
2. Create services/xyzService.ts logic
3. Create repositories/xyzRepository.ts (if db access needed)
4. Create app/api/xyz/route.ts endpoint
5. Add TypeScript types in types/
```

### Add New Page
```
1. Create component if needed in components/
2. Create app/xyz/page.tsx
3. Add route to layout if protected
4. Update types if needed
```

### Add New Service
```
1. Create services/xyzService.ts
2. Create repositories/xyzRepository.ts
3. Add types in types/
4. Use in API routes
```

### Update Database
```
1. Modify prisma/schema.prisma
2. Run npm run prisma:generate
3. Run npm run prisma:migrate
4. Update services & repositories
```

---

## 📊 Module Dependencies Map

```
UI Layer (Components & Pages)
    ↓ (uses)
Service Layer (Services)
    ↓ (uses)
Repository Layer (Repositories)
    ↓ (uses)
Prisma ORM (Database Access)
    ↓ (executes)
PostgreSQL (Database)

↓

Supporting Modules:
- Types (used throughout)
- Validations (used in Services & UI)
- Config (used throughout)
- Utils (used in API Routes)
- Errors (used throughout)
- Logger (used throughout)
- Auth (used in Middleware & Services)
```

---

## 📋 File Purpose Quick Reference

| File | Purpose | Depends On |
|------|---------|-----------|
| FormInput.tsx | Reusable form field | React |
| Button.tsx | Reusable button | React |
| Alert.tsx | Reusable alert | React |
| LoginForm.tsx | Login UI logic | next-auth |
| SignupForm.tsx | Signup UI logic | Fetch API |
| authService.ts | Auth logic | bcryptjs, userRepository |
| userService.ts | User logic | userRepository |
| userRepository.ts | DB access | Prisma |
| auth.ts | Auth.js config | next-auth |
| validations.ts | Input validation | Zod |
| middleware.ts | Route protection | next-auth |
| prisma.ts | DB client | @prisma/client |
| schema.prisma | DB schema | PostgreSQL |

---

## 🎯 Entry Points

### Application Entry Point
```
app/layout.tsx (Root layout)
    ↓
app/page.tsx (Home redirector)
    ↓
(auth) or (dashboard) route group
```

### Authentication Entry Point
```
app/(auth)/login/page.tsx
    ↓ (uses) components/LoginForm.tsx
    ↓ (calls) next-auth signIn()
    ↓ (triggers) lib/auth.ts
    ↓ (calls) services/authService.ts
```

### API Entry Point
```
app/api/auth/signup/route.ts
    ├─ Validates input
    ├─ Calls authService.signup()
    └─ Returns HTTP response
```

---

## 🔄 Data Model Relationships

### Users & Businesses (Multi-Tenant Ready)
```
User (1) ──→ (many) UserBusiness ←── (1) Business
   ↓                     ↓
   │                     └─ role (OWNER, MANAGER, STAFF)
   └─ Can own multiple businesses
      Can have staff role in other businesses
```

### Future POS Models
```
Business ──→ (many) Products
          ──→ (many) Transactions
          ──→ (many) Users (via UserBusiness)
```

---

## 💾 State Management Overview

### Client State
```
components/LoginForm.tsx      Local state for form
components/SignupForm.tsx     Local state for form
```

### Server State
```
lib/auth.ts                   JWT token in session
middleware.ts                 Session in request
app/(dashboard)/layout.tsx    useSession() hook
```

### Database State
```
prisma/schema.prisma          All persistent data
repositories/                 DB access methods
```

---

This file structure represents a **production-ready, enterprise-level codebase** that is:
- ✅ **Scalable** - Ready for multi-tenant SaaS
- ✅ **Maintainable** - Clear structure and responsibility
- ✅ **Secure** - Security at every layer
- ✅ **Testable** - Each component has single responsibility
- ✅ **Extensible** - Easy to add new features

Happy coding! 🚀
