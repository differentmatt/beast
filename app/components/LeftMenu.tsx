'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function LeftMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoading = status === 'loading';

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="menu">
      <h3>Beast</h3>

      {/* Show loading indicator when session status is loading */}
      {isLoading && (
        <div className="loading-indicator">Loading...</div>
      )}

      {/* Show these links only when user is signed in */}
      {!isLoading && session && (
        <>
          <Link href="/" className={isActive('/') ? 'active' : ''}>
            Play
          </Link>
          <Link href="/settings" className={isActive('/settings') ? 'active' : ''}>
            Settings
          </Link>
        </>
      )}

      {/* Show these links only when user is signed out */}
      {!isLoading && !session && (
        <>
          <Link href="/auth/signin" className={isActive('/auth/signin') ? 'active' : ''}>
            Sign In
          </Link>
          <Link href="/auth/signup" className={isActive('/auth/signup') ? 'active' : ''}>
            Sign Up
          </Link>
        </>
      )}
    </nav>
  );
}