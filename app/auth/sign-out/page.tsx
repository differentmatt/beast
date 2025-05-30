'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOut() {
  useEffect(() => {
    // Sign out and redirect to home page
    signOut({ callbackUrl: '/' });
  }, []);

  return null;
}