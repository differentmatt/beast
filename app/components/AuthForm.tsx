"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Alert, AlertDescription } from "@/app/components/ui/alert"

interface AuthFormProps {
  type: "signin" | "signup"
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (type === "signup") {
        // Validate form
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }

        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long")
        }

        // Register the user
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: username,
            email,
            password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Something went wrong")
        }

        // Sign in the user after successful registration
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        })

        if (result?.error) {
          throw new Error("Failed to sign in after registration")
        }
      } else {
        // Handle login
        const result = await signIn("credentials", {
          redirect: false,
          emailOrUsername: email,
          password,
        })

        if (result?.error) {
          throw new Error("Invalid credentials")
        }
      }

      // Redirect to the home page
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Authentication error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {type === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">{type === "signin" ? "Email or Username" : "Email"}</Label>
        <Input
          id="email"
          type={type === "signin" ? "text" : "email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {type === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : type === "signin" ? "Sign In" : "Sign Up"}
      </Button>
    </form>
  )
}
