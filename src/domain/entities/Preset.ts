export interface Preset {
  id: string;
  name: string;
  objective: string;
  trainingMode: 'PRESENCIAL' | 'CONSULTORIA' | 'HIBRIDO';
  exerciseCount: number; 
  estimatedDurationMinutes: number;
  isActive: boolean;
}