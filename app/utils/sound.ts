/**
 * PC Speaker-style Sound System
 * Generates authentic DOS-era square wave beeps using Web Audio API
 */

class PCSpeaker {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      } catch {
        console.warn('Web Audio API not supported')
        return null
      }
    }
    return this.audioContext
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resume(): Promise<void> {
    const ctx = this.getContext()
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
    }
  }

  /**
   * Enable/disable sound
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Play a simple square wave beep
   */
  beep(frequency: number, duration: number, volume: number = 0.3): void {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square' // PC speaker was essentially a square wave
    oscillator.frequency.value = frequency

    // Quick attack, sustain, quick release
    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.005)
    gainNode.gain.setValueAtTime(volume, now + duration / 1000 - 0.005)
    gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000)

    oscillator.start(now)
    oscillator.stop(now + duration / 1000)
  }

  /**
   * Play a frequency sweep (descending or ascending)
   */
  sweep(startFreq: number, endFreq: number, duration: number, volume: number = 0.3): void {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square'

    const now = ctx.currentTime
    oscillator.frequency.setValueAtTime(startFreq, now)
    oscillator.frequency.linearRampToValueAtTime(endFreq, now + duration / 1000)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.005)
    gainNode.gain.setValueAtTime(volume, now + duration / 1000 - 0.01)
    gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000)

    oscillator.start(now)
    oscillator.stop(now + duration / 1000 + 0.01)
  }

  /**
   * Play a sequence of notes
   */
  playSequence(notes: { freq: number; duration: number }[], volume: number = 0.3): void {
    if (!this.enabled) return

    let delay = 0
    for (const note of notes) {
      setTimeout(() => this.beep(note.freq, note.duration, volume), delay)
      delay += note.duration
    }
  }

  // === Game Sound Effects ===

  /**
   * Beast crushed - quick descending blip
   */
  beastCrushed(): void {
    this.sweep(300, 100, 80, 0.25)
  }

  /**
   * Super beast crushed - longer, more satisfying
   */
  superBeastCrushed(): void {
    this.sweep(400, 120, 150, 0.3)
  }

  /**
   * Player death - long descending wail
   */
  playerDeath(): void {
    this.sweep(500, 50, 400, 0.35)
  }

  /**
   * Egg hatching - ascending warning tone
   */
  eggHatch(): void {
    this.sweep(150, 400, 200, 0.25)
  }

  /**
   * Egg warning - pulsing beep when egg is about to hatch
   */
  eggWarning(): void {
    this.beep(200, 50, 0.15)
  }

  /**
   * Level complete - victory jingle
   */
  levelComplete(): void {
    this.playSequence([
      { freq: 523, duration: 100 },  // C5
      { freq: 659, duration: 100 },  // E5
      { freq: 784, duration: 100 },  // G5
      { freq: 1047, duration: 200 }, // C6
    ], 0.3)
  }

  /**
   * Game over - sad descending tones
   */
  gameOver(): void {
    this.playSequence([
      { freq: 400, duration: 200 },
      { freq: 300, duration: 200 },
      { freq: 200, duration: 300 },
    ], 0.3)
  }

  /**
   * Player move - subtle tick (optional, can be annoying)
   */
  playerMove(): void {
    this.beep(800, 15, 0.08)
  }

  /**
   * Block push - satisfying thunk
   */
  blockPush(): void {
    this.beep(150, 30, 0.2)
  }

  /**
   * Game start - ready beep
   */
  gameStart(): void {
    this.playSequence([
      { freq: 440, duration: 100 },
      { freq: 550, duration: 150 },
    ], 0.25)
  }
}

// Singleton instance
export const pcSpeaker = new PCSpeaker()

// Export type for components that need it
export type { PCSpeaker }
