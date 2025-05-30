# Beast

Testing latest AI coding tools by building a clone of classic [MS-DOS game Beast](https://en.wikipedia.org/wiki/Beast_(video_game).

## Game Features

- Procedurally generated levels with increasing difficulty
- Grid-based movement and block pushing mechanics
- Strategic gameplay focused on trapping beasts
- Level progression system
- Time tracking and beast counting

## Technical Features

- Built with Next.js and React
- User authentication with NextAuth.js
- Responsive design for various screen sizes
- Prisma ORM with SQLite for development
- Ready for PostgreSQL deployment on Vercel

## How to Play

- Use arrow keys or WASD to move your character (▲) around the grid
- Push blocks (■) to trap beasts (H)
- A beast is eliminated when it's trapped with no way to escape
- Complete a level by eliminating all beasts
- Press 'N' to advance to the next level during testing
- Press Space or Enter to restart after game over or to advance after completing a level

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

## Project Structure

- `app/` - Next.js application code
  - `api/` - API routes
  - `auth/` - Authentication pages
  - `components/` - React game components (Game, StatusBar, etc.)
  - `lib/` - Utility functions and database client
  - `types/` - TypeScript type definitions
  - `utils/` - Game utilities (levelManager, gameUtils)
- `prisma/` - Prisma schema and database configuration
- `public/` - Static assets

## License

[MIT](LICENSE)

## About

Beast is a challenging puzzle game inspired by classic grid-based games where strategic thinking and planning are key to success. The procedural level generation ensures a unique experience with each playthrough, while the difficulty progression keeps the game challenging as players advance.
