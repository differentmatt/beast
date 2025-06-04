"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Play, Star, Plus, Lock, Edit } from "lucide-react"
import Link from "next/link"
import { campaignLevels, userLevels } from "@/app/data/levels"
import { Suspense } from "react"

function LevelSelectorContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "campaign"

  const formatLevelName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Find the first incomplete level
  const firstIncompleteLevelIndex = campaignLevels.findIndex((level) => !level.completed)

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Select Level</h1>
        </div>

        <Tabs defaultValue={tab === "your-levels" ? "your-levels" : "campaign"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="your-levels">Your Levels</TabsTrigger>
          </TabsList>

          <TabsContent value="campaign" className="space-y-2 mt-4">
            <div className="space-y-1">
              {campaignLevels.map((level, index) => {
                // Determine if this level is playable
                const isPlayable = level.completed || index === firstIncompleteLevelIndex || index === 0

                return (
                  <div
                    key={level.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {level.completed && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        <span className="font-medium">{level.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                        <span>B:{level.beasts}</span>
                        <span>S:{level.superBeasts}</span>
                        <span>E:{level.eggs}</span>
                        <span>
                          {level.width}×{level.height}
                        </span>
                        <span>×{level.gameSpeed}</span>
                      </div>

                      {isPlayable ? (
                        <Button asChild size="sm">
                          <Link href={`/play?level=${level.id}`}>
                            <Play className="h-3 w-3 mr-1" />
                            {level.completed ? "Play" : "Start"}
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled>
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="your-levels" className="space-y-2 mt-4">
            <div className="space-y-1">
              {userLevels.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{level.name}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(level.createdDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                      <span>B:{level.beasts}</span>
                      <span>S:{level.superBeasts}</span>
                      <span>E:{level.eggs}</span>
                      <span>
                        {level.width}×{level.height}
                      </span>
                      <span>×{level.gameSpeed}</span>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/create-level?id=${level.id}`}>
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </Button>

                    <Button asChild size="sm">
                      <Link href={`/play?level=${level.id}`}>
                        <Play className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Play</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/create-level">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Level
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Export the default component with Suspense boundary
export default function LevelSelector() {
  return (
    <Suspense fallback={<div className="flex-1 p-6 flex items-center justify-center">Loading levels...</div>}>
      <LevelSelectorContent />
    </Suspense>
  )
}
