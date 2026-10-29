import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../services/supabase';
import { WorkoutService } from '../../../services/WorkoutService';
import { useWorkoutCreatorStore } from '../../../store/useWorkoutCreatorStore';
import { AITrainingParams } from '../../../components/AI/AIGeneratorModal';

const mapDayFromDB = (day: any) => ({
  id: day.id,
  name: day.name,
  exercises: (day.planned_exercises || []).map((ex: any) => {
    const origin = ex.exercises || ex.global_exercises || {};
    
    return {
      id: ex.id,
      exercise_id: ex.exercise_id || null, 
      global_exercise_id: ex.global_exercise_id || null,
      exercise_name: origin.name || ex.name || 'Exercício Salvo',
      
      thumbnail_url: origin.thumbnail_url || origin.gif_url || origin.video_url || ex.custom_media_url || '',
      gif_url: origin.gif_url || '',
      video_url: origin.video_url || '',
      
      group_code: origin.muscle_group || origin.primaryMuscle || ex.group_code || '',
      sets: ex.sets || '3',
      reps_target: ex.reps_target || '10-12',
      weight_target: ex.weight_target || '',
      rest_seconds: ex.rest_seconds || '60',
      technique: ex.technique || 'Normal',
      public_note: ex.public_note || '',
      private_note: ex.private_note || '',
      custom_media_url: ex.custom_media_url || '',
      target_rpe: ex.target_rpe || ''
    };
  })
});

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
  
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [showAISuccessModal, setShowAISuccessModal] = useState(false);

  useEffect(() => {
    const loadWorkout = async () => {
      if (!programIdToEdit) { store.reset(); return; }
      setIsLoading(true);
      try {
        const { data, error } = await WorkoutService.getWorkoutById(programIdToEdit);
        if (error) throw new Error(error); 
        if (data) {
          let mappedWeeks = [];
          if (data.training_weeks && data.training_weeks.length > 0) {
              mappedWeeks = data.training_weeks.map((week: any) => ({ id: week.id, name: week.name, generalObservation: week.general_notes || '', days: (week.workout_days || []).map((day: any) => mapDayFromDB(day)) }));
          } else if (data.workout_days) {
              mappedWeeks = [{ id: `week_${Date.now()}`, name: 'Semana 1', generalObservation: data.general_observation || '', days: data.workout_days.map((day: any) => mapDayFromDB(day)) }];
          }
          store.hydrateWorkout(data.name, data.objective, mappedWeeks, data.id);
        }
      } catch (err: any) {
        Alert.alert('Erro', 'Não foi possível carregar o treino: ' + err.message);
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
      if (result && result.success) { setPresetsList(result.data || []); } else { Alert.alert("Erro", result?.error || "Falha ao carregar modelos."); }
    } catch (error: any) { Alert.alert("Erro", "Ocorreu um erro ao tentar buscar os modelos."); } finally { setIsFetchingPresets(false); }
  };

  const handleSelectPresetToImport = async (presetId: string) => {
    setIsImportModalVisible(false);
    setIsLoading(true);
    try {
      const { data, error } = await WorkoutService.getWorkoutById(presetId);
      if (error) throw new Error(error);
      if (data) {
        let mappedWeeks = [];
        
        if (data.training_weeks && data.training_weeks.length > 0) {
            mappedWeeks = data.training_weeks.map((week: any, wIndex: number) => ({ 
                id: `imp_w_${Date.now()}_${wIndex}`, 
                name: week.name, 
                generalObservation: week.general_notes || '', 
                days: (week.workout_days || []).map((day: any, dIndex: number) => {
                    const d = mapDayFromDB(day);
                    d.id = `imp_d_${Date.now()}_${dIndex}`;
                    d.exercises = d.exercises.map((e: any, eIndex: number) => ({...e, id: `imp_e_${Date.now()}_${eIndex}`}));
                    return d;
                }) 
            }));
        } else if (data.workout_days) {
            mappedWeeks = [{ 
                id: `week_${Date.now()}`, 
                name: 'Semana 1', 
                generalObservation: data.general_observation || '', 
                days: data.workout_days.map((day: any, dIndex: number) => {
                    const d = mapDayFromDB(day);
                    d.id = `imp_d_${Date.now()}_${dIndex}`;
                    d.exercises = d.exercises.map((e: any, eIndex: number) => ({...e, id: `imp_e_${Date.now()}_${eIndex}`}));
                    return d;
                })
            }];
        }

        store.hydrateWorkout(data.name, data.objective, mappedWeeks, null);
        Alert.alert("Sucesso!", "Modelo importado com sucesso (incluindo as mídias)!");
      }
    } catch (err: any) { Alert.alert('Erro', 'Não foi possível importar.'); } finally { setIsLoading(false); }
  };

  const handleGenerateAITraining = async (aiParams: AITrainingParams) => {
    setIsGeneratingAI(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

       if (!apiKey) {
        alert("Chave da IA não configurada corretamente.");
        setIsGeneratingAI(false);
        return;
      }
      const modelName = "gemini-3.8-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const promptSistema = `Você é um Personal Trainer de Elite (PhD em Biomecânica e Fisiologia).
Sua missão é criar uma periodização perfeita baseada na ciência.
REGRAS:
1. Crie exatas 4 semanas de evolução (Semana 1 a Semana 4) com progressão.
2. O aluno treina ${aiParams.frequencia} dias por semana. Crie exatos ${aiParams.frequencia} dias por semana (Treino A, Treino B, Treino C...).
3. Nível do aluno: ${aiParams.nivel}. Objetivo: ${aiParams.objetivo}.
4. Restrições do aluno: ${aiParams.restricoes}. Respeite isso rigorosamente na escolha dos exercícios.
5. Adicione de 5 a 7 exercícios reais e conhecidos por treino.
6. A propriedade 'programName' deve ser algo inspirador (ex: "Projeto Elite - Hipertrofia").

Retorne APENAS o JSON válido, sem crases, sem formatação markdown:
{
  "programName": "Nome do Projeto",
  "objective": "${aiParams.objetivo}",
  "weeks": [
    {
      "id": "w1",
      "name": "Semana 1",
      "generalObservation": "Adaptação e consciência",
      "days": [
        {
          "id": "d1",
          "name": "Treino A",
          "exercises": [ { "id": "ex_1", "exercise_name": "Supino Reto", "group_code": "Peito", "sets": 3, "reps_target": "10-12", "weight_target": "", "rest_seconds": 60, "technique": "Normal" } ]
        }
      ]
    }
  ]
}`;

      const userPayload = JSON.stringify({ nivel: aiParams.nivel, objetivo: aiParams.objetivo, frequencia: aiParams.frequencia, restricoes: aiParams.restricoes });

      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_instruction: { parts: [{ text: promptSistema }] }, contents: [{ role: "user", parts: [{ text: userPayload }] }], generationConfig: { responseMimeType: "application/json" } }) });

      if (!response.ok) throw new Error(`Erro na API do Google: ${await response.text()}`);

      const jsonResponse = await response.json();
      const rawJsonString = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleanJson = rawJsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      const treinoIA = JSON.parse(cleanJson);

      const { data: { session } } = await supabase.auth.getSession();
      const personalId = session?.user?.id;

      if (personalId) {
        const [{ data: globais }, { data: pessoais }] = await Promise.all([
          supabase.from('global_exercises').select('id, name, gif_url, muscle_group'),
          supabase.from('exercises').select('id, name, gif_url, video_url, thumbnail_url, muscle_group').eq('personal_id', personalId)
        ]);

        const globaisTag = (globais || []).map(g => ({ ...g, isGlobal: true }));
        const pessoaisTag = (pessoais || []).map(p => ({ ...p, isGlobal: false }));
        const bancoDeExercicios = [...pessoaisTag, ...globaisTag];

        treinoIA.weeks.forEach((week: any) => {
          week.days.forEach((day: any) => {
            day.exercises.forEach((ex: any) => {
              const existe = bancoDeExercicios.find(b => b.name.toLowerCase().trim() === ex.exercise_name.toLowerCase().trim());

              if (existe) {
                if (existe.isGlobal) {
                  ex.global_exercise_id = existe.id;
                  ex.exercise_id = null;
                } else {
                  ex.exercise_id = existe.id;
                  ex.global_exercise_id = null;
                }
                ex.gif_url = existe.gif_url;
                ex.video_url = (existe as any).video_url || '';
              } else {
                ex.global_exercise_id = globaisTag[0]?.id || null;
                ex.exercise_id = null;
              }
              ex.id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7); 
            });
          });
        });
      }

      store.hydrateWorkout(treinoIA.programName || "Projeto IA", treinoIA.objective || "", treinoIA.weeks || [], null);
      
      setIsAIModalVisible(false);
      setShowAISuccessModal(true);

    } catch (error: any) { Alert.alert("Erro no Copilot:", error.message); } finally { setIsGeneratingAI(false); }
  };

  const handleSaveAndPublish = async () => {
    if (!store.programName) { Alert.alert('Atenção', 'Sua ficha precisa de um nome'); return; }
    if (!isPresetMode && !studentId) { Alert.alert('Erro', 'O ID do aluno não foi encontrado.'); return; }
    
    setIsPublishing(true);
    const cleanedWeeks = store.weeks.map(week => ({
      ...week,
      days: week.days.map(day => ({
        ...day,
        exercises: day.exercises.map(ex => ({
          ...ex,
          exercise_id: ex.exercise_id || null,
          global_exercise_id: ex.global_exercise_id || null
        }))
      }))
    }));

    const result = await WorkoutService.publishWorkout(isPresetMode ? null : studentId, store.programName, store.objective, cleanedWeeks, store.programId, isPresetMode);
    setIsPublishing(false);
    
    if (result.success) { store.reset(); setShowSuccessModal(true); } else { Alert.alert('Erro ao Salvar', result.error); }
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
              .from('training_programs')
              .update({ is_active: false }) 
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
              .from('training_programs') 
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
    store, isPresetMode, programIdToEdit, isLoading, isPublishing, 
    isImportModalVisible, setIsImportModalVisible, presetsList, 
    isFetchingPresets, isAIModalVisible, setIsAIModalVisible, 
    isGeneratingAI, showSuccessModal, setShowSuccessModal, 
    showAISuccessModal, setShowAISuccessModal, 
    handleOpenImportModal, handleSelectPresetToImport, 
    handleGenerateAITraining, handleSaveAndPublish, 
    handleArchiveWorkout, handleDeleteWorkout 
  };
}