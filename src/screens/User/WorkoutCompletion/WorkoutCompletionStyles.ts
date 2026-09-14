import { StyleSheet, Platform } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(120) },
  
  successHeader: { alignItems: "center", marginTop: verticalScale(20), marginBottom: verticalScale(30) },
  iconCircle: { width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(15), borderWidth: 2, borderColor: "rgba(0, 230, 118, 0.3)" },
  title: { color: "#00E676", fontSize: moderateScale(22), fontWeight: "900", letterSpacing: 2 },
  subtitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold", marginTop: verticalScale(4) },
  
  statsContainer: { flexDirection: "row", backgroundColor: "#0C0C0C", borderRadius: moderateScale(20), paddingVertical: verticalScale(20), borderWidth: 1, borderColor: "#1A1A1A", marginBottom: verticalScale(40) },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900", marginTop: verticalScale(8) },
  statLabel: { color: "#888", fontSize: moderateScale(11), textTransform: "uppercase", fontWeight: "bold", marginTop: verticalScale(4) },
  statDivider: { width: 1, height: "70%", backgroundColor: "#222", alignSelf: "center" },
  
  sectionTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900", marginBottom: verticalScale(15) },
  
  esforcoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: verticalScale(20) },
  esforcoBtn: { width: "48%", backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), padding: scale(15), alignItems: "center", marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#1A1A1A" },
  esforcoLabel: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "bold", marginTop: verticalScale(8) },
  esforcoSub: { color: "#666", fontSize: moderateScale(10), marginTop: verticalScale(2) },
  
  inputContainer: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", minHeight: verticalScale(100), padding: scale(15) },
  textInput: { color: "#FFF", fontSize: moderateScale(14), textAlignVertical: "top", flex: 1 },
  
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: scale(20), paddingBottom: Platform.OS === 'ios' ? verticalScale(35) : verticalScale(20), paddingTop: verticalScale(30) },
  footerGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  btnSalvar: { backgroundColor: "#00E676", borderRadius: moderateScale(18), paddingVertical: verticalScale(18), flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  btnSalvarDisabled: { backgroundColor: "#333", shadowOpacity: 0 },
  btnSalvarText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1 },
});