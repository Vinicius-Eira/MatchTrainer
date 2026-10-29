import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native'; 
import { exerciseRepository } from '../../../../src/data/repositories/ExerciseRepository';
import { Exercise } from '../../../../src/domain/entities/Exercise';
import { useWorkoutCreatorStore } from '../../../../src/store/useWorkoutCreatorStore';

export const MATCH_COLORS = { primary: '#FF5100', primaryGlow: 'rgba(255, 81, 0, 0.15)', surfaceDark: '#050505', surfaceCard: '#0A0A0C', borderLight: '#1A1A20', borderNeon: 'rgba(255, 81, 0, 0.4)', text: '#FAFAFA', textMuted: '#A1A1AA', textDim: '#71717A' };
export const MUSCLE_FILTERS = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Tríceps', 'Bíceps', 'CORE'];

export function useExerciseLibrary(route: any, navigation: any) {
  const params = route.params || {};
  const isSelectionMode = params.isSelectionMode || false;
  const isStudioMode = params.isStudioMode || false; 

  const addExerciseToActiveDay = useWorkoutCreatorStore((state: any) => state.addExerciseToActiveDay);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [hasMore, setHasMore] = useState(true);

  const loadExercises = useCallback(async (pageNum: number, query: string, filter: string, isReset: boolean = false) => {
      if (isReset && !isRefreshing) setIsLoading(true); else if (!isReset) setIsLoadingMore(true);
      try {
        const data = await exerciseRepository.getExercises(query, filter, pageNum);
        if (isReset) setExercises(data); else setExercises((prev) => [...prev, ...data]);
        setHasMore(data.length === 20);
      } catch (error) { console.error(error); } finally { setIsLoading(false); setIsLoadingMore(false); setIsRefreshing(false); }
    }, [isRefreshing] 
  );

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => { if (isMounted) loadExercises(1, searchQuery, selectedFilter, true); }, 300); 
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, [searchQuery, selectedFilter, loadExercises]);

  const handleRefresh = () => { setIsRefreshing(true); setPage(1); loadExercises(1, searchQuery, selectedFilter, true); };
  const handleLoadMore = () => { if (!isLoadingMore && hasMore && !isLoading && !isRefreshing) { const nextPage = page + 1; setPage(nextPage); loadExercises(nextPage, searchQuery, selectedFilter, false); } };

  const handleSelectExercise = (exercise: Exercise | any) => {
    if (isSelectionMode) {
      addExerciseToActiveDay(exercise);
      navigation.goBack();
    }
  };

  return { state: { exercises, isModalVisible, searchQuery, selectedFilter, isLoading, isLoadingMore, isRefreshing, isSelectionMode, isStudioMode }, actions: { setSearchQuery, setSelectedFilter, setIsModalVisible, handleRefresh, handleLoadMore, handleSelectExercise, loadExercises } };
};