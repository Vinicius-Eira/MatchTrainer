import { StyleSheet, Platform } from "react-native";

export const MATCH_COLORS = {
  bg: '#050505',
  cardTransparent: 'rgba(18, 18, 20, 0.7)', 
  cardBorder: 'rgba(255, 255, 255, 0.06)',
  
  primary: '#FF5100',
  primaryNeon: 'rgba(255, 81, 0, 0.4)', 
  primaryDim: 'rgba(255, 81, 0, 0.12)',  
  
  textBase: '#FAFAFA',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
  
  success: '#00E676',
  successNeon: 'rgba(0, 230, 118, 0.4)',
  successDim: 'rgba(0, 230, 118, 0.15)',
};

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: MATCH_COLORS.bg },
  scrollContent: { paddingBottom: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: MATCH_COLORS.bg },
  
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 20, paddingBottom: 24 },
  btnVoltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: MATCH_COLORS.cardTransparent, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: MATCH_COLORS.cardBorder },
  headerTitles: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleCenter: { fontSize: 20, fontWeight: '900', color: MATCH_COLORS.textBase, letterSpacing: -0.5 },
  headerSubtitleCenter: { fontSize: 11, color: MATCH_COLORS.primary, fontWeight: '700', marginTop: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  headerSpacer: { width: 44 },

  heroCard: { 
    marginHorizontal: 20, backgroundColor: MATCH_COLORS.cardTransparent, 
    borderRadius: 24, padding: 24, 
    borderWidth: 1.5, borderColor: MATCH_COLORS.primaryNeon,
    marginBottom: 24,
    shadowColor: MATCH_COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heroObjective: { fontSize: 28, fontWeight: '900', color: MATCH_COLORS.textBase, marginBottom: 4, letterSpacing: -0.5 },
  heroLevel: { fontSize: 14, color: MATCH_COLORS.primary, fontWeight: '800', letterSpacing: 0.5, marginTop: 2 },
  
  heroBadge: { backgroundColor: MATCH_COLORS.primaryDim, borderWidth: 1, borderColor: MATCH_COLORS.primaryNeon, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  heroBadgeText: { color: MATCH_COLORS.primary, fontSize: 12, fontWeight: '900', marginLeft: 6, letterSpacing: 1 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBlock: { flex: 1 },
  statValue: { fontSize: 22, fontWeight: '900', color: MATCH_COLORS.textBase },
  statLabel: { fontSize: 11, color: MATCH_COLORS.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700' },
  
  progressBarContainer: { height: 6, backgroundColor: '#1A1A20', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  progressBarFill: { height: '100%', backgroundColor: MATCH_COLORS.primary, borderRadius: 3 },
  progressDisclaimer: { fontSize: 12, color: MATCH_COLORS.textDim },

  tabsContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: MATCH_COLORS.cardTransparent, borderRadius: 12, padding: 4, marginBottom: 30, borderWidth: 1, borderColor: MATCH_COLORS.cardBorder },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: MATCH_COLORS.primaryDim, borderWidth: 1, borderColor: MATCH_COLORS.primaryNeon },
  tabText: { fontSize: 14, fontWeight: '800', color: MATCH_COLORS.textMuted },
  tabTextActive: { color: MATCH_COLORS.primary },

  sectionTitle: { fontSize: 12, fontWeight: '900', color: MATCH_COLORS.textMuted, letterSpacing: 1.5, marginLeft: 20, marginBottom: 16 },
  listContainer: { paddingHorizontal: 20, gap: 16 },

  weekCard: { backgroundColor: MATCH_COLORS.cardTransparent, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: MATCH_COLORS.cardBorder },
  weekCardActive: { borderColor: MATCH_COLORS.primaryNeon, backgroundColor: MATCH_COLORS.primaryDim },
  weekCardContent: { flexDirection: 'row', alignItems: 'center' },
  weekIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: MATCH_COLORS.cardBorder },
  weekIconBoxActive: { backgroundColor: MATCH_COLORS.primaryDim, borderColor: MATCH_COLORS.primaryNeon, borderWidth: 1 },
  weekInfoContainer: { flex: 1 },
  
  weekHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  weekTitle: { fontSize: 18, fontWeight: 'bold', color: MATCH_COLORS.textBase },
  deloadBadge: { backgroundColor: MATCH_COLORS.primaryDim, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 10, borderWidth: 1, borderColor: MATCH_COLORS.primaryNeon },
  deloadText: { color: MATCH_COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  weekMetaText: { fontSize: 12, color: MATCH_COLORS.textDim, fontWeight: '600', textTransform: 'uppercase' },
  
  dayCard: { 
    backgroundColor: MATCH_COLORS.cardTransparent, 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1.5, 
    borderColor: MATCH_COLORS.primaryNeon, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: MATCH_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  dayCardCompleted: { borderColor: MATCH_COLORS.successNeon, backgroundColor: MATCH_COLORS.successDim },
  
  dayIconBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: MATCH_COLORS.primaryDim, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: MATCH_COLORS.primaryNeon },
  dayIconBoxCompleted: { backgroundColor: MATCH_COLORS.successDim, borderColor: MATCH_COLORS.successNeon },
  
  dayTitle: { fontSize: 18, fontWeight: '900', color: MATCH_COLORS.textBase, marginBottom: 4 },
  dayObjective: { fontSize: 14, color: MATCH_COLORS.textMuted, marginBottom: 12 },
  dayMetricsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dayMetricItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayMetricText: { fontSize: 13, color: MATCH_COLORS.textMuted, fontWeight: '600' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: MATCH_COLORS.textBase, marginTop: 20, marginBottom: 10 },
  emptySubtitle: { fontSize: 14, color: MATCH_COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  
  notesContainer: { marginHorizontal: 20, backgroundColor: MATCH_COLORS.primaryDim, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: MATCH_COLORS.primaryNeon, marginBottom: 24 },
  notesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  notesTitle: { color: MATCH_COLORS.primary, fontWeight: '900', fontSize: 12, marginLeft: 8, letterSpacing: 1 },
  notesText: { color: MATCH_COLORS.textBase, fontSize: 15, lineHeight: 24 },
});