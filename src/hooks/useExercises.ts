import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase'; 

export const useExercises = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      let q = supabase.from('exercises').select('*');
      
      if (activeFilter !== 'Todos') {
        q = q.ilike('muscle_group', `%${activeFilter}%`);
      }
      if (query) {
        q = q.ilike('name', `%${query}%`);
      }

      const { data, error: sbError } = await q;
      if (sbError) throw sbError;
      
      setExercises(data || []);
      setError(null);
    } catch (err: any) {
      setError('Erro ao buscar exercícios.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, activeFilter]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

return { exercises, query, setQuery, activeFilter, setActiveFilter, isLoading, error, refetch: fetchExercises };
};