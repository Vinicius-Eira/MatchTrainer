import { StyleSheet, Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';
import { MATCH_COLORS } from './useExerciseLibrary';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MATCH_COLORS.surfaceDark },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: scale(20), 
    paddingTop: Platform.OS === 'android' ? verticalScale(40) : verticalScale(10), 
    paddingBottom: verticalScale(16) 
  },
  iconButton: { 
    width: scale(40), height: scale(40), 
    borderRadius: moderateScale(12), 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    justifyContent: "center", alignItems: "center", 
    borderWidth: 1, borderColor: MATCH_COLORS.borderLight 
  },
  iconButtonPrimary: { 
    width: scale(40), height: scale(40), 
    borderRadius: moderateScale(12), 
    backgroundColor: MATCH_COLORS.primary, 
    justifyContent: "center", alignItems: "center" 
  },
  headerTitle: { color: MATCH_COLORS.text, fontSize: moderateScale(14), fontWeight: '900', letterSpacing: 1 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    marginHorizontal: scale(20), paddingHorizontal: scale(16), 
    borderRadius: moderateScale(14), borderWidth: 1, 
    borderColor: MATCH_COLORS.borderLight, height: verticalScale(48) 
  },
  searchIcon: { marginRight: scale(8) },
  
  // CORREÇÃO AQUI 👇 (removido o outlineStyle)
  searchInput: { flex: 1, color: MATCH_COLORS.text, fontSize: moderateScale(14) },
  
  filtersWrapper: { marginVertical: verticalScale(16) },
  filtersContainer: { paddingHorizontal: scale(20), gap: scale(8) },
  filterChip: { 
    paddingHorizontal: scale(16), paddingVertical: verticalScale(8), 
    borderRadius: moderateScale(20), backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    borderWidth: 1, borderColor: MATCH_COLORS.borderLight 
  },
  filterChipActive: { backgroundColor: MATCH_COLORS.primaryGlow, borderColor: MATCH_COLORS.primary },
  filterChipText: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(12), fontWeight: '600' },
  filterChipTextActive: { color: MATCH_COLORS.primary, fontWeight: '800' },
  listContent: { paddingHorizontal: scale(20), paddingBottom: verticalScale(40) },
  cardWrapper: { 
    marginBottom: verticalScale(16), shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, 
    shadowRadius: 10, elevation: 8 
  },
  card: { 
    height: verticalScale(200), borderRadius: moderateScale(20), 
    overflow: 'hidden', backgroundColor: MATCH_COLORS.surfaceDark, 
    borderWidth: 1, borderColor: MATCH_COLORS.borderLight 
  },
  content: { flex: 1, padding: scale(16), justifyContent: 'space-between', zIndex: 2 },
  uploadingOverlay: { 
    ...StyleSheet.absoluteFill, backgroundColor: 'rgba(9, 9, 11, 0.8)', 
    justifyContent: 'center', alignItems: 'center', zIndex: 10 
  },
  uploadingText: { color: MATCH_COLORS.text, fontSize: moderateScale(12), fontWeight: '700', marginTop: verticalScale(10) },
  customBadge: { 
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', 
    backgroundColor: MATCH_COLORS.primary, paddingHorizontal: scale(10), 
    paddingVertical: verticalScale(4), borderRadius: moderateScale(8), gap: scale(4) 
  },
  customBadgeText: { color: '#000', fontSize: moderateScale(10), fontWeight: '900', textTransform: 'uppercase' },
  bottomSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
  textInfo: { flex: 1, paddingRight: scale(12) },
  title: { color: MATCH_COLORS.text, fontSize: moderateScale(18), fontWeight: '900', marginBottom: verticalScale(4), letterSpacing: 0.5 },
  muscleTag: { 
    alignSelf: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    paddingHorizontal: scale(10), paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(10), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' 
  },
  muscleText: { color: MATCH_COLORS.text, fontSize: moderateScale(11), fontWeight: '700' },
  addButton: { 
    width: scale(40), height: scale(40), borderRadius: moderateScale(20), 
    backgroundColor: MATCH_COLORS.primary, justifyContent: 'center', alignItems: 'center' 
  },
  studioButton: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 81, 0, 0.15)', 
    borderWidth: 1, borderColor: MATCH_COLORS.primary, paddingHorizontal: scale(14), 
    paddingVertical: verticalScale(8), borderRadius: moderateScale(12) 
  },
  studioButtonText: { color: MATCH_COLORS.primary, fontSize: moderateScale(11), fontWeight: '800', textTransform: 'uppercase' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(80) },
  emptyIconBg: { 
    width: scale(64), height: scale(64), borderRadius: moderateScale(20), 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', justifyContent: "center", 
    alignItems: "center", marginBottom: verticalScale(16), borderWidth: 1, 
    borderColor: MATCH_COLORS.borderLight 
  },
  emptyTitle: { color: MATCH_COLORS.textDim, marginTop: verticalScale(8), fontSize: moderateScale(14), fontWeight: '600' },
});