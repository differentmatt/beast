# Deploying to Vercel with Neon Postgres

This document outlines the steps to deploy this Next.js application to Vercel using Neon Postgres as the database.

## Prerequisites

- A Neon account and project
- A Vercel account
- Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Setup Steps

### 1. Get Your Neon Connection String

1. Log in to your Neon account at [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Go to the "Connection Details" section
4. Copy the connection string that looks like:
   ```
   postgresql://[username]:[password]@[neon-host]/[database]?sslmode=require
   ```
5. Add the following parameters to optimize for serverless:
   ```
   &connection_limit=5&pool_timeout=2
   ```

### 2. Configure Vercel Project

1. Log in to your Vercel account
2. Import your Git repository
3. Configure the following environment variables in the Vercel dashboard:
   - `DATABASE_URL`: Your Neon connection string from step 1
   - `NEXTAUTH_URL`: Your production URL (e.g., https://your-app.vercel.app)
   - `NEXTAUTH_SECRET`: Your NextAuth secret key

   For optimal Prisma performance in Vercel's serverless environment, also add these environment variables:
   - `PRISMA_SCHEMA_ENGINE_BINARY`: `/tmp/prisma-schema-engine`
   - `PRISMA_QUERY_ENGINE_BINARY`: `/tmp/prisma-query-engine`
   - `PRISMA_MIGRATION_ENGINE_BINARY`: `/tmp/prisma-migration-engine`
   - `PRISMA_FMT_BINARY`: `/tmp/prisma-fmt`

### 3. Deploy Your Project

1. Complete the import process in Vercel
2. Vercel will automatically build and deploy your project
3. The build process will:
   - Generate the Prisma client
   - Apply any pending migrations to your Neon database
   - Build your Next.js application

### 4. Verify the Deployment

1. Once deployed, visit your Vercel URL
2. Verify that your application is working correctly with the Neon database
3. Check the Vercel logs if you encounter any issues

## Local Development

For local development, the application uses SQLite:

1. The `.env.local` file contains the SQLite connection string
2. Run `npm run dev` to start the development server
3. The application will use the local SQLite database

## Database Migrations

When you make changes to your Prisma schema:

1. For local development:
   ```bash
   npx prisma migrate dev --name your-migration-name
   ```

2. For production (before deploying):
   ```bash
   # Use your Neon connection string
   DATABASE_URL="your-neon-connection-string" npx prisma migrate dev --name your-migration-name
   ```

## Troubleshooting

### Connection Issues

If you encounter database connection issues:

1. Verify your Neon connection string in Vercel environment variables
2. Check that your IP is allowed in Neon's connection settings
3. Ensure your Neon project is active and not in sleep mode

### Migration Issues

If migrations fail during deployment:

1. Try running migrations manually:
   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
   ```

2. Check the Prisma migration history:
   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma migrate status
   ```

### Performance Optimization

If you encounter performance issues:

1. Consider enabling Prisma Accelerate for better connection pooling
2. Optimize your database queries
3. Consider adding indexes to frequently queried fields