import LevelSelector from "@/app/components/LevelSelector"
import { getServerSession } from "@/app/auth"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Beast</h1>
        <p className="text-muted-foreground text-center">Please sign in to continue</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/new-user">Sign Up</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <LevelSelector />
    </div>
  )
}
