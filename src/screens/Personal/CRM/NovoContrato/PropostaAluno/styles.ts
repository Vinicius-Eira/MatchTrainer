import { StyleSheet, Platform } from "react-native";
import { theme } from "../../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../../utils/responsive";

export const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000" },
  
  glowTopLeft: { position: "absolute", top: verticalScale(-100), left: scale(-100), width: scale(300), height: scale(300), borderRadius: moderateScale(150), backgroundColor: "#00E676", opacity: 0.1 },
  glowCenter: { position: "absolute", top: verticalScale(200), alignSelf: 'center', width: scale(350), height: scale(350), borderRadius: moderateScale(175), backgroundColor: theme.colors.primary, opacity: 0.08 },
  glowBottomRight: { position: "absolute", bottom: verticalScale(-50), right: scale(-80), width: scale(250), height: scale(250), borderRadius: moderateScale(125), backgroundColor: "#00E676", opacity: 0.08 },
  
  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnVoltar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: moderateScale(14), color: "#FFF", letterSpacing: 1.5, textTransform: "uppercase" },
  
  scrollContent: { paddingTop: verticalScale(130), paddingHorizontal: scale(20), paddingBottom: verticalScale(180) },
  
  heroSection: { alignItems: 'center', marginBottom: verticalScale(25) },
  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(34), color: "#FFF", letterSpacing: -0.5, marginBottom: verticalScale(8), textAlign: "center" },
  highlight: { color: "#00E676" },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#AAA", textAlign: "center", lineHeight: moderateScale(22), paddingHorizontal: scale(10) },
  subtitleBold: { color: "#FFF", fontWeight: "bold" },

  ticketCard: { borderRadius: moderateScale(24), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(20), shadowColor: "#00E676", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, position: 'relative', overflow: 'hidden' },
  
  ticketHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(20), borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  trainerInfoRow: { flexDirection: 'row', alignItems: 'center' },
  trainerAvatar: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), marginRight: scale(12), borderWidth: 1, borderColor: "#333" },
  trainerAvatarPlaceholder: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#222", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "#333" },
  trainerName: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold", letterSpacing: 0.2 },
  trainerRole: { color: "#888", fontSize: moderateScale(12), fontWeight: "600" },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#00E676", paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(8) },
  verifiedText: { color: "#000", fontSize: moderateScale(10), fontWeight: "900", textTransform: 'uppercase', marginLeft: scale(4) },

  ticketBody: { padding: scale(24), alignItems: 'center' },
  labelAmount: { color: "#888", fontSize: moderateScale(11), fontWeight: "900", letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: verticalScale(10) },
  amountContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: verticalScale(10) },
  currencySymbol: { color: "#00E676", fontSize: moderateScale(20), fontWeight: '900', marginTop: verticalScale(6), marginRight: scale(6) },
  amountInteger: { color: "#FFF", fontSize: moderateScale(56), fontFamily: theme.fonts.title, letterSpacing: -2, lineHeight: moderateScale(60) },
  amountDecimal: { color: "#FFF", fontSize: moderateScale(24), fontFamily: theme.fonts.title, letterSpacing: -1, marginTop: verticalScale(4) },
  servicesHighlight: { backgroundColor: "rgba(0, 230, 118, 0.1)", color: "#00E676", paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(10), fontSize: moderateScale(12), fontWeight: "bold", overflow: 'hidden', borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },

  ticketDividerContainer: { height: verticalScale(40), justifyContent: 'center', position: 'relative' },
  ticketDashedLine: { borderBottomWidth: 2, borderBottomColor: "#333", borderStyle: "dashed", marginHorizontal: scale(24) },
  ticketCutoutLeft: { position: 'absolute', left: scale(-20), width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "#000", borderWidth: 1, borderColor: "#222" },
  ticketCutoutRight: { position: 'absolute', right: scale(-20), width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "#000", borderWidth: 1, borderColor: "#222" },

  ticketFooter: { padding: scale(20) },
  footerDataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "rgba(255,255,255,0.03)", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  footerDataItem: { flex: 1, alignItems: 'center' },
  footerDataDivider: { width: 1, height: '100%', backgroundColor: "#333" },
  footerDataLabel: { color: "#666", fontSize: moderateScale(9), fontWeight: "900", letterSpacing: 0.5, marginBottom: verticalScale(2) },
  footerDataValue: { color: "#FFF", fontSize: moderateScale(13), fontWeight: "bold" },
  
  signatureBox: { alignItems: 'center', marginTop: verticalScale(20), opacity: 0.7 },
  signatureText: { color: "#666", fontSize: moderateScale(11), fontStyle: 'italic', marginTop: verticalScale(4) },

  termsCard: { borderRadius: moderateScale(20), padding: scale(20), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(20), overflow: 'hidden' },
  termsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  termsHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  termsIconBox: { width: scale(36), height: scale(36), borderRadius: moderateScale(12), backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12) },
  termsTitle: { color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.title, letterSpacing: 0.3 },
  termsActionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(0, 230, 118, 0.1)", paddingHorizontal: scale(10), paddingVertical: verticalScale(6), borderRadius: moderateScale(10) },
  termsActionText: { color: "#00E676", fontSize: moderateScale(11), fontWeight: "bold", marginRight: scale(4) },
  
  regrasContainer: { marginTop: verticalScale(20) },
  regrasDivisor: { height: 1, backgroundColor: '#333', marginBottom: verticalScale(15) },
  regraText: { color: '#CCC', fontSize: moderateScale(14), lineHeight: moderateScale(22), fontFamily: theme.fonts.body, marginBottom: verticalScale(8) },
  regraTextBold: { color: '#FFF', fontWeight: 'bold' },

  footerBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: scale(24), paddingTop: verticalScale(15), paddingBottom: Platform.OS === 'ios' ? verticalScale(35) : verticalScale(20), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  btnPrimary: { borderRadius: moderateScale(20), shadowColor: "#00E676", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: verticalScale(12) },
  btnGradient: { flexDirection: "row", height: verticalScale(64), borderRadius: moderateScale(20), justifyContent: "center", alignItems: "center" },
  btnPrimaryText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },
  
  btnSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: verticalScale(40) },
  btnSecondaryText: { color: "#888", fontSize: moderateScale(14), fontWeight: "bold", textDecorationLine: 'underline' },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: scale(24) },
  modalSuccessCard: { width: "100%", backgroundColor: "#111", borderRadius: moderateScale(32), padding: scale(32), alignItems: "center", borderWidth: 1, borderColor: "#222", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  modalGlow: { position: "absolute", top: -50, width: scale(150), height: scale(150), borderRadius: moderateScale(75), backgroundColor: "#00E676", opacity: 0.15 },
  modalIconBox: { width: scale(80), height: scale(80), borderRadius: moderateScale(40), justifyContent: "center", alignItems: "center", marginBottom: verticalScale(24), shadowColor: "#00E676", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  modalSuccessTitle: { color: "#FFF", fontSize: moderateScale(26), fontFamily: theme.fonts.title, textAlign: "center", marginBottom: verticalScale(12), letterSpacing: -0.5 },
  modalSuccessText: { color: "#AAA", fontSize: moderateScale(15), textAlign: "center", lineHeight: moderateScale(24), marginBottom: verticalScale(32) },
  modalBtnAction: { width: "100%", borderRadius: moderateScale(20), shadowColor: "#00E676", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  modalBtnGradient: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(20), justifyContent: "center", alignItems: "center" },
  modalBtnText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }
});