import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050505' }, 
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingTop: Platform.OS === 'android' ? verticalScale(30) : verticalScale(10), paddingBottom: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#121214', backgroundColor: '#050505', zIndex: 10 },
  backBtn: { padding: scale(4) },
  headerTitle: { color: '#FFF', fontSize: scale(15), fontWeight: '900', letterSpacing: 1 },
  headerActionsRight: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  
  archiveHeaderBtn: { padding: scale(8), backgroundColor: '#161619', borderRadius: scale(8), borderWidth: 1, borderColor: '#1E1E24' },
  deleteHeaderBtn: { padding: scale(8), backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: scale(8), borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)' },
  
  publishBtn: { backgroundColor: '#FF5100', paddingHorizontal: scale(16), paddingVertical: verticalScale(10), borderRadius: scale(20), alignItems: 'center', shadowColor: '#FF5100', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  publishText: { color: '#000', fontSize: scale(12), fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
  
  scrollContent: { paddingBottom: verticalScale(200) }, 
  listHeaderContainer: { paddingBottom: verticalScale(10) },
  
  infoSection: { paddingHorizontal: scale(16), paddingTop: verticalScale(20), paddingBottom: verticalScale(20) },
  topActionsContainer: { flexDirection: 'row', gap: scale(12), marginBottom: verticalScale(24) },
  
  premiumAIBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 81, 0, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 81, 0, 0.4)', paddingVertical: verticalScale(14), borderRadius: scale(12) },
  premiumAIBtnText: { color: '#FF5100', fontSize: scale(13), fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  premiumModelBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121214', borderWidth: 1, borderColor: '#2A2A32', paddingVertical: verticalScale(14), borderRadius: scale(12) },
  premiumModelBtnText: { color: '#A0A0A5', fontSize: scale(13), fontWeight: '800', textTransform: 'uppercase' },
  
  formContainer: { backgroundColor: '#0A0A0C', borderRadius: scale(20), padding: scale(16), borderWidth: 1, borderColor: '#1A1A20' },
  inputWrapper: { marginBottom: verticalScale(20) }, 
  inputLabel: { color: '#888', fontSize: scale(11), fontWeight: '900', marginBottom: verticalScale(10), textTransform: 'uppercase', letterSpacing: 1 },
  
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121214', borderRadius: scale(12), borderWidth: 1, borderColor: '#1E1E24', paddingHorizontal: scale(14) },
  inputIcon: { marginRight: scale(10) },
  inputTitleLarge: { flex: 1, color: '#FFF', fontSize: scale(16), fontWeight: 'bold', paddingVertical: verticalScale(14) },
  inputSubtitle: { flex: 1, color: '#FFF', fontSize: scale(14), fontWeight: '500', paddingVertical: verticalScale(14) },
  
  quickTagsContainer: { flexDirection: 'row', marginTop: verticalScale(10), gap: scale(8) },
  quickTag: { backgroundColor: '#121214', paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(8), borderWidth: 1, borderColor: '#1E1E24' },
  quickTagActive: { backgroundColor: 'rgba(255, 81, 0, 0.1)', borderColor: '#FF5100' },
  quickTagText: { color: '#888', fontSize: scale(12), fontWeight: '600' },
  quickTagTextActive: { color: '#FF5100', fontWeight: 'bold' },

  daysWrapper: { paddingBottom: verticalScale(20) },
  daysScroll: { flexDirection: 'row', paddingHorizontal: scale(16), gap: scale(10), alignItems: 'center' },
  
  dayPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(16), paddingVertical: verticalScale(12), borderRadius: scale(24), backgroundColor: '#121214', borderWidth: 1, borderColor: '#1E1E24' },
  dayPillActive: { backgroundColor: 'rgba(255, 81, 0, 0.05)', borderColor: '#FF5100', shadowColor: '#FF5100', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  dayPillText: { color: '#A0A0A5', fontSize: scale(13), fontWeight: '700' },
  dayPillTextActive: { color: '#FF5100', fontWeight: '900' },
  
  addDayPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(16), paddingVertical: verticalScale(12), borderRadius: scale(24), backgroundColor: '#0A0A0C', borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
  addDayText: { color: '#A0A0A5', fontSize: scale(12), fontWeight: 'bold', marginLeft: scale(6) },
  
  listFooterContainer: { paddingHorizontal: scale(16), marginTop: verticalScale(20) },
  
  addExerciseBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(18), borderRadius: scale(16), backgroundColor: 'rgba(255, 81, 0, 0.08)', borderWidth: 1.5, borderColor: '#FF5100', borderStyle: 'dashed' },
  addExerciseText: { color: '#FF5100', fontSize: scale(14), fontWeight: '900', marginLeft: scale(8), letterSpacing: 1 },
  
  generalObsSection: { marginTop: verticalScale(30), marginBottom: verticalScale(20) },
  generalObsHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginBottom: verticalScale(12) },
  generalObsTitle: { color: '#A0A0A5', fontSize: scale(12), fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  generalObsInput: { backgroundColor: '#0A0A0C', borderWidth: 1, borderColor: '#1A1A20', borderRadius: scale(16), color: '#FFF', fontSize: scale(14), padding: scale(16), minHeight: verticalScale(120) },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#0A0A0C', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), minHeight: '50%', maxHeight: '80%', padding: scale(20), borderWidth: 1, borderColor: '#1A1A20' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
  modalTitle: { color: '#FFF', fontSize: scale(18), fontWeight: 'bold' },
  modalLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalLoadingText: { color: '#A0A0A5', marginTop: verticalScale(10), fontSize: scale(14) },
  modalEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(40) },
  modalEmptyText: { color: '#A0A0A5', marginTop: verticalScale(10), fontSize: scale(14) },
  presetCard: { backgroundColor: '#121214', borderRadius: scale(16), padding: scale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: '#1E1E24' },
  presetCardTitle: { color: '#FFF', fontSize: scale(16), fontWeight: 'bold', marginBottom: verticalScale(4) },
  presetCardObjective: { color: '#A0A0A5', fontSize: scale(13), marginBottom: verticalScale(12) },
  presetCardAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: scale(6), marginTop: verticalScale(8), borderTopWidth: 1, borderTopColor: '#1A1A20', paddingTop: verticalScale(12) },
  presetCardActionText: { color: '#FF5100', fontSize: scale(13), fontWeight: 'bold' }
});