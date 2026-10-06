import { StyleSheet } from 'react-native';
import { theme } from '../../../../../theme/theme'; 
import { scale, verticalScale, moderateScale } from '../../../../../utils/responsive';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(20), paddingVertical: verticalScale(15), borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { padding: scale(5) },
  headerTitle: { color: theme.colors.text, fontSize: moderateScale(18), fontFamily: theme.fonts.title, letterSpacing: 1 },
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(40) },
  
  contextCard: { backgroundColor: theme.colors.surface, borderRadius: moderateScale(16), padding: scale(20), borderWidth: 1, borderColor: theme.colors.borderLight, marginBottom: verticalScale(24) },
  contextHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
  avatarText: { color: theme.colors.text, fontFamily: theme.fonts.title, fontSize: moderateScale(18) },
  studentName: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: 'bold' },
  studentGoal: { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: verticalScale(16) },
  eventTitle: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: 'bold', marginBottom: verticalScale(12) },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(10) },
  eventLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(14) },
  eventValue: { color: theme.colors.text, fontSize: moderateScale(14), fontWeight: 'bold', flexShrink: 1, textAlign: 'right' },
  tagNeutral: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6), borderWidth: 1, borderColor: theme.colors.borderLight },
  tagNeutralText: { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
  tagDanger: { backgroundColor: 'rgba(255, 59, 48, 0.1)', paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6), borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)' },
  tagDangerText: { color: theme.colors.danger, fontSize: moderateScale(12), fontWeight: 'bold' },
  observationBox: { backgroundColor: theme.colors.surfaceLight, padding: scale(12), borderRadius: moderateScale(8), marginTop: verticalScale(8), borderLeftWidth: 3, borderLeftColor: theme.colors.textSecondary },
  observationText: { color: theme.colors.textBody, fontSize: moderateScale(13), fontStyle: 'italic' },

  sectionTitle: { color: theme.colors.text, fontSize: moderateScale(20), fontFamily: theme.fonts.title, marginBottom: verticalScale(16), letterSpacing: 0.5 },
  
  copilotIdle: { backgroundColor: 'rgba(255, 107, 0, 0.05)', borderRadius: moderateScale(16), padding: scale(20), borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', alignItems: 'center' },
  copilotIdleText: { color: theme.colors.textBody, fontSize: moderateScale(14), textAlign: 'center', marginBottom: verticalScale(20), lineHeight: moderateScale(20) },
  
  btnPrimary: { backgroundColor: theme.colors.primary, paddingVertical: verticalScale(14), paddingHorizontal: scale(24), borderRadius: moderateScale(12), width: '100%', alignItems: 'center' },
  btnPrimaryFlex: { flex: 2, backgroundColor: theme.colors.primary, paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: 'center', marginLeft: scale(8) },
  btnPrimaryText: { color: '#000', fontSize: moderateScale(14), fontWeight: 'bold', textTransform: 'uppercase' },
  
  copilotLoading: { alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(40) },
  copilotLoadingText: { color: theme.colors.primary, fontSize: moderateScale(14), marginTop: verticalScale(16), fontWeight: '600' },

  suggestionCard: { backgroundColor: theme.colors.surfaceLight, borderRadius: moderateScale(16), padding: scale(20), borderWidth: 1, borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
  suggestionTitle: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: 'bold' },
  confidenceTag: { backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6), borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
  confidenceText: { color: theme.colors.success, fontSize: moderateScale(10), fontWeight: 'bold', textTransform: 'uppercase' },
  
  changeVisualizer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, paddingVertical: verticalScale(16), borderRadius: moderateScale(12), marginBottom: verticalScale(20) },
  changeTextStrike: { flex: 1, color: theme.colors.textSecondary, fontSize: moderateScale(14), textDecorationLine: 'line-through', textAlign: 'right' },
  changeTextNew: { flex: 1, color: theme.colors.primary, fontSize: moderateScale(16), fontWeight: '900', textAlign: 'left' },
  
  reasonTitle: { color: theme.colors.text, fontSize: moderateScale(14), fontWeight: 'bold', marginBottom: verticalScale(8) },
  reasonText: { color: theme.colors.textBody, fontSize: moderateScale(13), lineHeight: moderateScale(20), marginBottom: verticalScale(24) },
  
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { flex: 1, backgroundColor: theme.colors.background, paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderLight, marginRight: scale(8) },
  btnSecondaryText: { color: theme.colors.textBody, fontSize: moderateScale(13), fontWeight: 'bold' },
});