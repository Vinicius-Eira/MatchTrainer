import { StyleSheet, Platform } from "react-native";
import { theme } from "../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";

const ORANGE_NEON = "#FF6B00";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0D0D0D" },
  scrollContent: { paddingBottom: verticalScale(180) },

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40), left: scale(20), zIndex: 100 },
  btnVoltar: { backgroundColor: "rgba(20,20,20,0.8)", width: scale(44), height: scale(44), borderRadius: moderateScale(22), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },

  escassezBanner: { flexDirection: "row", backgroundColor: "#FF3B30", paddingVertical: verticalScale(12), paddingHorizontal: scale(20), justifyContent: "center", alignItems: "center", paddingTop: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40), zIndex: 90 },
  escassezText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "600", flexShrink: 1 },

  heroSection: { alignItems: "center", paddingTop: verticalScale(40), paddingBottom: verticalScale(15), position: "relative" },
  heroCoverGradient: { position: "absolute", top: 0, width: "100%", height: verticalScale(280), opacity: 0.8 },

  avatarWrapper: { position: "relative", marginBottom: verticalScale(20), zIndex: 2 },
  avatarBorderGlow: { padding: scale(4), borderRadius: moderateScale(100), backgroundColor: "#000", shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  avatarImage: { width: scale(160), height: scale(160), borderRadius: moderateScale(80), borderWidth: 1.5, borderColor: "rgba(255,107,0,0.5)" },

  matchBadgeFloat: { position: "absolute", bottom: verticalScale(-12), alignSelf: "center", borderRadius: moderateScale(20), overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,107,0,0.5)" },
  matchBadgeGlass: { flexDirection: "row", alignItems: "center", gap: scale(6), paddingLeft: scale(14), paddingRight: scale(6), paddingVertical: verticalScale(6), backgroundColor: "rgba(0,0,0,0.8)" },
  matchBadgeText: { color: ORANGE_NEON, fontSize: moderateScale(11), fontWeight: "900", letterSpacing: 0.5 },
  matchBadgeIconBg: { backgroundColor: ORANGE_NEON, width: scale(22), height: scale(22), borderRadius: moderateScale(11), justifyContent: "center", alignItems: "center", marginLeft: scale(4) },
  neonGlowSoft: { textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },

  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: verticalScale(6), marginTop: verticalScale(15) },
  nomeText: { fontFamily: theme.fonts.title, fontSize: moderateScale(32), color: "#FFF", textAlign: "center", letterSpacing: -0.5 },

  locationEditorialRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(6), marginBottom: verticalScale(12) },
  locationEditorialText: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#AAA", letterSpacing: 0.5, fontWeight: "500" },

  crefPillCentered: { flexDirection: "row", alignItems: "center", alignSelf: "center", backgroundColor: "#111", paddingHorizontal: scale(16), paddingVertical: verticalScale(8), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)", marginBottom: verticalScale(20), gap: scale(6) },
  crefNeonText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "700", letterSpacing: 1 },

  absoluteFill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, },

  modalidadesRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(10), marginBottom: verticalScale(20) },
  modalityTag: { flexDirection: "row", alignItems: "center", backgroundColor: ORANGE_NEON, paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(8), gap: scale(6) },
  modalityTagText: { color: "#000", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase" },

  socialDockContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(14) },
  btnSocialDock: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#111", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#222" },

  propostaBanner: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", borderRadius: moderateScale(16), marginHorizontal: scale(20), marginTop: verticalScale(10), marginBottom: verticalScale(20), padding: scale(16), zIndex: 10 },
  propostaBannerContent: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(12) },
  propostaBannerTitle: { color: ORANGE_NEON, fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase" },
  propostaBannerText: { color: "#FFF", fontSize: moderateScale(13), marginTop: verticalScale(2), lineHeight: moderateScale(18) },
  btnVerProposta: { backgroundColor: ORANGE_NEON, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(12), borderRadius: moderateScale(12), gap: scale(8) },
  btnVerPropostaText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase" },

  statsFloatGrid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: scale(20), marginBottom: verticalScale(40), gap: scale(10) },
  statFloatCard: { flex: 1, backgroundColor: "#111", paddingVertical: verticalScale(16), paddingHorizontal: scale(4), borderRadius: moderateScale(20), alignItems: "center", borderWidth: 1, borderColor: "rgba(255,107,0,0.15)" },
  statFloatIcon: { marginBottom: verticalScale(8) },
  statFloatValue: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", fontFamily: theme.fonts.title, letterSpacing: -0.2, textAlign: "center" },
  statFloatLabel: { color: "#888", fontSize: moderateScale(10), marginTop: verticalScale(4), textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "700" },

  sectionContainer: { marginHorizontal: scale(20), marginBottom: verticalScale(35) },
  sectionHeaderTitle: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(20) },
  iconAccentBg: { width: scale(34), height: scale(34), borderRadius: moderateScale(10), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: moderateScale(20), fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  aboutCard: { backgroundColor: "#111", padding: scale(24), borderRadius: moderateScale(24), borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  quoteWatermark: { position: "absolute", top: verticalScale(-5), left: scale(10) },
  aboutTextPremium: { fontFamily: theme.fonts.body, fontSize: moderateScale(15), color: "#BBB", lineHeight: moderateScale(26), zIndex: 1, paddingTop: verticalScale(15) },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  localTag: { backgroundColor: "#1A1A1A", paddingHorizontal: scale(14), paddingVertical: verticalScale(8), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#333" },
  localTagText: { color: "#DDD", fontSize: moderateScale(13), fontWeight: "600" },

  specialtiesColumn: { gap: verticalScale(12) },
  specialtyDetailCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", padding: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222" },
  specialtyIconBg: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.08)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)" },
  specialtyTextWrap: { flex: 1 },
  specialtyTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(4), letterSpacing: 0.3 },
  specialtyDesc: { color: "#888", fontSize: moderateScale(13), lineHeight: moderateScale(18) },

  diferenciaisRow: { flexDirection: "row", justifyContent: "space-between" },
  achievementCard: { backgroundColor: "#111", padding: scale(20), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  achievementHeader: { flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: verticalScale(10) },
  achievementTitle: { color: ORANGE_NEON, fontSize: moderateScale(14), fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  achievementText: { color: "#AAA", fontSize: moderateScale(14), lineHeight: moderateScale(22) },

  galleryContainer: { marginBottom: verticalScale(35) },
  galleryScroll: { gap: scale(16), paddingHorizontal: scale(20) },
  galleryItemContainer: { width: scale(300), height: verticalScale(320), backgroundColor: "#111", borderRadius: moderateScale(24), overflow: "hidden", borderWidth: 1, borderColor: "#222" },
  galleryImageFull: { width: "100%", height: "100%" },
  galleryOverlay: { position: "absolute", bottom: 0, width: "100%", height: verticalScale(100), justifyContent: "flex-end", padding: scale(15), alignItems: "flex-end" },
  galleryIconExpand: { backgroundColor: "rgba(0,0,0,0.5)", padding: scale(8), borderRadius: moderateScale(20), overflow: "hidden" },

  luxuryEmptyState: { backgroundColor: "#111", borderRadius: moderateScale(24), padding: scale(35), alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#222", borderStyle: "dashed" },
  luxuryEmptyTitle: { color: "#FFF", fontFamily: theme.fonts.title, fontSize: moderateScale(18), marginBottom: verticalScale(8) },
  luxuryEmptyText: { color: "#666", fontSize: moderateScale(14), textAlign: "center", lineHeight: moderateScale(22) },

  reviewCard: { backgroundColor: "#111", padding: scale(20), borderRadius: moderateScale(20), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#222" },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(14) },
  reviewAvatar: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "#333" },
  reviewAvatarLetter: { color: "#888", fontSize: moderateScale(18), fontWeight: "bold", fontFamily: theme.fonts.title },
  reviewName: { color: "#FFF", fontWeight: "bold", fontSize: moderateScale(15), marginBottom: verticalScale(4) },
  reviewStars: { flexDirection: "row" },
  reviewText: { color: "#BBB", fontSize: moderateScale(15), fontStyle: "italic", lineHeight: moderateScale(24) },

  conversionFooter: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: scale(20), paddingTop: verticalScale(15), paddingBottom: Platform.OS === "ios" ? verticalScale(35) : verticalScale(20), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  twinButtonsRow: { flexDirection: "row", gap: scale(12) },
  btnWhatsApp: { backgroundColor: "#25D366", width: scale(60), height: scale(60), borderRadius: moderateScale(18), justifyContent: "center", alignItems: "center", shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  
  btnActionSolidFull: { flex: 1, backgroundColor: "rgba(255, 107, 0, 0.1)", height: verticalScale(60), borderRadius: moderateScale(18), flexDirection: "row", justifyContent: "center", alignItems: "center", gap: scale(8), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)" },
  btnActionSolidText: { color: ORANGE_NEON, fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  footerHint: { color: "#888", fontSize: moderateScale(12), textAlign: "center", fontWeight: "600", marginBottom: verticalScale(12), letterSpacing: 0.5 },

  modalMatchOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", padding: 20 },
  matchReportCard: { width: "100%", backgroundColor: "#111", borderRadius: moderateScale(28), padding: scale(24), paddingBottom: Platform.OS === "ios" ? verticalScale(30) : verticalScale(24), borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  
  matchReportHeader: { alignItems: "center", marginBottom: verticalScale(20) },
  matchReportTitle: { color: "#FFF", fontSize: moderateScale(20), fontWeight: "bold", textAlign: "center" },
  matchReportSubtitle: { color: "#888", fontSize: moderateScale(13), textAlign: "center", marginTop: verticalScale(6) },

  scoreRingContainer: { alignItems: "center", marginBottom: verticalScale(25) },
  scoreRing: { width: scale(120), height: scale(120), borderRadius: moderateScale(60), borderWidth: 2, borderColor: ORANGE_NEON, justifyContent: "center", alignItems: "center", shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, backgroundColor: "rgba(255,107,0,0.05)" },
  scoreText: { color: ORANGE_NEON, fontSize: moderateScale(38), fontWeight: "900", textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  scoreLabel: { color: "#FFF", fontSize: moderateScale(10), fontWeight: "bold", marginTop: verticalScale(-2), letterSpacing: 1 },

  matchReasonsScroll: { maxHeight: verticalScale(220), marginBottom: verticalScale(20) },
  reasonCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A1A1A", padding: scale(12), borderRadius: moderateScale(14), marginBottom: verticalScale(10), borderWidth: 1, borderColor: "#2A2A2A" },
  reasonIconBox: { width: scale(36), height: scale(36), borderRadius: moderateScale(10), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12) },
  reasonTextWrap: { flex: 1 },
  reasonText: { color: "#DDD", fontSize: moderateScale(13), lineHeight: moderateScale(18) },

  matchReportFooter: { flexDirection: "row", alignItems: "center", gap: scale(12) },
  btnReportCloseOutlined: { flex: 1, height: verticalScale(48), borderRadius: moderateScale(14), borderWidth: 1, borderColor: ORANGE_NEON, justifyContent: "center", alignItems: "center" },
  btnReportCloseTextNeon: { color: ORANGE_NEON, fontSize: moderateScale(14), fontWeight: "bold" },
  btnReportAction: { flex: 1, height: verticalScale(48), borderRadius: moderateScale(14), backgroundColor: ORANGE_NEON, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  btnReportActionText: { color: "#000", fontSize: moderateScale(14), fontWeight: "bold" },
});