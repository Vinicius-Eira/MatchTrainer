import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, Platform, Modal, FlatList, KeyboardAvoidingView } from 'react-native';
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
  const activeDayData = v.store.days.find(d => d.id === v.store.activeDayId);

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

              <TouchableOpacity style={styles.publishBtn} onPress={v.handleSaveAndPublish} disabled={v.isPublishing || (activeDayData?.exercises.length === 0)}>
                {v.isPublishing ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.publishText}>{v.isPresetMode ? 'Salvar' : 'Publicar'}</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.container}>
            <DraggableFlatList
              data={activeDayData?.exercises || []}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => {
                if (v.store.activeDayId) v.store.reorderExercises(v.store.activeDayId, data);
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
                        <Text style={styles.inputLabel}>NOME DA FICHA</Text>
                        <View style={styles.inputBox}>
                          <MaterialCommunityIcons name="format-title" size={20} color="#FF5100" style={styles.inputIcon} />
                          <TextInput 
                            style={styles.inputTitleLarge} 
                            placeholder={v.isPresetMode ? "Ex: Hipertrofia Iniciante" : "Ex: Treino A - Costas"} 
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

                  <View style={styles.daysWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                      {v.store.days.map((day) => (
                        <TouchableOpacity key={day.id} style={[styles.dayPill, v.store.activeDayId === day.id && styles.dayPillActive]} onPress={() => v.store.setActiveDay(day.id)}>
                          <MaterialCommunityIcons name="calendar-today" size={16} color={v.store.activeDayId === day.id ? "#FF5100" : "#A0A0A5"} style={{ marginRight: 6 }} />
                          <Text style={[styles.dayPillText, v.store.activeDayId === day.id && styles.dayPillTextActive]}>{day.name}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={styles.addDayPill} onPress={v.store.addDay}>
                        <Feather name="plus" size={16} color="#A0A0A5" />
                        <Text style={styles.addDayText}>Novo Treino</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              }
              ListFooterComponent={
                <View style={styles.listFooterContainer}>
                  
                  <TouchableOpacity style={styles.addExerciseBtn} onPress={() => navigation.navigate('ExerciseLibrary', { isSelectionMode: true, dayId: v.store.activeDayId })}>
                    <Feather name="plus-circle" size={22} color="#FF5100" />
                    <Text style={styles.addExerciseText}>ADICIONAR EXERCÍCIO</Text>
                  </TouchableOpacity>

                  <View style={styles.generalObsSection}>
                    <View style={styles.generalObsHeader}>
                      <Ionicons name="document-text-outline" size={18} color="#FF5100" />
                      <Text style={styles.generalObsTitle}>Observações Gerais da Ficha</Text>
                    </View>
                    <TextInput 
                      style={styles.generalObsInput} 
                      placeholder="Dicas globais (Ex: Aquecer 10min na esteira)..." 
                      placeholderTextColor="#555" 
                      multiline 
                      textAlignVertical="top" 
                      value={v.store.generalObservation} 
                      onChangeText={v.store.setGeneralObservation} 
                    />
                  </View>
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

        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}