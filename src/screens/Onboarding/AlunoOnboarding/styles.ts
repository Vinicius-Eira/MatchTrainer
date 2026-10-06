import { StyleSheet, Platform, Dimensions } from "react-native";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  glowTop: { position: "absolute", top: -100, alignSelf: "center", width: width, height: 250, backgroundColor: theme.colors.primary, opacity: 0.12, borderRadius: 200 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40), paddingHorizontal: scale(20), paddingBottom: verticalScale(15), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  
  progressWrapper: { flex: 1, alignItems: "center", paddingHorizontal: 15 },
  stepText: { color: "#888", fontSize: moderateScale(10), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 },
  progressContainer: { width: "100%", height: 4, backgroundColor: "#222", borderRadius: 2, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 2 },

  scrollContent: { flexGrow: 1, paddingHorizontal: scale(20), paddingBottom: verticalScale(40) },
  
  stepContainerCenter: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: -verticalScale(20) },
  stepContainerTop: { flex: 1, justifyContent: "flex-start", paddingTop: verticalScale(25) },

  avatarWrapper: { position: "relative", marginBottom: verticalScale(35), marginTop: verticalScale(20) },
  avatarGlow: { position: "absolute", top: -15, left: -15, right: -15, bottom: -15, backgroundColor: theme.colors.primary, opacity: 0.25, borderRadius: 100 },
  avatarImage: { width: scale(110), height: scale(110), borderRadius: scale(55), borderWidth: 2, borderColor: theme.colors.primary },
  avatarPlaceholder: { width: scale(110), height: scale(110), borderRadius: scale(55), backgroundColor: "#111", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: theme.colors.primary },
  badgeSuccess: { position: "absolute", bottom: 0, right: 5, backgroundColor: "#00E676", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#050505" },

  photoSection: { width: "100%", backgroundColor: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)", marginTop: 20 },
  photoBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  photoSelected: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: theme.colors.primary, marginBottom: 12 },
  photoPlaceholderUI: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  photoBtnText: { color: theme.colors.primary, fontSize: 13, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },

  sectionTitle: { color: "#FFF", fontSize: moderateScale(28), fontFamily: theme.fonts.title, marginBottom: verticalScale(6), textAlign: "center", letterSpacing: -0.5 },
  titleHighlight: { color: theme.colors.primary },
  sectionSubtitle: { color: "#AAA", fontSize: moderateScale(14), lineHeight: moderateScale(22), textAlign: "center", marginBottom: verticalScale(30), paddingHorizontal: scale(10) },
  highlight: { color: "#FFF", fontWeight: "bold" },
  
  featuresContainer: { width: '100%', backgroundColor: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", marginTop: 15 },
  featuresTitle: { color: "#FFF", fontSize: 16, fontFamily: theme.fonts.title, marginBottom: 20, textAlign: 'center' },
  featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  featureIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: 16, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  featureItemTitle: { color: "#FFF", fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  featureItemDesc: { color: "#888", fontSize: 13, lineHeight: 18 },

  label: { color: "#888", fontSize: moderateScale(11), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(8), marginLeft: scale(4), letterSpacing: 0.5 },
  inputGroup: { marginBottom: verticalScale(16) },
  rowInputs: { flexDirection: "row" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: scale(14), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIcon: { marginRight: scale(10) },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, height: "100%" },
  suffix: { color: "#666", fontWeight: "bold", fontSize: moderateScale(15), marginLeft: scale(8) },

  targetWeightBox: { flexDirection: "row", backgroundColor: "rgba(255, 107, 0, 0.08)", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", alignItems: "center", marginTop: verticalScale(10) },
  targetIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255, 107, 0, 0.2)", justifyContent: "center", alignItems: "center", marginRight: 16 },
  targetTitle: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "bold", marginBottom: 8 },
  targetInputContainer: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.colors.primary, paddingBottom: 4 },
  targetInput: { flex: 1, color: "#FFF", fontSize: moderateScale(22), fontWeight: "900" },
  targetSuffix: { color: theme.colors.primary, fontWeight: "bold", fontSize: moderateScale(16) },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginVertical: verticalScale(25) },

  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: scale(12) },
  premiumCard: { width: "48%", backgroundColor: "rgba(255,255,255,0.02)", padding: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: "hidden" },
  premiumCardActive: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  cardIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(12) },
  cardIconWrapActive: { backgroundColor: "rgba(255, 107, 0, 0.15)" },
  cardTitle: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "bold", marginBottom: verticalScale(4) },
  cardTitleActive: { color: theme.colors.primary },
  cardDesc: { color: "#777", fontSize: moderateScale(11), lineHeight: moderateScale(16) },

  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#444", justifyContent: "center", alignItems: "center" },
  radioCircleActive: { borderColor: theme.colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },

  yesNoContainer: { flexDirection: "row", gap: scale(12), marginBottom: verticalScale(20) },
  yesNoBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.03)", paddingVertical: verticalScale(20), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center" },
  yesNoBtnGreen: { backgroundColor: "rgba(0, 230, 118, 0.08)", borderColor: "#00E676" },
  yesNoBtnRed: { backgroundColor: "rgba(255, 59, 48, 0.08)", borderColor: "#FF3B30" },
  yesNoText: { color: "#888", fontSize: moderateScale(13), fontWeight: "bold" },

  detalhesArea: { marginTop: verticalScale(10) },
  textAreaBox: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#FF3B30", padding: scale(16), height: verticalScale(120) },
  textArea: { flex: 1, color: "#FFF", fontSize: moderateScale(14), textAlignVertical: "top", lineHeight: moderateScale(22) },

  tipCard: { flexDirection: "row", backgroundColor: "rgba(255, 107, 0, 0.08)", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)", marginTop: 25 },
  tipIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255, 107, 0, 0.15)", justifyContent: "center", alignItems: "center", marginRight: 16 },
  tipTitle: { color: theme.colors.primary, fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  tipDesc: { color: "#CCC", fontSize: 12, lineHeight: 18 },

  footer: { paddingHorizontal: scale(20), paddingBottom: Platform.OS === "ios" ? verticalScale(35) : verticalScale(20), paddingTop: verticalScale(15), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", backgroundColor: "#050505" },
  btnPrimary: { borderRadius: moderateScale(20), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnGradient: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(20), justifyContent: "center", alignItems: "center" },
  btnPrimaryText: { color: "#000", fontSize: moderateScale(14), fontFamily: theme.fonts.title, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});