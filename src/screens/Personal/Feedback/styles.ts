import { StyleSheet } from "react-native";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContainer: { padding: scale(20), paddingBottom: verticalScale(50) },

  headerContainer: {
    alignItems: "center",
    marginBottom: verticalScale(30),
    paddingTop: verticalScale(40),
  },
  backButton: {
    position: "absolute",
    top: verticalScale(40),
    left: 0,
    padding: scale(10),
  },
  mediaText: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(64),
    color: theme.colors.primary,
    lineHeight: moderateScale(70),
  },
  starsContainer: {
    flexDirection: "row",
    gap: scale(4),
    marginBottom: verticalScale(5),
  },
  totalAvaliacoesText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(13),
    marginBottom: verticalScale(20),
  },

  distribuicaoContainer: { width: "100%", paddingHorizontal: scale(20) },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },
  distNotaText: {
    color: theme.colors.textSecondary,
    width: scale(25),
    fontSize: moderateScale(13),
  },
  barraFundo: {
    flex: 1,
    height: verticalScale(8),
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(4),
    marginHorizontal: scale(10),
    overflow: "hidden",
  },
  barraPreenchida: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: moderateScale(4),
  },
  distCountText: {
    color: theme.colors.textSecondary,
    width: scale(20),
    textAlign: "right",
    fontSize: moderateScale(13),
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
  },
  avatarFallback: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    color: theme.colors.text,
    fontWeight: "bold",
    fontSize: moderateScale(14),
  },
  userInfo: { flex: 1, marginLeft: scale(12) },
  userName: {
    color: theme.colors.text,
    fontWeight: "bold",
    fontSize: moderateScale(15),
    marginBottom: verticalScale(2),
  },
  starsRow: { flexDirection: "row", gap: scale(2) },
  dateText: { color: theme.colors.textSecondary, fontSize: moderateScale(11) },
  commentText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(40),
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: moderateScale(18),
    fontWeight: "bold",
    marginTop: verticalScale(15),
    textAlign: "center",
  },
  emptySub: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(14),
    textAlign: "center",
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
  },

  skeletonCard: {
    width: "100%",
    height: verticalScale(100),
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
  },
});