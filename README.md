# Beast - ASCII Clone with NextAuth.js Authentication

This project is a Next.js application with user authentication implemented using NextAuth.js. It's designed to be deployed on Vercel.

## Features

- User authentication with NextAuth.js
- Email/password sign-in and registration
- Protected routes
- User profiles
- Responsive design
- SQLite database for development
- Ready for PostgreSQL deployment on Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd beast
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env` file and update the values as needed
   - Generate a secure NEXTAUTH_SECRET using `openssl rand -base64 32`

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Configuration

- For development, the application uses SQLite
- For production on Vercel, you should use a PostgreSQL database:
  1. Create a PostgreSQL database on Vercel or another provider
  2. Update the `DATABASE_URL` in your environment variables
  3. Update the `provider` in `prisma/schema.prisma` to `postgresql`

## Deploying on Vercel

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "New Project" and import your repository
   - Configure the project settings

3. Set up environment variables in the Vercel dashboard:
   - `NEXTAUTH_SECRET`: A secure random string
   - `DATABASE_URL`: Your PostgreSQL connection string
   - Any other provider credentials (Google, GitHub, etc.)

4. Deploy the project

5. After deployment, update the `NEXTAUTH_URL` in your environment variables to match your production URL

## Authentication Providers

The application is set up with email/password authentication. To add more providers:

1. Install the required packages
2. Add provider credentials to your environment variables
3. Update the `auth.ts` file to include the new providers

Example for adding Google authentication:

```typescript
import GoogleProvider from 'next-auth/providers/google';

// In the providers array:
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!
}),
```

## Project Structure

- `app/` - Next.js application code
  - `api/` - API routes
  - `auth/` - Authentication pages
  - `components/` - React components
  - `lib/` - Utility functions
  - `types/` - TypeScript type definitions
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets

## License

[MIT](LICENSE)
