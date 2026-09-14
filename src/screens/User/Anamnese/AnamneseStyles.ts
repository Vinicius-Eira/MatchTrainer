import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20, paddingBottom: verticalScale(15), paddingHorizontal: scale(20), backgroundColor: "#050505" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1.5 },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(60) },
  
  section: { marginBottom: verticalScale(35) },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900", marginBottom: verticalScale(16) },
  
  pendingCard: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), padding: scale(20), borderWidth: 1, borderColor: "#FF6B00", shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  pendingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(12) },
  pendingTitleRow: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  pendingTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900" },
  
  badgeNew: { backgroundColor: "rgba(255, 107, 0, 0.15)", paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  badgeNewText: { color: "#FF6B00", fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 1 },
  
  pendingDesc: { color: "#CCC", fontSize: moderateScale(14), lineHeight: moderateScale(20), marginBottom: verticalScale(16) },
  
  pendingMetaRow: { flexDirection: "row", alignItems: "center", gap: scale(16), marginBottom: verticalScale(20) },
  pendingMetaText: { color: "#888", fontSize: moderateScale(12), fontWeight: "bold" },
  
  btnRespond: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#FF6B00", paddingVertical: verticalScale(14), borderRadius: moderateScale(12) },
  btnRespondText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", letterSpacing: 1 },
  
  emptyStateCard: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), padding: scale(24), alignItems: "center", borderWidth: 1, borderColor: "#1A1A1A", borderStyle: "dashed" },
  emptyIconBox: { width: scale(64), height: scale(64), borderRadius: scale(32), backgroundColor: "rgba(0, 230, 118, 0.05)", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(16) },
  emptyStateTitle: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900", marginBottom: verticalScale(8) },
  emptyStateDesc: { color: "#888", fontSize: moderateScale(13), textAlign: "center", lineHeight: moderateScale(20) },
  
  historyList: { gap: verticalScale(12) },
  historyCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0C0C0C", padding: scale(14), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#1A1A1A" },
  historyIconBox: { width: scale(40), height: scale(40), borderRadius: moderateScale(10), backgroundColor: "#151515", justifyContent: "center", alignItems: "center", marginRight: scale(12) },
  
  historyInfo: { flex: 1, paddingRight: scale(10) },
  historyName: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "bold", marginBottom: verticalScale(4) },
  historyDate: { color: "#666", fontSize: moderateScale(11) },
  
  historyStatusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 230, 118, 0.1)", paddingHorizontal: scale(10), paddingVertical: verticalScale(6), borderRadius: moderateScale(6), gap: scale(4), borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  historyStatusText: { color: "#00E676", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase" },
});