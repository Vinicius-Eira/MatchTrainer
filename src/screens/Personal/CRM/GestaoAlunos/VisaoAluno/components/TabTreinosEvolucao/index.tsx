import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from '../../styles'; 
import { localStyles } from './styles'; 
import { theme } from '../../../../../../../theme/theme';
import { verticalScale } from '../../../../../../../utils/responsive';
import { supabase } from '../../../../../../../services/supabase';
import { AlertaDorAluno } from '../RelatoDor';

const BentoCardBio = ({ titulo, valor, unidade, variacao, corV, icone, descricao }: any) => (
  <View style={localStyles.bentoCard}>
    <View style={localStyles.bentoHeaderRow}>
      <Ionicons name={icone} size={14} color="#666" style={localStyles.bentoIcon} />
      <Text style={localStyles.bentoTitle}>{titulo}</Text>
    </View>
    <View style={localStyles.bentoValueRow}>
      <Text style={localStyles.bentoValue}>{valor}</Text>
      <Text style={localStyles.bentoUnit}>{unidade}</Text>
    </View>
    <Text style={localStyles.bentoDesc}>{descricao}</Text>
  </View>
);

const BentoDesempenho = ({ valor, titulo, icone, descricao, corDestaque = "#FFF" }: any) => (
  <View style={localStyles.bentoCard}>
    <View style={localStyles.desempenhoHeaderRow}>
      <Ionicons name={icone} size={16} color={theme.colors.primary} style={localStyles.bentoIcon} />
      <Text style={localStyles.desempenhoTitle}>{titulo}</Text>
    </View>
    <Text style={{ color: corDestaque, fontSize: 22, fontWeight: '900', marginBottom: 6 }}>{valor}</Text>
    <Text style={localStyles.desempenhoDesc}>{descricao}</Text>
  </View>
);

const getAnaliseIntensidade = (rpe?: number | null) => {
  if (!rpe) {
    return {
      label: "Concluído",
      texto: "Check-in Concluído",
      sub: "Sessão registrada sem nota de esforço",
      percentual: 100,
      cor: "#00E676"
    };
  }

  if (rpe === 1) {
    return { label: "Leve", texto: "Esforço Leve / Recuperação", sub: "Carga confortável, margem para progredir", percentual: 40, cor: "#00E676" };
  }
  if (rpe === 2) {
    return { label: "Moderado", texto: "Estímulo Moderado (Zona Alvo)", sub: "Boa intensidade e controle de execução", percentual: 70, cor: "#FFB300" };
  }
  if (rpe === 3) {
    return { label: "Intenso", texto: "Treino Intenso", sub: "Alto recrutamento e foco muscular", percentual: 85, cor: "#FF6B00" };
  }

  if (rpe <= 4) {
    return { label: "Leve", texto: "Esforço Leve / Recuperação", sub: "Carga confortável, margem para progredir", percentual: 40, cor: "#00E676" };
  }
  if (rpe <= 7) {
    return { label: "Moderado", texto: "Estímulo Moderado (Zona Alvo)", sub: "Boa intensidade e controle de execução", percentual: 70, cor: "#FFB300" };
  }
  if (rpe <= 8) {
    return { label: "Intenso", texto: "Treino Intenso", sub: "Próximo à falha, excelente recrutamento", percentual: 85, cor: "#FF6B00" };
  }
  return { label: "Máximo", texto: "Exigência Máxima / Limite", sub: "Atenção à recuperação para a próxima sessão", percentual: 100, cor: "#EF4444" };
};

