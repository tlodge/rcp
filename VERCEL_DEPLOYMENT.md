# Vercel Deployment Guide

This guide will help you deploy this multi-tenant portal to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (recommended: [Neon](https://neon.tech) - serverless PostgreSQL)
3. GitHub/GitLab/Bitbucket account (for Git integration)

## Step 1: Set Up PostgreSQL Database

### Option A: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy your connection string (it looks like `postgresql://user:password@host.neon.tech/dbname`)
4. You can also use Neon's branch feature for separate staging/production databases

### Option B: Other PostgreSQL Providers

- Vercel Postgres
- Supabase
- Railway
- AWS RDS
- Any other PostgreSQL database

## Step 2: Update Prisma Schema for Production

The current schema uses SQLite. For production on Vercel, you need PostgreSQL. You have two options:

### Option A: Use PostgreSQL for Both Local and Production (Recommended)

Update `prisma/schema.prisma` to use PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then use Neon for local development too by setting `DATABASE_URL` to your Neon connection string.

### Option B: Keep SQLite Locally, PostgreSQL in Production

Keep the schema as is (SQLite) for local dev. In Vercel, the build process will handle the switch. The code in `lib/prisma.ts` already detects the database type automatically.

However, **Prisma requires the provider to match at generation time**, so you'll need to:
1. Maintain separate schema files, OR
2. Use a build script that switches providers before building

**Recommended**: Use Option A (PostgreSQL for both) for simplicity.

## Step 3: Configure Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

### Required Variables

```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname
PORTAL_PRIMARY_DOMAIN=yourdomain.com
```

### Optional Variables

```
# Demo mode (set to "false" for production)
DEMO=true

# Blink Webhook (if using Blink payment integration)
BLINK_WEBHOOK_SECRET=your-webhook-secret

# Email (if using Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com

# NextAuth (if using email authentication)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

**To generate `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

### Setting Variables for Different Environments

You can set different values for:
- **Production**
- **Preview** (for pull requests)
- **Development**

Set `DATABASE_URL` for each environment appropriately.

## Step 4: Update Build Configuration

### Update `package.json` Build Script

The current build script runs database initialization. For Vercel, update it to handle PostgreSQL migrations:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

However, since you're using `db push` instead of migrations, you might want:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

And handle schema deployment separately (see Step 5).

### For SQLite (Local) + PostgreSQL (Production)

If keeping SQLite locally, you'll need to conditionally switch schemas. Update your build script:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma db push --skip-generate && next build",
    "postinstall": "prisma generate"
  }
}
```

## Step 5: Deploy the Schema

Before your first deployment, deploy the Prisma schema to your PostgreSQL database:

### Using Prisma Migrate (Recommended for Production)

1. Create an initial migration:
```bash
npx prisma migrate dev --name init
```

2. Deploy the migration:
```bash
npx prisma migrate deploy
```

### Using Prisma Push (Quick, but less version control)

```bash
npx prisma db push
```

**Note**: You can also run this after deployment by connecting to your Vercel function's environment, but it's better to do it beforehand.

## Step 6: Seed Production Database (Optional)

After deploying the schema, you may want to seed production data. **Be careful** - only do this if you want test data in production:

```bash
DATABASE_URL=your-production-database-url npx tsx prisma/seed.tsx
```

Or create a script endpoint that you can call once manually.

## Step 7: Configure Vercel Project

1. Import your repository to Vercel
2. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (or `npm run vercel-build` if using conditional setup)
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. Add your environment variables (from Step 3)

4. Deploy!

## Step 8: Set Up Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

For multi-tenant subdomains:
- Add wildcard domain: `*.yourdomain.com`
- Or add each tenant subdomain individually

## Step 9: Configure DNS for Multi-Tenant

To support subdomain routing:

1. Add a wildcard CNAME record in your DNS:
   ```
   *.yourdomain.com → cname.vercel-dns.com
   ```

2. Or add individual subdomains:
   ```
   rcpmanagement.yourdomain.com → cname.vercel-dns.com
   rcpgroup.yourdomain.com → cname.vercel-dns.com
   rcpproperty.yourdomain.com → cname.vercel-dns.com
   rcpgroundrent.yourdomain.com → cname.vercel-dns.com
   ```

## Troubleshooting

### Database Connection Issues

- Ensure `DATABASE_URL` is set correctly in Vercel environment variables
- Check that your database allows connections from Vercel IPs (Neon does this automatically)
- For serverless databases, ensure connection pooling is configured

### Build Failures

- Ensure `prisma generate` runs during build (it should via `postinstall`)
- Check that all environment variables are set
- Review build logs in Vercel dashboard

### Edge Runtime Issues

- The middleware uses Edge runtime, which doesn't support all Node.js APIs
- The current setup with lazy Prisma imports should work, but if you see Edge runtime errors, you may need to adjust `lib/prisma.ts`

### Prisma Client Not Found

- Add `postinstall` script: `"postinstall": "prisma generate"`
- Or ensure `prisma generate` runs in your build command

## Recommended Production Setup

1. **Database**: Neon (serverless, scales automatically)
2. **Environment Variables**: Set in Vercel dashboard
3. **Migrations**: Use Prisma Migrate for schema versioning
4. **Seeding**: Only run manually, not as part of build
5. **Monitoring**: Use Vercel Analytics and your database provider's monitoring

## Next Steps After Deployment

1. Set up database backups
2. Configure monitoring and alerts
3. Set up staging environment (separate Vercel project with separate database)
4. Review security settings (disable demo mode, enable real auth)
5. Set up CI/CD if not using Vercel's Git integration

