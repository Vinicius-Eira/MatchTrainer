import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  
  successHeader: { alignItems: "center", marginTop: 20, marginBottom: 30 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: 2, borderColor: "rgba(0, 230, 118, 0.3)" },
  title: { color: "#00E676", fontSize: 20, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  subtitle: { color: "#FFF", fontSize: 14, fontWeight: "600", textTransform: "uppercase" },

  statsContainer: { flexDirection: "row", backgroundColor: "#111", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#222", marginBottom: 30 },
  statBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  statDivider: { width: 1, height: "80%", backgroundColor: "#333", alignSelf: "center" },
  statValue: { color: "#FFF", fontSize: 17, fontWeight: "900", marginTop: 10, marginBottom: 4 },
  statLabel: { color: "#888", fontSize: 10, fontWeight: "700", textTransform: "uppercase" },

  feedbackSection: { backgroundColor: "#111", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#222" },
  sectionTitle: { color: "#FFF", fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  sectionSubtitle: { color: "#888", fontSize: 12, marginBottom: 16 },
  
  intensityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, gap: 8 },
  intensityBtn: { flex: 1, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#333", borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  intensityText: { color: "#AAA", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", marginTop: 4 },

  feedbackInput: { backgroundColor: "#1A1A1A", borderRadius: 12, padding: 16, color: "#FFF", fontSize: 14, minHeight: 90, borderWidth: 1, borderColor: "#333" },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 40 },
  footerGradient: { position: "absolute", bottom: 0, left: 0, right: 0, top: 0 },
  
  btnSalvar: { backgroundColor: "#00E676", flexDirection: "row", height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnSalvarText: { color: "#000", fontSize: 15, fontWeight: "900", letterSpacing: 1 }
});