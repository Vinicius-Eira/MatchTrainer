import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./workoutSessionStyles";
import { useWorkoutSession } from "./useWorkoutSession";

export default function WorkoutSession({ route, navigation }: any) {
  const {
    treinoInfo, exercicios, indiceAtual, progressoBarra,
    emDescanso, tempoDescansoRestante, tempoTotalTreino, observacaoTreinoGeral,
    setObservacaoTreinoGeral, formatarTempo, atualizarExecucaoSerie, atualizarObservacaoAluno, 
    focarExercicio, concluirSerie, pularDescanso, cancelarTreino
  } = useWorkoutSession(navigation, route);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current && indiceAtual > 0) {
        setTimeout(() => scrollViewRef.current?.scrollTo({ y: indiceAtual * 100, animated: true }), 300);
    }
  }, [indiceAtual]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
           <TouchableOpacity style={styles.btnClose} onPress={cancelarTreino} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <Ionicons name="close" size={26} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleBox}>
                <Text style={styles.treinoTitleText}>{treinoInfo.nome}</Text>
                <View style={styles.globalTimerBadge}>
                    <Ionicons name="time-outline" size={14} color="#888" />
                    <Text style={styles.globalTimerText}>{formatarTempo(tempoTotalTreino)}</Text>
                </View>
            </View>
            <View style={{ width: 26 }} />
        </View>
        
        <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>{indiceAtual} de {exercicios.length} concluídos</Text>
        </View>
        <View style={styles.progressBarContainer}>
           <View style={[styles.progressBarFill, { width: `${progressoBarra}%` }]} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {exercicios.map((ex: any, exIndex: number) => {
            const isAtual = exIndex === indiceAtual;
            const isConcluido = ex.series.every((s: any) => s.concluida) && !isAtual;

            if (!isAtual) {
                return (
                    <TouchableOpacity key={ex.id} style={[styles.cardCompacto, isConcluido && styles.cardCompactoConcluido]} activeOpacity={0.8} onPress={() => focarExercicio(exIndex)}>
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                            {isConcluido ? (
                                <Ionicons name="checkmark-circle" size={24} color="#00E676" style={{ marginRight: 12 }} />
                            ) : (
                                <View style={styles.dotPronto} />
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.cardCompactoNome, isConcluido && { color: "#888", textDecorationLine: "line-through" }]}>{ex.nome}</Text>
                                <Text style={styles.cardCompactoMets}>{ex.series.length} séries • {ex.descanso}s descanso</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            }

            return (
              <View key={ex.id} style={styles.cardPlayer}>
                
                <View style={styles.playerHeader}>
                    <View style={styles.videoContainer}>
                        {ex.imagem_url ? (
                        <Image source={{ uri: ex.imagem_url }} style={styles.mediaImage} />
                        ) : (
                        <View style={styles.mediaPlaceholder}><MaterialCommunityIcons name="weight-lifter" size={32} color="#333" /></View>
                        )}
                        <View style={styles.playOverlay}><Ionicons name="play" size={20} color="#FFF" style={{marginLeft:2}} /></View>
                    </View>

                    <View style={styles.infoRightContainer}>
                        <View>
                            <Text style={styles.labelAtual}>EXERCÍCIO {exIndex + 1}</Text>
                            <Text style={styles.nomeAtual}>{ex.nome}</Text>
                            {ex.grupo_muscular && <Text style={styles.grupoAtual}>{ex.grupo_muscular}</Text>}
                        </View>
                    </View>
                </View>

                {ex.observacao_personal ? (
                    <View style={styles.obsPersonalBox}>
                        <Text style={styles.obsPersonalLabel}>Orientação do Personal</Text>
                        <Text style={styles.obsPersonalText}>{ex.observacao_personal}</Text>
                    </View>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.seriesContainer}>
                    {ex.series.map((serie: any, sIndex: number) => {
                        const isAtiva = !serie.concluida && (sIndex === 0 || ex.series[sIndex - 1].concluida);

                        return (
                            <View key={sIndex} style={[styles.serieCard, serie.concluida && styles.serieCardConcluido, isAtiva && styles.serieCardAtivo]}>
                                
                                <View style={styles.serieCardHeader}>
                                    <Text style={[styles.serieTitle, serie.concluida && { color: "#00E676" }]}>SÉRIE {serie.numero.toString().padStart(2, '0')}</Text>
                                    <View style={styles.descansoBadge}>
                                        <Ionicons name="timer-outline" size={14} color="#888" />
                                        <Text style={styles.descansoBadgeText}>{ex.descanso}s</Text>
                                    </View>
                                </View>

                                <View style={styles.serieCardBody}>
                                    <View style={styles.seriePrescricaoRow}>
                                        <Text style={styles.dataLabel}>PRESCRITO:</Text>
                                        <Text style={[styles.dataPrescrito, serie.concluida && styles.textoOpacity]}>
                                            {serie.reps_alvo} reps  ·  {serie.carga_alvo} kg
                                        </Text>
                                    </View>

                                    <View style={styles.serieRealizadoContainer}>
                                        <Text style={styles.dataLabelHighlight}>MEU RESULTADO</Text>
                                        <View style={styles.inputsBigRow}>
                                            <View style={[styles.inputBigWrapper, isAtiva && styles.inputBigWrapperAtivo]}>
                                                <TextInput 
                                                    style={[styles.inputBigRealizado, serie.concluida && styles.inputBigRealizadoConcluido]} 
                                                    keyboardType="numeric" 
                                                    value={serie.reps_feitas} 
                                                    onChangeText={(v) => atualizarExecucaoSerie(exIndex, sIndex, 'reps_feitas', v)} 
                                                    editable={isAtiva}
                                                />
                                                <Text style={[styles.inputBigSuffix, serie.concluida && styles.textoOpacity]}>reps</Text>
                                            </View>
                                            
                                            <View style={[styles.inputBigWrapper, isAtiva && styles.inputBigWrapperAtivo]}>
                                                <TextInput 
                                                    style={[styles.inputBigRealizado, serie.concluida && styles.inputBigRealizadoConcluido]} 
                                                    keyboardType="numeric" 
                                                    value={serie.carga_feita} 
                                                    onChangeText={(v) => atualizarExecucaoSerie(exIndex, sIndex, 'carga_feita', v)} 
                                                    editable={isAtiva}
                                                />
                                                <Text style={[styles.inputBigSuffix, serie.concluida && styles.textoOpacity]}>kg</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={[styles.btnAction, serie.concluida ? styles.btnActionConcluido : (isAtiva ? styles.btnActionAtivo : styles.btnActionInativo)]} 
                                    onPress={() => isAtiva && concluirSerie(exIndex, sIndex)}
                                    disabled={!isAtiva}
                                >
                                    {serie.concluida ? (
                                        <>
                                            <Ionicons name="checkmark-circle" size={20} color="#00E676" />
                                            <Text style={styles.btnActionTextConcluido}>CONCLUÍDA</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="ellipse-outline" size={20} color={isAtiva ? "#000" : "#555"} />
                                            <Text style={[styles.btnActionText, !isAtiva && { color: "#555" }]}>CONCLUIR SÉRIE</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                            </View>
                        );
                    })}
                </View>

                <View style={styles.divider} />

                <View style={styles.alunoObsContainer}>
                    <View style={styles.alunoObsHeader}>
                        <Text style={styles.alunoObsTitle}>📝 Observação do Exercício</Text>
                        <Text style={styles.alunoObsHint}>(O personal verá isso)</Text>
                    </View>
                    <TextInput 
                        style={styles.alunoObsInput} 
                        placeholder="Ex: Última série foi até a falha..." 
                        placeholderTextColor="#555" 
                        value={ex.observacao_aluno} 
                        onChangeText={(v) => atualizarObservacaoAluno(exIndex, v)} 
                        multiline 
                    />
                </View>

              </View>
            );
          })}

          <View style={styles.feedbackGeralContainer}>
              <View style={styles.alunoObsHeader}>
                  <Text style={styles.feedbackGeralTitle}>📝 Feedback Geral do Treino</Text>
                  <Text style={styles.alunoObsHint}>(O personal verá isso)</Text>
              </View>
              <Text style={styles.feedbackGeralSub}>Como foi o seu desempenho geral hoje?</Text>
              <TextInput 
                  style={styles.alunoObsInput} 
                  placeholder="Ex: Treino rendeu muito! Senti facilidade em costas..." 
                  placeholderTextColor="#555" 
                  value={observacaoTreinoGeral} 
                  onChangeText={setObservacaoTreinoGeral} 
                  multiline 
              />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {emDescanso && (
        <View style={styles.floatingRestBar}>
          <LinearGradient colors={["rgba(5,5,5,0.95)", "#050505"]} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
          <View style={styles.restInfo}>
             <Ionicons name="timer" size={32} color="#00E676" />
             <View style={{ marginLeft: 15 }}>
                <Text style={styles.restTitle}>TEMPO DE DESCANSO</Text>
                <Text style={styles.restTimer}>{formatarTempo(tempoDescansoRestante)}</Text>
             </View>
          </View>
          <TouchableOpacity style={styles.btnPularDescanso} onPress={pularDescanso}>
             <Text style={styles.btnPularText}>PULAR</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}