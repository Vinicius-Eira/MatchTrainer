import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  container: { flex: 1 },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20, paddingBottom: verticalScale(15), paddingHorizontal: scale(20), backgroundColor: "#050505" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "#151515", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#2A2A32" },
  headerTitle: { color: "#666", fontSize: moderateScale(12), fontWeight: "900", letterSpacing: 1.5 },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(60) },
  
  titleWrapper: { marginBottom: verticalScale(20) },
  mainTitle: { color: "#FFF", fontSize: moderateScale(26), fontWeight: "900", letterSpacing: -0.5 },

  introBox: { backgroundColor: "#111", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(30) },
  introRow: { flexDirection: "row", alignItems: "center", paddingRight: scale(15) },
  introText: { color: "#AAA", fontSize: moderateScale(13), lineHeight: moderateScale(20) },
  
  formContainer: { gap: verticalScale(20), marginBottom: verticalScale(40) },
  
  questionCard: { backgroundColor: "#0C0C0E", borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#1A1A20", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  questionCardLeitura: { borderColor: "rgba(0, 230, 118, 0.15)" },
  cardGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  
  questionHeader: { flexDirection: "row", padding: scale(20), paddingBottom: scale(15), borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.03)" },
  questionNumberBox: { width: scale(30), height: scale(30), borderRadius: moderateScale(15), justifyContent: "center", alignItems: "center", marginRight: scale(15) },
  questionNumberText: { fontSize: moderateScale(14), fontWeight: "900" },
  questionText: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", lineHeight: moderateScale(24), marginTop: Platform.OS === 'ios' ? 4 : 2 },
  requiredAsterisk: { color: "#FF3B30", fontWeight: "900" },
  
  answerArea: { padding: scale(20), paddingTop: scale(15) },

  yesNoRow: { flexDirection: "row", gap: scale(12) },
  yesNoBtn: { flex: 1, height: verticalScale(50), backgroundColor: "#111", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222", justifyContent: "center", alignItems: "center" },
  yesNoText: { color: "#666", fontSize: moderateScale(14), fontWeight: "bold" },
  
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: scale(10) },
  optionChip: { backgroundColor: "#111", borderColor: "#222", borderWidth: 1, paddingVertical: verticalScale(12), paddingHorizontal: scale(16), borderRadius: moderateScale(12) },
  optionChipText: { color: "#888", fontSize: moderateScale(14), fontWeight: "600" },
  
  inputText: { backgroundColor: "#111", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222", color: "#FFF", fontSize: moderateScale(15), padding: scale(16), minHeight: verticalScale(120), textAlignVertical: "top", lineHeight: moderateScale(22) },
  
  btnSubmit: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: verticalScale(18), borderRadius: moderateScale(16), gap: scale(10), shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10, overflow: 'hidden' },
  btnGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  btnSubmitText: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1 },
});