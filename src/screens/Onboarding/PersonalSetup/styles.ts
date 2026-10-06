import { StyleSheet, Platform } from "react-native";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020202", position: "relative" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020202" },
  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.12},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-80), right: scale(-80), width: scale(350), height: scale(350), borderRadius: scale(175), backgroundColor: theme.colors.primary, opacity: 0.08},
  
  headerAbsolute: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.8)" : "transparent" },
  stepperHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: scale(24), paddingBottom: verticalScale(15) },
  stepCounterText: { color: theme.colors.primary, fontSize: moderateScale(13), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  stepTitleText: { color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  stepperBarBackground: { width: "100%", height: verticalScale(2), backgroundColor: "#222" },
  stepperBarFill: { height: "100%", backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },

  content: { paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(110) : verticalScale(100), paddingBottom: verticalScale(140) },
  stepContainer: { width: "100%" },
  headerTextContainer: { marginBottom: verticalScale(35), alignItems: "center" },
  mainTitle: { color: "#FFF", fontSize: moderateScale(34), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), letterSpacing: -0.5, textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subTitle: { color: "#888", fontSize: moderateScale(14), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold", marginBottom: verticalScale(8), textTransform: "uppercase", letterSpacing: 0.5 },
  helpText: { color: "#666", fontSize: moderateScale(13), marginBottom: verticalScale(15) },
  
  photoSection: { alignItems: "center", marginBottom: verticalScale(35) },
  avatarContainer: { position: "relative" },
  avatarPlaceholder: { width: scale(110), height: scale(110), borderRadius: moderateScale(55), backgroundColor: "#151515", borderWidth: 1, borderColor: "#2A2A2A", justifyContent: "center", alignItems: "center" },
  avatarImage: { width: scale(110), height: scale(110), borderRadius: moderateScale(55), borderWidth: 2, borderColor: theme.colors.primary },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: scale(34), height: scale(34), borderRadius: moderateScale(17), justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#020202" },
  
  formGroup: { marginBottom: verticalScale(20) },
  inputLabel: { color: "#888", fontSize: moderateScale(12), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(8), marginLeft: scale(5) },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#2A2A2A", paddingHorizontal: scale(14), height: verticalScale(60) },
  inputBoxArea: { backgroundColor: "#121212", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#2A2A2A", paddingHorizontal: scale(16) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputPremium: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, height: "100%" },
  textAreaPremium: { minHeight: verticalScale(120), paddingTop: verticalScale(16), paddingBottom: verticalScale(16), color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body },
  inputSubChip: { backgroundColor: "#151515", borderRadius: moderateScale(14), color: "#FFF", fontSize: moderateScale(14), padding: scale(14), borderWidth: 1, borderColor: "#2A2A2A", width: "100%", marginTop: verticalScale(10), marginBottom: verticalScale(10) },
  
  btnGpsRadar: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.05)" },
  btnGpsRadarText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", marginLeft: scale(8), textTransform: "uppercase" },
  locationResultText: { color: "#00E676", fontSize: moderateScale(13), fontWeight: "bold", marginTop: verticalScale(10), marginLeft: scale(5) },
  
  chipsContainerCenter: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  chip: { backgroundColor: "#151515", paddingVertical: verticalScale(10), paddingHorizontal: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#2A2A2A" },
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.08)", borderColor: theme.colors.primary },
  chipTexto: { color: "#CCC", fontSize: moderateScale(13), fontWeight: "700" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },
  subBox: { backgroundColor: "#121212", width: "100%", padding: scale(15), borderRadius: moderateScale(16), marginTop: verticalScale(10), borderWidth: 1, borderColor: "#2A2A2A" },
  subBoxTitle: { color: "#AAA", fontSize: moderateScale(12), fontWeight: "bold", marginBottom: verticalScale(10), textTransform: "uppercase" },
  
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: verticalScale(10) },
  gridItemWithIcon: { width: "48%", backgroundColor: "#151515", paddingVertical: verticalScale(18), paddingHorizontal: scale(10), borderRadius: moderateScale(18), alignItems: "center", borderWidth: 1, borderColor: "#2A2A2A", overflow: "hidden" },
  gridItemAtivo: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.08)" },
  gridItemText: { color: "#E0E0E0", fontSize: moderateScale(13), fontWeight: "bold", textAlign: "center" },
  gridItemTextAtivo: { color: "#FFF", fontWeight: "900" },
  gridItemDesc: { color: "#888", fontSize: moderateScale(11), textAlign: "center", marginTop: verticalScale(4) },
  
  subSection: { marginTop: verticalScale(20), paddingTop: verticalScale(15), borderTopWidth: 1, borderTopColor: "#2A2A2A" },

  priceContainer: { backgroundColor: "#121212", borderRadius: moderateScale(18), padding: scale(20), borderWidth: 1, borderColor: "#2A2A2A", marginTop: verticalScale(15), alignItems: "center" },
  slider: { width: "100%", height: verticalScale(40) },
  priceEditableContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: verticalScale(10) },
  pricePrefix: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(28), letterSpacing: -1 },
  priceInput: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(28), letterSpacing: -1, minWidth: scale(60), textAlign: "left" },
  
  galeriaScroll: { paddingVertical: verticalScale(10) },
  galeriaItem: { width: scale(100), height: scale(100), borderRadius: moderateScale(16), overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "#2A2A2A", marginRight: scale(12) },
  galeriaImage: { width: "100%", height: "100%", resizeMode: "cover" },
  btnRemoverFoto: { position: "absolute", top: scale(6), right: scale(6), backgroundColor: "rgba(0,0,0,0.7)", borderRadius: moderateScale(12), padding: scale(4) },
  btnAddFoto: { width: scale(100), height: scale(100), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,107,0,0.05)" },
  btnAddFotoText: { color: theme.colors.primary, fontSize: moderateScale(12), marginTop: verticalScale(8), fontWeight: "bold" },
  
  footerBlur: { position: "absolute", bottom: 0, left: 0, right: 0, padding: scale(24), paddingTop: verticalScale(20), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  stepperControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  btnVoltarStep: { flexDirection: "row", alignItems: "center", paddingVertical: verticalScale(10), paddingHorizontal: scale(10) },
  btnVoltarStepText: { color: "#888", fontSize: moderateScale(15), fontWeight: "bold", marginLeft: scale(6) },
  btnAvancarStep: { flexDirection: "row", height: verticalScale(50), paddingHorizontal: scale(24), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", overflow: 'hidden' },
  btnAvancarStepText: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});