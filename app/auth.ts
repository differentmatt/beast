import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession as getNextAuthServerSession } from 'next-auth';
import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { User } from 'next-auth';
import prisma from './lib/prisma';
import { verifyPassword } from './lib/auth';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        emailOrUsername: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          return null;
        }

        // Try to find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.emailOrUsername },
              { name: credentials.emailOrUsername }
            ]
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
    // You can add more providers here like Google, GitHub, etc.
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    // }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    error: '/auth/error',
    newUser: '/auth/new-user',
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT; user?: User }) {
      console.log('NextAuth session callback - token present:', !!token);
      if (token && session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('NextAuth JWT callback - user present:', !!user, 'account present:', !!account);
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth debug:', code, metadata);
    }
  },
};

// Helper function to get the session on the server side
export async function getServerSession() {
  try {
    const session = await getNextAuthServerSession(authOptions);
    return session;
  } catch (error) {
    console.error('getServerSession: Error getting session:', error);
    return null;
  }
}