export function TabTreinosEvolucao({ 
  aluno, 
  conexaoId,
  navigation,
  mostrarAjudaAdesao, 
  streak, 
  adesao, 
  ultimosLogs 
}: any) {
  
  const temDados = adesao && adesao.length > 0;
  const [abaVisualizacao, setAbaVisualizacao] = useState<'evolucao' | 'corpo'>('evolucao');
  const [tipoSegmentar, setTipoSegmentar] = useState<'gordura' | 'massa'>('gordura');
  const [ocultarAlertaDor, setOcultarAlertaDor] = useState(false);

  const [idConexaoReal, setIdConexaoReal] = useState<string | null>(conexaoId || null);
  const [recadoAtualSalvo, setRecadoAtualSalvo] = useState<string>("");
  const [novoRecadoInput, setNovoRecadoInput] = useState<string>("");
  const [dataUltimoRecado, setDataUltimoRecado] = useState<string | null>(null);
  const [editorFeedbackAberto, setEditorFeedbackAberto] = useState(false);
  const [salvandoRecado, setSalvandoRecado] = useState(false);

  const [treinoSelecionado, setTreinoSelecionado] = useState<any | null>(null);
  const [exercicioExpandidoId, setExercicioExpandidoId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const carregarRecadoExistente = async () => {
      try {
        let query = supabase.from('conexoes').select('id, recado_evolucao, data_recado');
        if (conexaoId) {
          query = query.eq('id', conexaoId);
        } else if (aluno?.id) {
          query = query.eq('usuario_id', aluno.id).in('status', ['aluno_ativo', 'aguardando_assinatura', 'pendente']);
        } else {
          return;
        }

        const { data } = await query.maybeSingle();
        if (data && isMounted) {
          setIdConexaoReal(data.id);
          setRecadoAtualSalvo(data.recado_evolucao || "");
          if (data.data_recado) {
            setDataUltimoRecado(new Date(data.data_recado).toLocaleDateString('pt-BR'));
          }
        }
      } catch (err) {
        console.log("Erro ao carregar recado do personal:", err);
      }
    };

    carregarRecadoExistente();
    return () => { isMounted = false; };
  }, [conexaoId, aluno?.id]);

  const abrirEditorNovoFeedback = () => {
    setNovoRecadoInput("");
    setEditorFeedbackAberto(true);
  };

  const salvarFeedbackEvolucao = async () => {
    if (!idConexaoReal) {
      return Alert.alert("Erro", "Vínculo do aluno não localizado.");
    }
    const textoLimpo = novoRecadoInput.trim();
    if (!textoLimpo) {
      return Alert.alert("Campo vazio", "Escreva uma mensagem antes de enviar para o aluno.");
    }

    setSalvandoRecado(true);
    try {
      const agoraIso = new Date().toISOString();

      const { error } = await supabase
        .from('conexoes')
        .update({
          recado_evolucao: textoLimpo,
          data_recado: agoraIso
        })
        .eq('id', idConexaoReal);

      if (error) throw error;

      setRecadoAtualSalvo(textoLimpo);
      setDataUltimoRecado(new Date(agoraIso).toLocaleDateString('pt-BR'));
      setNovoRecadoInput("");
      setEditorFeedbackAberto(false);
    } catch (err) {
      console.log("Erro ao salvar feedback:", err);
      Alert.alert("Erro", "Não foi possível enviar o feedback.");
    } finally {
      setSalvandoRecado(false);
    }
  };

  const abrirDetalhesExecucao = (log: any) => {
    setTreinoSelecionado(log);
    const primeiroExId = log?.exerciciosDetalhados?.[0]?.id || null;
    setExercicioExpandidoId(primeiroExId);
  };

  const fecharDetalhesExecucao = () => {
    setTreinoSelecionado(null);
    setExercicioExpandidoId(null);
  };

  const alternarExercicioExpandido = (exId: string) => {
    setExercicioExpandidoId(prev => (prev === exId ? null : exId));
  };

  let prefs: any = {};
  try { prefs = typeof aluno?.preferencias === 'string' ? JSON.parse(aluno.preferencias) : aluno?.preferencias || {}; } catch(e){}
  const metaDePeso = prefs?.meta_peso || "--";

  const compMock = {
    gordura: "--", massa: "--", agua: "--", visceral: "--", tmb: "--",
    segmentar: { bracoDir: "--", bracoEsq: "--", tronco: "--", pernaDir: "--", pernaEsq: "--" }
  };

  const analiseModal = treinoSelecionado ? getAnaliseIntensidade(treinoSelecionado.rpe) : null;
  const dataModalFormatada = treinoSelecionado?.created_at
    ? new Date(treinoSelecionado.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '--/--/----';

  return (
    <View style={styles.sectionContainer}>

      {!ocultarAlertaDor && (
        <AlertaDorAluno 
          alunoId={aluno.id} 
          onResolvido={() => setOcultarAlertaDor(true)} 
        />
      )}

      <View style={[styles.sectionHeaderRow, { marginBottom: verticalScale(12) }]}>
        <FontAwesome5 name="dumbbell" size={20} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Programas de Treino</Text>
      </View>

      <View style={styles.treinosMainCard}>
        <View style={styles.treinosCardHeader}>
          <View style={styles.treinosIconBg}>
            <Ionicons name="list" size={28} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.treinosCardTitle}>Gestão de Fichas</Text>
            <Text style={styles.treinosCardDesc}>Controle as planilhas e rotinas ativas</Text>
          </View>
        </View>
        
        <View style={styles.treinosActionRow}>
          <TouchableOpacity style={styles.btnVerTreinos} onPress={() => navigation.navigate("ListaTreinosAluno", { alunoId: aluno?.id, alunoNome: aluno?.nome })} activeOpacity={0.8}>
            <Ionicons name="eye" size={18} color={theme.colors.primary} />
            <Text style={styles.btnVerTreinosText}>Ver Treinos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnVerTreinos} onPress={() => navigation.navigate("HistoricoTreinosAluno", { alunoId: aluno?.id, alunoNome: aluno?.nome })} activeOpacity={0.8}>
            <Ionicons name="archive-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.btnVerTreinosText}>Histórico</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.sectionHeaderRow, { marginTop: verticalScale(26), marginBottom: verticalScale(12) }]}>
        <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Conexão & Feedback</Text>
      </View>

      <View style={localStyles.feedbackCardWrapper}>
        <LinearGradient colors={['rgba(255, 107, 0, 0.12)', 'transparent']} style={localStyles.gradientFill} />

        <View style={localStyles.feedbackTopRow}>
          <View style={localStyles.feedbackIconBox}>
            <Ionicons name="megaphone-outline" size={20} color="#FF6B00" />
          </View>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={localStyles.feedbackMainTitle}>Feedback para o Aluno</Text>
            <Text style={localStyles.feedbackSubtitle}>
              {recadoAtualSalvo 
                ? `Último envio em ${dataUltimoRecado || 'Recente'}` 
                : 'Destaque orientações no painel principal do aluno'}
            </Text>
          </View>
          {recadoAtualSalvo && !editorFeedbackAberto && (
            <View style={localStyles.ativoPill}>
              <View style={localStyles.ativoDot} />
              <Text style={localStyles.ativoPillText}>ATIVO</Text>
            </View>
          )}
        </View>

        {!editorFeedbackAberto ? (
          <View>
            {recadoAtualSalvo ? (
              <View style={localStyles.previewQuoteBox}>
                <Text style={localStyles.previewQuoteLabel}>MENSAGEM ATUAL NO PAINEL DO ALUNO:</Text>
                <Text style={localStyles.previewQuoteText} numberOfLines={2}>
                  {recadoAtualSalvo}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={localStyles.btnAbrirEditor} 
              onPress={abrirEditorNovoFeedback}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color="#FF6B00" style={{ marginRight: 8 }} />
              <Text style={localStyles.btnAbrirEditorText}>
                {recadoAtualSalvo ? "ENVIAR NOVO FEEDBACK" : "ESCREVER FEEDBACK PARA O ALUNO"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={localStyles.editorContainer}>
            <Text style={localStyles.editorLabel}>NOVA MENSAGEM DE ACOMPANHAMENTO:</Text>
            <TextInput
              style={localStyles.feedbackInput}
              placeholder={`Ex: Excelente semana de treinos, ${aluno?.nome?.split(' ')[0] || 'aluno'}! Mantenha o foco na execução...`}
              placeholderTextColor="#666"
              multiline
              autoFocus
              numberOfLines={3}
              value={novoRecadoInput}
              onChangeText={setNovoRecadoInput}
            />

            <View style={localStyles.editorActionsRow}>
              <TouchableOpacity 
                style={localStyles.btnCancelarFeedback} 
                onPress={() => setEditorFeedbackAberto(false)}
                disabled={salvandoRecado}
                activeOpacity={0.7}
              >
                <Text style={localStyles.btnCancelarFeedbackText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={localStyles.btnEnviarFeedback} 
                onPress={salvarFeedbackEvolucao}
                disabled={salvandoRecado}
                activeOpacity={0.8}
              >
                {salvandoRecado ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Ionicons name="send" size={14} color="#000" style={{ marginRight: 6 }} />
                    <Text style={localStyles.btnEnviarFeedbackText}>ENVIAR AGORA</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.sectionHeaderRow, { marginTop: verticalScale(28), marginBottom: verticalScale(16) }]}>
        <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Bioimpedância</Text>
      </View>

      <TouchableOpacity 
          style={localStyles.btnNovaAvaliacao}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Bioimpedancia", { conexaoId: idConexaoReal || aluno.id })}
      >
          <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text style={localStyles.btnNovaAvaliacaoText}>NOVA AVALIAÇÃO FÍSICA</Text>
      </TouchableOpacity>

      <View style={localStyles.tabSelectorRow}>
          <TouchableOpacity style={[localStyles.tabBtn, { backgroundColor: abaVisualizacao === 'evolucao' ? '#222' : 'transparent' }]} onPress={() => setAbaVisualizacao('evolucao')}>
              <Text style={[localStyles.tabText, { color: abaVisualizacao === 'evolucao' ? '#FF6B00' : '#666' }]}>DESEMPENHO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[localStyles.tabBtn, { backgroundColor: abaVisualizacao === 'corpo' ? '#222' : 'transparent' }]} onPress={() => setAbaVisualizacao('corpo')}>
              <Text style={[localStyles.tabText, { color: abaVisualizacao === 'corpo' ? '#FF6B00' : '#666' }]}>CORPO DO ALUNO</Text>
          </TouchableOpacity>
      </View>

      {abaVisualizacao === 'evolucao' && (
          <View>
              <View style={localStyles.resumoCard}>
                  <Text style={localStyles.resumoTitle}>RESUMO ATUAL</Text>
                  <View style={localStyles.resumoValoresRow}>
                      <View>
                          <Text style={localStyles.resumoLabel}>PESO ATUAL</Text>
                          <View style={localStyles.resumoBigValueRow}>
                              <Text style={localStyles.resumoBigValue}>{aluno?.peso || "--"}</Text>
                              <Text style={localStyles.resumoBigUnit}>kg</Text>
                          </View>
                      </View>
                      <View style={localStyles.resumoDivider} />
                      <View style={{ alignItems: 'flex-end' }}>
                          <Text style={localStyles.resumoLabel}>META DO ALUNO</Text>
                          <View style={localStyles.resumoBigValueRow}>
                              <Text style={localStyles.resumoMetaValue}>{metaDePeso}</Text>
                              <Text style={localStyles.resumoBigUnit}>kg</Text>
                          </View>
                      </View>
                  </View>
                  
                  <View style={localStyles.estadoBadgeRow}>
                      <Text style={localStyles.resumoLabel}>ESTADO GERAL</Text>
                      <View style={localStyles.estadoBadge}>
                          <Text style={{ color: '#FF6B00', fontSize: 11, fontWeight: 'bold' }}>Aguardando Bio.</Text>
                      </View>
                  </View>
              </View>

              <Text style={localStyles.sectionTitle}>Desempenho Acumulado</Text>
              
              <View style={localStyles.rowMarginMinus}>
                  <BentoDesempenho titulo="SEQUÊNCIA" valor={streak || 0} icone="flame" descricao="Treinos seguidos." corDestaque="#FF6B00" />
                  <BentoDesempenho titulo="CONCLUÍDOS" valor={ultimosLogs?.length || 0} icone="checkmark-circle" descricao="Treinos recentes." />
                  <BentoDesempenho titulo="MELHOR ADESÃO" valor={`${adesao?.[0]?.percentual || 0}%`} icone="trophy" descricao="Ficha mais feita." corDestaque="#00E676" />
              </View>

              <View style={localStyles.freqCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>Frequência por Ficha (30 Dias)</Text>
                      <TouchableOpacity onPress={mostrarAjudaAdesao} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                          <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                  </View>
                  
                  {!temDados ? (
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Nenhum treino concluído ainda.</Text>
                  ) : (
                    adesao.map((item: any, index: number) => {
                      const isDanger = item.percentual < 50;
                      const barColor = isDanger ? theme.colors.danger : theme.colors.success;
                      return (
                        <View key={index} style={{ marginBottom: 12 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: '#AAA', fontSize: 12, fontWeight: '600' }}>{item.nome}</Text>
                            <Text style={{ color: isDanger ? theme.colors.danger : '#FFF', fontSize: 12, fontWeight: 'bold' }}>{item.percentual}%</Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: '#1A1A1A', borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ width: `${item.percentual}%`, height: '100%', backgroundColor: barColor, borderRadius: 3 }} />
                          </View>
                        </View>
                      );
                    })
                  )}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 }}>
                <Text style={[localStyles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Últimos Treinos Concluídos</Text>
                {ultimosLogs?.length > 0 && (
                  <Text style={{ color: '#888', fontSize: 11, fontWeight: '700' }}>Toque para ver detalhes</Text>
                )}
              </View>

              <View>
                  {ultimosLogs?.length > 0 ? (
                      ultimosLogs.map((hist: any) => {
                        const analise = getAnaliseIntensidade(hist.rpe);
                        const dataObj = hist.created_at ? new Date(hist.created_at) : null;
                        const dataFormatada = dataObj ? dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '--/--/----';
                        const temComentarios = Boolean(hist.comentarioFinal) || (hist.qtdObservacoesExercicios || 0) > 0;

                        return (
                          <TouchableOpacity 
                            key={hist.id} 
                            activeOpacity={0.82}
                            onPress={() => abrirDetalhesExecucao(hist)}
                            style={[
                              localStyles.bentoCard, 
                              { 
                                padding: 16, 
                                borderWidth: 1, 
                                borderColor: hist.sentiuDor ? 'rgba(239, 68, 68, 0.45)' : '#222226',
                                marginBottom: 12 
                              }
                            ]}
                          >
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
                                      <View style={[localStyles.tmbIconBg, { backgroundColor: 'rgba(255, 107, 0, 0.12)', borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.25)' }]}>
                                          <Ionicons name="checkmark-done" size={18} color="#FF6B00" />
                                      </View>
                                      <View style={{ flex: 1 }}>
                                          <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '900' }} numberOfLines={1}>
                                            {hist.nomeTreino || "Sessão de Treino"}
                                          </Text>
                                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                            <Ionicons name="calendar-outline" size={11} color="#888" style={{ marginRight: 4 }} />
                                            <Text style={{ color: '#888', fontSize: 11, fontWeight: '600' }}>
                                              {dataFormatada} às {hist.horario}
                                            </Text>
                                          </View>
                                      </View>
                                  </View>

                                  <View style={{ backgroundColor: analise.cor + '18', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: analise.cor + '45', flexDirection: 'row', alignItems: 'center' }}>
                                      <Ionicons name="flame" size={13} color={analise.cor} />
                                      <Text style={{ color: analise.cor, fontSize: 11, fontWeight: '900', marginLeft: 4 }}>
                                        {analise.label}
                                      </Text>
                                  </View>
                              </View>

                              <View style={localStyles.logQuickPillsRow}>
                                  <View style={localStyles.logQuickPill}>
                                    <Ionicons name="time-outline" size={12} color="#FF6B00" style={{ marginRight: 4 }} />
                                    <Text style={localStyles.logQuickPillText}>{hist.duracao}</Text>
                                  </View>

                                  {hist.volumeTotal && hist.volumeTotal !== "--" && (
                                    <View style={localStyles.logQuickPill}>
                                      <MaterialCommunityIcons name="weight-kilogram" size={13} color="#FF6B00" style={{ marginRight: 4 }} />
                                      <Text style={localStyles.logQuickPillText}>{hist.volumeTotal}</Text>
                                    </View>
                                  )}

                                  {hist.prsCount > 0 && (
                                    <View style={[localStyles.logQuickPill, { backgroundColor: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.3)' }]}>
                                      <Ionicons name="trophy" size={11} color="#00E676" style={{ marginRight: 4 }} />
                                      <Text style={[localStyles.logQuickPillText, { color: '#00E676' }]}>{hist.prsCount} PR</Text>
                                    </View>
                                  )}

                                  {temComentarios && (
                                    <View style={[localStyles.logQuickPill, { backgroundColor: 'rgba(255, 107, 0, 0.1)', borderColor: 'rgba(255, 107, 0, 0.3)' }]}>
                                      <Ionicons name="chatbox-ellipses-outline" size={11} color="#FF6B00" style={{ marginRight: 4 }} />
                                      <Text style={[localStyles.logQuickPillText, { color: '#FF6B00' }]}>Comentário</Text>
                                    </View>
                                  )}

                                  {hist.sentiuDor && (
                                    <View style={[localStyles.logQuickPill, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.35)' }]}>
                                      <Ionicons name="warning" size={11} color="#EF4444" style={{ marginRight: 4 }} />
                                      <Text style={[localStyles.logQuickPillText, { color: '#EF4444' }]}>Relato de Dor</Text>
                                    </View>
                                  )}
                              </View>

                              <View style={{ backgroundColor: '#121215', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1F1F24' }}>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                          <Ionicons name="pulse" size={14} color={analise.cor} style={{ marginRight: 6 }} />
                                          <Text style={{ color: '#E4E4E7', fontSize: 12, fontWeight: '800' }}>
                                            {analise.texto}
                                          </Text>
                                      </View>
                                      <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '800' }}>
                                        SÉRIES {hist.seriesResumo || "--"}
                                      </Text>
                                  </View>

                                  <View style={{ height: 5, backgroundColor: '#1F1F24', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                                      <View style={{ width: `${analise.percentual}%`, height: '100%', backgroundColor: analise.cor, borderRadius: 3 }} />
                                  </View>

                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                      <Text style={{ color: '#71717A', fontSize: 11, flex: 1 }} numberOfLines={1}>
                                        {hist.comentarioFinal ? `"${hist.comentarioFinal}"` : analise.sub}
                                      </Text>
                                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                                        <Text style={{ color: '#FF6B00', fontSize: 11, fontWeight: '800' }}>Ver execução</Text>
                                        <Ionicons name="chevron-forward" size={13} color="#FF6B00" style={{ marginLeft: 2 }} />
                                      </View>
                                  </View>
                              </View>
                          </TouchableOpacity>
                        );
                      })
                  ) : (
                      <View style={localStyles.emptyCard}>
                          <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={36} color="#333" style={{ marginBottom: 10 }} />
                          <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                              Nenhum treino concluído ainda.{'\n'}Os logs de execução aparecerão aqui.
                          </Text>
                      </View>
                  )}
              </View>
          </View>
      )}

      {abaVisualizacao === 'corpo' && (
          <View>
              <Text style={localStyles.sectionTitle}>Fisiologia e Composição</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4 }}>
                  <BentoCardBio icone="pie-chart" titulo="GORDURA CORP." valor={compMock.gordura} unidade="%" variacao="-" descricao="Proporção de gordura no corpo." />
                  <BentoCardBio icone="fitness" titulo="MASSA MUSCULAR" valor={compMock.massa} unidade="kg" variacao="-" descricao="Peso dos músculos esqueléticos." />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4 }}>
                  <BentoCardBio icone="water" titulo="ÁGUA CORPORAL" valor={compMock.agua} unidade="L" variacao="-" descricao="Essencial para o metabolismo." />
                  <BentoCardBio icone="warning" titulo="GORD. VISCERAL" valor={compMock.visceral} unidade="lvl" variacao="-" descricao="Gordura interna entre os órgãos." />
              </View>

              <View style={localStyles.tmbCard}>
                  <View style={localStyles.tmbIconBg}>
                      <Ionicons name="flame" size={28} color="#FF6B00" />
                  </View>
                  <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FF6B00', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>TAXA METABÓLICA BASAL</Text>
                      <View style={localStyles.resumoBigValueRow}>
                          <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '900' }}>{compMock.tmb}</Text>
                          <Text style={localStyles.bentoUnit}>kcal/dia</Text>
                      </View>
                      <Text style={{ color: '#888', fontSize: 10, lineHeight: 14 }}>Energia queima em repouso absoluto.</Text>
                  </View>
              </View>

              <Text style={localStyles.sectionTitle}>Análise Segmentar</Text>
              
              <View style={localStyles.tabSelectorRow}>
                  <TouchableOpacity onPress={() => setTipoSegmentar('gordura')} style={[localStyles.tabBtn, { backgroundColor: tipoSegmentar === 'gordura' ? '#222' : 'transparent' }]}>
                      <Text style={[localStyles.tabText, { color: tipoSegmentar === 'gordura' ? '#FF6B00' : '#666' }]}>GORDURA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTipoSegmentar('massa')} style={[localStyles.tabBtn, { backgroundColor: tipoSegmentar === 'massa' ? '#222' : 'transparent' }]}>
                      <Text style={[localStyles.tabText, { color: tipoSegmentar === 'massa' ? '#FF6B00' : '#666' }]}>MASSA MAGRA</Text>
                  </TouchableOpacity>
              </View>

              <View style={localStyles.segmentarBg}>
                  <Ionicons name="body" size={260} color="#1A1A1A" style={{ opacity: 0.8 }} />

                  <View style={[localStyles.badgeSegmentar, { top: 50, right: 15, alignItems: 'flex-end' }]}>
                      <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>BRAÇO ESQ.</Text>
                      <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{compMock.segmentar.bracoEsq} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={[localStyles.badgeSegmentar, { top: 50, left: 15, alignItems: 'flex-start' }]}>
                      <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>BRAÇO DIR.</Text>
                      <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{compMock.segmentar.bracoDir} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={[localStyles.badgeSegmentar, { top: 120, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: '#222' }]}>
                      <Text style={{ color: '#888', fontSize: 9, fontWeight: '800' }}>TRONCO</Text>
                      <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{compMock.segmentar.tronco} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={[localStyles.badgeSegmentar, { bottom: 40, right: 25, alignItems: 'flex-end' }]}>
                      <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>PERNA ESQ.</Text>
                      <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{compMock.segmentar.pernaEsq} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={[localStyles.badgeSegmentar, { bottom: 40, left: 25, alignItems: 'flex-start' }]}>
                      <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>PERNA DIR.</Text>
                      <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{compMock.segmentar.pernaDir} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
              </View>
          </View>
      )}

      <Modal
        visible={Boolean(treinoSelecionado)}
        transparent
        animationType="slide"
        onRequestClose={fecharDetalhesExecucao}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <View style={localStyles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={localStyles.modalBadgeRow}>
                  <View style={localStyles.modalTagSemana}>
                    <Ionicons name="barbell" size={11} color="#FF6B00" style={{ marginRight: 4 }} />
                    <Text style={localStyles.modalTagSemanaText}>
                      {treinoSelecionado?.nomeSemana ? treinoSelecionado.nomeSemana.toUpperCase() : "RELATÓRIO DE EXECUÇÃO"}
                    </Text>
                  </View>
                  {analiseModal && (
                    <View style={[localStyles.modalIntensityBadge, { backgroundColor: analiseModal.cor + '18', borderColor: analiseModal.cor + '45' }]}>
                      <Ionicons name="flame" size={11} color={analiseModal.cor} style={{ marginRight: 4 }} />
                      <Text style={[localStyles.modalIntensityText, { color: analiseModal.cor }]}>
                        Esforço: {analiseModal.label}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={localStyles.modalTitle} numberOfLines={1}>
                  {treinoSelecionado?.nomeTreinoCurto || treinoSelecionado?.nomeTreino || "Treino Realizado"}
                </Text>
                <Text style={localStyles.modalSubDate}>
                  Realizado em {dataModalFormatada} às {treinoSelecionado?.horario}
                </Text>
              </View>

              <TouchableOpacity style={localStyles.modalCloseBtn} onPress={fecharDetalhesExecucao}>
                <Ionicons name="close" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.modalScrollContent}>
              <View style={localStyles.modalStatsGrid}>
                <View style={localStyles.modalStatBox}>
                  <Ionicons name="time-outline" size={18} color="#FF6B00" style={{ marginBottom: 4 }} />
                  <Text style={localStyles.modalStatValue}>{treinoSelecionado?.duracao || "--"}</Text>
                  <Text style={localStyles.modalStatLabel}>Duração</Text>
                </View>

                <View style={localStyles.modalStatBox}>
                  <MaterialCommunityIcons name="weight-kilogram" size={18} color="#FF6B00" style={{ marginBottom: 4 }} />
                  <Text style={localStyles.modalStatValue}>{treinoSelecionado?.volumeTotal || "--"}</Text>
                  <Text style={localStyles.modalStatLabel}>Volume Total</Text>
                </View>

                <View style={localStyles.modalStatBox}>
                  <Ionicons name="checkmark-done-circle-outline" size={18} color="#00E676" style={{ marginBottom: 4 }} />
                  <Text style={localStyles.modalStatValue}>{treinoSelecionado?.seriesResumo || "--"}</Text>
                  <Text style={localStyles.modalStatLabel}>Séries Feitas</Text>
                </View>

                <View style={localStyles.modalStatBox}>
                  <Ionicons name="trophy-outline" size={18} color="#FFD700" style={{ marginBottom: 4 }} />
                  <Text style={localStyles.modalStatValue}>
                    {treinoSelecionado?.prsCount > 0 ? `${treinoSelecionado.prsCount} PRs` : (treinoSelecionado?.maiorCargaSessao || "--")}
                  </Text>
                  <Text style={localStyles.modalStatLabel}>
                    {treinoSelecionado?.prsCount > 0 ? "Recordes" : "Maior Carga"}
                  </Text>
                </View>
              </View>

              {(treinoSelecionado?.sentiuDor || treinoSelecionado?.comentarioFinal) && (
                <View style={localStyles.modalFeedbackSection}>
                  <Text style={localStyles.modalSectionTitle}>Feedback & Alertas do Aluno</Text>

                  {treinoSelecionado?.sentiuDor && (
                    <View style={localStyles.modalPainAlertCard}>
                      <View style={localStyles.modalPainHeader}>
                        <View style={localStyles.modalPainIconBox}>
                          <Ionicons name="warning" size={18} color="#EF4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={localStyles.modalPainTitle}>Alerta de Dor / Desconforto na Sessão</Text>
                          <Text style={localStyles.modalPainSubtitle}>
                            Verifique a carga e a amplitude nos exercícios sinalizados abaixo.
                          </Text>
                        </View>
                      </View>

                      {treinoSelecionado?.relatosDorSessao?.length > 0 && (
                        <View style={localStyles.modalPainList}>
                          {treinoSelecionado.relatosDorSessao.map((dor: any, dIdx: number) => (
                            <View key={dIdx} style={localStyles.modalPainItem}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={localStyles.modalPainExName}>{dor.exercicioNome}</Text>
                                {dor.intensidade !== null && dor.intensidade !== undefined && (
                                  <View style={localStyles.modalPainLevelBadge}>
                                    <Text style={localStyles.modalPainLevelText}>Nível {dor.intensidade}/10</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={localStyles.modalPainDesc}>{dor.descricao}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {treinoSelecionado?.comentarioFinal && (
                    <View style={localStyles.modalStudentCommentCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="chatbubble-ellipses" size={15} color="#FF6B00" style={{ marginRight: 6 }} />
                        <Text style={localStyles.modalStudentCommentLabel}>COMENTÁRIO FINAL DO ALUNO:</Text>
                      </View>
                      <Text style={localStyles.modalStudentCommentText}>
                        {treinoSelecionado.comentarioFinal}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={{ marginTop: 6 }}>
                <Text style={localStyles.modalSectionTitle}>
                  Exercícios Realizados ({treinoSelecionado?.exerciciosDetalhados?.length || 0})
                </Text>

                {treinoSelecionado?.exerciciosDetalhados?.length > 0 ? (
                  treinoSelecionado.exerciciosDetalhados.map((ex: any, index: number) => {
                    const isExpanded = exercicioExpandidoId === ex.id;

                    return (
                      <View
                        key={ex.id || index}
                        style={[
                          localStyles.modalExerciseCard,
                          isExpanded && localStyles.modalExerciseCardExpanded,
                          ex.teveDor && { borderColor: 'rgba(239, 68, 68, 0.45)' }
                        ]}
                      >
                        <TouchableOpacity
                          style={localStyles.modalExerciseHeader}
                          activeOpacity={0.75}
                          onPress={() => alternarExercicioExpandido(ex.id)}
                        >
                          <View style={localStyles.modalExerciseIndexBadge}>
                            <Text style={localStyles.modalExerciseIndexText}>{index + 1}</Text>
                          </View>

                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={localStyles.modalExerciseName} numberOfLines={1}>
                              {ex.nome}
                            </Text>
                            <View style={localStyles.modalExerciseMetaRow}>
                              <Text style={localStyles.modalExerciseMetaText}>
                                {ex.seriesConcluidas}/{ex.seriesPlanejadas} séries
                              </Text>
                              <View style={localStyles.modalMetaDot} />
                              <Text style={[localStyles.modalExerciseMetaText, { color: '#FF6B00', fontWeight: '800' }]}>
                                Máx: {ex.maiorCarga}
                              </Text>
                            </View>
                          </View>

                          <View style={localStyles.modalExerciseBadgesRight}>
                            {ex.bateuPr && (
                              <View style={localStyles.miniBadgePr}>
                                <Ionicons name="trophy" size={11} color="#00E676" />
                                <Text style={localStyles.miniBadgePrText}>PR</Text>
                              </View>
                            )}
                            {ex.observacaoAluno && (
                              <View style={localStyles.miniBadgeNote}>
                                <Ionicons name="document-text" size={12} color="#FF6B00" />
                              </View>
                            )}
                            {ex.teveDor && (
                              <View style={localStyles.miniBadgePain}>
                                <Ionicons name="warning" size={12} color="#EF4444" />
                              </View>
                            )}
                            <Ionicons
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={18}
                              color="#888"
                              style={{ marginLeft: 4 }}
                            />
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={localStyles.modalExerciseBody}>
                            <View style={localStyles.seriesTableHeader}>
                              <Text style={[localStyles.seriesTableHeaderCell, { flex: 0.8 }]}>SÉRIE</Text>
                              <Text style={[localStyles.seriesTableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>REPS</Text>
                              <Text style={[localStyles.seriesTableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>CARGA</Text>
                              <Text style={[localStyles.seriesTableHeaderCell, { flex: 0.8, textAlign: 'right' }]}>STATUS</Text>
                            </View>

                            {ex.series && ex.series.length > 0 ? (
                              ex.series.map((s: any) => (
                                <View key={s.id} style={localStyles.seriesTableRow}>
                                  <View style={{ flex: 0.8, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[localStyles.serieNumBadge, s.concluida && { backgroundColor: 'rgba(0, 230, 118, 0.12)', borderColor: 'rgba(0, 230, 118, 0.3)' }]}>
                                      <Text style={[localStyles.serieNumText, s.concluida && { color: '#00E676' }]}>
                                        S{s.numero}
                                      </Text>
                                    </View>
                                  </View>

                                  <Text style={[localStyles.seriesTableCellText, { flex: 1.2, textAlign: 'center' }]}>
                                    {s.reps}
                                  </Text>

                                  <Text style={[localStyles.seriesTableCellLoad, { flex: 1.2, textAlign: 'center' }]}>
                                    {s.carga}
                                  </Text>

                                  <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                                    {s.concluida ? (
                                      <View style={localStyles.statusCheckDone}>
                                        <Ionicons name="checkmark" size={12} color="#000" />
                                      </View>
                                    ) : (
                                      <Text style={{ color: '#666', fontSize: 10, fontWeight: '700' }}>Pendente</Text>
                                    )}
                                  </View>
                                </View>
                              ))
                            ) : (
                              <Text style={{ color: '#666', fontSize: 12, paddingVertical: 8 }}>
                                Nenhuma série detalhada registrada.
                              </Text>
                            )}

                            {ex.observacaoAluno && (
                              <View style={localStyles.exerciseObsAlunoBox}>
                                <Ionicons name="chatbox-ellipses-outline" size={14} color="#FF6B00" style={{ marginRight: 8, marginTop: 1 }} />
                                <View style={{ flex: 1 }}>
                                  <Text style={localStyles.exerciseObsAlunoLabel}>ANOTAÇÃO DO ALUNO NESTE EXERCÍCIO:</Text>
                                  <Text style={localStyles.exerciseObsAlunoText}>{ex.observacaoAluno}</Text>
                                </View>
                              </View>
                            )}

                            {ex.teveDor && ex.detalheDor && (
                              <View style={localStyles.exercisePainDetailBox}>
                                <Ionicons name="warning" size={14} color="#EF4444" style={{ marginRight: 8, marginTop: 1 }} />
                                <View style={{ flex: 1 }}>
                                  <Text style={localStyles.exercisePainDetailLabel}>
                                    RELATO DE DOR {ex.detalheDor.intensidade !== null ? `(NÍVEL ${ex.detalheDor.intensidade}/10)` : ""}:
                                  </Text>
                                  <Text style={localStyles.exercisePainDetailText}>{ex.detalheDor.descricao}</Text>
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View style={localStyles.emptyCard}>
                    <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>
                      Os detalhes por série não estão disponíveis para este registro antigo.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}