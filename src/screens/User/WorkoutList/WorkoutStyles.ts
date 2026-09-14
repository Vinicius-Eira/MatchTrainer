import { StyleSheet, Platform, StatusBar } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";
import { theme } from "../../../theme/theme";

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: STATUSBAR_HEIGHT ? STATUSBAR_HEIGHT + 10 : 20,
    paddingBottom: verticalScale(15),
    paddingHorizontal: scale(20),
    backgroundColor: "#050505",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  headerTitleBox: { alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900", letterSpacing: 1 },
  headerSubtitle: { color: "#FF6B00", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase" },
  
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(80) },
  sectionContainer: { marginBottom: verticalScale(25) },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "900", letterSpacing: 0.5, marginBottom: verticalScale(15), textTransform: "uppercase" },
  
  cardHoje: {
    backgroundColor: "#111",
    borderRadius: moderateScale(24),
    padding: scale(24),
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.4)",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    overflow: "hidden",
  },
  cardGradientBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  cardHojeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(20) },
  badgeHoje: { backgroundColor: "#FF6B00", flexDirection: "row", alignItems: "center", paddingHorizontal: scale(10), paddingVertical: verticalScale(4), borderRadius: moderateScale(8) },
  badgeHojeText: { color: "#FFF", fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 1 },
  statusPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(8) },
  statusDotGreen: { width: scale(6), height: scale(6), borderRadius: scale(3), backgroundColor: "#00E676", marginRight: scale(6) },
  statusPillText: { color: "#AAA", fontSize: moderateScale(10), fontWeight: "bold" },
  
  cardTitleHoje: { color: "#FFF", fontSize: moderateScale(26), fontWeight: "900", marginBottom: verticalScale(4), letterSpacing: -0.5 },
  cardObjetivoHoje: { color: "#888", fontSize: moderateScale(14), marginBottom: verticalScale(20) },
  
  infoGridHoje: { flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(25) },
  infoRow: { flexDirection: "row", alignItems: "center", gap: scale(6) },
  infoText: { color: "#FFF", fontSize: moderateScale(13), fontWeight: "bold" },
  
  btnIniciarHoje: { backgroundColor: "#FF6B00", borderRadius: moderateScale(16), paddingVertical: verticalScale(16), flexDirection: "row", justifyContent: "center", alignItems: "center" },
  btnIniciarHojeText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", letterSpacing: 1 },
  
  cardNormal: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(20), padding: scale(20), marginBottom: verticalScale(15), borderWidth: 1, borderColor: "#1A1A1A" },
  cardNormalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(4) },
  cardNormalTitle: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900" },
  cardNormalObjetivo: { color: "#888", fontSize: moderateScale(12), marginBottom: verticalScale(15) },
  
  cardNormalStats: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: moderateScale(12), padding: scale(12), marginBottom: verticalScale(15) },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "900" },
  statLabel: { color: "#666", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase", marginTop: verticalScale(2) },
  statDivider: { width: 1, height: "80%", backgroundColor: "#222" },
  
  cardNormalFooter: { borderTopWidth: 1, borderTopColor: "#1A1A1A", paddingTop: verticalScale(12), flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerLabel: { color: "#666", fontSize: moderateScale(12) },
  footerValue: { color: "#FFF", fontWeight: "bold" },
});