import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in or sign up to access your account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            Your App Name
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Welcome back
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}