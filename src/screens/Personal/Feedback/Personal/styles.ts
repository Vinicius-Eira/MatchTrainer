import { StyleSheet } from "react-native";
import { theme } from "../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: verticalScale(60),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(10),
  },
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(50) },

  titleContainer: { alignItems: "center", marginBottom: verticalScale(30) },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(32),
    color: theme.colors.text,
    marginTop: verticalScale(15),
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(14),
    textAlign: "center",
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
  },

  label: {
    color: theme.colors.text,
    fontSize: moderateScale(16),
    fontWeight: "bold",
    marginBottom: verticalScale(15),
    marginTop: verticalScale(10),
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(10),
    marginBottom: verticalScale(30),
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: verticalScale(30),
  },
  chip: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(5),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: verticalScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(13),
    textAlign: "center",
    fontWeight: "500",
  },
  chipTextActive: { color: "#000", fontWeight: "bold" },

  inputArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(12),
    padding: scale(15),
    color: theme.colors.text,
    fontSize: moderateScale(15),
    minHeight: verticalScale(120),
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: verticalScale(30),
  },

  btnEnviar: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    padding: scale(16),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  btnEnviarText: {
    color: "#000",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});