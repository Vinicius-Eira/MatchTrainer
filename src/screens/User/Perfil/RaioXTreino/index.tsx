import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";
import { useRaioXTreino } from "./useRaioXTreino";

const OPCOES_MODALIDADE = [
  { id: "Consultoria", titulo: "Consultoria Online", icon: "phone-portrait" as any, desc: "Treinos prescritos via app" },
  { id: "Presencial", titulo: "Presencial", icon: "people" as any, desc: "Acompanhamento físico lado a lado" },
  { id: "Indiferente", titulo: "Híbrido / Ambos", icon: "options" as any, desc: "Aberto a qualquer formato" },
];
const OPCOES_LOCAL = [
  { id: "Academias Comerciais", titulo: "Academias", icon: "business" as any, desc: "Academias de rede ou de bairro" },
  { id: "Condominios", titulo: "Condomínios", icon: "home" as any, desc: "Treinar no prédio ou em casa" },
  { id: "Ar Livre", titulo: "Ar Livre", icon: "leaf" as any, desc: "Parques e áreas abertas" },
];
const OPCOES_TURNO = [
  { id: "manha", titulo: "Manhã", icon: "partly-sunny" as any, desc: "Treino antes do dia começar" },
  { id: "tarde", titulo: "Tarde", icon: "sunny" as any, desc: "Horário de almoço ou fim de tarde" },
  { id: "noite", titulo: "Noite", icon: "moon" as any, desc: "Depois do trabalho/estudos" },
  { id: "variado", titulo: "Janelas Específicas", icon: "time" as any, desc: "Tenho horários limitados" },
];
const OPCOES_FREQUENCIA = [
  { id: "1-2", titulo: "1 a 2 dias", icon: "calendar" as any, desc: "Adaptação e rotina apertada" },
  { id: "3-4", titulo: "3 a 4 dias", icon: "flash" as any, desc: "Constância e evolução real" },
  { id: "5-6", titulo: "5 a 6 dias", icon: "flame" as any, desc: "Foco alto e disciplina" },
  { id: "7", titulo: "Todo dia", icon: "rocket" as any, desc: "Intensidade máxima" },
];
const OPCOES_GENERO_TREINADOR = [
  { id: "indiferente", titulo: "Indiferente", icon: "people" as any, desc: "Foco apenas na qualidade" },
  { id: "mulher", titulo: "Apenas Mulheres", icon: "woman" as any, desc: "Me sinto mais confortável" },
  { id: "homem", titulo: "Apenas Homens", icon: "man" as any, desc: "Tenho preferência" },
];
const OPCOES_INVESTIMENTO = [
  { id: "economico", titulo: "Orçamento Básico", icon: "wallet-outline" as any, desc: "Treinos presenciais mais acessíveis." },
  { id: "medio", titulo: "Média de Mercado", icon: "cash-outline" as any, desc: "Faixa padrão para a maioria." },
  { id: "premium", titulo: "Orçamento Premium", icon: "diamond-outline" as any, desc: "Consultorias de alto nível VIP." },
];
const OPCOES_HISTORICO = [
  { id: "iniciante", titulo: "Iniciante", icon: "walk" as any, desc: "Nunca treinei ou parei faz tempo" },
  { id: "intermediario", titulo: "Intermediário", icon: "bicycle" as any, desc: "Treino com alguma constância" },
  { id: "avancado", titulo: "Avançado", icon: "fitness" as any, desc: "Treino pesado e conheço meu corpo" },
];
const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecer", icon: "flame" as any, desc: "Perder gordura e secar" },
  { id: "hipertrofia", titulo: "Ganhar Massa", icon: "barbell" as any, desc: "Crescer e definir músculos" },
  { id: "performance", titulo: "Performance", icon: "speedometer" as any, desc: "Correr mais, TAF ou esportes" },
  { id: "saude", titulo: "Saúde / Qualidade", icon: "heart" as any, desc: "Condicionamento e bem-estar" },
  { id: "outro", titulo: "Outro Foco", icon: "add-circle" as any, desc: "Tenho um alvo diferente..." },
];
const OPCOES_LIMITACAO = [
  { id: "nenhuma", titulo: "Sem Restrições", icon: "checkmark-done" as any, desc: "Estou 100% pronto(a)" },
  { id: "gestante", titulo: "Gestante/Pós", icon: "body" as any, desc: "Preciso de treino adaptado" },
  { id: "lesao", titulo: "Lesões/Dores", icon: "medkit" as any, desc: "Dores articulares ou musculares" },
  { id: "clinica", titulo: "Condição Clínica", icon: "pulse" as any, desc: "Doença crônica ou síndrome" },
  { id: "outra", titulo: "Outra Restrição", icon: "add-circle" as any, desc: "Especificar..." },
];
const SUB_SAUDE = ["Hipertensão", "Diabetes", "Obesidade", "Postura", "Outros"];
const SUB_ESPORTE = ["Corrida", "Lutas", "Ciclismo", "Crossfit", "Futebol", "Outros"];
const SUB_LESAO = ["Joelho", "Coluna", "Ombro", "Quadril", "Tornozelo", "Outros"];
const SUB_CLINICA = ["Cardiopatia", "Asma", "SOP", "Fibromialgia", "Outros"];
const OPCOES_COBRANCA = [
  { id: "leve", titulo: "Compreensivo(a)", icon: "leaf-outline" as any, desc: "Foco no hábito sem pressão" },
  { id: "moderada", titulo: "Equilibrado(a)", icon: "scale-outline" as any, desc: "Exige, mas entende deslizes" },
  { id: "rigorosa", titulo: "Sargento", icon: "flash-outline" as any, desc: "Pega no pé, sem desculpas" },
];
const OPCOES_ACOMPANHAMENTO = [
  { id: "pontual", titulo: "Independente", icon: "chatbubble-outline" as any, desc: "Só preciso do treino e pronto" },
  { id: "frequente", titulo: "Semanal", icon: "calendar-outline" as any, desc: "Gosto de feedbacks e ajustes" },
  { id: "proximo", titulo: "Lado a Lado", icon: "people-circle-outline" as any, desc: "Quero muita motivação e contato" },
];
const OPCOES_AUTONOMIA = [
  { id: "baixa", titulo: "Baixa Autonomia", icon: "map-outline" as any, desc: "Preciso de vídeos detalhados" },
  { id: "media", titulo: "Média Autonomia", icon: "compass-outline" as any, desc: "Sei executar, quero a base" },
  { id: "alta", titulo: "Alta Autonomia", icon: "rocket-outline" as any, desc: "Domino tudo, quero a planilha" },
];
const OPCOES_VALORES = [
  { id: "didatica", titulo: "Boa Didática", icon: "book" as any, desc: "Saber explicar o porquê" },
  { id: "motivacao", titulo: "Motivação", icon: "flame" as any, desc: "Energia lá em cima" },
  { id: "flexibilidade", titulo: "Flexibilidade", icon: "swap-horizontal" as any, desc: "Saber adaptar imprevistos" },
  { id: "pontualidade", titulo: "Pontualidade", icon: "time" as any, desc: "Respostas rápidas no app" },
  { id: "outro", titulo: "Outro Valor", icon: "add-circle" as any, desc: "Especificar..." },
];

