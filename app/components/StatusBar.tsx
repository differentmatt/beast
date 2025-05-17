'use client'
import { formatTime } from '../utils/gameUtils';

interface StatusBarProps {
  currentLevel: number;
  beastsLeft: number;
  totalBeasts: number;
  timeElapsed: number;
  lives?: number; // Made optional since we're not using it
}

export default function StatusBar({
  currentLevel,
  beastsLeft,
  totalBeasts,
  timeElapsed
}: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">Level:</span>
        <span className="status-value">{currentLevel}</span>
      </div>
      <div className="status-item">
        <span className="status-label">Beasts:</span>
        <span className="status-value">{beastsLeft}/{totalBeasts}</span>
      </div>
      <div className="status-item">
        <span className="status-label">Time:</span>
        <span className="status-value">{formatTime(timeElapsed)}</span>
      </div>
    </div>
  );
}