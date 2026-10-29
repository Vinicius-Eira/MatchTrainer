import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./styles";
import { useWorkoutSession } from "./useWorkoutSession";

import { PainModal } from '../../../../components/training/PainModal';
import { RestTimer } from '../../../../components/training/RestTimer';
import { FinishWorkoutModal } from '../../../../components/training/FinishWorkoutModal';

export function WorkoutSession({ route, navigation }: any) {
  const {
    conexaoId,
    treinoInfo, exercicios, progressoBarra,
    emDescanso, tempoDescansoRestante, tempoTotalTreino,
    mostrarFinalizacao, setMostrarFinalizacao,
    modalDorVisivel, exercicioDorId, exercicioDorNome, abrirModalDor, fecharModalDor, handleDorRegistradaSucesso,
    formatarTempo, atualizarExecucaoSerie, atualizarObservacaoAluno,
    concluirSerie, pularDescanso, cancelarTreino
  } = useWorkoutSession(navigation, route);

  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [fullScreenMedia, setFullScreenMedia] = useState<string | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? -1 : index));
  };

  const getStats = () => {
    let setsCompleted = 0;
    let totalSets = 0;
    exercicios.forEach(e => {
      const seriesList = e.series || [];
      totalSets += seriesList.length;
      setsCompleted += seriesList.filter((s: any) => s.concluida).length;
    });
    return {
      durationSeconds: tempoTotalTreino,
      exercisesCompleted: exercicios.filter(e => (e.series || []).every((s: any) => s.concluida)).length,
      totalExercises: exercicios.length,
      setsCompleted,
      totalSets
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={"#050505" as any} translucent={false} />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.btnClose} onPress={cancelarTreino} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>

          <View style={styles.dynamicIsland}>
            <Ionicons name="time-outline" size={16} color="#FF6B00" />
            <Text style={styles.globalTimerText}> {formatarTempo(tempoTotalTreino)}</Text>
            <View style={{ width: 1, height: 12, backgroundColor: '#333', marginHorizontal: 10 }} />
            <Text style={styles.treinoTitleText} numberOfLines={1}>{treinoInfo.nome}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Progresso do Treino</Text>
            <Text style={styles.progressValue}>{Math.floor(progressoBarra)}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressoBarra}%`, backgroundColor: progressoBarra === 100 ? "#00E676" : "#FF6B00" }]} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {exercicios.map((ex, index) => {
            const isExpanded = expandedIndex === index;
            const isCompleted = ex.series.length > 0 && ex.series.every((s: any) => s.concluida);

            return (
              <View key={ex.id} style={[styles.cardContainer, isExpanded && styles.cardContainerExpanded, isCompleted && !isExpanded && styles.cardContainerCompleted]}>
                
                <TouchableOpacity style={styles.cardHeader} activeOpacity={0.7} onPress={() => toggleExpand(index)}>
                  <View style={styles.thumbnailContainer}>
                    {ex.imagem_url ? (
                      <>
                        <Image source={{ uri: ex.imagem_url }} style={styles.thumbnail} />
                        <View style={styles.thumbnailPlayOverlay}>
                          <Ionicons name="play" size={14} color="#FFF" style={{ marginLeft: 2 }} />
                        </View>
                      </>
                    ) : (
                      <MaterialCommunityIcons name="weight-lifter" size={28} color="#444" />
                    )}
                  </View>
                  
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, isCompleted && !isExpanded && { textDecorationLine: "line-through", color: "#888" }]} numberOfLines={1}>
                      {ex.nome}
                    </Text>
                    <Text style={styles.cardSubtitle}>{ex.series.length} séries • {ex.grupo_muscular}</Text>
                  </View>

                  <View style={styles.cardIconBox}>
                    {isCompleted && !isExpanded ? (
                      <Ionicons name="checkmark-circle" size={26} color="#00E676" />
                    ) : (
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={22} color="#888" />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.cardBody}>
                    <View style={styles.divider} />
                    
                    <TouchableOpacity 
                      style={styles.expandedMediaContainer}
                      activeOpacity={0.8}
                      onPress={() => ex.imagem_url && setFullScreenMedia(ex.imagem_url)}
                    >
                      {ex.imagem_url ? (
                        <Image source={{ uri: ex.imagem_url }} style={styles.expandedMedia} />
                      ) : (
                        <MaterialCommunityIcons name="weight-lifter" size={56} color="#333" />
                      )}
                      
                      {ex.imagem_url && (
                        <View style={styles.expandedPlayOverlay}>
                          <Ionicons name="play" size={30} color="#FFF" style={{ marginLeft: 4 }} />
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    {ex.observacao_personal ? (
                      <View style={styles.obsPersonalBox}>
                        <Ionicons name="chatbubble-ellipses" size={16} color="#FF6B00" style={{ marginTop: 2 }} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.obsPersonalLabel}>Orientação do Personal</Text>
                          <Text style={styles.obsPersonalText}>{ex.observacao_personal}</Text>
                        </View>
                      </View>
                    ) : null}

                    <View style={styles.seriesHeaderTitles}>
                      <Text style={styles.seriesHeaderLabelTitle}>SÉRIE</Text>
                      <Text style={styles.seriesHeaderLabelCenter}>TEMPO</Text>
                      <Text style={styles.seriesHeaderLabelCenter}>REPS</Text>
                      <Text style={styles.seriesHeaderLabelCenter}>CARGA (KG)</Text>
                      <Text style={styles.seriesHeaderLabelCheck}>FEITO</Text>
                    </View>

                    {ex.series.map((serie: any, sIndex: number) => {
                      const isAtiva = !serie.concluida && (sIndex === 0 || ex.series[sIndex - 1].concluida);
                      return (
                        <View key={serie.id} style={[styles.serieRow, serie.concluida && styles.serieRowConcluido, isAtiva && styles.serieRowAtiva]}>
                          <View style={styles.serieColNumber}>
                            <Text style={[styles.serieNumberText, serie.concluida && { color: "#00E676" }]}>{serie.numero}</Text>
                          </View>
                          
                          <View style={styles.serieColTempo}>
                            <Text style={[styles.serieTargetText, serie.concluida && styles.textDimmed]}>
                              {serie.tempo_alvo} 
                            </Text>
                          </View>
                          
                          <View style={styles.serieColTarget}>
                            <Text style={[styles.serieTargetText, serie.concluida && styles.textDimmed]}>{serie.reps_alvo}</Text>
                          </View>
                          
                          <View style={styles.serieColInput}>
                            <TextInput
                              style={[styles.inputCarga, serie.concluida && styles.inputCargaConcluida]}
                              keyboardType="numeric"
                              value={String(serie.carga_feita)}
                              onChangeText={(v) => atualizarExecucaoSerie(index, sIndex, 'carga_feita', v)}
                              editable={isAtiva}
                              placeholder="0"
                              placeholderTextColor="#444"
                            />
                          </View>
                          
                          <View style={styles.serieColCheck}>
                            <TouchableOpacity
                              style={[styles.btnCheckSerie, serie.concluida ? styles.btnCheckSerieConcluido : (isAtiva ? styles.btnCheckSerieAtivo : styles.btnCheckSerieInativo)]}
                              onPress={() => isAtiva && concluirSerie(index, sIndex)}
                              disabled={!isAtiva}
                            >
                              <Ionicons name="checkmark" size={18} color={serie.concluida ? "#000" : (isAtiva ? "#FFF" : "#444")} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}

                    <View style={styles.divider} />

                    <View style={styles.alunoAcoesContainer}>
                      <Text style={styles.alunoAcoesTitle}>Detalhes da Execução (Opcional)</Text>
                      <TextInput
                        style={styles.alunoObsInput}
                        placeholder="Ex: Tive dificuldade na última série..."
                        placeholderTextColor="#555"
                        value={ex.observacao_aluno}
                        onChangeText={(v) => atualizarObservacaoAluno(index, v)}
                        multiline
                      />
                      
                      <TouchableOpacity
                        style={styles.btnRelatarDor}
                        onPress={() => abrirModalDor(ex.id, ex.nome)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.btnRelatarDorIconBox}>
                          <Ionicons name="warning" size={16} color="#EF4444" />
                        </View>
                        <Text style={styles.btnRelatarDorText}>Relatar Dor ou Desconforto</Text>
                        <Ionicons name="chevron-forward" size={18} color="rgba(239, 68, 68, 0.5)" />
                      </TouchableOpacity>
                    </View>

                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity 
            style={styles.btnFinalizarOutline} 
            onPress={() => {
              navigation.replace("WorkoutCompletion", { 
                tempoTotal: tempoTotalTreino, 
                conexaoId: conexaoId, 
                treinoId: treinoInfo.id, 
                exercicios: exercicios 
              });
            }} 
            activeOpacity={0.7}
          >
            <Text style={styles.btnFinalizarOutlineText}>FINALIZAR TREINO</Text>
            <Ionicons name="flag" size={18} color="#FF6B00" />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={emDescanso} transparent={true} animationType="fade">
        <View style={styles.restModalContainer}>
          <View style={styles.restModalBox}>
            <MaterialCommunityIcons name="timer-sand" size={48} color="#004d27" style={{ marginBottom: 10 }} />
            <Text style={styles.restModalTitle}>Tempo de Descanso</Text>
            <Text style={styles.restModalTime}>{formatarTempo(tempoDescansoRestante)}</Text>
            
            <TouchableOpacity style={styles.restModalBtn} onPress={pularDescanso} activeOpacity={0.8}>
              <Text style={styles.restModalBtnText}>PULAR DESCANSO</Text>
              <Ionicons name="play-skip-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!fullScreenMedia} transparent={true} animationType="fade" onRequestClose={() => setFullScreenMedia(null)}>
        <View style={styles.fullScreenModalContainer}>
          <TouchableOpacity style={styles.btnCloseFullScreen} onPress={() => setFullScreenMedia(null)}>
            <Ionicons name="close" size={26} color="#FFF" />
          </TouchableOpacity>
          {fullScreenMedia && ( <Image source={{ uri: fullScreenMedia }} style={styles.fullScreenMedia} /> )}
        </View>
      </Modal>

      <PainModal
        isVisible={modalDorVisivel} onClose={fecharModalDor} session_id={treinoInfo.id}
        session_exercise_id={exercicioDorId} exercicioNome={exercicioDorNome} onSaveSuccess={handleDorRegistradaSucesso}
      />

      <FinishWorkoutModal
        isVisible={mostrarFinalizacao}
        onClose={() => {
          setMostrarFinalizacao(false);
          setTimeout(() => { navigation.replace("WorkoutCompletion", { tempoTotal: tempoTotalTreino, conexaoId, treinoId: treinoInfo.id, exercicios }); }, 400);
        }}
        session_id={treinoInfo.id} stats={getStats()}
      />

    </SafeAreaView>
  );
}