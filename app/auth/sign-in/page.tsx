'use client';

import Link from "next/link"
import AuthForm from "@/app/components/AuthForm"

export default function SignInPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <AuthForm type="signin" />
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </div>
        </div>
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/new-user" className="font-medium text-indigo-600 hover:text-indigo-500">
            New User
          </Link>
        </p>
      </div>
    </div>
  )
}
