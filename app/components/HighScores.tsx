"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Trophy } from "lucide-react"
import { getHighScores, formatScoreDate, type HighScoreEntry } from "@/app/utils/highScores"

interface HighScoresProps {
  refreshTrigger?: number // Increment to refresh scores
  compact?: boolean // Compact mode for sidebar display
}

export default function HighScores({ refreshTrigger, compact = false }: HighScoresProps) {
  const [scores, setScores] = useState<HighScoreEntry[]>([])

  useEffect(() => {
    setScores(getHighScores())
  }, [refreshTrigger])

  if (scores.length === 0) {
    return (
      <Card className={compact ? "bg-transparent border-0 shadow-none" : ""}>
        <CardHeader className={compact ? "pb-2 px-0" : ""}>
          <CardTitle className="flex items-center gap-2 text-sm font-dos">
            <Trophy className="h-4 w-4 text-yellow-500" />
            High Scores
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? "px-0" : ""}>
          <p className="text-xs text-muted-foreground font-dos">No high scores yet. Be the first!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={compact ? "bg-transparent border-0 shadow-none" : ""}>
      <CardHeader className={compact ? "pb-2 px-0" : ""}>
        <CardTitle className="flex items-center gap-2 text-sm font-dos">
          <Trophy className="h-4 w-4 text-yellow-500" />
          High Scores
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "px-0" : ""}>
        <div className="space-y-1">
          {scores.map((entry, index) => (
            <div
              key={`${entry.name}-${entry.date}`}
              className={`flex items-center justify-between text-xs font-dos ${
                index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-600" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-right">{index + 1}.</span>
                <span className="truncate max-w-[80px]">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{entry.score.toLocaleString()}</span>
                {!compact && (
                  <span className="text-muted-foreground text-[10px]">L{entry.level}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
