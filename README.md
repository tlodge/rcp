# Multi-Tenant Property Management Portal

A Next.js 14 application with multi-tenant architecture, custom authentication, and Prisma ORM.

## Features

- Multi-tenant architecture with subdomain routing
- Custom session-based authentication (demo mode)
- Prisma ORM with SQLite (local) / PostgreSQL (production)
- TypeScript and CSS Modules
- Clean design system with CSS tokens

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Copy `.env.example` to `.env` and fill in the required values:

\`\`\`bash
cp .env.example .env
\`\`\`

4. Initialize the database (generates Prisma client, pushes schema, and seeds data):

\`\`\`bash
npm run db:init
\`\`\`

Or run steps individually:

\`\`\`bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:seed      # Seed with test data
\`\`\`

### Development

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Testing Multi-Tenant Locally

To test subdomains locally, add these entries to your `/etc/hosts` file:

\`\`\`
127.0.0.1 rcpmanagement.localhost
127.0.0.1 rcpgroup.localhost
127.0.0.1 rcpproperty.localhost
127.0.0.1 rcpgroundrent.localhost
\`\`\`

Then access:
- http://localhost:3000 (apex domain - group landing)
- http://rcpmanagement.localhost:3000
- http://rcpgroup.localhost:3000
- http://rcpproperty.localhost:3000
- http://rcpgroundrent.localhost:3000

### Demo Users

After seeding, you can use these test accounts:

- **Admin**: admin@rcpgroup.com
- **Demo User**: demo@example.com

**Demo Mode Authentication:**

The application runs in demo mode with simplified authentication. Simply enter any email address on the sign-in page to authenticate instantly without email verification. This is perfect for development and testing in the v0 environment.

**For Production:**

To enable real email authentication with magic links via Resend and NextAuth:

1. Install NextAuth and Resend:
\`\`\`bash
npm install next-auth @next-auth/prisma-adapter resend
\`\`\`

2. Get a Resend API key from https://resend.com

3. Add environment variables:
\`\`\`
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@yourdomain.com"
\`\`\`

4. Replace the custom auth system in `lib/auth.ts` with NextAuth configuration

5. Update API routes to use NextAuth handlers

## Project Structure

\`\`\`
├── app/
│   ├── (tenant)/          # Tenant-specific routes
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   └── page.tsx           # Apex domain landing
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # Custom auth system
│   ├── prisma.ts         # Prisma client
│   └── tenant.ts         # Multi-tenant helpers
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── styles/               # Global styles and tokens
└── middleware.ts         # Multi-tenant middleware
\`\`\`

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: Database connection string
- `PORTAL_PRIMARY_DOMAIN`: Primary domain for tenant routing
- `DEMO`: Enable demo mode (true/false)
- `BLINK_WEBHOOK_SECRET`: Secret for Blink webhook verification

Optional (for production email auth):
- `RESEND_API_KEY`: Resend API key for email
- `EMAIL_FROM`: Email sender address

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/auth/signin` - Sign in endpoint
- `POST /api/auth/signout` - Sign out endpoint
- `POST /api/verify-email` - Email verification (placeholder for MRI integration)

## Database Schema

The application uses Prisma with the following main models:

- **Tenant**: Multi-tenant configuration
- **User**: User accounts with roles
- **UserAccountLink**: Links users to tenant accounts
- **Transaction**: Financial transactions
- **BalanceSnapshot**: Account balance history
- **FormDefinition**: Dynamic form configurations
- **FormSubmission**: Form submission data
- **TenantMessage**: Tenant-specific messages

## License

MIT
