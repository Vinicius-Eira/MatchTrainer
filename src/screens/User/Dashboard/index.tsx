import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, ScrollView, RefreshControl, ActivityIndicator, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CONSTANTS } from "./dashboardConstants";
import { styles } from "./dashboardStyles";
import { usePainelMeuTreinador } from "./useDashboard";

export default function Dashboard({ route, navigation }: any) {
  const { conexaoId } = route.params || { conexaoId: "1" };
  const {
    loading, refreshing, aluno, personal, diasTreino, progressoBarra, estaNoPeriodoTeste,
    semanaAtual, temTreinosNaSemana, treinoHoje, recadoPersonal, anamnesePendente, jaAvaliou,
    onRefresh, handleLogout, handleWhatsApp, featureBloqueada,
    handleAcaoEncerramento, verPerfilPersonal, irParaMeuPerfil, irParaChat
  } = usePainelMeuTreinador(navigation, conexaoId);

  const [statusFinanceiro] = useState<'em_dia' | 'pendente' | 'atrasado'>('pendente'); 
  
  const [imgErroAluno, setImgErroAluno] = useState(false);
  const [imgErroPersonal, setImgErroPersonal] = useState(false);

  if (loading || !aluno || !personal) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  const getFinanceiroProps = () => {
    switch (statusFinanceiro) {
      case 'em_dia': return { cor: "#00E676", bg: "rgba(0, 230, 118, 0.05)", border: "rgba(0, 230, 118, 0.2)", icone: "checkmark-circle", titulo: "Tudo em dia", sub: "Assinatura ativa" };
      case 'atrasado': return { cor: "#FF3B30", bg: "rgba(255, 59, 48, 0.05)", border: "rgba(255, 59, 48, 0.3)", icone: "alert-circle", titulo: "Pagamento Atrasado", sub: "Regularize agora" };
      case 'pendente': default: return { cor: "#FF6B00", bg: "rgba(255, 107, 0, 0.05)", border: "rgba(255, 107, 0, 0.3)", icone: "time", titulo: "Vence em breve", sub: "Dia 10/10 • R$ 150,00" };
    }
  };
  const finProps = getFinanceiroProps();

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
             <View style={[styles.studentAvatar, { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={20} color="#666" />
             </View>
           )}
           <View style={{ marginLeft: 12 }}>
              <Text style={styles.studentGreeting}>Olá, {aluno.nome?.split(' ')[0]}</Text>
              <Text style={styles.studentSub}>Pronto para o treino de hoje?</Text>
           </View>
        </View>
        <View style={styles.studentHeaderRight}>
          <TouchableOpacity style={styles.btnIcon} onPress={irParaMeuPerfil}>
            <Ionicons name="person-outline" size={22} color="#FF6B00" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnIcon, { marginLeft: 10 }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}>
        
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>{CONSTANTS.TITLE_TREINADOR}</Text>
          <View style={styles.trainerPremiumCard}>
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
              return (
                <View key={i} style={[styles.dayBox, dia.status === 'hoje' && styles.dayBoxHoje]}>
                  <Text style={[styles.dayLabel, dia.status === 'hoje' && {color: '#FF6B00'}]}>{dia.dia}</Text>
                  <Text style={[styles.dayDate, dia.status === 'hoje' && {color: '#FFF'}]}>{dia.data}</Text>
                  {dia.status === 'concluido' ? (
                    <View style={styles.statusDotConcluido}>
                      <Ionicons name="checkmark" size={10} color="#000" />
                    </View>
                  ) : (
                    <View style={[styles.statusDot, dia.status === 'hoje' ? {backgroundColor: '#FF6B00'} : {backgroundColor: 'transparent'}]} />
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
            <TouchableOpacity style={styles.checkinCardPendente} activeOpacity={0.9} onPress={() => navigation.navigate("Anamnese")}>
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
              <Ionicons name="checkmark-circle" size={24} color="#FF6B00" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}>Tudo em dia</Text>
                <Text style={{ color: "#888", fontSize: 12 }}>Seu personal ainda não enviou um check-in.</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>Treino do Dia</Text>
            <TouchableOpacity style={styles.btnVerTodos} onPress={() => navigation.navigate("WorkoutList", { conexaoId })}>
              <Text style={styles.btnVerTodosText}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color="#FF6B00" />
            </TouchableOpacity>
          </View>

          {treinoHoje ? (
            <TouchableOpacity style={styles.workoutCard} activeOpacity={0.9} onPress={() => featureBloqueada("Tela de Execução de Treino")}>
              <LinearGradient colors={["rgba(255,107,0,0.15)", "rgba(255,107,0,0.02)"]} style={styles.workoutCardBg} />
              <View style={styles.workoutCardContent}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutTitle}>{treinoHoje.nome || "Treino"}</Text>
                  <Ionicons name="play-circle" size={32} color="#FFF" />
                </View>
                <View style={styles.workoutSpecs}>
                  <View style={styles.workoutSpecItem}>
                    <Ionicons name="time-outline" size={14} color="#CCC" />
                    <Text style={styles.workoutSpecText}>Previsto: 60 min</Text>
                  </View>
                </View>
                <View style={styles.btnStartWorkout}>
                  <Text style={styles.btnStartWorkoutText}>Iniciar Treino</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyWorkoutCard}>
              <MaterialCommunityIcons name="weight-lifter" size={32} color="#FF6B00" style={{marginBottom: 8}} />
              <Text style={styles.emptyWorkoutTitle}>Sem treino previsto</Text>
              <Text style={styles.emptyWorkoutDesc}>Seu personal ainda não liberou o próximo treino.</Text>
            </View>
          )}

          {recadoPersonal ? (
            <View style={styles.feedbackBubble}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#FF6B00" />
              <Text style={styles.feedbackText}>
                <Text style={{fontWeight: 'bold', color: "#FFF"}}>Do seu personal: </Text>
                {recadoPersonal}
              </Text>
            </View>
          ) : (
            <View style={styles.feedbackBubbleEmpty}>
              <Ionicons name="chatbox-outline" size={20} color="#FF6B00" />
              <Text style={styles.feedbackTextEmpty}>Seu personal ainda não adicionou nenhum comentário sobre a sua evolução.</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Financeiro</Text>
          <TouchableOpacity style={[styles.financeiroCard, { backgroundColor: finProps.bg, borderColor: finProps.border }]} activeOpacity={0.8} onPress={() => navigation.navigate("Finance")}>
            <View style={[styles.financeiroIconBox, { backgroundColor: finProps.cor + '20' }]}>
              <Ionicons name={finProps.icone as any} size={20} color={finProps.cor} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.financeiroTitle}>Assinatura do Contrato</Text>
              <Text style={[styles.financeiroSub, { color: finProps.cor }]}>{finProps.titulo} • {finProps.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>

          <View style={styles.gridActionsPremium}>
            <TouchableOpacity style={styles.actionCardPremium} activeOpacity={0.8} onPress={() => navigation.navigate("Progress")}>
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
    </View>
  );
}