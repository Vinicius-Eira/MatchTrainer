import { StyleSheet, Platform, Dimensions } from "react-native";
import { theme } from "../../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../../utils/responsive";

const { width } = Dimensions.get("window");

export const OPCOES_MODALIDADE = [
  { id: "Consultoria", label: "Consultoria", icon: "phone-portrait-outline" as any },
  { id: "Presencial", label: "Presencial", icon: "barbell-outline" as any },
  { id: "Híbrido", label: "Híbrido", icon: "diamond-outline" as any },
];

export const frequenciaList = [
  { id: "Avulso", label: "Avulso" },
  { id: "Mensal", label: "Mensal" },
  { id: "Trimestral", label: "Trimestral" },
  { id: "Semestral", label: "Semestral" },
  { id: "Anual", label: "Anual" },
];

export const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#030303" },
  
  glowTop: { position: "absolute", top: -100, left: -50, width: width * 1.5, height: 300, backgroundColor: theme.colors.primary, opacity: 0.08, borderRadius: 200 },
  glowBottom: { position: "absolute", bottom: -100, right: -50, width: width * 1.2, height: 300, backgroundColor: "#00E676", opacity: 0.04, borderRadius: 200 },
  
  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(12), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.03)" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.03)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: moderateScale(13), color: "#AAA", letterSpacing: 2, textTransform: "uppercase" },
  
  scrollContent: { paddingBottom: verticalScale(40) },
  innerContent: { paddingHorizontal: scale(20), paddingTop: Platform.OS === "ios" ? verticalScale(130) : verticalScale(110) },
  
  heroSection: { alignItems: "center", marginBottom: verticalScale(35) },
  iconBadge: { width: scale(64), height: scale(64), borderRadius: moderateScale(20), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", marginBottom: verticalScale(16), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 5 },
  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(30), color: "#FFF", letterSpacing: -0.5, textAlign: "center", marginBottom: verticalScale(6) },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#888", lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },
  
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(16), marginTop: verticalScale(24) },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  sectionDot: { width: scale(8), height: scale(8), borderRadius: moderateScale(4), backgroundColor: theme.colors.primary, marginRight: scale(10), shadowColor: theme.colors.primary, shadowOpacity: 0.8, shadowRadius: 5 },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.title, letterSpacing: 0.5, textTransform: "uppercase" },
  
  inputGroup: { gap: verticalScale(12) },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)", paddingLeft: scale(16), height: verticalScale(60) },
  inputWrapperFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" }, 
  inputIcon: { marginRight: scale(12) },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, height: "100%" },
  
  modalityContainer: { flexDirection: "row", gap: scale(10) },
  modalityCard: { flex: 1, height: verticalScale(85), backgroundColor: "rgba(255,255,255,0.02)", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)", justifyContent: "center", alignItems: "center" },
  modalityCardActive: { backgroundColor: "rgba(255, 107, 0, 0.08)", borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  modalityText: { color: "#888", fontSize: moderateScale(12), fontWeight: "bold", marginTop: verticalScale(8) },
  modalityTextActive: { color: theme.colors.primary, fontWeight: "900" },
  
  financeBox: { backgroundColor: "rgba(0, 230, 118, 0.03)", borderRadius: moderateScale(24), padding: scale(24), borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.15)", marginTop: verticalScale(8) },
  financeHero: { alignItems: "center", marginBottom: verticalScale(25) },
  financeLabelCenter: { color: "#00E676", fontSize: moderateScale(11), fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: verticalScale(8) },
  financeInputRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  currencySymbol: { color: "#00E676", fontSize: moderateScale(24), fontFamily: theme.fonts.title, marginRight: scale(6), marginTop: verticalScale(4) },
  hugeInput: { color: "#FFF", fontSize: moderateScale(48), fontFamily: theme.fonts.title, minWidth: scale(120), textAlign: "center" },
  
  pillLabel: { color: "#888", fontSize: moderateScale(12), fontWeight: "bold", marginBottom: verticalScale(10), textTransform: "uppercase", letterSpacing: 0.5 },
  pillScroll: { flexDirection: "row", gap: scale(8), paddingBottom: verticalScale(10) },
  pill: { paddingHorizontal: scale(18), paddingVertical: verticalScale(10), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: moderateScale(20), borderWidth: 1, borderColor: "transparent" },
  pillActive: { backgroundColor: "#00E676", borderColor: "#00E676" },
  pillText: { color: "#AAA", fontSize: moderateScale(13), fontWeight: "600" },
  pillTextActive: { color: "#000", fontWeight: "900" },

  chipsContainerWrap: { flexDirection: "row", flexWrap: "wrap", gap: scale(8), width: "100%" },
  vencimentoChip: { flex: 1, minWidth: scale(80), paddingVertical: verticalScale(10), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: moderateScale(20), borderWidth: 1, borderColor: "transparent", alignItems: "center", marginHorizontal: scale(4) },

  editorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(12) },
  editorHeaderDesc: { color: "#777", fontSize: moderateScale(12), flex: 1, marginRight: scale(10), lineHeight: moderateScale(18) },
  btnImportar: { flexDirection: "row", alignItems: "center", paddingHorizontal: scale(10), paddingVertical: verticalScale(6), backgroundColor: "rgba(255, 107, 0, 0.1)", borderRadius: moderateScale(10), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  btnImportarText: { color: theme.colors.primary, fontSize: moderateScale(11), fontWeight: "bold", marginLeft: scale(6) },
  
  editorContainer: { minHeight: verticalScale(160), backgroundColor: "rgba(255,255,255,0.02)", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)", padding: scale(16) },
  editorContainerFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.03)" },
  editorInput: { flex: 1, color: "#FFF", fontSize: moderateScale(14), fontFamily: theme.fonts.body, textAlignVertical: "top", lineHeight: moderateScale(22) },
  
  iaProcessingContainer: { height: verticalScale(160), justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.05)", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  iaProcessingTitle: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "bold", marginTop: verticalScale(12) },
  iaProcessingStatus: { color: "#AAA", fontSize: moderateScale(12), marginTop: verticalScale(6), textAlign: 'center', paddingHorizontal: 20 },

  btnMagicIA: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 107, 0, 0.05)", marginTop: verticalScale(12), paddingVertical: verticalScale(14), borderRadius: moderateScale(14), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  btnMagicIAText: { color: theme.colors.primary, fontSize: moderateScale(13), fontWeight: "bold", marginLeft: scale(8), letterSpacing: 0.5 },

  btnFinalizar: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: verticalScale(60), backgroundColor: "rgba(255, 107, 0, 0.08)", borderRadius: moderateScale(20), marginTop: verticalScale(40), borderWidth: 1.5, borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 6 },
  btnFinalizarText: { color: theme.colors.primary, fontSize: moderateScale(14), fontFamily: theme.fonts.title, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", marginLeft: scale(10) },

  modalUploadOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "flex-end" },
  modalUploadSheet: { backgroundColor: "#111", borderTopLeftRadius: moderateScale(30), borderTopRightRadius: moderateScale(30), paddingHorizontal: scale(24), paddingBottom: Platform.OS === "ios" ? verticalScale(40) : verticalScale(24), paddingTop: verticalScale(12), borderWidth: 1, borderColor: "#222" },
  sheetHandle: { width: scale(40), height: verticalScale(4), backgroundColor: "#444", borderRadius: moderateScale(2), alignSelf: "center", marginBottom: verticalScale(24) },
  sheetTitle: { color: "#FFF", fontSize: moderateScale(22), fontFamily: theme.fonts.title, marginBottom: verticalScale(4) },
  sheetSubtitle: { color: "#888", fontSize: moderateScale(14), fontFamily: theme.fonts.body, marginBottom: verticalScale(24) },
  uploadOptionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A1A1A", padding: scale(16), borderRadius: moderateScale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#222" },
  uploadOptionIcon: { width: scale(48), height: scale(48), borderRadius: moderateScale(12), justifyContent: "center", alignItems: "center", marginRight: scale(16) },
  uploadOptionTexts: { flex: 1 },
  uploadOptionTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(4) },
  uploadOptionDesc: { color: "#888", fontSize: moderateScale(12), lineHeight: moderateScale(16) },
  sheetBtnClose: { marginTop: verticalScale(16), alignItems: "center", paddingVertical: verticalScale(16), backgroundColor: "rgba(255,255,255,0.05)", borderRadius: moderateScale(16) },
  sheetBtnCloseText: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold" }
});