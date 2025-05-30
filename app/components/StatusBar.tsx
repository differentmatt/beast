interface StatusBarProps {
  beastsLeft: number
  level: number
  time: number
  lives: number
  score: number
}

export default function StatusBar({ beastsLeft, level, time, lives, score }: StatusBarProps) {
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex gap-2 sm:gap-6 text-xs sm:text-sm items-center">
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground">
          <span className="hidden sm:inline">Beasts</span>
          <span className="sm:hidden">B</span>
        </span>
        <span className="font-bold">{beastsLeft}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground">
          <span className="hidden sm:inline">Level</span>
          <span className="sm:hidden">L</span>
        </span>
        <span className="font-bold">{level}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground">
          <span className="hidden sm:inline">Time</span>
          <span className="sm:hidden">T</span>
        </span>
        <span className="font-bold font-mono">{formatTime(time)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground">
          <span className="hidden sm:inline">Lives</span>
          <span className="sm:hidden">♥</span>
        </span>
        <span className="font-bold">{lives}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground">
          <span className="hidden sm:inline">Score</span>
          <span className="sm:hidden">S</span>
        </span>
        <span className="font-bold">{score}</span>
      </div>
    </div>
  )
}
