import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  
  // HEADER
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20, paddingBottom: verticalScale(15), paddingHorizontal: scale(20), backgroundColor: "#050505" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1.5 },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(60) },
  
  // A FATURA DIGITAL
  invoiceCard: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", marginBottom: verticalScale(35), overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  
  invoiceHeader: { padding: scale(20), backgroundColor: "#111", borderBottomWidth: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: verticalScale(4) },
  statusTitle: { fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase" },
  statusSubtitle: { color: "#AAA", fontSize: moderateScale(12) },
  
  invoiceBody: { padding: scale(20), alignItems: "center" },
  valueLabel: { color: "#666", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(8), letterSpacing: 1 },
  valueText: { color: "#FFF", fontSize: moderateScale(36), fontWeight: "900", marginBottom: verticalScale(12), letterSpacing: -1 },
  dateBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#151515", paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(8), borderWidth: 1, borderColor: "#222", gap: scale(6) },
  dateText: { color: "#AAA", fontSize: moderateScale(12), fontWeight: "bold" },
  
  invoiceFooter: { paddingHorizontal: scale(20), paddingBottom: scale(20) },
  dividerDashed: { height: 1, width: "100%", borderWidth: 1, borderColor: "#222", borderStyle: "dashed", marginBottom: verticalScale(20) },
  
  instructionText: { color: "#888", fontSize: moderateScale(12), lineHeight: moderateScale(18), marginBottom: verticalScale(20), fontStyle: "italic", textAlign: "center" },
  
  btnPix: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF", paddingVertical: verticalScale(14), borderRadius: moderateScale(12), gap: scale(8) },
  btnPixText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", letterSpacing: 1 },
  pixHint: { color: "#666", fontSize: moderateScale(11), textAlign: "center", marginTop: verticalScale(12), fontWeight: "bold" },
  
  // HISTÓRICO
  section: { flex: 1 },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900", marginBottom: verticalScale(16) },
  
  historyList: { gap: verticalScale(12) },
  historyCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0C0C0C", padding: scale(16), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#151515" },
  historyIconBox: { width: scale(36), height: scale(36), borderRadius: moderateScale(18), backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  
  historyInfo: { flex: 1 },
  historyMonth: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(2) },
  historyDate: { color: "#666", fontSize: moderateScale(11) },
  
  historyRight: { alignItems: "flex-end" },
  historyValue: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900" },
});