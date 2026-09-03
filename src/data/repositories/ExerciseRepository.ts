import { Exercise } from '../../domain/entities/Exercise';
import { supabase } from '../../services/supabase'; 

export interface IExerciseRepository {
  getExercises(query: string, filter: string, page: number): Promise<Exercise[]>;
}

export class SupabaseExerciseRepository implements IExerciseRepository {
  async getExercises(query: string, filter: string, page: number): Promise<Exercise[]> {
    try {
      const pageSize = 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const filterMap: Record<string, string> = {
        'Peito': 'CHEST',
        'Costas': 'BACK',
        'Pernas': 'LEGS',
        'Ombros': 'SHOULDERS',
        'Bíceps': 'BICEPS',
        'Tríceps': 'TRICEPS',
        'Abdômen': 'CORE'
      };
      
      const dbFilterPersonal = filterMap[filter] || filter; 
      const dbFilterGlobal = filter; 

      let queryGlobal = supabase.from('global_exercises').select('*');
      if (filter && filter !== 'Todos') {
        queryGlobal = queryGlobal.eq('muscle_group', dbFilterGlobal);
      }
      if (query && query.trim() !== '') {
        queryGlobal = queryGlobal.ilike('name', `%${query.trim()}%`);
      }

      let queryPersonal = supabase.from('exercises').select('*');
      if (filter && filter !== 'Todos') {
        queryPersonal = queryPersonal.eq('muscle_group', dbFilterPersonal);
      }
      if (query && query.trim() !== '') {
        queryPersonal = queryPersonal.ilike('name', `%${query.trim()}%`);
      }

      const [resGlobal, resPersonal] = await Promise.all([queryGlobal, queryPersonal]);

      if (resGlobal.error) throw resGlobal.error;
      if (resPersonal.error) throw resPersonal.error;

      const globaisFormatados = (resGlobal.data || []).map((item: any) => ({
        id: item.id,
        type: 'GLOBAL' as 'GLOBAL' | 'PERSONAL', 
        name: item.name,
        group_code: item.muscle_group, 
        primaryMuscle: item.muscle_group, 
        secondaryMuscles: [],
        equipment: item.equipment || 'Geral',
        difficulty: 'INTERMEDIATE',
        movementType: 'COMPOUND',
        instructions: [],
        tips: [],
        isActive: true,
        video_url: item.gif_url || '', 
        gif_url: item.gif_url || '',
        personal_id: null,
      } as Exercise));

      const pessoaisFormatados = (resPersonal.data || []).map((item: any) => ({
        id: item.id,
        type: (item.personal_id ? 'PERSONAL' : 'GLOBAL') as 'GLOBAL' | 'PERSONAL', 
        name: item.name,
        group_code: item.muscle_group, 
        primaryMuscle: item.muscle_group, 
        secondaryMuscles: [],
        equipment: 'Geral',
        difficulty: 'INTERMEDIATE',
        movementType: 'COMPOUND',
        instructions: [],
        tips: [],
        isActive: true,
        video_url: item.video_url || item.gif_url || '', 
        gif_url: item.gif_url || item.video_url || '',
        personal_id: item.personal_id,
      } as Exercise));

      const todos = [...globaisFormatados, ...pessoaisFormatados];
      return todos.slice(from, to + 1);

    } catch (error) {
      console.error('Falha no repositório de exercícios:', error);
      return [];
    }
  }
}

export const exerciseRepository = new SupabaseExerciseRepository();