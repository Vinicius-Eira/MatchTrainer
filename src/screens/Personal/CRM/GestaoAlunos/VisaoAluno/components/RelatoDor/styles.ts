import { StyleSheet } from 'react-native';

export const localStyles = StyleSheet.create({
  redFlagCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 14,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  redFlagTitle: { 
    color: '#EF4444', 
    fontSize: 13, 
    fontWeight: '900', 
    letterSpacing: 0.8 
  },
  redFlagSub: { 
    color: '#A1A1AA', 
    fontSize: 13, 
    marginTop: 4, 
    lineHeight: 18 
  },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.88)', 
    justifyContent: 'flex-end' 
  },
  modalContainer: { 
    backgroundColor: '#09090B', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    maxHeight: '90%', 
    borderTopWidth: 1, 
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#27272A',
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  modalTitle: { 
    color: '#FAFAFA', 
    fontSize: 21, 
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalDate: { 
    color: '#71717A', 
    fontSize: 13, 
    marginTop: 3, 
    fontWeight: '600' 
  },
  closeBtn: { 
    padding: 10, 
    backgroundColor: '#18181B', 
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.07)',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    marginBottom: 14,
  },
  exerciseValue: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },

  topPanelRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 16 
  },
  panelBox: { 
    flex: 1, 
    backgroundColor: '#121215', 
    padding: 16, 
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: '#27272A' 
  },
  panelLabel: { 
    color: '#A1A1AA', 
    fontSize: 11, 
    fontWeight: '900', 
    letterSpacing: 1, 
    marginBottom: 6 
  },
  panelValueDor: { 
    color: '#EF4444', 
    fontSize: 22, 
    fontWeight: '900' 
  },
  panelValueTexto: { 
    color: '#F4F4F5', 
    fontSize: 15, 
    fontWeight: '700', 
    lineHeight: 21 
  },
  
  descBox: { 
    backgroundColor: '#121215', 
    padding: 18, 
    borderRadius: 18, 
    marginBottom: 22, 
    borderWidth: 1,
    borderColor: '#27272A',
    borderLeftWidth: 4, 
    borderLeftColor: '#FF5500' 
  },
  descText: { 
    color: '#E4E4E7', 
    fontSize: 15, 
    fontStyle: 'italic', 
    marginTop: 4, 
    lineHeight: 23 
  },
  
  resolveInfo: { 
    color: '#71717A', 
    fontSize: 12, 
    textAlign: 'center', 
    marginBottom: 18, 
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  resolveBtn: { 
    backgroundColor: 'transparent', 
    paddingVertical: 18, 
    paddingHorizontal: 20,
    borderRadius: 16, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF5500',
    shadowColor: '#FF5500', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 14,
  },
  resolveBtnText: { 
    color: '#FF5500', 
    fontSize: 14, 
    fontWeight: '900', 
    letterSpacing: 1 
  }
});