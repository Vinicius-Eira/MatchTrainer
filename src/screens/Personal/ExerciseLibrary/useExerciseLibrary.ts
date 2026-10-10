import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { exerciseRepository } from '../../../../src/data/repositories/ExerciseRepository';
import { ExerciseService } from '../../../../src/services/ExerciseService';
import { Exercise } from '../../../../src/domain/entities/Exercise';
import { useWorkoutCreatorStore } from '../../../../src/store/useWorkoutCreatorStore';

export const MATCH_COLORS = {
  primary: '#FF5100',
  primaryGlow: 'rgba(255, 81, 0, 0.15)',
  surfaceDark: '#050505',
  surfaceCard: '#0A0A0C', 
  borderLight: '#1A1A20',
  borderNeon: 'rgba(255, 81, 0, 0.4)',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
};

export const MUSCLE_FILTERS = [
  'Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Tríceps', 'Bíceps', 'CORE',
];

export function useExerciseLibrary(route: any, navigation: any) {
  const params = route.params || {};
  const isSelectionMode = params.isSelectionMode || false;
  const isStudioMode = params.isStudioMode || false; 
  const dayId = params.dayId; 

  const addExerciseToDay = useWorkoutCreatorStore((state: any) => state.addExerciseToDay || state.addExercise);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [hasMore, setHasMore] = useState(true);
  
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadExercises = useCallback(
    async (pageNum: number, query: string, filter: string, isReset: boolean = false) => {
      if (isReset && !isRefreshing) setIsLoading(true);
      else if (!isReset) setIsLoadingMore(true);

      try {
        const data = await exerciseRepository.getExercises(query, filter, pageNum);

        if (isReset) setExercises(data);
        else setExercises((prev) => [...prev, ...data]);

        setHasMore(data.length === 20);
      } catch (error) {
        console.error('Erro ao carregar exercícios:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false); 
      }
    },
    [isRefreshing] 
  );

  useEffect(() => {
    let isMounted = true;
    
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        loadExercises(1, searchQuery, selectedFilter, true);
      }
    }, 300); 

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, selectedFilter, loadExercises]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    loadExercises(1, searchQuery, selectedFilter, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading && !isRefreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadExercises(nextPage, searchQuery, selectedFilter, false);
    }
  };

  const handleDirectUpload = async (exercise: Exercise) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Ops!', 'Precisamos de permissão para acessar sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.5, 
        videoMaxDuration: 15, 
      });

      if (result.canceled) return;

      const mediaUri = result.assets[0].uri;
      setUploadingId(exercise.id); 

      const uploadResult = await ExerciseService.uploadExerciseMedia(mediaUri, true);
      
      if (!uploadResult.success) {
        throw new Error('Falha ao subir o vídeo para o Storage.');
      }

      const saveResult = await ExerciseService.updateExerciseMedia(
        exercise.id,
        uploadResult.url || ''
      );

      if (saveResult.success) {
        loadExercises(1, searchQuery, selectedFilter, true);
      } else {
        const erroReal = typeof saveResult.error === 'string' ? saveResult.error : JSON.stringify(saveResult.error);
        throw new Error(`Erro do Banco: ${erroReal}`);
      }

    } catch (error: any) {
      Alert.alert('Erro ao Salvar', error.message || 'Ocorreu um erro.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (isSelectionMode && dayId) {
      const draftExerciseId = Date.now().toString(36) + exercise.id.substring(0, 4);
      
      const payload = {
        id: draftExerciseId,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        group_code: exercise.primaryMuscle,
        sets: 3,
        reps_target: '10-12',
        rest_seconds: 60,
        technique: 'Normal',
        video_url: exercise.video_url || exercise.gif_url || '',
        custom_media_url: exercise.video_url || exercise.gif_url || '',
      };

      addExerciseToDay(dayId, payload);
      navigation.goBack();
    } else if (isStudioMode) {
      handleDirectUpload(exercise);
    }
  };

  return {
    state: {
      exercises, isModalVisible, searchQuery, selectedFilter,
      isLoading, isLoadingMore, isRefreshing, uploadingId,
      isSelectionMode, isStudioMode
    },
    actions: {
      setSearchQuery, setSelectedFilter, setIsModalVisible,
      handleRefresh, handleLoadMore, handleSelectExercise, loadExercises
    }
  };
}