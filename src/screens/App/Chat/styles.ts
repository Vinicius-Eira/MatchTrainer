import { StyleSheet, Platform } from "react-native";
import { theme } from "../../../theme/theme"; 
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerBlur: {
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerContent: { flexDirection: "row", alignItems: "center", paddingHorizontal: scale(16) },
  btnVoltar: { padding: scale(5), marginRight: scale(10) },
  headerProfile: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: scale(42), height: scale(42), borderRadius: moderateScale(21), marginRight: scale(12),
    borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)",
  },
  headerName: { fontFamily: theme.fonts.title, fontSize: moderateScale(17), color: "#FFF", letterSpacing: 0.3 },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: verticalScale(2) },
  statusDot: { width: scale(8), height: scale(8), borderRadius: moderateScale(4), marginRight: scale(6) },
  statusText: { color: "#888", fontSize: moderateScale(12), fontWeight: "600" },

  islandContainer: { paddingHorizontal: scale(15), paddingVertical: verticalScale(15), zIndex: 10 },
  islandCard: {
    borderRadius: moderateScale(24), padding: scale(20), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)",
    overflow: "hidden"
  },
  islandHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(12) },
  iconCirclePrimary: {
    width: scale(36), height: scale(36), borderRadius: moderateScale(18),
    backgroundColor: "rgba(255, 107, 0, 0.15)", justifyContent: "center", alignItems: "center", marginRight: scale(10),
    borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)"
  },
  islandTitleVIP: { color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.title, letterSpacing: 0.3 },
  islandSubtitleVIP: { color: "#AAA", fontSize: moderateScale(13), lineHeight: moderateScale(20), marginBottom: verticalScale(18) },
  
  btnNeonTransparente: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(255, 107, 0, 0.1)", 
    paddingVertical: verticalScale(14), borderRadius: moderateScale(16), gap: scale(8),
    borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.5)",
    shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
  },
  btnNeonText: { color: "#FF6B00", fontWeight: "900", fontSize: moderateScale(14), letterSpacing: 1, textTransform: "uppercase" },

  proposalBadgeRow: { flexDirection: "row", marginBottom: verticalScale(12) },
  proposalBadge: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,215,0,0.1)",
    paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(12),
    borderWidth: 1, borderColor: "rgba(255,215,0,0.3)", gap: scale(6),
  },
  proposalBadgeText: { color: "#FFD700", fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 1 },

  pillContainer: { alignItems: "center", paddingVertical: verticalScale(12) },
  pillWaiting: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.1)",
    paddingHorizontal: scale(20), paddingVertical: verticalScale(12), borderRadius: moderateScale(20),
    borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)",
  },
  pillText: { color: "#FF6B00", fontSize: moderateScale(12), fontWeight: "600", flexShrink: 1 },

  listContent: { paddingHorizontal: scale(16), paddingVertical: verticalScale(10) },
  
  dateSeparator: {
    alignSelf: "center", backgroundColor: "#1A1A1A", paddingVertical: verticalScale(6), paddingHorizontal: scale(16),
    borderRadius: moderateScale(16), marginVertical: verticalScale(15), borderWidth: 1, borderColor: "#333",
  },
  dateSeparatorText: { color: "#888", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase" },

  bubbleContainer: {
    maxWidth: "82%", paddingHorizontal: scale(16), paddingVertical: verticalScale(12), marginBottom: verticalScale(12),
  },
  bubbleRight: {
    alignSelf: "flex-end", backgroundColor: "#FF6B00",
    borderTopLeftRadius: moderateScale(20), borderTopRightRadius: moderateScale(20),
    borderBottomLeftRadius: moderateScale(20), borderBottomRightRadius: moderateScale(4),
  },
  bubbleLeft: {
    alignSelf: "flex-start", backgroundColor: "#1A1A1A",
    borderTopLeftRadius: moderateScale(20), borderTopRightRadius: moderateScale(20),
    borderBottomLeftRadius: moderateScale(4), borderBottomRightRadius: moderateScale(20),
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  bubbleText: { fontSize: moderateScale(15), lineHeight: moderateScale(22), fontWeight: "500" },
  bubbleTextRight: { color: "#000" }, // Texto escuro na bolha laranja pra dar contraste premium
  bubbleTextLeft: { color: "#FFF" },

  timeRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: verticalScale(6) },
  timeText: { fontSize: moderateScale(10), fontWeight: "bold" },
  timeTextRight: { color: "rgba(0,0,0,0.5)" },
  timeTextLeft: { color: "#888" },

  icebreakerContainer: {
    backgroundColor: "#111", padding: scale(20), borderRadius: moderateScale(20),
    borderWidth: 1, borderColor: "#222", marginTop: verticalScale(30), marginHorizontal: scale(10),
  },
  icebreakerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: verticalScale(6), gap: scale(8) },
  icebreakerTitle: { color: "#FF6B00", fontSize: moderateScale(16), fontWeight: "bold", textTransform: "uppercase" },
  icebreakerSubtitle: { color: "#888", fontSize: moderateScale(13), textAlign: "center", marginBottom: verticalScale(20) },
  btnSugestao: {
    backgroundColor: "#1A1A1A", padding: scale(16), borderRadius: moderateScale(16), marginBottom: verticalScale(10),
    borderWidth: 1, borderColor: "#333",
  },
  btnSugestaoText: { color: "#CCC", fontSize: moderateScale(14), fontStyle: "italic", textAlign: "center" },

  inputArea: {
    backgroundColor: "#0D0D0D", paddingHorizontal: scale(16), paddingTop: verticalScale(12),
    paddingBottom: Platform.OS === "ios" ? verticalScale(35) : verticalScale(15),
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)",
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "flex-end", backgroundColor: "#1A1A1A", borderRadius: moderateScale(24),
    paddingLeft: scale(18), paddingRight: scale(6), paddingVertical: verticalScale(6),
    borderWidth: 1, borderColor: "#333",
  },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(15), paddingTop: verticalScale(12), paddingBottom: verticalScale(12) },
  btnSend: {
    width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#FF6B00",
    justifyContent: "center", alignItems: "center", marginBottom: verticalScale(2),
  },
  btnSendDisabled: { backgroundColor: "#222" },
});