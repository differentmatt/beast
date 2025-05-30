import Link from "next/link"
import AuthForm from "@/app/components/AuthForm"

export default function SignupPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Enter your details to create a new account</p>
        </div>
        <AuthForm type="signup" />
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="underline underline-offset-4 hover:text-primary">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
