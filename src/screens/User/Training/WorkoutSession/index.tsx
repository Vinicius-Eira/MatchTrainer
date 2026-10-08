import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { useWorkoutSession } from "./useWorkoutSession";
import { PainModal } from '../../../../components/training/PainModal'; 

export function WorkoutSession({ route, navigation }: any) {
  const {
    treinoInfo, exercicios, indiceAtual, progressoBarra,
    emDescanso, tempoDescansoRestante, tempoTotalTreino, observacaoTreinoGeral,
    setObservacaoTreinoGeral, formatarTempo, atualizarExecucaoSerie, atualizarObservacaoAluno, 
    focarExercicio, concluirSerie, pularDescanso, cancelarTreino, finalizarTreinoNoBanco,
    mostrarFinalizacao, nivelEsforco, setNivelEsforco, sentiuDor, setSentiuDor,
    modalDorVisivel, exercicioDorId, abrirModalDor, fecharModalDor, handleDorRegistradaSucesso 
  } = useWorkoutSession(navigation, route);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current && indiceAtual > 0 && !mostrarFinalizacao) {
        setTimeout(() => scrollViewRef.current?.scrollTo({ y: indiceAtual * 110, animated: true }), 300);
    }
    if (mostrarFinalizacao) {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
    }
  }, [indiceAtual, mostrarFinalizacao]);

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
            <Text style={styles.progressLabel}>{Math.floor(progressoBarra)}% Concluído</Text>
        </View>
        <View style={styles.progressBarContainer}>
           <View style={[styles.progressBarFill, { width: `${progressoBarra}%`, backgroundColor: progressoBarra === 100 ? "#00E676" : "#FF6B00" }]} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {exercicios.map((ex: any, exIndex: number) => {
            const isAtual = exIndex === indiceAtual && !mostrarFinalizacao;
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
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                                            <Text style={styles.dataLabelHighlight}>MEU RESULTADO</Text>
                                            {serie.carga_historico && (
                                                <Text style={{color: "#888", fontSize: 10, fontStyle: 'italic'}}>Último: {serie.carga_historico}kg</Text>
                                            )}
                                        </View>
                                        
                                        <View style={styles.inputsBigRow}>
                                            <View style={[styles.inputBigWrapper, isAtiva && styles.inputBigWrapperAtivo]}>
                                                <TextInput 
                                                    style={[styles.inputBigRealizado, serie.concluida && styles.inputBigRealizadoConcluido]} 
                                                    keyboardType="numeric" 
                                                    value={String(serie.reps_feitas)} 
                                                    onChangeText={(v) => atualizarExecucaoSerie(exIndex, sIndex, 'reps_feitas', v)} 
                                                    editable={isAtiva}
                                                />
                                                <Text style={[styles.inputBigSuffix, serie.concluida && styles.textoOpacity]}>reps</Text>
                                            </View>
                                            
                                            <View style={[styles.inputBigWrapper, isAtiva && styles.inputBigWrapperAtivo]}>
                                                <TextInput 
                                                    style={[styles.inputBigRealizado, serie.concluida && styles.inputBigRealizadoConcluido]} 
                                                    keyboardType="numeric" 
                                                    value={String(serie.carga_feita)} 
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
                    </View>
                    <TextInput 
                        style={styles.alunoObsInput} 
                        placeholder="Ex: Última série foi até a falha..." 
                        placeholderTextColor="#555" 
                        value={ex.observacao_aluno} 
                        onChangeText={(v) => atualizarObservacaoAluno(exIndex, v)} 
                        multiline 
                    />

                    <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onPress={() => abrirModalDor(ex.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="warning" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Senti dor neste movimento</Text>
                    </TouchableOpacity>

                </View>

              </View>
            );
          })}

          {mostrarFinalizacao && (
            <View style={[styles.cardPlayer, { borderColor: "#00E676", backgroundColor: "#111" }]}>
                <View style={{alignItems: 'center', marginBottom: 20}}>
                    <Ionicons name="trophy" size={40} color="#00E676" />
                    <Text style={[styles.nomeAtual, { color: "#00E676", marginTop: 10, textAlign: 'center' }]}>Treino Finalizado!</Text>
                    <Text style={{color: '#888', textAlign: 'center', fontSize: 13, marginTop: 5}}>Quase lá. Precisamos apenas do seu feedback para o professor ajustar sua próxima carga.</Text>
                </View>

                <View style={styles.divider} />

                <Text style={[styles.alunoObsTitle, {marginBottom: 15}]}>⚡ Qual foi o Nível de Esforço (RPE)?</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30}}>
                    {[
                        {v: 5, t: 'Leve', c: '#4ADE80'},
                        {v: 7, t: 'Ideal', c: '#FFB020'},
                        {v: 9, t: 'Pesado', c: '#F87171'}
                    ].map(rpe => (
                        <TouchableOpacity 
                            key={rpe.v} 
                            style={{ flex: 1, alignItems: 'center', padding: 10, borderWidth: 1, borderColor: nivelEsforco === rpe.v ? rpe.c : '#333', borderRadius: 8, marginHorizontal: 4, backgroundColor: nivelEsforco === rpe.v ? `${rpe.c}15` : 'transparent'}}
                            onPress={() => setNivelEsforco(rpe.v)}
                        >
                            <Text style={{color: nivelEsforco === rpe.v ? rpe.c : '#888', fontWeight: 'bold'}}>{rpe.t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.alunoObsTitle, {marginBottom: 15}]}>🏥 Sentiu alguma dor ou desconforto articular?</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30}}>
                    <TouchableOpacity 
                        style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: sentiuDor === false ? '#00E676' : '#333', borderRadius: 8, marginRight: 5, backgroundColor: sentiuDor === false ? 'rgba(0,230,118,0.1)' : 'transparent'}}
                        onPress={() => setSentiuDor(false)}
                    >
                        <Ionicons name="thumbs-up" size={16} color={sentiuDor === false ? "#00E676" : "#888"} style={{marginRight: 6}}/>
                        <Text style={{color: sentiuDor === false ? '#00E676' : '#888', fontWeight: 'bold'}}>Não, 100%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: sentiuDor === true ? '#F87171' : '#333', borderRadius: 8, marginLeft: 5, backgroundColor: sentiuDor === true ? 'rgba(248,113,113,0.1)' : 'transparent'}}
                        onPress={() => setSentiuDor(true)}
                    >
                        <Ionicons name="warning" size={16} color={sentiuDor === true ? "#F87171" : "#888"} style={{marginRight: 6}}/>
                        <Text style={{color: sentiuDor === true ? '#F87171' : '#888', fontWeight: 'bold'}}>Sim, senti</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.alunoObsHeader}>
                    <Text style={styles.alunoObsTitle}>📝 Algo mais a relatar?</Text>
                </View>
                <TextInput 
                    style={styles.alunoObsInput} 
                    placeholder="Ex: A academia estava muito cheia, não fiz esteira..." 
                    placeholderTextColor="#555" 
                    value={observacaoTreinoGeral} 
                    onChangeText={setObservacaoTreinoGeral} 
                    multiline 
                />

                <TouchableOpacity 
                    style={[styles.btnAction, {backgroundColor: '#00E676', marginTop: 20, height: 55}]} 
                    onPress={finalizarTreinoNoBanco}
                >
                    <Text style={[styles.btnActionText, {color: '#000', fontSize: 16}]}>FINALIZAR E ENVIAR</Text>
                </TouchableOpacity>

            </View>
          )}

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

      <PainModal 
        isVisible={modalDorVisivel} 
        onClose={fecharModalDor}
        session_id={treinoInfo.id}
        session_exercise_id={exercicioDorId}
        onSaveSuccess={handleDorRegistradaSucesso}
      />

    </SafeAreaView>
  );
};