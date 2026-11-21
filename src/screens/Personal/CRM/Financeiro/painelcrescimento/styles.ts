import { Platform, StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../../../utils/responsive";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },

  glowTopLeft: {
    position: "absolute",
    top: verticalScale(-60),
    left: scale(-60),
    width: scale(280),
    height: scale(280),
    borderRadius: moderateScale(140),
    backgroundColor: "#FF6B00",
    opacity: 0.12,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: verticalScale(-60),
    right: scale(-60),
    width: scale(260),
    height: scale(260),
    borderRadius: moderateScale(130),
    backgroundColor: "#FF6B00",
    opacity: 0.07,
  },

  header: {
    paddingTop: Platform.OS === "ios" ? verticalScale(55) : verticalScale(38),
    paddingBottom: verticalScale(12),
    paddingHorizontal: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    zIndex: 10,
  },
  btnVoltar: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(19),
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerSubtitle: {
    color: "#FF6B00",
    fontSize: moderateScale(10),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  btnInfo: {
    padding: scale(4),
    marginLeft: scale(4),
    opacity: 0.85,
  },

  tabsWrapper: {
    flexDirection: "row",
    marginHorizontal: scale(16),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
    backgroundColor: "#111115",
    borderRadius: moderateScale(14),
    padding: scale(4),
    borderWidth: 1,
    borderColor: "#22222A",
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabItemAtiva: {
    backgroundColor: "rgba(255, 107, 0, 0.14)",
    borderColor: "#FF6B00",
  },
  tabLabel: {
    color: "#777",
    fontSize: moderateScale(12),
    fontWeight: "800",
  },
  tabLabelAtiva: {
    color: "#FF6B00",
    fontWeight: "900",
  },

  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(90),
  },
});