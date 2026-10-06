import { Platform, StyleSheet } from "react-native";
import { theme } from "../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";

export const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#020202", position: "relative" },

  glowTopLeft: { position: "absolute", top: verticalScale(-100), left: scale(-50), width: scale(250), height: scale(250), borderRadius: scale(125), backgroundColor: theme.colors.primary, opacity: 0.15},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-50), right: scale(-100), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.1},

  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.8)" : "transparent" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: moderateScale(15), color: "#FFF", letterSpacing: 1, textTransform: "uppercase" },

  scrollContent: { flexGrow: 1 },
  innerContent: { flex: 1, paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(120) : verticalScale(110), paddingBottom: verticalScale(40) },

  headerTextContainer: { alignItems: "center", marginBottom: verticalScale(35) },
  iconWrapper: { position: "relative", marginBottom: verticalScale(20), justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: theme.colors.primary, opacity: 0.3},
  iconCircle: { width: scale(84), height: scale(84), borderRadius: scale(42), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)", backgroundColor: "#0A0A0A" },

  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(34), color: "#FFF", letterSpacing: -0.5, lineHeight: moderateScale(40), textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#888", marginTop: verticalScale(10), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },

  form: { width: "100%", marginBottom: verticalScale(30) },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", paddingLeft: scale(12), marginBottom: verticalScale(16), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  inputIconWrapper: { width: scale(38), height: scale(38), borderRadius: moderateScale(10), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },
  eyeIcon: { paddingHorizontal: scale(16), height: "100%", justifyContent: "center" },

  btnOutline: { flexDirection: "row", marginTop: verticalScale(10), height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(16), fontWeight: "bold", letterSpacing: 0.5, textTransform: "uppercase" },

  infoWrapperContainer: { marginTop: "auto" },
  infoSectionTitle: { color: "#888", fontFamily: theme.fonts.title, fontSize: moderateScale(14), marginBottom: verticalScale(16), textAlign: "center", letterSpacing: 1, textTransform: "uppercase" },
  infoItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(18), paddingHorizontal: scale(16), paddingVertical: verticalScale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#1A1A1A" },
  infoIconBox: { width: scale(40), height: scale(40), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  infoText: { flex: 1, color: "#777", fontSize: moderateScale(13), lineHeight: moderateScale(18) },
  infoTextBold: { color: "#DDD", fontWeight: "bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: scale(20) },
  modalContent: { width: "100%", backgroundColor: "#0A0A0A", borderRadius: moderateScale(28), padding: scale(28), borderWidth: 1, borderColor: "#1A1A1A", alignItems: "center", position: "relative", overflow: 'hidden' },
  modalGlow: { position: "absolute", top: -50, width: 200, height: 200, backgroundColor: theme.colors.primary, opacity: 0.1, borderRadius: 100},
  modalIconContainer: { marginBottom: verticalScale(20), marginTop: verticalScale(10) },
  modalIconRing: { width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  modalTitle: { color: "#FFF", fontSize: moderateScale(24), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), textAlign: "center" },
  modalSubtitle: { color: "#888", fontSize: moderateScale(14), textAlign: "center", marginBottom: verticalScale(20), paddingHorizontal: scale(10) },
  modalHighlightBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 107, 0, 0.05)', padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', marginBottom: verticalScale(25), width: '100%' },
  modalHighlightText: { flex: 1, color: "#AAA", fontSize: moderateScale(13), lineHeight: moderateScale(18) },
  
  modalBtnActionOutline: { flexDirection: "row", width: "100%", height: verticalScale(56), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  modalBtnTextOutline: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});