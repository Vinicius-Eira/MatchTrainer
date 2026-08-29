import { useState, useCallback } from 'react';
import { WorkoutService } from '../services/WorkoutService';

export function useStudentWorkouts(studentId: string) {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await WorkoutService.getStudentWorkouts(studentId);
    
    if (result.success && result.data) {
      setWorkouts(result.data);
    } else {
      setError(result.error || 'Falha ao carregar os treinos. Verifique sua conexão.');
    }
    
    setIsLoading(false);
  }, [studentId]);

  return { workouts, isLoading, error, refetch: fetchWorkouts };
} 