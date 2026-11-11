import { StyleSheet } from 'react-native';
import { theme } from '../../../../../../../theme/theme';
import { moderateScale } from '../../../../../../../utils/responsive';

export const localStyles = StyleSheet.create({
  bentoCard: {
    flex: 1, backgroundColor: '#0D0D0F', borderRadius: 16, padding: 16, 
    marginHorizontal: 4, marginBottom: 12, borderWidth: 1, borderColor: '#1C1C1F'
  },
  bentoHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bentoIcon: { marginRight: 6 },
  bentoTitle: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bentoValueRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  bentoValue: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  bentoUnit: { color: "#666", fontSize: 12, marginLeft: 4, fontWeight: '600' },
  bentoDesc: { color: '#555', fontSize: 9, lineHeight: 12, marginTop: 'auto' },
  
  desempenhoHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  desempenhoTitle: { color: '#888', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  desempenhoDesc: { color: '#555', fontSize: 9, lineHeight: 12 },

  btnNovaAvaliacao: {
    backgroundColor: 'rgba(255, 107, 0, 0.05)', borderRadius: 16, paddingVertical: 16, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    marginBottom: 20, borderWidth: 1, borderColor: theme.colors.primary
  },
  btnNovaAvaliacaoText: {
    color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: 'bold', letterSpacing: 0.5
  },

  tabSelectorRow: {
    flexDirection: 'row', backgroundColor: '#111', borderRadius: 8, padding: 4, marginBottom: 20
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6
  },
  tabText: {
    fontWeight: 'bold', fontSize: 12
  },

  resumoCard: {
    backgroundColor: '#0D0D0F', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1C1C1F', marginBottom: 25
  },
  resumoTitle: { color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  resumoValoresRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  resumoLabel: { color: '#666', fontSize: 11, fontWeight: '600' },
  resumoBigValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  resumoBigValue: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  resumoBigUnit: { color: '#888', fontSize: 14, fontWeight: '700', marginLeft: 4 },
  resumoDivider: { width: 1, height: 40, backgroundColor: '#222', marginHorizontal: 15 },
  resumoMetaValue: { color: '#FF6B00', fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  
  estadoBadgeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#151515', padding: 12, borderRadius: 12
  },
  estadoBadge: {
    backgroundColor: 'rgba(255,107,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)'
  },
  
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginLeft: 4 },
  rowMarginMinus: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 25 },
  
  freqCard: {
    backgroundColor: '#0A0A0A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1C1C1F', marginBottom: 25
  },
  emptyCard: {
    padding: 20, backgroundColor: "#0A0A0A", borderRadius: 16, borderWidth: 1, 
    borderColor: "#1C1C1F", alignItems: "center"
  },
  
  tmbCard: {
    backgroundColor: '#1A0F00', borderRadius: 16, padding: 16, marginHorizontal: -4, 
    marginTop: 4, marginBottom: 30, borderWidth: 1, borderColor: '#FF6B0040', 
    flexDirection: 'row', alignItems: 'center'
  },
  tmbIconBg: { backgroundColor: '#FF6B0020', padding: 14, borderRadius: 12, marginRight: 15 },
  
  segmentarBg: {
    backgroundColor: '#0A0A0A', borderRadius: 24, paddingVertical: 40, alignItems: 'center', 
    justifyContent: 'center', borderWidth: 1, borderColor: '#1C1C1F', position: 'relative'
  },
  badgeSegmentar: {
    position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 8
  }
});