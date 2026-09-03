import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, Platform, Modal, FlatList } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale } from '../../../utils/responsive';
import { useWorkoutCreatorStore } from '../../../store/useWorkoutCreatorStore';
import { DraftExerciseCard } from '../../../components/Exercise/DraftExerciseCard';
import { supabase } from '../../../services/supabase';
import { WorkoutService } from '../../../services/WorkoutService';
import { AIGeneratorModal, AITrainingParams } from '../../../components/AI/AIGeneratorModal';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

export const WorkoutCreator = ({ navigation, route }: any) => {
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
          if (data.general_observation) store.setGeneralObservation(data.general_observation);
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
        Alert.alert("Erro do Banco", result?.error || "Falha ao carregar modelos.");
      }
    } catch (error: any) {
      Alert.alert("Erro Inesperado", "Ocorreu um erro no código ao tentar buscar.");
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
        Alert.alert("Sucesso!", "Modelo importado. Agora você pode fazer ajustes antes de salvar para o aluno.");
      }
    } catch (err: any) {
      Alert.alert('Erro', 'Não foi possível importar os dados do modelo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAITraining = async (params: AITrainingParams) => {
    setIsGeneratingAI(true);
    try {
      console.log("Enviando requisição para a IA...");
      
      const { data, error } = await supabase.functions.invoke('AI-Treino', {
        body: params,
      });

      if (error) {
        console.log("❌ ERRO COMPLETO DA FUNÇÃO:", error);
        if (error.context) {
          const errorDetails = await error.context.text();
          console.log("🔍 DETALHES DO SERVIDOR:", errorDetails);
        }
        throw error;
      }

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
        Alert.alert("Sucesso! 🪄", "A base do treino foi gerada. Ajuste as cargas e exercícios conforme necessário antes de publicar.");
      } else {
        console.log("Retorno inesperado da IA:", data);
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
      Alert.alert('Erro no Sistema', 'O ID do aluno não foi encontrado. Volte para a tela anterior e tente abrir o criador novamente.');
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
              .from('training_programs')
              .update({ status: 'arquivado' })
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

  const activeDayData = store.days.find(d => d.id === store.activeDayId);

  const renderExerciseItem = ({ item, drag, isActive }: RenderItemParams<any>) => (
    <DraftExerciseCard
      dayId={store.activeDayId || ''}
      exercise={item}
      drag={drag} 
      isActive={isActive} 
    />
  );

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF5100" /></View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={isPublishing} style={styles.backBtn}>
            <Feather name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isPresetMode ? (programIdToEdit ? 'Editar Modelo' : 'Novo Modelo') : (programIdToEdit ? 'Editar Ficha' : 'Montar Ficha')}</Text>
          <View style={styles.headerActionsRight}>
            
            {programIdToEdit && !isPresetMode && (
              <TouchableOpacity onPress={handleArchiveWorkout} style={styles.archiveHeaderBtn}>
                <Feather name="archive" size={20} color="#A0A0A5" />
              </TouchableOpacity>
            )}

            {programIdToEdit && (
              <TouchableOpacity onPress={handleDeleteWorkout} style={styles.deleteHeaderBtn}>
                <Feather name="trash-2" size={20} color="#FF3B30" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.publishBtn} onPress={handleSaveAndPublish} disabled={isPublishing || (activeDayData?.exercises.length === 0)}>
              {isPublishing ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.publishText}>{isPresetMode ? 'Salvar Modelo' : 'Publicar'}</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          <DraggableFlatList
            data={activeDayData?.exercises || []}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              if (store.activeDayId) store.reorderExercises(store.activeDayId, data);
            }}
            renderItem={renderExerciseItem}
            ListHeaderComponent={
              <View style={styles.listHeaderContainer}>
                
                <View style={styles.infoSection}>
                  {!isPresetMode && (
                    <View style={styles.topActionsContainer}>
                      <TouchableOpacity style={styles.premiumAIBtn} onPress={() => setIsAIModalVisible(true)}>
                        <MaterialCommunityIcons name="auto-fix" size={20} color="#FF5100" style={{ marginRight: 8 }} />
                        <Text style={styles.premiumAIBtnText}>Copiloto IA</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.premiumModelBtn} onPress={handleOpenImportModal}>
                        <Feather name="download" size={20} color="#A0A0A5" style={{ marginRight: 8 }} />
                        <Text style={styles.premiumModelBtnText}>Modelos</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>NOME DA FICHA</Text>
                    <TextInput 
                      style={styles.inputTitleLarge} 
                      placeholder={isPresetMode ? "Ex: Modelo Global Hipertrofia" : "Ex: Treino A - Costas e Bíceps"} 
                      placeholderTextColor="#555" 
                      value={store.programName} 
                      onChangeText={store.setProgramName} 
                    />
                    
                    <Text style={[styles.inputLabel, { marginTop: verticalScale(12) }]}>OBJETIVO PRINCIPAL</Text>
                    <TextInput 
                      style={styles.inputSubtitle} 
                      placeholder={isPresetMode ? "Ex: Foco em iniciantes para emagrecimento" : "Ex: Foco em força e hipertrofia"} 
                      placeholderTextColor="#555" 
                      value={store.objective} 
                      onChangeText={store.setObjective} 
                    />
                  </View>
                </View>

                <View style={styles.daysWrapper}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.daysScroll}
                  >
                    {store.days.map((day) => (
                      <TouchableOpacity key={day.id} style={[styles.dayPill, store.activeDayId === day.id && styles.dayPillActive]} onPress={() => store.setActiveDay(day.id)}>
                        <Text style={[styles.dayPillText, store.activeDayId === day.id && styles.dayPillTextActive]}>{day.name}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.addDayPill} onPress={store.addDay}>
                      <Feather name="plus" size={16} color="#A0A0A5" />
                      <Text style={styles.addDayText}>Novo Dia</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            }
            ListFooterComponent={
              <View style={styles.listFooterContainer}>
                <TouchableOpacity style={styles.addExerciseBtn} onPress={() => navigation.navigate('ExerciseLibrary', { isSelectionMode: true, dayId: store.activeDayId })}>
                  <Feather name="plus" size={20} color="#FF5100" />
                  <Text style={styles.addExerciseText}>Adicionar Exercício</Text>
                </TouchableOpacity>
                <View style={styles.generalObsSection}>
                  <View style={styles.generalObsHeader}>
                    <Ionicons name="document-text-outline" size={16} color="#A0A0A5" />
                    <Text style={styles.generalObsTitle}>Observações Gerais da Ficha</Text>
                  </View>
                  <TextInput style={styles.generalObsInput} placeholder="Ex: Aquecer 10 min na esteira antes de começar..." placeholderTextColor="#555" multiline textAlignVertical="top" value={store.generalObservation} onChangeText={store.setGeneralObservation} />
                </View>
              </View>
            }
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <AIGeneratorModal
          visible={isAIModalVisible}
          onClose={() => setIsAIModalVisible(false)}
          onGenerate={handleGenerateAITraining}
          isLoading={isGeneratingAI}
        />

        <Modal visible={isImportModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsImportModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Importar Modelo</Text>
                <TouchableOpacity onPress={() => setIsImportModalVisible(false)}>
                  <Feather name="x" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              {isFetchingPresets ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color="#FF5100" />
                  <Text style={styles.modalLoadingText}>Buscando modelos...</Text>
                </View>
              ) : presetsList.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Feather name="folder-minus" size={40} color="#555" />
                  <Text style={styles.modalEmptyText}>Nenhum modelo global encontrado.</Text>
                </View>
              ) : (
                <FlatList
                  data={presetsList}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.presetCard} onPress={() => handleSelectPresetToImport(item.id)}>
                      <Text style={styles.presetCardTitle}>{item.name}</Text>
                      {item.objective ? <Text style={styles.presetCardObjective}>{item.objective}</Text> : null}
                      <View style={styles.presetCardAction}>
                        <Text style={styles.presetCardActionText}>Usar este modelo</Text>
                        <Feather name="arrow-right" size={16} color="#FF5100" />
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0D0F' }, 
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0F' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingTop: Platform.OS === 'android' ? verticalScale(30) : verticalScale(10), paddingBottom: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#1E1E24', backgroundColor: '#0D0D0F' },
  backBtn: { padding: scale(4) },
  headerTitle: { color: '#FFF', fontSize: scale(16), fontWeight: 'bold' },
  headerActionsRight: { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  
  archiveHeaderBtn: { padding: scale(8), backgroundColor: '#1E1E24', borderRadius: scale(8) },
  deleteHeaderBtn: { padding: scale(8), backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: scale(8) },
  
  publishBtn: { backgroundColor: '#FF5100', paddingHorizontal: scale(14), paddingVertical: verticalScale(10), borderRadius: scale(8), minWidth: scale(80), alignItems: 'center', shadowColor: '#FF5100', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  publishText: { color: '#000', fontSize: scale(13), fontWeight: 'bold' },
  scrollContent: { paddingBottom: verticalScale(80) },
  listHeaderContainer: { paddingBottom: verticalScale(10) },
  
  infoSection: { paddingHorizontal: scale(20), paddingTop: verticalScale(24), paddingBottom: verticalScale(16) },
  topActionsContainer: { flexDirection: 'row', gap: scale(12), marginBottom: verticalScale(24) },
  
  premiumAIBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#161619', borderWidth: 1.5, borderColor: '#FF5100', paddingVertical: verticalScale(14), borderRadius: scale(12), shadowColor: '#FF5100', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  premiumAIBtnText: { color: '#FF5100', fontSize: scale(14), fontWeight: '800', textTransform: 'uppercase' },
  
  premiumModelBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E24', borderWidth: 1, borderColor: '#2A2A32', paddingVertical: verticalScale(14), borderRadius: scale(12) },
  premiumModelBtnText: { color: '#A0A0A5', fontSize: scale(14), fontWeight: '700', textTransform: 'uppercase' },
  
  formContainer: { backgroundColor: '#161619', borderRadius: scale(16), padding: scale(16), borderWidth: 1, borderColor: '#1E1E24' },
  inputLabel: { color: '#666', fontSize: scale(10), fontWeight: 'bold', marginBottom: verticalScale(4), textTransform: 'uppercase', letterSpacing: 1 },
  inputTitleLarge: { color: '#FFF', fontSize: scale(20), fontWeight: '800', borderBottomWidth: 1, borderBottomColor: '#2A2A32', paddingBottom: verticalScale(8) },
  inputSubtitle: { color: '#FFF', fontSize: scale(14), fontWeight: '500', borderBottomWidth: 1, borderBottomColor: '#2A2A32', paddingBottom: verticalScale(8) },
  
  daysWrapper: { paddingBottom: verticalScale(16), marginBottom: verticalScale(16) },
  daysScroll: { flexDirection: 'row', paddingHorizontal: scale(20), gap: scale(12), alignItems: 'center' },
  dayPill: { paddingHorizontal: scale(24), paddingVertical: verticalScale(12), borderRadius: scale(24), backgroundColor: '#161619', borderWidth: 1, borderColor: '#1E1E24' },
  dayPillActive: { backgroundColor: '#1E1410', borderColor: '#FF5100', shadowColor: '#FF5100', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  dayPillText: { color: '#A0A0A5', fontSize: scale(14), fontWeight: '600' },
  dayPillTextActive: { color: '#FF5100', fontWeight: '900' },
  addDayPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(16), paddingVertical: verticalScale(12), borderRadius: scale(24), backgroundColor: 'transparent', borderWidth: 1, borderColor: '#444', borderStyle: 'dashed' },
  addDayText: { color: '#A0A0A5', fontSize: scale(13), fontWeight: 'bold', marginLeft: scale(6) },
  
  listFooterContainer: { paddingHorizontal: scale(20), marginTop: verticalScale(10) },
  addExerciseBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(16), borderRadius: scale(12), backgroundColor: 'rgba(255, 81, 0, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 81, 0, 0.4)', borderStyle: 'dashed' },
  addExerciseText: { color: '#FF5100', fontSize: scale(14), fontWeight: 'bold', marginLeft: scale(8), textTransform: 'uppercase' },
  generalObsSection: { marginTop: verticalScale(24), marginBottom: verticalScale(40) },
  generalObsHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginBottom: verticalScale(12) },
  generalObsTitle: { color: '#A0A0A5', fontSize: scale(12), fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  generalObsInput: { backgroundColor: '#161619', borderWidth: 1, borderColor: '#1E1E24', borderRadius: scale(12), color: '#FFF', fontSize: scale(14), padding: scale(16), minHeight: verticalScale(100) },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#161619', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), minHeight: '50%', maxHeight: '80%', padding: scale(20), borderWidth: 1, borderColor: '#2A2A32' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
  modalTitle: { color: '#FFF', fontSize: scale(18), fontWeight: 'bold' },
  modalLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalLoadingText: { color: '#A0A0A5', marginTop: verticalScale(10), fontSize: scale(14) },
  modalEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(40) },
  modalEmptyText: { color: '#A0A0A5', marginTop: verticalScale(10), fontSize: scale(14) },
  presetCard: { backgroundColor: '#1E1E24', borderRadius: scale(12), padding: scale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: '#2A2A32' },
  presetCardTitle: { color: '#FFF', fontSize: scale(16), fontWeight: 'bold', marginBottom: verticalScale(4) },
  presetCardObjective: { color: '#A0A0A5', fontSize: scale(13), marginBottom: verticalScale(12) },
  presetCardAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: scale(6), marginTop: verticalScale(8), borderTopWidth: 1, borderTopColor: '#2A2A32', paddingTop: verticalScale(12) },
  presetCardActionText: { color: '#FF5100', fontSize: scale(13), fontWeight: 'bold' }
});