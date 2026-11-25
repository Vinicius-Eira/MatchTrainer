import { StyleSheet } from "react-native";
import { theme } from "../../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../../utils/responsive";

export { frequenciaList, styles } from "../AdicionarAluno/styles";

export const anexoStyles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(0, 230, 118, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.28)",
    borderRadius: moderateScale(14),
    padding: scale(12),
    marginBottom: verticalScale(12),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(10),
    backgroundColor: "rgba(0, 230, 118, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  sub: {
    color: "#8E8E93",
    fontSize: moderateScale(11),
    marginTop: 2,
  },
  btnRemove: {
    padding: scale(8),
  },
  actionsRow: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: verticalScale(10),
  },
  btnSmall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnSmallPrimary: {
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    borderColor: "rgba(255, 107, 0, 0.35)",
  },
  btnSmallText: {
    color: "#FFF",
    fontSize: moderateScale(11.5),
    fontWeight: "700",
  },
});

export const sucessoModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.84)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(22),
  },
  card: {
    width: "100%",
    backgroundColor: "#0B0B11",
    borderRadius: moderateScale(26),
    padding: scale(24),
    borderWidth: 1.3,
    borderColor: "rgba(0, 230, 118, 0.42)",
    alignItems: "center",
  },
  iconOuter: {
    width: scale(74),
    height: scale(74),
    borderRadius: moderateScale(37),
    backgroundColor: "rgba(0, 230, 118, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(0, 230, 118, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },
  kicker: {
    color: "#00E676",
    fontSize: moderateScale(10),
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: verticalScale(6),
  },
  title: {
    color: "#FFF",
    fontSize: moderateScale(20),
    fontFamily: theme.fonts.title,
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(18.5),
    textAlign: "center",
    marginBottom: verticalScale(18),
  },
  summaryBox: {
    width: "100%",
    backgroundColor: "#12121B",
    borderRadius: moderateScale(16),
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#20202E",
    marginBottom: verticalScale(20),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(4),
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: verticalScale(6),
  },
  summaryLabel: {
    color: "#8E8E93",
    fontSize: moderateScale(11.5),
    fontWeight: "700",
  },
  summaryValue: {
    color: "#FFF",
    fontSize: moderateScale(12.5),
    fontWeight: "800",
  },
  summaryValueAccent: {
    color: "#00E676",
    fontSize: moderateScale(13),
    fontWeight: "900",
  },
  btnVoltarChat: {
    width: "100%",
    height: verticalScale(50),
    borderRadius: moderateScale(14),
    backgroundColor: "rgba(255, 107, 0, 0.14)",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
  },
  btnVoltarChatText: {
    color: theme.colors.primary,
    fontSize: moderateScale(13),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});