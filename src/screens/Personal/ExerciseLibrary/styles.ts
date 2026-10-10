import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';
import { MATCH_COLORS } from './useExerciseLibrary';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MATCH_COLORS.surfaceDark },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: scale(16), 
    paddingTop: Platform.OS === 'android' ? verticalScale(30) : verticalScale(10), 
    paddingBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#121214'
  },
  iconButton: { padding: scale(4) },
  iconButtonPrimary: { 
    width: scale(36), height: scale(36), 
    borderRadius: moderateScale(12), 
    backgroundColor: MATCH_COLORS.primary, 
    justifyContent: "center", alignItems: "center",
    shadowColor: MATCH_COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5
  },
  headerTitle: { color: MATCH_COLORS.text, fontSize: moderateScale(15), fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { color: MATCH_COLORS.primary, fontSize: moderateScale(10), fontWeight: '800', marginTop: verticalScale(2), textTransform: 'uppercase' },
  
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#0A0A0C', 
    marginHorizontal: scale(16), paddingHorizontal: scale(16), 
    borderRadius: moderateScale(16), borderWidth: 1, 
    borderColor: '#1A1A20', height: verticalScale(50),
    marginTop: verticalScale(10)
  },
  searchIcon: { marginRight: scale(10) },
  searchInput: { flex: 1, color: MATCH_COLORS.text, fontSize: moderateScale(14), fontWeight: '500' },
  
  filtersWrapper: { marginVertical: verticalScale(16) },
  filtersContainer: { paddingHorizontal: scale(16), gap: scale(8) },
  filterChip: { 
    paddingHorizontal: scale(18), paddingVertical: verticalScale(10), 
    borderRadius: moderateScale(24), backgroundColor: '#0A0A0C', 
    borderWidth: 1, borderColor: '#1A1A20' 
  },
  filterChipActive: { backgroundColor: MATCH_COLORS.primaryGlow, borderColor: MATCH_COLORS.primary, shadowColor: MATCH_COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  filterChipText: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(12), fontWeight: '700' },
  filterChipTextActive: { color: MATCH_COLORS.primary, fontWeight: '900' },
  
  listContent: { paddingHorizontal: scale(16), paddingBottom: verticalScale(40) },
  cardWrapper: { marginBottom: verticalScale(16) },
  card: { 
    height: verticalScale(220), borderRadius: moderateScale(20), 
    overflow: 'hidden', backgroundColor: '#0A0A0C', 
    borderWidth: 1, borderColor: '#1A1A20' 
  },
  content: { flex: 1, padding: scale(16), justifyContent: 'space-between', zIndex: 2 },
  
  uploadingOverlay: { 
    ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 5, 5, 0.85)', 
    justifyContent: 'center', alignItems: 'center', zIndex: 10 
  },
  uploadingText: { color: MATCH_COLORS.primary, fontSize: moderateScale(13), fontWeight: '800', marginTop: verticalScale(10), textTransform: 'uppercase' },
  
  customBadge: { 
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255, 81, 0, 0.8)', paddingHorizontal: scale(10), 
    paddingVertical: verticalScale(6), borderRadius: moderateScale(8), gap: scale(6),
    borderWidth: 1, borderColor: MATCH_COLORS.primary
  },
  customBadgeText: { color: '#FFF', fontSize: moderateScale(10), fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  bottomSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
  textInfo: { flex: 1, paddingRight: scale(12) },
  title: { color: MATCH_COLORS.text, fontSize: moderateScale(18), fontWeight: '900', marginBottom: verticalScale(6), letterSpacing: 0.5 },
  
  muscleTag: { 
    alignSelf: 'flex-start', backgroundColor: '#121214', 
    paddingHorizontal: scale(10), paddingVertical: verticalScale(6), 
    borderRadius: moderateScale(8), borderWidth: 1, borderColor: '#1E1E24' 
  },
  muscleText: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(11), fontWeight: '800', textTransform: 'uppercase' },
  
  addButton: { 
    width: scale(46), height: scale(46), borderRadius: moderateScale(23), 
    backgroundColor: MATCH_COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: MATCH_COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5
  },
  
  studioButton: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: MATCH_COLORS.primaryGlow, 
    borderWidth: 1, borderColor: MATCH_COLORS.primary, paddingHorizontal: scale(14), 
    paddingVertical: verticalScale(10), borderRadius: moderateScale(12) 
  },
  studioButtonText: { color: MATCH_COLORS.primary, fontSize: moderateScale(11), fontWeight: '900', textTransform: 'uppercase' },
  
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(100) },
  emptyIconBg: { 
    width: scale(80), height: scale(80), borderRadius: moderateScale(40), 
    backgroundColor: MATCH_COLORS.primaryGlow, justifyContent: "center", 
    alignItems: "center", marginBottom: verticalScale(20), borderWidth: 1, 
    borderColor: MATCH_COLORS.borderNeon,
    shadowColor: MATCH_COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20
  },
  emptyTitle: { color: MATCH_COLORS.textDim, fontSize: moderateScale(15), fontWeight: '700' },
});