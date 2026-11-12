import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { ActivityIndicator, Image, Modal, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../services/supabase"; 
import { CONSTANTS } from "./constants";
import { styles } from "./styles";
import { useDashboard } from "./useDashboard";

export function AlunoDashboard({ route, navigation }: any) {
  const { conexaoId } = route.params || { conexaoId: "1" };
  const {
    loading, refreshing, aluno, personal, conexao, diasTreino, progressoBarra, estaNoPeriodoTeste,
    semanaAtual, temTreinosNaSemana, treinoHoje, statusTreinoDia, recadoPersonal, dataRecadoPersonal, anamnesePendente, jaAvaliou,
    onRefresh, handleLogout, handleWhatsApp, featureBloqueada,
    handleAcaoEncerramento, verPerfilPersonal, irParaMeuPerfil, irParaChat
  } = useDashboard(navigation, conexaoId);

  const realConexaoId = conexao?.id || conexaoId;

  const [financeiroInfo, setFinanceiroInfo] = useState({
    status: 'em_dia' as 'em_dia' | 'pendente' | 'atrasado',
    valor: 'R$ 0,00',
    vencimento: '--/--'
  });

  const [imgErroAluno, setImgErroAluno] = useState(false);
  const [imgErroPersonal, setImgErroPersonal] = useState(false);
  const [modalRecadoVisivel, setModalRecadoVisivel] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const carregarResumoFinanceiro = async () => {
      if (!realConexaoId || realConexaoId === "1") return;
      try {
        const { data: contrato } = await supabase
          .from('planos')
          .select('valor_mensal, dia_vencimento')
          .eq('conexao_id', realConexaoId)
          .in('status', ['ativo', 'aguardando_assinatura', 'pendente'])
          .maybeSingle();

        if (contrato && isMounted) {
          const valorFloat = contrato.valor_mensal || 0;
          const diaVencimento = contrato.dia_vencimento || 10;
          
          const hoje = new Date();
          let mesVencimento = hoje.getMonth();
          let anoVencimento = hoje.getFullYear();

          if (hoje.getDate() > diaVencimento + 5) {
            mesVencimento += 1;
            if (mesVencimento > 11) {
              mesVencimento = 0;
              anoVencimento += 1;
            }
          }

          const dataVenc = new Date(anoVencimento, mesVencimento, diaVencimento);
          const diffDias = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

          let novoStatus: 'em_dia' | 'pendente' | 'atrasado' = 'em_dia';
          if (diffDias < 0) novoStatus = 'atrasado';
          else if (diffDias <= 5) novoStatus = 'pendente';

          setFinanceiroInfo({
            status: novoStatus,
            valor: `R$ ${valorFloat.toFixed(2).replace('.', ',')}`,
            vencimento: dataVenc.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          });
        }
      } catch (error) {
        console.log("Erro ao carregar widget financeiro:", error);
      }
    };
    carregarResumoFinanceiro();
    return () => { isMounted = false; };
  }, [realConexaoId, refreshing]);

  if (loading || !aluno || !personal) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  const getFinanceiroProps = () => {
    switch (financeiroInfo.status) {
      case 'em_dia': return { cor: "#00E676", bg: "rgba(0, 230, 118, 0.08)", border: "rgba(0, 230, 118, 0.4)", icone: "checkmark-circle", titulo: "Tudo em dia" };
      case 'atrasado': return { cor: "#FF3B30", bg: "rgba(255, 59, 48, 0.08)", border: "rgba(255, 59, 48, 0.4)", icone: "alert-circle", titulo: "Pagamento Atrasado" };
      case 'pendente': default: return { cor: "#FF6B00", bg: "rgba(255, 107, 0, 0.08)", border: "rgba(255, 107, 0, 0.4)", icone: "time", titulo: "Vence em breve" };
    }
  };
  const finProps = getFinanceiroProps();

  const renderEstadoSemTreino = () => {
    if (statusTreinoDia === 'fim_ciclo') {
      return (
        <View style={styles.premiumEmptyWorkout}>
          <View style={[styles.emptyWorkoutIconBg, { backgroundColor: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.3)', borderWidth: 1 }]}>
            <Ionicons name="trophy-outline" size={30} color="#00E676" />
          </View>
          <Text style={styles.emptyWorkoutTitle}>Ciclo Concluído!</Text>
          <Text style={styles.emptyWorkoutDesc}>
            Parabéns! Você finalizou todos os treinos desta programação. Seu personal já pode liberar o próximo ciclo.
          </Text>
        </View>
      );
    }

    if (statusTreinoDia === 'descanso') {
      return (
        <View style={styles.premiumEmptyWorkout}>
          <View style={styles.emptyWorkoutIconBg}>
            <MaterialCommunityIcons name="sleep" size={32} color="#FF6B00" />
          </View>
          <Text style={styles.emptyWorkoutTitle}>Dia de Descanso</Text>
          <Text style={styles.emptyWorkoutDesc}>
            Você está em dia com os treinos desta etapa da semana. Aproveite para recuperar a musculatura!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.premiumEmptyWorkout}>
        <View style={styles.emptyWorkoutIconBg}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={32} color="#555" />
        </View>
        <Text style={styles.emptyWorkoutTitle}>Aguardando Programação</Text>
        <Text style={styles.emptyWorkoutDesc}>
          Seu personal trainer ainda está estruturando os treinos da sua rotina ativa.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <View style={styles.studentHeader}>
        <View style={styles.studentHeaderLeft}>
          {aluno.foto_url && !imgErroAluno ? (
            <Image 
              source={{ uri: aluno.foto_url }} 
              style={styles.studentAvatar} 
              onError={() => setImgErroAluno(true)} 
            />
          ) : (
            <View style={[styles.studentAvatar, { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' }]}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.studentGreeting}>Olá, <Text style={{ color: "#FFF" }}>{aluno.nome?.split(' ')[0]}</Text></Text>
            <Text style={styles.studentSub}>Pronto para o treino de hoje?</Text>
          </View>
        </View>
        <View style={styles.studentHeaderRight}>
          <TouchableOpacity style={styles.btnIcon} onPress={irParaMeuPerfil}>
            <Ionicons name="person-outline" size={22} color="#FF6B00" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnIcon, { marginLeft: 10, backgroundColor: 'rgba(255, 59, 48, 0.1)' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}>
        
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>{CONSTANTS.TITLE_TREINADOR}</Text>
          <View style={[styles.trainerPremiumCard, { overflow: 'hidden', borderWidth: 1, borderColor: '#1A1A20' }]}>
            <LinearGradient colors={["rgba(255,107,0,0.1)", "transparent"]} style={styles.absoluteFill} />
            
            <View style={styles.trainerRow}>
              <View style={styles.trainerAvatarLarge}>
                {personal.foto_url && !imgErroPersonal ? (
                  <Image 
                    source={{ uri: personal.foto_url }} 
                    style={{ width: "100%", height: "100%" }} 
                    resizeMode="cover" 
                    onError={() => setImgErroPersonal(true)}
                  />
                ) : (
                  <Ionicons name="person" size={32} color="#555" />
                )}
              </View>
              <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>{personal.nome}</Text>
                {personal.especialidade && <Text style={styles.trainerSpec}>{personal.especialidade}</Text>}
                <View style={styles.crefBadge}>
                  <MaterialCommunityIcons name={personal.cref_verificado ? "shield-check" : "shield-alert-outline"} size={14} color={personal.cref_verificado ? "#00E676" : "#888"} />
                  <Text style={[styles.crefText, personal.cref_verificado && { color: "#00E676" }]}>
                    {personal.cref ? `CREF: ${personal.cref}` : "CREF em Validação"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.trainerActionsRow}>
              <TouchableOpacity style={styles.btnTrainerAction} onPress={verPerfilPersonal}>
                <Ionicons name="person-circle-outline" size={18} color="#FF6B00" style={{ marginRight: 6 }} />
                <Text style={styles.btnTrainerActionText}>Ver Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnTrainerAction, { backgroundColor: "rgba(37, 211, 102, 0.15)", borderColor: "rgba(37, 211, 102, 0.3)" }]} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" style={{ marginRight: 6 }} />
                <Text style={[styles.btnTrainerActionText, { color: "#25D366" }]}>Contato</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.dashboardSection}>
          
          <Text style={styles.sectionTitle}>Sua Consistência</Text>
          <View style={styles.calendarRow}>
            {semanaAtual.map((dia, i) => {
              const isConcluido = dia.status === 'concluido';
              const isHoje = dia.status === 'hoje';

              return (
                <View key={i} style={[
                  styles.dayBox, 
                  isHoje && styles.dayBoxHoje,
                  isConcluido && { borderColor: 'rgba(0, 230, 118, 0.4)', backgroundColor: 'rgba(0, 230, 118, 0.08)' }
                ]}>
                  <Text style={[styles.dayLabel, isHoje && {color: '#FF6B00'}, isConcluido && {color: '#00E676', fontWeight: 'bold'}]}>{dia.dia}</Text>
                  <Text style={[styles.dayDate, isHoje && {color: '#FFF'}, isConcluido && {color: '#00E676', fontWeight: 'bold'}]}>{dia.data}</Text>
                  
                  {isConcluido ? (
                    <View style={[styles.statusDot, { backgroundColor: '#00E676', shadowColor: '#00E676', shadowOpacity: 0.8, shadowRadius: 6, justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="checkmark-sharp" size={10} color="#000" />
                    </View>
                  ) : (
                    <View style={[styles.statusDot, isHoje ? {backgroundColor: '#FF6B00', shadowColor: '#FF6B00', shadowOpacity: 0.8, shadowRadius: 5} : {backgroundColor: 'transparent'}]} />
                  )}
                </View>
              );
            })}
          </View>
          {!temTreinosNaSemana && (
            <Text style={styles.emptyHintText}>Nenhum treino concluído nos últimos 7 dias. Vamos mudar isso?</Text>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Acompanhamento</Text>
          {anamnesePendente ? (
            <TouchableOpacity style={[styles.checkinCardPendente, { overflow: 'hidden' }]} activeOpacity={0.9} onPress={() => navigation.navigate("Anamnese")}>
              <LinearGradient colors={["rgba(255,107,0,0.15)", "transparent"]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.absoluteFill} />
              <View style={styles.checkinIconBox}>
                <Ionicons name="document-text" size={24} color="#FF6B00" />
                <View style={styles.checkinAlertDot} />
              </View>
              <View style={styles.checkinContent}>
                <Text style={styles.checkinTitle}>{anamnesePendente.titulo}</Text>
                <Text style={styles.checkinDesc}>Responda o questionário para atualizar seu planejamento.</Text>
                <View style={styles.checkinBtn}>
                  <Text style={styles.checkinBtnText}>Responder Agora</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" style={{marginLeft: 4}} />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.checkinCardNeutro}>
              <Ionicons name="checkmark-circle" size={24} color="#00E676" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}>Tudo em dia</Text>
                <Text style={{ color: "#888", fontSize: 12 }}>Seu personal ainda não enviou um check-in.</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>Treino do Dia</Text>
            <TouchableOpacity style={styles.btnVerTodos} onPress={() => navigation.navigate("WorkoutList", { conexaoId: realConexaoId })}>
              <Text style={styles.btnVerTodosText}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color="#FF6B00" />
            </TouchableOpacity>
          </View>

          {treinoHoje ? (
            <TouchableOpacity style={styles.premiumWorkoutCard} activeOpacity={0.9} onPress={() => navigation.navigate("WorkoutPreview", { treinoId: treinoHoje.id, conexaoId: realConexaoId })}>
              <LinearGradient colors={["#1A0B02", "#0A0A0C"]} style={styles.absoluteFill} />
              
              <View style={styles.premiumWorkoutHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.premiumWorkoutBadge}>
                    <Ionicons name="flame" size={12} color="#FF6B00" />
                    <Text style={styles.premiumWorkoutBadgeText}>
                      {treinoHoje.nome_semana ? `${treinoHoje.nome_semana.toUpperCase()} • FOCO DO DIA` : "FOCO DO DIA"}
                    </Text>
                  </View>
                  <Text style={styles.premiumWorkoutTitle}>{treinoHoje.nome || "Treino do Dia"}</Text>
                  {treinoHoje.objetivo ? (
                    <Text style={styles.premiumWorkoutObjective} numberOfLines={1}>
                      {treinoHoje.objetivo}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.premiumWorkoutInfoRow}>
                <View style={styles.premiumWorkoutInfoItem}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color="#888" />
                  <Text style={styles.premiumWorkoutInfoText}>{treinoHoje.qtd_exercicios} exercícios</Text>
                </View>
                <View style={styles.premiumWorkoutInfoDot} />
                <View style={styles.premiumWorkoutInfoItem}>
                  <Ionicons name="time-outline" size={16} color="#888" />
                  <Text style={styles.premiumWorkoutInfoText}>~ {treinoHoje.duracao_estimada}</Text>
                </View>
              </View>

              <View style={styles.premiumBtnStartOutline}>
                <Text style={styles.premiumBtnStartTextOutline}>INICIAR TREINO</Text>
                <Ionicons name="arrow-forward" size={18} color="#FF6B00" style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
          ) : (
            renderEstadoSemTreino()
          )}

          {recadoPersonal ? (
            <TouchableOpacity 
              style={styles.feedbackBubble} 
              activeOpacity={0.85} 
              onPress={() => setModalRecadoVisivel(true)}
            >
              <LinearGradient colors={["rgba(255, 107, 0, 0.12)", "transparent"]} style={styles.absoluteFill} />
              
              <View style={styles.feedbackHeaderRow}>
                <View style={styles.feedbackTitleRow}>
                  <View style={styles.feedbackIconBadge}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FF6B00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feedbackLabelUpper}>FEEDBACK DO TREINADOR</Text>
                    <Text style={styles.feedbackTitle} numberOfLines={1}>
                      Prof. {personal.nome?.split(' ')[0] || "Treinador"}
                    </Text>
                  </View>
                </View>

                {dataRecadoPersonal ? (
                  <View style={styles.feedbackDateBadge}>
                    <Text style={styles.feedbackDateText}>{dataRecadoPersonal}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.feedbackQuoteBox}>
                <Text style={styles.feedbackText} numberOfLines={3}>
                  "{recadoPersonal}"
                </Text>
              </View>

              <View style={styles.feedbackMetaFooter}>
                <View style={styles.feedbackMetaPill}>
                  <View style={styles.feedbackOnlineDot} />
                  <Text style={styles.feedbackMetaPillText}>Acompanhamento de Evolução</Text>
                </View>

                <View style={styles.feedbackReadMoreRow}>
                  <Text style={styles.feedbackReadMoreText}>Ler completo</Text>
                  <Ionicons name="chevron-forward" size={13} color="#FF6B00" />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.feedbackBubbleEmpty}>
              <View style={styles.feedbackIconBadge}>
                <Ionicons name="chatbox-outline" size={16} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackEmptyTitle}>Feedback do Treinador</Text>
                <Text style={styles.feedbackTextEmpty}>
                  Seu personal ainda não adicionou nenhum comentário sobre a sua evolução.
                </Text>
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Financeiro</Text>
          <TouchableOpacity style={[styles.financeiroCard, { backgroundColor: finProps.bg, borderColor: finProps.border, overflow: 'hidden' }]} activeOpacity={0.8} onPress={() => navigation.navigate("Finance")}>
            <LinearGradient colors={[finProps.bg, "transparent"]} style={styles.absoluteFill} />
            <View style={[styles.financeiroIconBox, { backgroundColor: finProps.cor + '20' }]}>
              <Ionicons name={finProps.icone as any} size={20} color={finProps.cor} style={{ textShadowColor: finProps.cor, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.financeiroTitle}>Assinatura do Contrato</Text>
              <Text style={[styles.financeiroSub, { color: finProps.cor, fontWeight: 'bold' }]}>
                {finProps.titulo} • Dia {financeiroInfo.vencimento} • {financeiroInfo.valor}
              </Text>
            </View>
            <View style={{ backgroundColor: '#1A1A20', padding: 6, borderRadius: 12 }}>
              <Ionicons name="chevron-forward" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.gridActionsPremium}>
            <TouchableOpacity style={styles.actionCardPremium} activeOpacity={0.8} onPress={() => navigation.navigate("Progress", { conexaoId: realConexaoId })}>
              <LinearGradient colors={["rgba(0, 230, 118, 0.1)", "transparent"]} style={styles.absoluteFill} />
              <View style={[styles.actionIconWrapper, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
                <Ionicons name="trending-up" size={24} color="#00E676" />
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={styles.actionCardTitle}>Sua Evolução</Text>
                <Text style={styles.actionCardDesc}>Recordes e Metas</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCardPremium} activeOpacity={0.8} onPress={irParaChat}>
              <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "transparent"]} style={styles.absoluteFill} />
              <View style={[styles.actionIconWrapper, { backgroundColor: "rgba(255, 107, 0, 0.15)" }]}>
                <Ionicons name="chatbubbles" size={24} color="#FF6B00" />
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={styles.actionCardTitle}>Mensagens</Text>
                <Text style={styles.actionCardDesc}>Fale com Personal</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.trackerCard}>
            <View style={styles.trackerHeader}>
              <Feather name="target" size={16} color="#FFF" />
              <Text style={styles.trackerTitle}>{CONSTANTS.TITLE_ADAPTACAO}</Text>
            </View>
            <Text style={styles.trackerDesc}>{CONSTANTS.MSG_ADAPTACAO}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${progressoBarra}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>Dia {diasTreino}</Text>
              <Text style={styles.progressLabelRight}>Meta: 60 Dias</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.btnDangerOutline} onPress={handleAcaoEncerramento}>
            <Text style={styles.btnDangerText}>{estaNoPeriodoTeste ? "Desfazer Vínculo (Teste)" : "Solicitar Encerramento da Parceria"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalRecadoVisivel} transparent animationType="fade" onRequestClose={() => setModalRecadoVisivel(false)}>
        <View style={styles.feedbackModalOverlay}>
          <View style={styles.feedbackModalCard}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "transparent"]} style={styles.absoluteFill} />

            <View style={styles.feedbackModalHeader}>
              <View style={styles.feedbackIconBadge}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackLabelUpper}>ACOMPANHAMENTO</Text>
                <Text style={styles.feedbackModalTitle}>Feedback do Treinador</Text>
              </View>
              <TouchableOpacity style={styles.feedbackModalCloseBtn} onPress={() => setModalRecadoVisivel(false)}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.feedbackModalStatsGrid}>
              <View style={styles.feedbackModalStatBox}>
                <Text style={styles.feedbackModalStatLabel}>TREINADOR</Text>
                <Text style={styles.feedbackModalStatValue} numberOfLines={1}>
                  Prof. {personal.nome?.split(' ')[0] || "Personal"}
                </Text>
              </View>
              {dataRecadoPersonal ? (
                <View style={styles.feedbackModalStatBox}>
                  <Text style={styles.feedbackModalStatLabel}>DATA</Text>
                  <Text style={[styles.feedbackModalStatValue, { color: '#FF6B00' }]}>
                    {dataRecadoPersonal}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.feedbackModalMessageBox}>
              <Text style={styles.feedbackModalMessageLabel}>MENSAGEM DO SEU PERSONAL:</Text>
              <Text style={styles.feedbackModalMessageText}>{recadoPersonal}</Text>
            </View>

            <View style={styles.feedbackModalActionsRow}>
              <TouchableOpacity 
                style={styles.feedbackModalBtnSecondary} 
                onPress={() => {
                  setModalRecadoVisivel(false);
                  navigation.navigate("Progress", { conexaoId: realConexaoId });
                }}
              >
                <Ionicons name="trending-up" size={16} color="#FF6B00" style={{ marginRight: 6 }} />
                <Text style={styles.feedbackModalBtnSecondaryText}>SUA EVOLUÇÃO</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.feedbackModalBtnPrimary} 
                onPress={() => setModalRecadoVisivel(false)}
              >
                <Text style={styles.feedbackModalBtnPrimaryText}>FECHAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}