import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  container: { flex: 1, backgroundColor: "#050505" },
  center: { justifyContent: "center", alignItems: "center" },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20, paddingBottom: verticalScale(15), paddingHorizontal: scale(20), backgroundColor: "#050505" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.5 },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(140) },
  
  heroSection: { marginBottom: verticalScale(35), alignItems: "center" },
  badgeTreinoHoje: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.1)", paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", marginBottom: verticalScale(16), gap: scale(6) },
  badgeTreinoHojeText: { color: "#FF6B00", fontSize: moderateScale(11), fontWeight: "900", letterSpacing: 1 },
  treinoTitle: { color: "#FFF", fontSize: moderateScale(32), fontWeight: "900", textAlign: "center", letterSpacing: -1, marginBottom: verticalScale(8) },
  treinoObjetivoBox: { flexDirection: "row", alignItems: "center", gap: scale(6), marginBottom: verticalScale(20) },
  treinoObjetivo: { color: "#AAA", fontSize: moderateScale(14), fontWeight: "600" },
  
  obsGeralBox: { backgroundColor: "#111", padding: scale(16), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(20), width: "100%" },
  obsGeralText: { color: "#CCC", fontSize: moderateScale(13), fontStyle: "italic", textAlign: "center", lineHeight: moderateScale(18) },
  
  macroStatsContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%", backgroundColor: "rgba(255, 107, 0, 0.03)", paddingVertical: verticalScale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)", shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  macroStat: { alignItems: "center", flex: 1 },
  macroStatValue: { color: "#FFF", fontSize: moderateScale(20), fontWeight: "900" },
  macroStatLabel: { color: "#FF6B00", fontSize: moderateScale(11), textTransform: "uppercase", fontWeight: "bold", marginTop: verticalScale(4) },
  macroStatDivider: { width: 1, height: "60%", backgroundColor: "rgba(255, 107, 0, 0.2)" },
  
  sectionTitle: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900", marginBottom: verticalScale(15), letterSpacing: 0.5 },
  listaContainer: { gap: verticalScale(16) },
  
  // CARD E VÍDEO
  exercicioCard: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(20), padding: scale(14), borderWidth: 1, borderColor: "#1A1A1A", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  exercicioRow: { flexDirection: "row", alignItems: "stretch" },
  
  videoContainer: { width: scale(100), height: "auto", minHeight: verticalScale(140), borderRadius: moderateScale(14), backgroundColor: "#151515", marginRight: scale(16), position: "relative", overflow: "hidden", borderWidth: 1, borderColor: "#222" },
  videoThumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
  videoPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" },
  playOverlay: { position: "absolute", top: "50%", left: "50%", marginTop: -18, marginLeft: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  
  // LADO DIREITO (INFORMAÇÕES E DASHBOARD DE MÉTRICAS)
  exercicioMainInfo: { flex: 1, justifyContent: "space-between" },
  exercicioNome: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900", marginBottom: verticalScale(2), lineHeight: moderateScale(20) },
  grupoMuscularText: { color: "#666", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(10) },
  
  premiumMetricsBlock: { gap: verticalScale(6) },
  premiumMetricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111", paddingHorizontal: scale(10), paddingVertical: verticalScale(6), borderRadius: moderateScale(8) },
  premiumMetricRowHighlight: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.08)", paddingHorizontal: scale(10), paddingVertical: verticalScale(6), borderRadius: moderateScale(8), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.25)" },
  
  premiumMetricLabel: { color: "#888", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase" },
  premiumMetricValue: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "900" },
  premiumMetricLabelDestaque: { color: "#FF6B00", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase" },
  premiumMetricValueDestaque: { color: "#FF6B00", fontSize: moderateScale(15), fontWeight: "900" },
  metricSubText: { color: "#666", fontSize: moderateScale(11), fontWeight: "normal" },
  
  // OBSERVAÇÃO
  trainerNoteBox: { flexDirection: "row", backgroundColor: "#120E0A", padding: scale(12), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)", marginTop: verticalScale(14) },
  trainerNoteIcon: { marginRight: scale(10), marginTop: verticalScale(2) },
  trainerNoteTitle: { color: "#FF6B00", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(4) },
  trainerNoteText: { color: "#CCC", fontSize: moderateScale(13), lineHeight: moderateScale(18) },
  
  // FOOTER
  footerFixo: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: scale(20), paddingBottom: Platform.OS === 'ios' ? verticalScale(35) : verticalScale(25), paddingTop: verticalScale(40) },
  footerGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  btnIniciar: { backgroundColor: "#FF6B00", borderRadius: moderateScale(18), paddingVertical: verticalScale(18), flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  btnIniciarText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", letterSpacing: 1.5 },
});