// AI Mood Garden — Shared Types

export type Mood = 'Joy' | 'Sadness' | 'Anger' | 'Calm' | 'Love';

export type Energy = 'High' | 'Low';

export interface MoodResult {
  mood: Mood;
  energy: Energy;
  /** intensity 0..1 */
  intensity: number;
  /** ASCII art for the mood */
  art: string;
  /** color hex for the mood */
  color: string;
  /** glitch effect (for negative moods) */
  glitch: boolean;
}

export interface GardenEntry {
  id: string;
  text: string;
  mood: Mood;
  energy: Energy;
  intensity: number;
  art: string;
  color: string;
  timestamp: number;
}
