import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, Platform, Modal, FlatList, KeyboardAvoidingView, Alert } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import { styles } from './styles';
import { useWorkoutCreator } from './useWorkoutCreator';
import { DraftExerciseCard } from '../../../components/Exercise/DraftExerciseCard';
import { AIGeneratorModal } from '../../../components/AI/AIGeneratorModal';

const QUICK_OBJECTIVES = ["Hipertrofia", "Emagrecimento", "Força", "Resistência", "Mobilidade"];

export function WorkoutCreator({ navigation, route }: any) {
  const v = useWorkoutCreator(navigation, route);
  
  const activeWeekData = v.store.weeks?.find((w: any) => w.id === v.store.activeWeekId);
  const activeDayData = activeWeekData?.days?.find((d: any) => d.id === v.store.activeDayId);

  const renderExerciseItem = ({ item, drag, isActive }: RenderItemParams<any>) => (
    <DraftExerciseCard
      dayId={v.store.activeDayId || ''}
      exercise={item}
      drag={drag} 
      isActive={isActive} 
    />
  );

  if (v.isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF5100" /></View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={v.isPublishing} style={styles.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <Feather name="chevron-left" size={26} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {v.isPresetMode ? (v.programIdToEdit ? 'EDITAR MODELO' : 'NOVO MODELO') : (v.programIdToEdit ? 'EDITAR FICHA' : 'MONTAR FICHA')}
            </Text>
            <View style={styles.headerActionsRight}>
              
              {v.programIdToEdit && !v.isPresetMode && (
                <TouchableOpacity onPress={v.handleArchiveWorkout} style={styles.archiveHeaderBtn}>
                  <Feather name="archive" size={20} color="#A0A0A5" />
                </TouchableOpacity>
              )}

              {v.programIdToEdit && (
                <TouchableOpacity onPress={v.handleDeleteWorkout} style={styles.deleteHeaderBtn}>
                  <Feather name="trash-2" size={20} color="#FF3B30" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.publishBtn} onPress={v.handleSaveAndPublish} disabled={v.isPublishing || (activeDayData?.exercises?.length === 0)}>
                {v.isPublishing ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.publishText}>{v.isPresetMode ? 'Salvar' : 'Publicar'}</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.container}>
            <DraggableFlatList
              data={activeDayData?.exercises || []}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => {
                if (v.store.activeWeekId && v.store.activeDayId) {
                    v.store.reorderExercises(v.store.activeWeekId, v.store.activeDayId, data);
                }
              }}
              renderItem={renderExerciseItem}
              automaticallyAdjustKeyboardInsets={true} 
              ListHeaderComponent={
                <View style={styles.listHeaderContainer}>
                  
                  <View style={styles.infoSection}>
                    {!v.isPresetMode && (
                      <View style={styles.topActionsContainer}>
                        <TouchableOpacity style={styles.premiumAIBtn} onPress={() => v.setIsAIModalVisible(true)}>
                          <MaterialCommunityIcons name="auto-fix" size={20} color="#FF5100" style={{ marginRight: 8 }} />
                          <Text style={styles.premiumAIBtnText}>Copiloto IA</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.premiumModelBtn} onPress={v.handleOpenImportModal}>
                          <Feather name="download" size={20} color="#A0A0A5" style={{ marginRight: 8 }} />
                          <Text style={styles.premiumModelBtnText}>Importar Modelo</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={styles.formContainer}>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>NOME DO PROGRAMA</Text>
                        <View style={styles.inputBox}>
                          <MaterialCommunityIcons name="format-title" size={20} color="#FF5100" style={styles.inputIcon} />
                          <TextInput 
                            style={styles.inputTitleLarge} 
                            placeholder={v.isPresetMode ? "Ex: Hipertrofia Iniciante" : "Ex: Projeto Verão"} 
                            placeholderTextColor="#555" 
                            value={v.store.programName} 
                            onChangeText={v.store.setProgramName} 
                          />
                        </View>
                      </View>
                      
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>OBJETIVO PRINCIPAL</Text>
                        <View style={styles.inputBox}>
                          <Feather name="target" size={20} color="#FF5100" style={styles.inputIcon} />
                          <TextInput 
                            style={styles.inputSubtitle} 
                            placeholder="Ex: Foco em força e hipertrofia" 
                            placeholderTextColor="#555" 
                            value={v.store.objective} 
                            onChangeText={v.store.setObjective} 
                          />
                        </View>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTagsContainer}>
                          {QUICK_OBJECTIVES.map((obj, idx) => (
                            <TouchableOpacity 
                              key={idx} 
                              style={[styles.quickTag, v.store.objective.includes(obj) && styles.quickTagActive]}
                              onPress={() => v.store.setObjective(obj)}
                            >
                              <Text style={[styles.quickTagText, v.store.objective.includes(obj) && styles.quickTagTextActive]}>{obj}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </View>

                  <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
                    <Text style={{ color: "#888", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: 1 }}>Semanas de Treino</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 10 }}>
                      {v.store.weeks?.map((week: any) => (
                        <View 
                          key={week.id} 
                          style={{
                            flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, 
                            borderRadius: 12, borderWidth: 1, 
                            backgroundColor: v.store.activeWeekId === week.id ? "#FF5100" : "#111",
                            borderColor: v.store.activeWeekId === week.id ? "#FF5100" : "#222"
                          }}
                        >
                          <TouchableOpacity 
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => v.store.setActiveWeek(week.id)}
                          >
                            <Feather name="calendar" size={14} color={v.store.activeWeekId === week.id ? "#000" : "#A0A0A5"} style={{ marginRight: 6 }} />
                            <Text style={{ color: v.store.activeWeekId === week.id ? "#000" : "#FFF", fontSize: 13, fontWeight: "bold" }}>{week.name}</Text>
                          </TouchableOpacity>
                          
                          {/* Lixeira visível se for a semana ativa e houver mais de uma semana */}
                          {(v.store.activeWeekId === week.id && v.store.weeks.length > 1) && (
                            <TouchableOpacity 
                              style={{ marginLeft: 12, backgroundColor: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10 }}
                              onPress={() => {
                                Alert.alert("Atenção", `Excluir a ${week.name} e todos os treinos nela?`, [
                                  { text: "Cancelar", style: "cancel" },
                                  { text: "Excluir", onPress: () => v.store.removeWeek(week.id), style: 'destructive' }
                                ]);
                              }}
                            >
                              <Feather name="x" size={14} color="#000" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                      
                      <TouchableOpacity 
                        style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, backgroundColor: "transparent", borderColor: "#333" }} 
                        onPress={() => v.store.addWeek()}
                      >
                        <Feather name="plus" size={16} color="#A0A0A5" style={{ marginRight: 4 }}/>
                        <Text style={{ color: "#A0A0A5", fontSize: 13, fontWeight: "bold" }}>Nova Semana</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>

                  {/* 🔥 ABAS DOS DIAS COM BOTÃO DE EXCLUIR */}
                  {activeWeekData && (
                    <View style={{ marginTop: 15, paddingHorizontal: 20, marginBottom: 10 }}>
                        <Text style={{ color: "#888", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: 1 }}>Treinos da {activeWeekData.name}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {activeWeekData.days.map((day: any) => (
                            <View 
                              key={day.id} 
                              style={[styles.dayPill, v.store.activeDayId === day.id && styles.dayPillActive, { flexDirection: 'row', alignItems: 'center' }]}
                            >
                              <TouchableOpacity 
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => v.store.setActiveDay(day.id)}
                              >
                                <MaterialCommunityIcons name="dumbbell" size={16} color={v.store.activeDayId === day.id ? "#FF5100" : "#A0A0A5"} style={{ marginRight: 6 }} />
                                <Text style={[styles.dayPillText, v.store.activeDayId === day.id && styles.dayPillTextActive]}>{day.name}</Text>
                              </TouchableOpacity>

                              {(v.store.activeDayId === day.id && activeWeekData.days.length > 1) && (
                                <TouchableOpacity 
                                  style={{ marginLeft: 8, backgroundColor: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10 }}
                                  onPress={() => {
                                    Alert.alert("Atenção", `Excluir o ${day.name}?`, [
                                      { text: "Cancelar", style: "cancel" },
                                      { text: "Excluir", onPress: () => v.store.removeDay(activeWeekData.id, day.id), style: 'destructive' }
                                    ]);
                                  }}
                                >
                                  <Feather name="x" size={14} color={v.store.activeDayId === day.id ? "#FF5100" : "#A0A0A5"} />
                                </TouchableOpacity>
                              )}
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addDayPill} onPress={() => v.store.addDay(activeWeekData.id)}>
                            <Feather name="plus" size={16} color="#A0A0A5" />
                            <Text style={styles.addDayText}>Novo Treino</Text>
                        </TouchableOpacity>
                        </ScrollView>
                    </View>
                  )}

                </View>
              }
              ListFooterComponent={
                <View style={styles.listFooterContainer}>
                  
                  <TouchableOpacity style={styles.addExerciseBtn} onPress={() => navigation.navigate('ExerciseLibrary', { isSelectionMode: true, dayId: v.store.activeDayId })}>
                    <Feather name="plus-circle" size={22} color="#FF5100" />
                    <Text style={styles.addExerciseText}>ADICIONAR EXERCÍCIO</Text>
                  </TouchableOpacity>

                  {activeWeekData && (
                    <View style={styles.generalObsSection}>
                        <View style={styles.generalObsHeader}>
                        <Ionicons name="document-text-outline" size={18} color="#FF5100" />
                        <Text style={styles.generalObsTitle}>Orientação para a {activeWeekData.name}</Text>
                        </View>
                        <TextInput 
                        style={styles.generalObsInput} 
                        placeholder="Ex: Foco em sobrecarga progressiva nesta semana..." 
                        placeholderTextColor="#555" 
                        multiline 
                        textAlignVertical="top" 
                        value={activeWeekData.generalObservation} 
                        onChangeText={(obs) => v.store.setGeneralObservation(activeWeekData.id, obs)} 
                        />
                    </View>
                  )}

                </View>
              }
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <AIGeneratorModal visible={v.isAIModalVisible} onClose={() => v.setIsAIModalVisible(false)} onGenerate={v.handleGenerateAITraining} isLoading={v.isGeneratingAI} />
          
          <Modal visible={v.isImportModalVisible} animationType="slide" transparent={true} onRequestClose={() => v.setIsImportModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Importar Modelo</Text>
                  <TouchableOpacity onPress={() => v.setIsImportModalVisible(false)} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <Feather name="x" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
                {v.isFetchingPresets ? (
                  <View style={styles.modalLoading}>
                    <ActivityIndicator size="large" color="#FF5100" />
                    <Text style={styles.modalLoadingText}>Buscando modelos...</Text>
                  </View>
                ) : v.presetsList.length === 0 ? (
                  <View style={styles.modalEmpty}>
                    <Feather name="folder-minus" size={40} color="#555" />
                    <Text style={styles.modalEmptyText}>Nenhum modelo global encontrado.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={v.presetsList}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.presetCard} onPress={() => v.handleSelectPresetToImport(item.id)}>
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

          <Modal visible={v.showSuccessModal} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 }}>
              <View style={{ backgroundColor: "#0A0A0C", borderRadius: 24, padding: 30, alignItems: "center", borderWidth: 1, borderColor: "#00E676", shadowColor: "#00E676", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "#00E676" }}>
                  <Ionicons name="checkmark-done" size={40} color="#00E676" />
                </View>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#FFF", textAlign: "center", marginBottom: 10 }}>Treino Publicado!</Text>
                <Text style={{ fontSize: 14, color: "#AAA", textAlign: "center", marginBottom: 25, lineHeight: 22 }}>
                  A ficha foi salva com sucesso e já está disponível para o aluno no aplicativo.
                </Text>
                <TouchableOpacity 
                  style={{ backgroundColor: "#00E676", width: "100%", paddingVertical: 16, borderRadius: 16, alignItems: "center" }} 
                  onPress={() => { v.setShowSuccessModal(false); navigation.goBack(); }} 
                  activeOpacity={0.8}
                >
                  <Text style={{ color: "#000", fontSize: 15, fontWeight: "900", textTransform: "uppercase" }}>Voltar ao Painel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal visible={v.showAISuccessModal} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
              <View style={{ backgroundColor: '#161619', padding: 32, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#00E676', width: '100%', shadowColor: '#00E676', shadowOpacity: 0.4, shadowRadius: 20 }}>
                
                <View style={{ backgroundColor: 'rgba(0, 230, 118, 0.1)', padding: 16, borderRadius: 50, marginBottom: 16 }}>
                  <MaterialCommunityIcons name="robot-excited-outline" size={48} color="#00E676" />
                </View>
                
                <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 8, textAlign: 'center' }}>Magia Concluída!</Text>
                <Text style={{ color: '#A0A0A5', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                  A periodização de elite foi gerada com sucesso. Revise as cargas e anotações antes de publicar para o aluno.
                </Text>
                
                <TouchableOpacity 
                  style={{ backgroundColor: '#00E676', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                  onPress={() => v.setShowAISuccessModal(false)}
                >
                  <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>Incrível, revisar treino!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};