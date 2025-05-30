'use client';

import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
      <Link href="/api/auth/signout">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </Link>
    </Button>
  );
}