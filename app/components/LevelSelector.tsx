"use client"

import { Button } from "@/app/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Play, Star, Plus, Lock, Edit } from "lucide-react"
import Link from "next/link"

// Campaign levels data
const campaignLevels = [
  {
    id: 1,
    name: "forest-clearing",
    beasts: 3,
    superBeasts: 0,
    eggs: 2,
    height: 10,
    width: 10,
    gameSpeed: 0.8,
    completed: true,
  },
  {
    id: 2,
    name: "dark-woods",
    beasts: 5,
    superBeasts: 1,
    eggs: 3,
    height: 12,
    width: 12,
    gameSpeed: 1.0,
    completed: true,
  },
  {
    id: 3,
    name: "mountain-peak",
    beasts: 8,
    superBeasts: 2,
    eggs: 4,
    height: 15,
    width: 15,
    gameSpeed: 1.2,
    completed: false,
  },
  {
    id: 4,
    name: "crystal-caves",
    beasts: 12,
    superBeasts: 3,
    eggs: 6,
    height: 18,
    width: 18,
    gameSpeed: 1.5,
    completed: false,
  },
]

// User levels data
const userLevels = [
  {
    id: 101,
    name: "speed-arena",
    beasts: 4,
    superBeasts: 0,
    eggs: 1,
    height: 8,
    width: 8,
    gameSpeed: 1.3,
    createdDate: "2024-01-15",
  },
  {
    id: 102,
    name: "maze-challenge",
    beasts: 6,
    superBeasts: 2,
    eggs: 3,
    height: 20,
    width: 20,
    gameSpeed: 0.9,
    createdDate: "2024-01-10",
  },
  {
    id: 103,
    name: "peaceful-garden",
    beasts: 2,
    superBeasts: 0,
    eggs: 5,
    height: 12,
    width: 12,
    gameSpeed: 0.7,
    createdDate: "2024-01-08",
  },
]

export default function LevelSelector() {
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

        <Tabs defaultValue="campaign" className="w-full">
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
                        <span className="font-medium">{formatLevelName(level.name)}</span>
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
                      <span className="font-medium">{formatLevelName(level.name)}</span>
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
