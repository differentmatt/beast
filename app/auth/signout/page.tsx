'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function SignOut() {
  useEffect(() => {
    // Automatically sign out when the page loads
    signOut({ redirect: false });
  }, []);

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              You have been signed out
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for using our application
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}