import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  absoluteFill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  
  // HEADER
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20, paddingBottom: verticalScale(15), paddingHorizontal: scale(20), backgroundColor: "#050505" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1.5 },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(80) },
  
  // SEÇÕES
  section: { marginBottom: verticalScale(35) },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: verticalScale(16) },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900", marginBottom: verticalScale(12) },
  sectionHint: { color: "#888", fontSize: moderateScale(12) },
  
  // FEEDBACK DO PERSONAL
  coachCardWrapper: { marginBottom: verticalScale(30), backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)", overflow: "hidden" },
  coachHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(10) },
  coachTitleRow: { flexDirection: "row", alignItems: "center", gap: scale(6) },
  coachTitle: { color: "#FF6B00", fontSize: moderateScale(13), fontWeight: "900", textTransform: "uppercase" },
  coachDate: { color: "#666", fontSize: moderateScale(11) },
  coachMessage: { color: "#FFF", fontSize: moderateScale(14), fontStyle: "italic", lineHeight: moderateScale(22) },
  
  // 1. COMPOSIÇÃO CORPORAL (Identidade Neon)
  bioGrid: { flexDirection: "row", justifyContent: "space-between", gap: scale(10) },
  bioCard: { flex: 1, backgroundColor: "#0A0A0A", padding: scale(14), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#151515", borderTopWidth: 3, borderTopColor: "#FF6B00", alignItems: "center", shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  bioLabel: { color: "#888", fontSize: moderateScale(11), fontWeight: "bold", marginBottom: verticalScale(8), textAlign: "center", textTransform: "uppercase" },
  bioValue: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900", marginBottom: verticalScale(6) },
  bioDiffBadge: { flexDirection: "row", alignItems: "center", gap: scale(4), paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(20), backgroundColor: "#151515" },
  bioDiffGood: { backgroundColor: "rgba(0, 230, 118, 0.1)" },
  bioDiffNeutral: { backgroundColor: "#111" },
  bioDiffText: { fontSize: moderateScale(10), fontWeight: "bold", color: "#888" },
  
  // 2. RESUMO DE TREINOS (Números em Neon Orange)
  resumoGrid: { flexDirection: "row", backgroundColor: "#0A0A0A", borderRadius: moderateScale(12), paddingVertical: verticalScale(16), borderWidth: 1, borderColor: "#1A1A1A" },
  resumoItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  resumoValor: { color: "#FF6B00", fontSize: moderateScale(20), fontWeight: "900", marginBottom: verticalScale(4) },
  resumoUnidade: { fontSize: moderateScale(12), color: "#888", fontWeight: "bold" },
  resumoLabel: { color: "#888", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase" },
  resumoDivider: { width: 1, backgroundColor: "#222" },
  
  // 3. RECORDES (Badge Sólida Premium)
  listContainer: { gap: verticalScale(12) },
  prCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#050505", padding: scale(16), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#1A1A1A", borderLeftWidth: 3, borderLeftColor: "#FF6B00" },
  prInfo: { flex: 1 },
  prName: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(2) },
  prDate: { color: "#666", fontSize: moderateScale(11) },
  prWeightBadge: { backgroundColor: "#FF6B00", paddingHorizontal: scale(14), paddingVertical: verticalScale(6), borderRadius: moderateScale(8) },
  prWeightText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900" },
  
  // 4. ÚLTIMOS TREINOS
  historyCard: { backgroundColor: "#0A0A0A", padding: scale(16), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#151515" },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(12) },
  historyTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900" },
  historyDate: { color: "#666", fontSize: moderateScale(12) },
  historyMetricsRow: { flexDirection: "row", gap: scale(16) },
  historyMetric: { flexDirection: "row", alignItems: "center", gap: scale(6) },
  historyMetricText: { color: "#AAA", fontSize: moderateScale(12), fontWeight: "bold" },
});