'use client'
import { useState, useRef } from 'react';
import Game from '../components/Game';

export default function TestPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const resetFunctionRef = useRef<(advanceLevel?: boolean) => void | null>(null);

  const handleLevelChange = (level: number) => {
    setCurrentLevel(level);
  };

  const handleResetFunction = (resetFunction: (advanceLevel?: boolean) => void) => {
    resetFunctionRef.current = resetFunction;
  };

  const handleNextLevel = () => {
    if (resetFunctionRef.current) {
      resetFunctionRef.current(true);
    }
  };

  const handleRestart = () => {
    if (resetFunctionRef.current) {
      resetFunctionRef.current(false);
    }
  };

  return (
    <div className="test-page">
      <h1>Beast Game - Test Page</h1>
      <p>Use arrow keys or WASD to move. Push blocks to trap beasts.</p>
      <p>Press R to restart, N to skip to next level (for testing).</p>
      <p>When you win a level, press SPACE or ENTER to advance to the next level.</p>

      <div className="test-controls">
        <button onClick={handleNextLevel} className="test-button">
          Next Level
        </button>
        <button onClick={handleRestart} className="test-button">
          Restart
        </button>
        <div className="level-display">Current Level: {currentLevel}</div>
      </div>

      <Game
        onLevelChange={handleLevelChange}
        onReset={handleResetFunction}
      />
    </div>
  );
}