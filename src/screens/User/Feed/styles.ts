import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ORANGE_NEON = "#FF5100";
const DARK_BG = "#050505";
const CARD_BG = "#0A0A0C";
const BORDER_COLOR = "#1A1A20";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: DARK_BG },
  
  headerFeed: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 50, paddingBottom: 15, backgroundColor: DARK_BG, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, zIndex: 10 },
  logoRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#FFF", letterSpacing: 2 },
  btnLogout: { position: "absolute", right: 20, top: 48, padding: 4 },

  scrollContent: { padding: 16, paddingBottom: 40 },

  radarContainer: { backgroundColor: CARD_BG, padding: 16, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: BORDER_COLOR, borderStyle: 'dashed' },
  radarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  radarTitle: { fontSize: 14, fontWeight: "800", color: "#A0A0A5", marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  radarBadge: { backgroundColor: "rgba(255, 81, 0, 0.1)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 81, 0, 0.3)" },
  radarBadgeText: { color: ORANGE_NEON, fontSize: 12, fontWeight: "900" },

  cardWrapper: { alignItems: "center" },
  
  premiumCard: { width: "100%", backgroundColor: CARD_BG, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: BORDER_COLOR },
  
  imageContainer: { width: "100%", height: 380, position: "relative" },
  image: { width: "100%", height: "100%", backgroundColor: "#121214" },
  imageOverlay: { position: "absolute", bottom: 0, width: "100%", height: "70%" },
  
  badgeMatch: { position: "absolute", top: 16, right: 16, backgroundColor: "rgba(10, 10, 12, 0.85)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: ORANGE_NEON, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  badgeMatchText: { color: ORANGE_NEON, fontSize: 12, fontWeight: "900", marginLeft: 6, letterSpacing: 0.5 },
  neonGlow: { shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },

  badgeService: { position: "absolute", top: 16, left: 16, backgroundColor: "rgba(10, 10, 12, 0.7)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  badgeServiceText: { color: "#FFF", fontSize: 10, fontWeight: "900", marginLeft: 6, textTransform: "uppercase", letterSpacing: 0.5 },

  badgeConsultoriaNeon: { backgroundColor: "rgba(10, 10, 12, 0.85)", borderColor: ORANGE_NEON, borderWidth: 1.5, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  badgeConsultoriaTextNeon: { color: ORANGE_NEON },

  imageBottomText: { position: "absolute", bottom: 16, left: 16, right: 16 },
  cardName: { color: "#FFF", fontSize: 28, fontWeight: "900", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, letterSpacing: 0.5 },
  
  locationRow: { marginTop: 8 },
  digitalLocation: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(10, 10, 12, 0.6)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cardLocation: { color: "#E4E4E7", fontSize: 13, fontWeight: "700", marginLeft: 6 },
  cardLocationDigital: { color: ORANGE_NEON, fontSize: 13, fontWeight: "900", marginLeft: 6 },

  cardBody: { padding: 20 },
  cardBio: { color: "#A0A0A5", fontSize: 14, fontWeight: "500", marginBottom: 16, lineHeight: 22 },
  
  specialtiesContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  tagPrimary: { backgroundColor: "rgba(255, 81, 0, 0.08)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 81, 0, 0.3)", marginRight: 8, marginBottom: 8 },
  tagPrimaryText: { color: ORANGE_NEON, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },

  statsContainer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#121214", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#1E1E24", marginBottom: 20 },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 16, fontWeight: "900", color: "#FFF", marginTop: 8 },
  statLabel: { fontSize: 10, color: "#888", fontWeight: "800", textTransform: "uppercase", marginTop: 4, letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: "#2A2A32", height: "100%" },

  btnActionOutlined: { width: "100%", backgroundColor: "rgba(255, 81, 0, 0.05)", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 16, borderWidth: 1.5, borderColor: ORANGE_NEON, borderStyle: 'dashed' },
  btnActionTextNeon: { color: ORANGE_NEON, fontSize: 14, fontWeight: "900", marginRight: 8, textTransform: "uppercase", letterSpacing: 1 },

  navigationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: 24, paddingHorizontal: 20 },
  navButton: { width: 64, height: 64, backgroundColor: CARD_BG, borderRadius: 32, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: BORDER_COLOR, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  navButtonDisabled: { opacity: 0.3 },
  navCounterPill: { backgroundColor: "#121214", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#2A2A32" },
  navCounterText: { fontSize: 12, fontWeight: "900", color: "#A0A0A5", letterSpacing: 1 },

  emptyState: { alignItems: "center", marginTop: 80, paddingHorizontal: 20 },
  emptyIconGlow: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255, 81, 0, 0.05)", borderWidth: 1, borderColor: "rgba(255, 81, 0, 0.2)", justifyContent: "center", alignItems: "center", marginBottom: 20, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "900", color: "#FFF", marginBottom: 10 },
  emptyText: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  emptyHint: { fontSize: 12, color: "#666", textAlign: "center", fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: CARD_BG, borderRadius: 28, padding: 24, alignItems: "center", borderWidth: 1, borderColor: BORDER_COLOR, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  modalHeader: { alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#FFF", textAlign: "center", marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: "#A0A0A5", textAlign: "center", lineHeight: 20 },
  
  scoreRingContainer: { alignItems: "center", marginBottom: 24 },
  scoreRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: ORANGE_NEON, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 81, 0, 0.05)", shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 8 },
  scoreRingValue: { fontSize: 32, fontWeight: "900", color: ORANGE_NEON, textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  scoreRingLabel: { fontSize: 10, color: "#FFF", fontWeight: "900", marginTop: 2, letterSpacing: 1.5 },

  modalBody: { width: "100%", backgroundColor: "#121214", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1E1E24", marginBottom: 24 },
  motivoRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  motivoIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255, 81, 0, 0.1)", borderWidth: 1, borderColor: "rgba(255, 81, 0, 0.2)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  motivoText: { fontSize: 13, color: "#E4E4E7", flex: 1, lineHeight: 20, fontWeight: "500" },

  btnModalOutlined: { width: "100%", backgroundColor: "rgba(10, 10, 12, 0.85)", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 16, borderWidth: 1.5, borderColor: ORANGE_NEON, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  btnModalTextNeon: { color: ORANGE_NEON, fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
});