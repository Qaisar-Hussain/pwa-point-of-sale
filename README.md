# POS SaaS - Progressive Web App

A production-grade PWA-based Point of Sale system built with Next.js 14+, featuring secure authentication infrastructure designed to scale into a multi-tenant SaaS platform.

## Features Implemented

### Authentication
- ✅ Email + Password signup with validation
- ✅ Email + Password login
- ✅ Password hashing with bcryptjs
- ✅ Secure session management with Auth.js
- ✅ JWT-based authentication
- ✅ Protected routes with middleware
- ✅ User profile management

### Technology Stack
- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth)
- **Validation**: Zod
- **Password Security**: bcryptjs
- **PWA**: next-pwa

### Architecture
- Clean separation of concerns (UI, Services, Repositories)
- Type-safe API responses with Zod schemas
- Database layer abstraction with repositories
- Environment-based configuration
- Middleware authentication guards
- Multi-tenant ready database schema

### UI Components
- Responsive login/signup pages
- Form validation and error handling
- User dashboard with account information
- Alert system with multiple types
- Loading states and animations

### PWA Features
- Installable on mobile and desktop
- Service worker support
- Offline-first architecture ready
- manifest.json for PWA installation
- Mobile-friendly responsive design

## Project Structure

```
/src
├── /app                           # Next.js App Router
│   ├── /(auth)                   # Auth route group
│   │   ├── /login                # Login page
│   │   ├── /signup               # Signup page
│   │   └── /layout.tsx
│   ├── /(dashboard)              # Protected dashboard
│   │   ├── /dashboard            # Dashboard page
│   │   └── /layout.tsx
│   ├── /api                       # API routes
│   │   └── /auth
│   │       ├── /[...nextauth]    # Auth.js handler
│   │       ├── /signup           # Signup endpoint
│   │       └── /profile          # User profile endpoint
│   ├── /layout.tsx               # Root layout
│   ├── /page.tsx                 # Home redirector
│   └── /globals.css              # Global styles
├── /components                    # Reusable React components
│   ├── FormInput.tsx             # Form input component
│   ├── Button.tsx                # Button component
│   ├── Alert.tsx                 # Alert component
│   ├── LoginForm.tsx             # Login form
│   └── SignupForm.tsx            # Signup form
├── /lib                           # Utilities and configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # Auth.js configuration
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # API response helpers
├── /services                      # Business logic
│   └── authService.ts            # Authentication service
├── /repositories                  # Data access layer
│   └── userRepository.ts         # User database operations
├── /types                         # TypeScript types
│   └── auth.ts                   # Authentication types
└── /middleware.ts                 # Route protection middleware
/prisma
├── /schema.prisma                 # Database schema
/public
├── /manifest.json                # PWA manifest
├── /robots.txt                   # SEO robots file
└── /icons                        # PWA icons (to be added)
```

## Database Schema

### User Model
- `id` (UUID) - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password with bcryptjs
- `role` - ADMIN or STAFF
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Business Model (for multi-tenant support)
- `id` - Business identifier
- `name` - Business name
- `ownerId` - Reference to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### UserBusiness Model (for multi-tenant support)
- `id` - Record identifier
- `userId` - Reference to User
- `businessId` - Reference to Business
- `role` - User's role in this business (OWNER, MANAGER, STAFF)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Future Models (placeholders)
- `Product` - Inventory management
- `Transaction` - Sales transactions

## Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn
- PostgreSQL database (local or Vercel Postgres)

### 2. Clone and Setup

```bash
# Clone repository
git clone <repo-url>
cd pwa-point-of-sale

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### 3. Configure Environment Variables

Edit `.env.local` with your settings:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/pos_saas"

# Auth.js configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Optional
SITE_URL="http://localhost:3000"
```

### 4. Generate Auth Secret

If you don't have `openssl` available:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as `NEXTAUTH_SECRET`.

### 5. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Optional: Open Prisma Studio to view database
npm run prisma:studio
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account.

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!@#"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF"
  },
  "message": "User created successfully"
}
```

#### POST `/api/auth/signin` (via Auth.js)
Authenticate user with email and password.

#### GET `/api/auth/profile`
Get authenticated user profile (requires session).

Request Headers:
```
Authorization: Bearer <session-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF"
  }
}
```

## Security Features

### Implemented
- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Prisma ORM
- ✅ XSS protection through React's built-in sanitization
- ✅ CSRF protection via Auth.js
- ✅ Environment variable protection for secrets
- ✅ Secure session tokens with JWT
- ✅ HTTP-only cookies for session storage
- ✅ Route protection with middleware
- ✅ Password requirements enforcement

### Best Practices Followed
- Separate business logic from UI components
- Never expose passwords or sensitive data to client
- Validate on both client and server
- Use prepared statements (Prisma ORM)
- Implement proper error handling
- Use secure headers and cookies

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Set database connection string (Vercel Postgres)
5. Deploy

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Future Features (Roadmap)

### Phase 2: POS Core
- Point of Sale interface
- Product & inventory management
- Sales transactions
- Stock management
- Discounts and promotions

### Phase 3: Multi-Business SaaS
- Multi-tenant support (already in schema)
- Business management dashboard
- Team management
- Role-based access control (RBAC)
- Business analytics

### Phase 4: Advanced Features
- Blockchain integration
- Cryptocurrency payments
- Crypto rewards system
- Loyalty program
- Online store integration
- Sync capabilities

### Phase 5: Analytics & Reporting
- Real-time sales dashboard
- Revenue reports
- Inventory tracking
- Customer analytics
- Export functionality

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Run linter
npm run lint
```

## Password Requirements

The system enforces strong password requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

Example: `SecurePass123!`

## Validation Rules

### Signup
- **Name**: 2-100 characters
- **Email**: Valid email format
- **Password**: Strong password (see above)

### Login
- **Email**: Valid email format
- **Password**: Required (any format on login)

## Session Management

- Session duration: 30 days
- Token storage: HTTP-only cookies (secure)
- Strategy: JWT-based
- Refresh: Automatic on activity

## File Upload (Future)

The project is prepared for file uploads:
- Images for products
- Business logos
- User avatars
- Documents

## Email Integration (Future)

Ready for email service integration:
- Welcome emails
- Password reset
- Notifications
- Receipts

## Testing (Future)

Prepare for testing with:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright/Cypress)

## Troubleshooting

### Database Connection Issues
1. Verify `DATABASE_URL` in `.env.local`
2. Ensure PostgreSQL is running
3. Check database credentials
4. Run `npm run prisma:migrate` to sync schema

### Authentication Not Working
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Clear browser cookies and try again
4. Check server logs for errors

### Session Issues
1. Clear browser cache and cookies
2. Restart development server
3. Check `.env.local` configuration
4. Verify NEXTAUTH_SECRET is not empty

## Support

For issues and questions:
1. Check `/docs` for detailed documentation
2. Review code comments in components
3. Check database schema in `prisma/schema.prisma`

## License

Private - Proprietary Software

---

Built with ❤️ using Next.js and modern web technologies.
