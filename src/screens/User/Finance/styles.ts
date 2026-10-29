import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20, paddingBottom: verticalScale(15), paddingHorizontal: scale(20), backgroundColor: "#050505" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1.5 },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(60) },
  
  invoiceCard: { backgroundColor: "#0C0C0E", borderRadius: moderateScale(20), borderWidth: 1, marginBottom: verticalScale(35), overflow: "hidden" },
  
  invoiceHeader: { padding: scale(20), borderBottomWidth: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: verticalScale(6) },
  statusTitle: { fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase" },
  statusSubtitle: { color: "#AAA", fontSize: moderateScale(12) },
  
  invoiceBody: { padding: scale(24), alignItems: "center" },
  valueLabel: { color: "#888", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(10), letterSpacing: 1 },
  valueRow: { flexDirection: "row", alignItems: "baseline", marginBottom: verticalScale(16) },
  valueText: { color: "#FFF", fontSize: moderateScale(40), fontWeight: "900", letterSpacing: -1 },
  
  dateBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#151515", paddingHorizontal: scale(16), paddingVertical: verticalScale(8), borderRadius: moderateScale(10), borderWidth: 1, borderColor: "#222", gap: scale(8) },
  dateText: { color: "#AAA", fontSize: moderateScale(13) },
  
  invoiceFooter: { paddingHorizontal: scale(20), paddingBottom: scale(24) },
  dividerDashed: { height: 1, width: "100%", borderWidth: 1, borderColor: "#222", borderStyle: "dashed", marginBottom: verticalScale(20) },
  
  pixLabel: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "bold", textAlign: "center", marginBottom: verticalScale(6) },
  pixHint: { color: "#888", fontSize: moderateScale(13), lineHeight: moderateScale(18), textAlign: "center", marginBottom: verticalScale(20) },
  
  btnPix: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(14), borderRadius: moderateScale(12), gap: scale(8) },
  btnPixText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", letterSpacing: 1 },
  
  section: { flex: 1 },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900", marginBottom: 0 },
  
  historyList: { gap: verticalScale(12) },
  historyCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0C0C0C", padding: scale(16), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#151515" },
  historyIconBox: { width: scale(36), height: scale(36), borderRadius: moderateScale(18), backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  historyInfo: { flex: 1 },
  historyMonth: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(2) },
  historyDate: { color: "#666", fontSize: moderateScale(11) },
  historyRight: { alignItems: "flex-end" },
  historyValue: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900" },
  
  historyEmpty: { backgroundColor: "#0C0C0C", padding: scale(30), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", alignItems: "center", borderStyle: "dashed" },
  historyEmptyText: { color: "#666", fontSize: moderateScale(13), textAlign: "center", lineHeight: moderateScale(20) }
});