export function RaioXTreino({ navigation }: any) {
  const { state, actions } = useRaioXTreino(navigation);

  const renderPremiumList = (opcoes: any[], stateData: any, setStateData: any, isSingle = true) => (
    <View style={styles.listContainer}>
      {opcoes.map((opt) => {
        const ativo = isSingle ? stateData?.id === opt.id : stateData?.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.premiumOptionCard, ativo && styles.premiumOptionCardAtivo, state.isLocked && { opacity: 0.6 }]}
            onPress={() => state.isLocked ? actions.handleLockedPress() : (isSingle ? setStateData({ id: opt.id }) : actions.toggleArrayItem(opt.id, stateData, setStateData))}
            activeOpacity={state.isLocked ? 1 : 0.8}
          >
            {ativo && <LinearGradient colors={["rgba(255, 107, 0, 0.12)", "transparent"]} style={StyleSheet.absoluteFill} />}
            <View style={[styles.premiumIconBox, ativo && styles.premiumIconBoxAtivo]}>
              <Ionicons name={opt.icon as any} size={22} color={ativo ? theme.colors.backgroundPure : "#888"} />
            </View>
            <View style={styles.premiumTextContent}>
              <Text style={[styles.premiumOptionTitle, ativo && styles.premiumOptionTitleAtivo]}>{opt.titulo}</Text>
              {opt.desc && <Text style={styles.premiumOptionDesc}>{opt.desc}</Text>}
            </View>
            <View style={[styles.radioCircle, ativo && styles.radioCircleAtivo]}>
              {ativo && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderChips = (opcoes: string[], stateArray: string[], setStateArray: any) => (
    <View style={styles.chipsContainer}>
      {opcoes.map((opt) => {
        const isSelected = stateArray?.includes(opt);
        return (
          <TouchableOpacity key={opt} style={[styles.chip, isSelected && styles.chipAtivo]} onPress={() => actions.toggleArrayItem(opt, stateArray, setStateArray)} activeOpacity={state.isLocked ? 1 : 0.7}>
            <Text style={[styles.chipTexto, isSelected && styles.chipTextoAtivo]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (state.loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />
      <View style={styles.glowTopLeft} />

      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RAIO-X DO TREINO</Text>
        <View style={{ width: scale(40) }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {state.isLocked ? (
          <View style={styles.statusBoxLocked}>
            <Ionicons name="lock-closed" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
            <Text style={styles.statusTextLocked}>Sincronização blindada. Você possui um contrato ativo. Alterações no perfil são permitidas apenas sem vínculo.</Text>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="handshake" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.statusText}>Estas tags guiam nossa Inteligência Artificial para achar o seu Match perfeito.</Text>
          </View>
        )}

        <Text style={styles.sectionDivider}>Logística e Estrutura</Text>
        
        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Formato de Atendimento {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_MODALIDADE, state.servicoBuscado, actions.setServicoBuscado)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Onde você vai treinar? {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_LOCAL, state.locaisTreino, actions.setLocaisTreino, false)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Turno de Treino {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_TURNO, state.turnos, actions.setTurnos, false)}
          {state.turnos?.includes("variado") && (
            <TextInput style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]} placeholder="Ex: Ter/Qui às 14h..." placeholderTextColor="#666" value={state.horarioEspecifico} onChangeText={actions.setHorarioEspecifico} editable={!state.isLocked} keyboardAppearance="dark" />
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Disponibilidade na Semana {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_FREQUENCIA, state.frequencia, actions.setFrequencia)}
        </View>

        <Text style={styles.sectionDivider}>Seu Corpo</Text>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Nível de Experiência {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_HISTORICO, state.historico, actions.setHistorico)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Objetivo Principal {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_OBJETIVO, state.objetivos, actions.setObjetivos, false)}
          
          {state.objetivos?.includes("outro") && (
            <TextInput style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]} placeholder="Qual seu foco?" placeholderTextColor="#666" value={state.outroObjetivoTexto} onChangeText={actions.setOutroObjetivoTexto} editable={!state.isLocked} keyboardAppearance="dark" />
          )}
          {state.objetivos?.includes("saude") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Foco de Saúde:</Text>{renderChips(SUB_SAUDE, state.subsObjetivos, actions.setSubsObjetivos)}</View>
          )}
          {state.objetivos?.includes("performance") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Quais Esportes?</Text>{renderChips(SUB_ESPORTE, state.subsObjetivos, actions.setSubsObjetivos)}</View>
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Limitações / Cuidados {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_LIMITACAO, state.limitacoes, actions.setLimitacoes, false)}
          
          {state.limitacoes?.includes("outra") && (
            <TextInput style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]} placeholder="Especifique..." placeholderTextColor="#666" value={state.outraLimitacaoTexto} onChangeText={actions.setOutraLimitacaoTexto} editable={!state.isLocked} keyboardAppearance="dark" />
          )}
          {state.limitacoes?.includes("lesao") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Foco da dor:</Text>{renderChips(SUB_LESAO, state.subsLimitacoes, actions.setSubsLimitacoes)}</View>
          )}
          {state.limitacoes?.includes("clinica") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Condição Clínica:</Text>{renderChips(SUB_CLINICA, state.subsLimitacoes, actions.setSubsLimitacoes)}</View>
          )}
        </View>

        <Text style={styles.sectionDivider}>O Match Ideal</Text>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Qual perfil te motiva? {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_COBRANCA, state.cobranca, actions.setCobranca)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Nível de Contato {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_ACOMPANHAMENTO, state.acompanhamento, actions.setAcompanhamento)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Sua Autonomia {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_AUTONOMIA, state.autonomia, actions.setAutonomia)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>O que mais valoriza? {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_VALORES, state.valoresTreinador, actions.setValoresTreinador, false)}
          {state.valoresTreinador?.includes("outro") && (
            <TextInput style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]} placeholder="Especifique..." placeholderTextColor="#666" value={state.outroValorTexto} onChangeText={actions.setOutroValorTexto} editable={!state.isLocked} keyboardAppearance="dark" />
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Preferência de Gênero {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_GENERO_TREINADOR, state.generoTreinador, actions.setGeneroTreinador)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Investimento Mensal {state.isLocked && "🔒"}</Text>
          {renderPremiumList(OPCOES_INVESTIMENTO, state.investimento, actions.setInvestimento)}
        </View>

        {!state.isLocked && (
          <TouchableOpacity style={styles.btnSalvar} onPress={actions.handleSalvar} disabled={state.salvando} activeOpacity={0.85}>
            <LinearGradient colors={["#FF8C00", "#FF5500"]} style={styles.btnGradient}>
              {state.salvando ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.btnSalvarText}>Salvar Preferências</Text>}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020202" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020202" },
  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.1},
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { color: theme.colors.primary, fontSize: moderateScale(13), fontWeight: "900", letterSpacing: 1.5 },
  content: { padding: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(120) : verticalScale(100), paddingBottom: verticalScale(60) },

  statusBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.08)", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)", marginBottom: verticalScale(20) },
  statusText: { color: "#CCC", fontSize: moderateScale(13), fontWeight: "500", flex: 1, lineHeight: moderateScale(20) },
  statusBoxLocked: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 59, 48, 0.08)", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 59, 48, 0.2)", marginBottom: verticalScale(20) },
  statusTextLocked: { color: "#FF3B30", fontSize: moderateScale(12), fontWeight: "bold", flex: 1, lineHeight: moderateScale(18) },

  sectionDivider: { color: theme.colors.primary, fontSize: moderateScale(18), fontFamily: theme.fonts.title, marginTop: verticalScale(10), marginBottom: verticalScale(15), textTransform: "uppercase" },

  preferenceCard: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(24), padding: scale(20), marginBottom: verticalScale(16), borderWidth: 1, borderColor: "#222" },
  cardHeaderTitleSub: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "700", marginBottom: verticalScale(16), textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" },

  listContainer: { flexDirection: "column", gap: verticalScale(12) },
  premiumOptionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", padding: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  premiumOptionCardAtivo: { borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  premiumIconBox: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  premiumIconBoxAtivo: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  premiumTextContent: { flex: 1, paddingRight: scale(10) },
  premiumOptionTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(4), letterSpacing: 0.2 },
  premiumOptionTitleAtivo: { color: theme.colors.primary },
  premiumOptionDesc: { color: "#888", fontSize: moderateScale(13), lineHeight: moderateScale(18) },
  radioCircle: { width: scale(24), height: scale(24), borderRadius: moderateScale(12), borderWidth: 2, borderColor: "#444", justifyContent: "center", alignItems: "center" },
  radioCircleAtivo: { borderColor: theme.colors.primary },
  radioInner: { width: scale(10), height: scale(10), borderRadius: moderateScale(5), backgroundColor: theme.colors.primary },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: scale(8), justifyContent: "center" },
  chip: { backgroundColor: "#151515", paddingVertical: verticalScale(10), paddingHorizontal: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#2A2A2A" },
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.08)", borderColor: theme.colors.primary },
  chipTexto: { color: "#CCC", fontSize: moderateScale(13), fontWeight: "700" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },

  subBox: { backgroundColor: "#111", width: "100%", padding: scale(15), borderRadius: moderateScale(16), marginTop: verticalScale(10), borderWidth: 1, borderColor: "#2A2A2A" },
  subBoxTitle: { color: "#AAA", fontSize: moderateScale(12), fontWeight: "bold", marginBottom: verticalScale(10), textTransform: "uppercase", textAlign: "center" },
  inputPremiumSmall: { backgroundColor: "#1A1A1A", borderRadius: moderateScale(14), color: "#FFF", fontSize: moderateScale(14), padding: scale(16), borderWidth: 1, borderColor: "#333", width: "100%", marginTop: verticalScale(15), marginBottom: verticalScale(5) },

  btnSalvar: { borderRadius: moderateScale(20), marginTop: verticalScale(15), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnGradient: { flexDirection: "row", height: verticalScale(64), borderRadius: moderateScale(20), justifyContent: "center", alignItems: "center" },
  btnSalvarText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});