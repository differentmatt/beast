"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { GamepadIcon as GameController, LogIn, UserPlus, ArrowLeft, List, Edit, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import SignOutButton from "./SignOutButton"
import { useState, useEffect } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const searchParams = useSearchParams()
  const [editingLevelName, setEditingLevelName] = useState<string>("")

  // Get current level info when playing
  const currentLevelId = searchParams.get("level")
  const editingLevelId = searchParams.get("id") // For edit mode

  const getLevelName = (id: string | null) => {
    if (!id) return ""
    const allLevels = {
      "1": "Level 1",
      "2": "Level 2",
      "3": "Level 3",
      "4": "Level 4",
      "101": "Speed Arena",
      "102": "Maze Challenge",
      "103": "Peaceful Garden",
    }
    return allLevels[id as keyof typeof allLevels] || `Level ${id}`
  }

  // Load level name when editing
  useEffect(() => {
    if (pathname === "/create-level" && editingLevelId) {
      const levelName = getLevelName(editingLevelId)
      setEditingLevelName(levelName)
    }
  }, [pathname, editingLevelId])


  const isPlayingGame = pathname === "/play"
  const isCreatingLevel = pathname === "/create-level"
  const isEditingLevel = isCreatingLevel && !!editingLevelId
  const currentLevelName = getLevelName(currentLevelId)

    return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
      <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <GameController className="h-5 w-5" />
            <span>Beast</span>
          </Link>

          {/* Navigation based on current page */}
          {isPlayingGame ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Levels</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              {currentLevelName && (
                <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Playing:</span>
                  <span className="font-medium">{currentLevelName}</span>
                </div>
              )}
            </div>
          ) : isCreatingLevel ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Levels</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm">
                {isEditingLevel ? (
                  <>
                    <Edit className="h-4 w-4" />
                    <span className="font-medium">Edit Level</span>
                    {editingLevelName && (
                      <span className="hidden sm:inline text-muted-foreground">- {editingLevelName}</span>
                    )}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Create Level</span>
                  </>
                )}
              </div>
            </div>
          ) : pathname === "/" ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Level Selection</span>
              <span className="sm:hidden">Levels</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoading ? (
            <div>Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <span className="text-sm text-muted-foreground">
                {session.user?.name || session.user?.email}
                </span>
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <>
              <Button
                variant={pathname === "/auth/sign-in" ? "secondary" : "ghost"}
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <Link href="/auth/sign-in">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
              <Button
                variant={pathname === "/auth/new-user" ? "secondary" : "ghost"}
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <Link href="/auth/new-user">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">New User</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
