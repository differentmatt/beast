# Beast

Testing latest AI coding tools by building a clone of classic [MS-DOS game Beast](https://en.wikipedia.org/wiki/Beast_\(video_game\)).

## Technical Features

- Built with Next.js and React
- User authentication with NextAuth.js
- Responsive design for various screen sizes
- Prisma ORM with SQLite for development
- Ready for PostgreSQL deployment on Vercel

## Development

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd beast
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file with required NextAuth and database configuration
   - Generate a secure NEXTAUTH_SECRET using `openssl rand -base64 32`

3. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application is configured for easy deployment on Vercel:

1. For production, it's recommended to use PostgreSQL instead of SQLite:
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in your environment variables
   - Change the provider in `prisma/schema.prisma` to `postgresql`

2. Set up the required environment variables:
   - `NEXTAUTH_SECRET`: A secure random string (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Your production URL (after deployment)
   - `DATABASE_URL`: Your database connection string

3. Deploy to Vercel through their GitHub integration or CLI

## Authentication

The application uses NextAuth.js for authentication with email/password by default. Additional providers (Google, GitHub, etc.) can be added by:

1. Installing the required packages
2. Adding provider credentials to environment variables
3. Updating the `auth.ts` file with the new provider configuration

## License

[MIT](LICENSE)
