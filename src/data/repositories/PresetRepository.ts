import { Preset } from '../../domain/entities/Preset';

export interface IPresetRepository {
  getPresets(): Promise<Preset[]>;
}

const mockPresets: Preset[] = [
  {
    id: 'p1',
    name: 'Hipertrofia A (Peito/Tríceps)',
    objective: 'Ganho de Massa',
    trainingMode: 'CONSULTORIA',
    exerciseCount: 6,
    estimatedDurationMinutes: 50,
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Full Body Iniciante',
    objective: 'Adaptação Anatômica',
    trainingMode: 'HIBRIDO',
    exerciseCount: 8,
    estimatedDurationMinutes: 60,
    isActive: true,
  },
  {
    id: 'p3',
    name: 'Glúteos e Posteriores - Avançado',
    objective: 'Força e Hipertrofia',
    trainingMode: 'PRESENCIAL',
    exerciseCount: 5,
    estimatedDurationMinutes: 45,
    isActive: true,
  }
];

export class MockPresetRepository implements IPresetRepository {
  async getPresets(): Promise<Preset[]> {
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return mockPresets;
  }
}

export const presetRepository = new MockPresetRepository();