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

      let dbQuery = supabase
        .from('exercises')
        .select('*')
        .range(from, to);

      const filterMap: Record<string, string> = {
        'Peito': 'CHEST',
        'Costas': 'BACK',
        'Pernas': 'LEGS',
        'Ombros': 'SHOULDERS',
        'Bíceps': 'BICEPS',
        'Tríceps': 'TRICEPS',
        'Abdômen': 'CORE'
      };

      if (filter && filter !== 'Todos') {
        const dbFilter = filterMap[filter] || filter; 
        dbQuery = dbQuery.eq('muscle_group', dbFilter);
      }

      if (query && query.trim() !== '') {
        dbQuery = dbQuery.ilike('name', `%${query.trim()}%`);
      }

      const { data, error } = await dbQuery;

      if (error) {
        console.error('Erro ao buscar exercícios no Supabase:', error.message);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        type: item.personal_id ? 'PERSONAL' : 'GLOBAL', 
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
        video_url: item.video_url || item.gif_url || null, 
        gif_url: item.video_url || item.gif_url || null,
        personal_id: item.personal_id,
      }));

    } catch (error) {
      console.error('Falha no repositório de exercícios:', error);
      return [];
    }
  }
}

export const exerciseRepository = new SupabaseExerciseRepository();