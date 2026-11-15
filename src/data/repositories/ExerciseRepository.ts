import { Exercise } from '../../domain/entities/Exercise';
import { supabase } from '../../services/supabase'; 

export interface IExerciseRepository {
  getExercises(query: string, filter: string, page: number): Promise<Exercise[]>;
}

const MUSCLE_FILTER_VARIANTS: Record<string, string[]> = {
  Peito: ['Peito', 'CHEST', 'Peitoral'],
  Costas: ['Costas', 'BACK', 'Dorsal'],
  Pernas: ['Pernas', 'LEGS', 'CALVES', 'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha'],
  Ombros: ['Ombros', 'SHOULDERS', 'Deltoides'],
  Bíceps: ['Bíceps', 'BICEPS', 'Biceps'],
  Tríceps: ['Tríceps', 'TRICEPS', 'Triceps'],
  CORE: ['CORE', 'Abdômen', 'Abdomen', 'Core'],
};

const DISPLAY_MUSCLE_MAP: Record<string, string> = {
  CHEST: 'Peito',
  Peito: 'Peito',
  Peitoral: 'Peito',
  BACK: 'Costas',
  Costas: 'Costas',
  Dorsal: 'Costas',
  LEGS: 'Pernas',
  CALVES: 'Pernas',
  Quadríceps: 'Pernas',
  Pernas: 'Pernas',
  SHOULDERS: 'Ombros',
  Ombros: 'Ombros',
  BICEPS: 'Bíceps',
  Bíceps: 'Bíceps',
  TRICEPS: 'Tríceps',
  Tríceps: 'Tríceps',
  CORE: 'CORE',
  Abdômen: 'CORE',
  Abdomen: 'CORE',
};

const SYNONYM_CANONICAL_MAP: Record<string, string> = {
  'rosca 45 graus': 'rosca inclinada com halteres',
  'remada unilateral com halter': 'remada serrote',
  'abdominal canivete': 'abdominal v-up',
  'crucifixo inverso com halteres': 'crucifixo inverso',
  'barra fixa pronada': 'barra fixa',
  'woodchopper unilateral': 'woodchopper na polia',
  'chest press inclinado': 'supino inclinado na maquina',
};

const normalizarTexto = (texto?: string | null): string => {
  if (!texto) return '';
  const base = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return SYNONYM_CANONICAL_MAP[base] || base;
};

export class SupabaseExerciseRepository implements IExerciseRepository {
  async getExercises(query: string, filter: string, page: number): Promise<Exercise[]> {
    try {
      const pageSize = 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;

      const variantesFiltro = filter && filter !== 'Todos'
        ? (MUSCLE_FILTER_VARIANTS[filter] || [filter])
        : null;

      let queryGlobal = supabase
        .from('global_exercises')
        .select('*')
        .not('gif_url', 'is', null)
        .neq('gif_url', '');

      if (variantesFiltro) {
        queryGlobal = queryGlobal.in('muscle_group', variantesFiltro);
      }
      if (query && query.trim() !== '') {
        queryGlobal = queryGlobal.ilike('name', `%${query.trim()}%`);
      }

      let queryPersonal = currentUserId
        ? supabase.from('exercises').select('*').eq('personal_id', currentUserId)
        : null;

      if (queryPersonal && variantesFiltro) {
        queryPersonal = queryPersonal.in('muscle_group', variantesFiltro);
      }
      if (queryPersonal && query && query.trim() !== '') {
        queryPersonal = queryPersonal.ilike('name', `%${query.trim()}%`);
      }

      const [resGlobal, resPersonal] = await Promise.all([
        queryGlobal,
        queryPersonal ? queryPersonal : Promise.resolve({ data: [], error: null })
      ]);

      if (resGlobal.error) throw resGlobal.error;
      if (resPersonal.error) throw resPersonal.error;

      const meusExerciciosPersonal: any[] = (resPersonal.data || []).map((item: any) => {
        const musculoTraduzido = DISPLAY_MUSCLE_MAP[item.muscle_group] || item.muscle_group || 'Geral';
        return {
          id: item.id,
          type: 'PERSONAL' as 'GLOBAL' | 'PERSONAL',
          originTable: 'EXERCISES',
          name: item.name,
          group_code: musculoTraduzido,
          primaryMuscle: musculoTraduzido,
          secondaryMuscles: [],
          equipment: item.equipment || 'Geral',
          difficulty: 'INTERMEDIATE',
          movementType: 'COMPOUND',
          instructions: [],
          tips: [],
          isActive: true,
          video_url: item.video_url || item.gif_url || '',
          gif_url: item.gif_url || item.video_url || '',
          personal_id: item.personal_id,
        };
      });

      const mapaPorNome = new Map<string, any>();
      const urlsGifJaUsadas = new Set<string>();

      (resGlobal.data || []).forEach((item: any) => {
        const urlLimpa = (item.gif_url || '').trim();
        if (!urlLimpa) return;

        const chaveNome = normalizarTexto(item.name);
        if (!chaveNome || mapaPorNome.has(chaveNome)) return;

        if (urlsGifJaUsadas.has(urlLimpa)) return;

        urlsGifJaUsadas.add(urlLimpa);
        const musculoTraduzido = DISPLAY_MUSCLE_MAP[item.muscle_group] || item.muscle_group || 'Geral';

        mapaPorNome.set(chaveNome, {
          id: item.id,
          type: 'GLOBAL' as 'GLOBAL' | 'PERSONAL',
          originTable: 'GLOBAL',
          name: item.name,
          group_code: musculoTraduzido,
          primaryMuscle: musculoTraduzido,
          secondaryMuscles: [],
          equipment: item.equipment || 'Geral',
          difficulty: 'INTERMEDIATE',
          movementType: 'COMPOUND',
          instructions: [],
          tips: [],
          isActive: true,
          video_url: urlLimpa,
          gif_url: urlLimpa,
          personal_id: null,
        });
      });

      const catalogoGeralOrdenado = Array.from(mapaPorNome.values()).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR')
      );

      const todos = [...meusExerciciosPersonal, ...catalogoGeralOrdenado];
      return todos.slice(from, to + 1) as Exercise[];
    } catch (error) {
      console.error('Falha no repositório de exercícios:', error);
      return [];
    }
  }
}

export const exerciseRepository = new SupabaseExerciseRepository();