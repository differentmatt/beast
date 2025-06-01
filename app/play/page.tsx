"use client"

import dynamic from 'next/dynamic'

const GameArea = dynamic(() => import("@/app/components/GameArea"), {
  ssr: false
})

export default function PlayPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GameArea />
    </div>
  )
}
