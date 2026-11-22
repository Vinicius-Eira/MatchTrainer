import { StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../../../utils/responsive";

export const styles = StyleSheet.create({
    container: { paddingHorizontal: scale(16), paddingTop: verticalScale(16), paddingBottom: verticalScale(24) },

    resumoCard: {
        backgroundColor: "#111115",
        borderRadius: moderateScale(18),
        padding: scale(18),
        borderWidth: 1,
        borderColor: "#22222A",
        flexDirection: "row",
        alignItems: "center",
        gap: scale(16),
        marginBottom: verticalScale(16),
    },
    notaGrande: { color: "#FFF", fontSize: moderateScale(34), fontWeight: "900" },
    resumoSub: { color: "#8E8E93", fontSize: moderateScale(12), marginTop: 4 },

    reviewCard: {
        backgroundColor: "#111115",
        borderRadius: moderateScale(18),
        padding: scale(16),
        borderWidth: 1,
        borderColor: "#22222A",
        marginBottom: verticalScale(10),
    },
    reviewCardFixado: {
        borderColor: "rgba(255, 107, 0, 0.45)",
        backgroundColor: "rgba(255, 107, 0, 0.05)",
    },
    pinTag: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: verticalScale(8),
    },
    pinTagText: { color: "#FF6B00", fontSize: moderateScale(10), fontWeight: "900", textTransform: "uppercase" },
    reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(10) },
    avatar: {
        width: scale(38),
        height: scale(38),
        borderRadius: moderateScale(19),
        backgroundColor: "#191922",
        borderWidth: 1,
        borderColor: "#2A2A36",
        justifyContent: "center",
        alignItems: "center",
        marginRight: scale(12),
    },
    avatarLetter: { color: "#FF6B00", fontSize: moderateScale(15), fontWeight: "900" },
    nome: { color: "#FFF", fontSize: moderateScale(13.5), fontWeight: "800", marginBottom: 3 },
    comentario: { color: "#D4D4D8", fontSize: moderateScale(13), fontStyle: "italic", lineHeight: moderateScale(19) },

    emptyBox: {
        backgroundColor: "#111115",
        borderRadius: moderateScale(18),
        padding: scale(28),
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#22222A",
        borderStyle: "dashed",
    },
    emptyTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", marginTop: 10 },
    emptyDesc: { color: "#8E8E93", fontSize: moderateScale(12.5), textAlign: "center", marginTop: 6, lineHeight: 18 },
});