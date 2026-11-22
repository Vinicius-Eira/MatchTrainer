import { StyleSheet } from "react-native";
import { theme } from "../../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../../utils/responsive";

export const styles = StyleSheet.create({
    container: { paddingHorizontal: scale(16), paddingTop: verticalScale(16), paddingBottom: verticalScale(24) },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
        marginBottom: verticalScale(10),
        marginTop: verticalScale(6),
    },
    sectionTitle: {
        color: "#FFF",
        fontSize: moderateScale(15),
        fontFamily: theme.fonts.title,
        letterSpacing: 0.4,
    },

    card: {
        backgroundColor: "#111115",
        borderRadius: moderateScale(18),
        padding: scale(16),
        borderWidth: 1,
        borderColor: "#22222A",
        marginBottom: verticalScale(18),
    },
    bioText: {
        color: "#D4D4D8",
        fontSize: moderateScale(13.5),
        lineHeight: moderateScale(21),
    },

    metodoTitle: { color: "#FF6B00", fontSize: moderateScale(13), fontWeight: "900", textTransform: "uppercase", marginBottom: 6 },
    difItem: { flexDirection: "row", alignItems: "flex-start", gap: scale(8), marginTop: verticalScale(8) },
    difText: { flex: 1, color: "#E4E4E7", fontSize: moderateScale(12.5), lineHeight: moderateScale(18) },

    formacaoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: "#1E1E26",
    },
    formacaoIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: moderateScale(10),
        backgroundColor: "rgba(255, 107, 0, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(255, 107, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    formacaoTitulo: { color: "#FFF", fontSize: moderateScale(13.5), fontWeight: "800" },
    formacaoSub: { color: "#8E8E93", fontSize: moderateScale(11.5), marginTop: 2 },

    dnaGrid: { flexDirection: "row", flexWrap: "wrap", gap: scale(8), marginBottom: verticalScale(18) },
    dnaChip: {
        flexGrow: 1,
        minWidth: "46%",
        backgroundColor: "#111115",
        borderRadius: moderateScale(14),
        padding: scale(12),
        borderWidth: 1,
        borderColor: "#22222A",
    },
    dnaLabel: { color: "#71717A", fontSize: moderateScale(9.5), fontWeight: "900", textTransform: "uppercase", marginBottom: 4 },
    dnaVal: { color: "#FFF", fontSize: moderateScale(12.5), fontWeight: "800" },

    specRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111115",
        padding: scale(13),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: "#22222A",
        marginBottom: verticalScale(8),
    },
    specIconBox: {
        width: scale(38),
        height: scale(38),
        borderRadius: moderateScale(11),
        backgroundColor: "rgba(255, 107, 0, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(255, 107, 0, 0.25)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: scale(12),
    },
    specTitle: { color: "#FFF", fontSize: moderateScale(13.5), fontWeight: "800" },
    specDesc: { color: "#8E8E93", fontSize: moderateScale(11.5), marginTop: 2, lineHeight: moderateScale(16) },

    locaisWrap: { flexDirection: "row", flexWrap: "wrap", gap: scale(8), marginBottom: verticalScale(18) },
    localPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#111115",
        borderWidth: 1,
        borderColor: "#22222A",
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(12),
    },
    localPillText: { color: "#E4E4E7", fontSize: moderateScale(12), fontWeight: "700" },
});