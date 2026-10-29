import { Platform, StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";

const MATCH_COLORS = {
  background: "#050505",       
  surface: "#0A0A0C",          
  surfaceLight: "#15151A",     
  primary: "#FF6B00",          
  primaryDim: "rgba(255, 107, 0, 0.15)", 
  success: "#00E676",          
  successDim: "rgba(0, 230, 118, 0.1)",  
  danger: "#EF4444",           
  dangerDim: "rgba(239, 68, 68, 0.05)",
  border: "#1A1A20",           
  borderActive: "rgba(255, 107, 0, 0.4)", 
  text: "#FFFFFF",             
  textMuted: "#888888",        
  textDim: "#555555"           
};

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: MATCH_COLORS.background },
  container: { flex: 1 },
  
  header: { 
    backgroundColor: MATCH_COLORS.background, 
    paddingTop: verticalScale(10), 
    paddingBottom: verticalScale(15), 
    paddingHorizontal: scale(16),
  },
  headerTopRow: { 
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(12)
  },
  btnClose: { 
    width: scale(40), height: scale(40), borderRadius: 20, 
    backgroundColor: MATCH_COLORS.surface, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: MATCH_COLORS.border
  },
  dynamicIsland: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: MATCH_COLORS.surface, marginHorizontal: scale(12),
    paddingVertical: verticalScale(8), borderRadius: 20,
    borderWidth: 1, borderColor: MATCH_COLORS.border
  },
  treinoTitleText: { 
    color: MATCH_COLORS.text, fontSize: moderateScale(14), fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 
  },
  globalTimerText: { 
    color: MATCH_COLORS.primary, fontSize: moderateScale(13), fontWeight: "bold", fontVariant: ['tabular-nums'], marginTop: verticalScale(2)
  },
  
  progressContainer: { width: "100%", paddingHorizontal: scale(4) },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(6) },
  progressLabel: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(11), fontWeight: "700", textTransform: "uppercase" },
  progressValue: { color: MATCH_COLORS.primary, fontSize: moderateScale(11), fontWeight: "900" },
  progressBarTrack: { width: "100%", height: verticalScale(4), backgroundColor: MATCH_COLORS.border, borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 2 },
  
  scrollContent: { padding: scale(16), paddingBottom: verticalScale(160) },
  
  cardContainer: {
    backgroundColor: MATCH_COLORS.surface, borderRadius: 16, marginBottom: verticalScale(12),
    borderWidth: 1, borderColor: MATCH_COLORS.border, overflow: "hidden"
  },
  cardContainerExpanded: {
    borderColor: MATCH_COLORS.borderActive, shadowColor: MATCH_COLORS.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
  },
  cardContainerCompleted: { opacity: 0.7, borderColor: MATCH_COLORS.successDim },
  
  cardHeader: { flexDirection: "row", alignItems: "center", padding: scale(12) },
  
  thumbnailContainer: {
    width: scale(64), height: scale(64), borderRadius: 12, backgroundColor: "#111",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
    marginRight: scale(12), borderWidth: 1, borderColor: MATCH_COLORS.border
  },
  thumbnail: { width: "100%", height: "100%", resizeMode: "cover", opacity: 0.7 },
  thumbnailPlayOverlay: {
    position: "absolute", width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  
  cardInfo: { flex: 1, justifyContent: "center" },
  cardTitle: { color: MATCH_COLORS.text, fontSize: moderateScale(15), fontWeight: "900", marginBottom: verticalScale(4) },
  cardSubtitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(12), fontWeight: "600" },
  cardIconBox: { width: scale(32), alignItems: "flex-end", justifyContent: "center" },

  cardBody: { paddingHorizontal: scale(12), paddingBottom: verticalScale(16) },
  divider: { height: 1, backgroundColor: MATCH_COLORS.border, marginVertical: verticalScale(12), width: "100%" },

  expandedMediaContainer: {
    width: "100%", height: verticalScale(280), backgroundColor: "#111", borderRadius: 16,
    overflow: "hidden", marginBottom: verticalScale(16), borderWidth: 1, borderColor: MATCH_COLORS.border,
    justifyContent: "center", alignItems: "center"
  },
  expandedMedia: { width: "100%", height: "100%", resizeMode: "cover", opacity: 0.8 },
  expandedPlayOverlay: {
    position: "absolute", width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)"
  },

  fullScreenModalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  fullScreenMedia: { width: "100%", height: "80%", resizeMode: "contain" },
  btnCloseFullScreen: {
    position: "absolute", top: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(30), right: scale(20),
    width: scale(44), height: scale(44), borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center", zIndex: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },

  obsPersonalBox: { flexDirection: "row", backgroundColor: MATCH_COLORS.primaryDim, padding: scale(12), borderRadius: 12, marginBottom: verticalScale(16) },
  obsPersonalLabel: { color: MATCH_COLORS.primary, fontSize: moderateScale(10), fontWeight: "800", textTransform: "uppercase", marginBottom: 2 },
  obsPersonalText: { color: MATCH_COLORS.text, fontSize: moderateScale(13), fontStyle: "italic" },

  seriesHeaderTitles: { flexDirection: "row", paddingHorizontal: scale(4), marginBottom: verticalScale(8) },
  seriesHeaderLabelTitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(9), fontWeight: "bold", width: scale(35) },
  seriesHeaderLabelCenter: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(9), fontWeight: "bold", flex: 1, textAlign: "center" },
  seriesHeaderLabelCheck: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(9), fontWeight: "bold", width: scale(45), textAlign: "center" },
  
  serieRow: { flexDirection: "row", alignItems: "center", backgroundColor: MATCH_COLORS.background, paddingVertical: verticalScale(10), paddingHorizontal: scale(8), borderRadius: 12, marginBottom: verticalScale(6), borderWidth: 1, borderColor: MATCH_COLORS.border },
  serieRowAtiva: { borderColor: MATCH_COLORS.borderActive, backgroundColor: MATCH_COLORS.surfaceLight },
  serieRowConcluido: { opacity: 0.5, borderColor: MATCH_COLORS.background },
  
  serieColNumber: { width: scale(35), justifyContent: "center" },
  serieNumberText: { color: MATCH_COLORS.text, fontSize: moderateScale(14), fontWeight: "900" },
  
  serieColTempo: { flex: 1, alignItems: "center", justifyContent: "center" },
  serieColTarget: { flex: 1, alignItems: "center", justifyContent: "center" },
  serieTargetText: { color: MATCH_COLORS.text, fontSize: moderateScale(15), fontWeight: "bold" },
  textDimmed: { color: MATCH_COLORS.textMuted },
  
  serieColInput: { flex: 1, alignItems: "center", justifyContent: "center" },
  inputCarga: { width: scale(55), backgroundColor: MATCH_COLORS.surface, color: MATCH_COLORS.primary, fontSize: moderateScale(15), fontWeight: "900", textAlign: "center", paddingVertical: verticalScale(8), borderRadius: 8, borderWidth: 1, borderColor: MATCH_COLORS.border },
  inputCargaConcluida: { color: MATCH_COLORS.textMuted, borderColor: MATCH_COLORS.surface },
  
  serieColCheck: { width: scale(45), alignItems: "flex-end", justifyContent: "center" },
  btnCheckSerie: { width: scale(36), height: scale(36), borderRadius: 18, justifyContent: "center", alignItems: "center", borderWidth: 2 },
  btnCheckSerieAtivo: { backgroundColor: MATCH_COLORS.primary, borderColor: MATCH_COLORS.primary },
  btnCheckSerieInativo: { backgroundColor: "transparent", borderColor: MATCH_COLORS.border },
  btnCheckSerieConcluido: { backgroundColor: MATCH_COLORS.success, borderColor: MATCH_COLORS.success },

  alunoAcoesContainer: { marginTop: verticalScale(8) },
  alunoAcoesTitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(11), fontWeight: "800", textTransform: "uppercase", marginBottom: verticalScale(8) },
  alunoObsInput: { backgroundColor: MATCH_COLORS.background, borderRadius: 12, padding: scale(12), color: MATCH_COLORS.text, fontSize: moderateScale(13), minHeight: verticalScale(60), textAlignVertical: "top", borderWidth: 1, borderColor: MATCH_COLORS.border, marginBottom: verticalScale(16) },
  
  btnRelatarDor: { 
    flexDirection: "row", alignItems: "center", paddingVertical: verticalScale(14), paddingHorizontal: scale(16),
    backgroundColor: "rgba(239, 68, 68, 0.08)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.4)",
    shadowColor: MATCH_COLORS.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8
  },
  btnRelatarDorIconBox: {
    width: scale(32), height: scale(32), borderRadius: 16, backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center", alignItems: "center", marginRight: scale(12)
  },
  btnRelatarDorText: { color: MATCH_COLORS.danger, fontSize: moderateScale(13), fontWeight: "900", flex: 1, letterSpacing: 0.5 },

  btnFinalizarOutline: { 
    width: "100%", backgroundColor: "rgba(255, 107, 0, 0.05)", borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.4)", paddingVertical: verticalScale(16), 
    borderRadius: 16, flexDirection: "row", justifyContent: "center", 
    alignItems: "center", marginTop: verticalScale(10), marginBottom: verticalScale(20)
  },
  btnFinalizarOutlineText: { color: MATCH_COLORS.primary, fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.5, marginRight: scale(8) },

  floatingRestContainer: { position: "absolute", bottom: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(16), left: scale(16), right: scale(16), zIndex: 999 },

  restModalContainer: { flex: 1, backgroundColor: "rgba(0, 38, 19, 0.95)", justifyContent: "center", alignItems: "center", padding: scale(20) },
  restModalBox: { width: "100%", backgroundColor: "#00E676", borderRadius: 24, padding: scale(30), alignItems: "center", shadowColor: "#00E676", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  restModalTitle: { color: "#004d27", fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase", letterSpacing: 2, marginBottom: verticalScale(10) },
  restModalTime: { color: "#050505", fontSize: moderateScale(64), fontWeight: "900", fontVariant: ['tabular-nums'], letterSpacing: -2, marginBottom: verticalScale(20) },
  restModalBtn: { backgroundColor: "#050505", paddingVertical: verticalScale(14), paddingHorizontal: scale(30), borderRadius: 100, flexDirection: "row", alignItems: "center" },
  restModalBtnText: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }
});