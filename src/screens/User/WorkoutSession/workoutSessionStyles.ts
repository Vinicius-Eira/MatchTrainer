import { StyleSheet, Platform } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  container: { flex: 1 },
  
  // HEADER GLOBAL
  header: { backgroundColor: "#0A0A0A", paddingTop: verticalScale(15), borderBottomWidth: 1, borderBottomColor: "#151515" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: scale(15), marginBottom: verticalScale(10) },
  btnClose: { width: scale(30), height: scale(30), justifyContent: "center" },
  headerTitleBox: { alignItems: "center", flex: 1 },
  treinoTitleText: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  
  globalTimerBadge: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(4) },
  globalTimerText: { color: "#888", fontSize: moderateScale(12), fontWeight: "bold", marginLeft: scale(4), fontVariant: ['tabular-nums'] },
  
  progressTextRow: { paddingHorizontal: scale(20), marginBottom: verticalScale(8) },
  progressLabel: { color: "#666", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase" },
  progressBarContainer: { width: "100%", height: verticalScale(3), backgroundColor: "#222" },
  progressBarFill: { height: "100%", backgroundColor: "#FF6B00" },
  
  scrollContent: { padding: scale(16), paddingBottom: verticalScale(120) },
  exerciseBlock: { marginBottom: verticalScale(16) },
  divider: { height: 1, backgroundColor: "#151515", marginVertical: verticalScale(20), width: "100%" },
  
  // ESTADO COMPACTO
  cardCompacto: { backgroundColor: "#0C0C0C", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A" },
  cardCompactoConcluido: { backgroundColor: "rgba(0, 230, 118, 0.05)", borderColor: "rgba(0, 230, 118, 0.15)" },
  dotPronto: { width: scale(12), height: scale(12), borderRadius: scale(6), backgroundColor: "#222", marginRight: scale(12), borderWidth: 2, borderColor: "#333" },
  cardCompactoNome: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold" },
  cardCompactoMets: { color: "#666", fontSize: moderateScale(12), marginTop: verticalScale(4) },
  
  // ESTADO ATUAL
  cardPlayer: { backgroundColor: "#050505", borderRadius: moderateScale(20), padding: scale(16), borderWidth: 1, borderColor: "#1A1A1A" },
  playerHeader: { flexDirection: "row", alignItems: "stretch", marginBottom: verticalScale(20) },
  videoContainer: { width: scale(90), height: verticalScale(120), backgroundColor: "#151515", borderRadius: moderateScale(12), overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "#222" },
  mediaImage: { width: "100%", height: "100%", resizeMode: "cover" },
  mediaPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  playOverlay: { position: "absolute", top: "50%", left: "50%", marginTop: -16, marginLeft: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  
  infoRightContainer: { flex: 1, marginLeft: scale(16), justifyContent: "center" },
  labelAtual: { color: "#FF6B00", fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 1, marginBottom: verticalScale(4) },
  nomeAtual: { color: "#FFF", fontSize: moderateScale(20), fontWeight: "900", lineHeight: moderateScale(24) },
  grupoAtual: { color: "#666", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginTop: verticalScale(4) },
  
  obsPersonalBox: { marginTop: verticalScale(4), marginBottom: verticalScale(4) },
  obsPersonalLabel: { color: "#AAA", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(4) },
  obsPersonalText: { color: "#FFF", fontSize: moderateScale(14), fontStyle: "italic", lineHeight: moderateScale(20) },
  
  // AS SÉRIES (ESPAÇOSAS E LARGAS)
  seriesContainer: { gap: verticalScale(20) },
  serieCard: { backgroundColor: "#0C0C0C", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A" },
  serieCardAtivo: { backgroundColor: "#111", borderColor: "#333", elevation: 6 },
  serieCardConcluido: { opacity: 0.6, backgroundColor: "#050505" },
  
  serieCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(16) },
  serieTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1 },
  descansoBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", paddingHorizontal: scale(10), paddingVertical: verticalScale(6), borderRadius: moderateScale(8), borderWidth: 1, borderColor: "#222" },
  descansoBadgeText: { color: "#AAA", fontSize: moderateScale(12), marginLeft: scale(4), fontWeight: "bold" },
  
  serieCardBody: { marginBottom: verticalScale(16) },
  
  // Prescrição Horizontal no topo do card
  seriePrescricaoRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#151515", padding: scale(12), borderRadius: moderateScale(10), marginBottom: verticalScale(16) },
  dataLabel: { color: "#888", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginRight: scale(10) },
  dataPrescrito: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold" },
  textoOpacity: { opacity: 0.5 },
  
  serieRealizadoContainer: { width: "100%" },
  dataLabelHighlight: { color: "#FF6B00", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(10) },
  
  // INPUTS GIGANTES
  inputsBigRow: { flexDirection: "row", gap: scale(12), width: "100%" },
  inputBigWrapper: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#000", paddingVertical: verticalScale(14), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222" },
  inputBigWrapperAtivo: { borderColor: "#444", backgroundColor: "#050505" },
  inputBigRealizado: { color: "#FFF", fontSize: moderateScale(26), fontWeight: "900", textAlign: "center", minWidth: scale(45), padding: 0 },
  inputBigRealizadoConcluido: { color: "#00E676" },
  inputBigSuffix: { color: "#888", fontSize: moderateScale(12), marginLeft: scale(6), marginBottom: -verticalScale(4) },
  
  // BOTÃO DE AÇÃO NA BASE
  btnAction: { width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: verticalScale(16), borderRadius: moderateScale(12), borderWidth: 1 },
  btnActionAtivo: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  btnActionInativo: { backgroundColor: "#000", borderColor: "#222" },
  btnActionConcluido: { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.3)" },
  btnActionText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1, marginLeft: scale(8) },
  btnActionTextConcluido: { color: "#00E676", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1, marginLeft: scale(8) },
  
  // OBSERVAÇÕES
  alunoObsContainer: { marginTop: verticalScale(10) },
  alunoObsHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: verticalScale(12) },
  alunoObsTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold" },
  alunoObsHint: { color: "#FF6B00", fontSize: moderateScale(11), fontStyle: "italic", fontWeight: "bold" },
  alunoObsInput: { backgroundColor: "#111", borderRadius: moderateScale(12), padding: scale(16), color: "#FFF", fontSize: moderateScale(15), minHeight: verticalScale(120), textAlignVertical: "top", borderWidth: 1, borderColor: "#222" },
  
  feedbackGeralContainer: { marginTop: verticalScale(20), paddingHorizontal: scale(10) },
  feedbackGeralTitle: { color: "#FF6B00", fontSize: moderateScale(16), fontWeight: "900" },
  feedbackGeralSub: { color: "#AAA", fontSize: moderateScale(13), marginBottom: verticalScale(12), lineHeight: moderateScale(18) },
  
  // FLOATING REST BAR (Fixa e Imune a Erros)
  floatingRestBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: verticalScale(100), flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: scale(20), paddingBottom: Platform.OS === 'ios' ? verticalScale(20) : 0, borderTopWidth: 1, borderTopColor: "#00E676", elevation: 20 },
  restInfo: { flexDirection: "row", alignItems: "center" },
  restTitle: { color: "#00E676", fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 1, marginBottom: verticalScale(2) },
  restTimer: { color: "#FFF", fontSize: moderateScale(32), fontWeight: "bold", fontVariant: ['tabular-nums'], letterSpacing: -1 },
  btnPularDescanso: { backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: scale(16), paddingVertical: verticalScale(12), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  btnPularText: { color: "#FFF", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase" },
});