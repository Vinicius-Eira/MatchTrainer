import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../services/supabase';
import { WorkoutService } from '../../../services/WorkoutService';
import { useWorkoutCreatorStore } from '../../../store/useWorkoutCreatorStore';
import { AITrainingParams } from '../../../components/AI/AIGeneratorModal';

export function useWorkoutCreator(navigation: any, route: any) {
  const params = route.params || {};
  const studentId = params.alunoId || params.studentId || params.usuarioId;
  const programIdToEdit = params.programIdToEdit || params.programId || params.id || params.workoutId;
  const isPresetMode = params.isPresetMode || false;

  const store = useWorkoutCreatorStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [presetsList, setPresetsList] = useState<any[]>([]);
  const [isFetchingPresets, setIsFetchingPresets] = useState(false);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    const loadWorkout = async () => {
      if (!programIdToEdit) {
        store.reset(); 
        store.setProgramName('');
        store.setObjective('');
        store.setGeneralObservation(''); 
        if (store.days.length === 0) store.addDay(); 
        return; 
      }

      setIsLoading(true);
      try {
        const { data, error } = await WorkoutService.getWorkoutById(programIdToEdit);
        if (error) throw error;

        if (data) {
          const mappedDays = (data.workout_days || []).map((day: any) => ({
            id: day.id,
            name: day.name,
            exercises: (day.planned_exercises || []).map((ex: any) => ({
              id: ex.id,
              exercise_id: ex.exercise_id,
              exercise_name: ex.exercises?.name || 'Exercício Salvo',
              thumbnail_url: ex.exercises?.thumbnail_url,
              gif_url: ex.exercises?.gif_url,
              video_url: ex.exercises?.video_url || '',
              group_code: ex.exercises?.muscle_group || ex.group_code || '',
              sets: ex.sets,
              reps_target: ex.reps_target,
              weight_target: ex.weight_target || '',
              rest_seconds: ex.rest_seconds,
              technique: ex.technique || 'Normal',
              public_note: ex.public_note || '',
              private_note: ex.private_note || '',
              custom_media_url: ex.custom_media_url || '',
              target_rpe: ex.target_rpe || ''
            }))
          }));
          store.hydrateWorkout(data.name, data.objective, mappedDays, data.id, data.general_observation || '');
        }
      } catch (err: any) {
        Alert.alert('Erro', 'Não foi possível carregar o treino.');
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkout();
  }, [programIdToEdit]);

  const handleOpenImportModal = async () => {
    try {
      setIsImportModalVisible(true);
      setIsFetchingPresets(true);
      const result = await WorkoutService.getGlobalPresets();
      if (result && result.success) {
        setPresetsList(result.data || []);
      } else {
        Alert.alert("Erro", result?.error || "Falha ao carregar modelos.");
      }
    } catch (error: any) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar buscar os modelos.");
    } finally {
      setIsFetchingPresets(false);
    }
  };

  const handleSelectPresetToImport = async (presetId: string) => {
    setIsImportModalVisible(false);
    setIsLoading(true);

    try {
      const { data, error } = await WorkoutService.getWorkoutById(presetId);
      if (error) throw error;

      if (data) {
        const mappedDays = (data.workout_days || []).map((day: any, dayIndex: number) => ({
          id: `imported_day_${Date.now()}_${dayIndex}`, 
          name: day.name,
          exercises: (day.planned_exercises || []).map((ex: any, exIndex: number) => ({
            id: `imported_ex_${Date.now()}_${exIndex}`, 
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercises?.name || 'Exercício Salvo',
            thumbnail_url: ex.exercises?.thumbnail_url,
            gif_url: ex.exercises?.gif_url,
            video_url: ex.exercises?.video_url || '',
            group_code: ex.exercises?.muscle_group || ex.group_code || '',
            sets: ex.sets,
            reps_target: ex.reps_target,
            weight_target: ex.weight_target || '',
            rest_seconds: ex.rest_seconds,
            technique: ex.technique || 'Normal',
            public_note: ex.public_note || '',
            private_note: ex.private_note || '',
            custom_media_url: ex.custom_media_url || '',
            target_rpe: ex.target_rpe || ''
          }))
        }));

        store.hydrateWorkout(data.name, data.objective, mappedDays, null, data.general_observation || '');
        Alert.alert("Sucesso!", "Modelo importado. Faça os ajustes antes de salvar para o aluno.");
      }
    } catch (err: any) {
      Alert.alert('Erro', 'Não foi possível importar os dados do modelo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAITraining = async (aiParams: AITrainingParams) => {
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('AI-Treino', { body: aiParams });
      if (error) throw error;

      if (data && data.success && data.data) {
        const treinoIA = data.data;
        store.hydrateWorkout(
          treinoIA.programName,
          treinoIA.objective,
          treinoIA.days,
          null,
          treinoIA.generalObservation
        );
        setIsAIModalVisible(false);
        Alert.alert("Sucesso! 🪄", "A base do treino foi gerada. Ajuste as cargas e exercícios antes de publicar.");
      } else {
        throw new Error("Formato de retorno inválido");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar a ficha no momento. Tente novamente.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveAndPublish = async () => {
    if (!store.programName) {
      Alert.alert('Atenção', 'Sua ficha precisa de um nome (Ex: Treino A)');
      return;
    }
    if (!isPresetMode && !studentId) {
      Alert.alert('Erro', 'O ID do aluno não foi encontrado.');
      return;
    }
    
    setIsPublishing(true);
    const targetStudentId = isPresetMode ? null : studentId;
    const result = await WorkoutService.publishWorkout(
      targetStudentId, 
      store.programName, 
      store.objective, 
      store.days, 
      store.programId,
      isPresetMode,
      store.generalObservation
    );
    setIsPublishing(false);
    
    if (result.success) {
      store.reset();
      Alert.alert('Sucesso', 'Ficha salva com sucesso!');
      navigation.goBack();
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const handleArchiveWorkout = () => {
    Alert.alert(
      "Arquivar Ficha",
      "Deseja arquivar esta ficha? Ela deixará de aparecer nos treinos ativos e irá para o histórico do aluno.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Arquivar", onPress: async () => {
            setIsLoading(true);
            const { error } = await supabase
              .from('treinos_prescritos') 
              .update({ ativo: false }) 
              .eq('id', programIdToEdit);
            setIsLoading(false);
            
            if (error) Alert.alert("Erro", "Não foi possível arquivar.");
            else {
              Alert.alert("Sucesso", "Ficha movida para o histórico.");
              navigation.goBack();
            }
        }}
      ]
    );
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      "Excluir Permanentemente",
      "Esta ação apagará a ficha do banco de dados definitivamente. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            setIsLoading(true);
            const { error } = await supabase
              .from('treinos_prescritos') 
              .delete()
              .eq('id', programIdToEdit);
            setIsLoading(false);
            
            if (error) Alert.alert("Erro", "Não foi possível excluir.");
            else {
              Alert.alert("Sucesso", "Ficha excluída com sucesso.");
              navigation.goBack();
            }
        }}
      ]
    );
  };

  return {
    store,
    isPresetMode,
    programIdToEdit,
    isLoading,
    isPublishing,
    isImportModalVisible,
    setIsImportModalVisible,
    presetsList,
    isFetchingPresets,
    isAIModalVisible,
    setIsAIModalVisible,
    isGeneratingAI,
    handleOpenImportModal,
    handleSelectPresetToImport,
    handleGenerateAITraining,
    handleSaveAndPublish,
    handleArchiveWorkout,
    handleDeleteWorkout
  };
}