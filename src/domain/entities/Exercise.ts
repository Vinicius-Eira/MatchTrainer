export interface Exercise {
  id: string;
  type: 'GLOBAL' | 'PERSONAL';
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  movementType: 'COMPOUND' | 'ISOLATION';
  description?: string;
  instructions: string[];
  tips: string[];
  thumbnailUrl?: string;
  isActive: boolean;
  thumbnail_url?: string;
  gifUrl?: string; 
  gif_url?: string;
  video_url?: string;
  muscle_group?: string;
  mechanic?: string;
  level?: string;
}