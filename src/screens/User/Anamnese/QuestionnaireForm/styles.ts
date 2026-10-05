import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  container: { flex: 1 },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20, paddingBottom: verticalScale(15), paddingHorizontal: scale(20), backgroundColor: "#0A0A0A", borderBottomWidth: 1, borderBottomColor: "#151515" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(60) },
  
  introBox: { marginBottom: verticalScale(25), paddingBottom: verticalScale(15), borderBottomWidth: 1, borderBottomColor: "#1A1A1A" },
  introText: { color: "#888", fontSize: moderateScale(13), lineHeight: moderateScale(20) },
  
  formContainer: { gap: verticalScale(35), marginBottom: verticalScale(40) },
  
  questionBlock: { width: "100%" },
  questionText: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold", lineHeight: moderateScale(24), marginBottom: verticalScale(16) },
  questionNumber: { color: "#FF6B00", fontWeight: "900" },
  requiredAsterisk: { color: "#FF3B30" },
  
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222", paddingHorizontal: scale(16), height: verticalScale(50) },
  inputNumber: { flex: 1, color: "#FFF", fontSize: moderateScale(18), fontWeight: "bold" },
  inputSuffix: { color: "#666", fontSize: moderateScale(14), fontWeight: "bold", marginLeft: scale(10) },
  
  scaleContainer: { width: "100%" },
  scaleRow: { flexDirection: "row", justifyContent: "space-between", gap: scale(8), marginBottom: verticalScale(8) },
  scaleBtn: { flex: 1, height: verticalScale(50), backgroundColor: "#0A0A0A", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222", justifyContent: "center", alignItems: "center" },
  scaleBtnSelected: { backgroundColor: "rgba(255, 107, 0, 0.15)", borderColor: "#FF6B00" },
  scaleText: { color: "#888", fontSize: moderateScale(16), fontWeight: "bold" },
  scaleTextSelected: { color: "#FF6B00", fontWeight: "900" },
  scaleLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: scale(4) },
  scaleLabelText: { color: "#666", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase" },
  
  yesNoRow: { flexDirection: "row", gap: scale(12) },
  yesNoBtn: { flex: 1, height: verticalScale(50), backgroundColor: "#0A0A0A", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222", justifyContent: "center", alignItems: "center" },
  yesNoBtnSelected: { backgroundColor: "rgba(255, 107, 0, 0.15)", borderColor: "#FF6B00" },
  yesNoText: { color: "#888", fontSize: moderateScale(14), fontWeight: "bold" },
  yesNoTextSelected: { color: "#FF6B00", fontWeight: "900" },
  
  inputText: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#222", color: "#FFF", fontSize: moderateScale(14), padding: scale(16), minHeight: verticalScale(100), textAlignVertical: "top" },
  
  btnSubmit: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#FF6B00", paddingVertical: verticalScale(16), borderRadius: moderateScale(16), gap: scale(10), shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  btnSubmitText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1 },
});