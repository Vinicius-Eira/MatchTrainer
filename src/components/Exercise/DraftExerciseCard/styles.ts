import { StyleSheet } from 'react-native';
import { scale, verticalScale } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0C',
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#1A1A20',
    marginHorizontal: scale(16),
  },
  activeCard: {
    borderColor: '#FF5100',
    backgroundColor: '#121214',
    transform: [{ scale: 1.02 }],
    shadowColor: '#FF5100',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 999,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(14),
  },
  dragHandle: {
    paddingRight: scale(10),
    paddingVertical: scale(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    paddingRight: scale(10),
  },
  title: {
    color: '#FFFFFF',
    fontSize: scale(15),
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },

  badgeRow: {
    flexDirection: 'row',
    gap: scale(6),
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#121214',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: '#1E1E24',
  },
  badgeText: {
    color: '#A0A0A5',
    fontSize: scale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  deleteBtn: {
    padding: scale(6),
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },

  body: {
    flexDirection: 'row',
    gap: scale(12),
  },

  mediaColumn: {
    width: scale(95),
    height: verticalScale(120),
    borderRadius: scale(12),
    backgroundColor: '#121214',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  editMediaBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(255, 81, 0, 0.9)',
    padding: 6,
    borderRadius: 12,
    zIndex: 10,
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: scale(12),
  },
  noMediaText: {
    color: '#777',
    fontSize: scale(10),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  inputsColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inputRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    color: '#888',
    fontSize: scale(10),
    marginBottom: verticalScale(4),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#1E1E24',
    borderRadius: scale(10),
    color: '#FFFFFF',
    fontSize: scale(14),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(8),
    textAlign: 'center',
    fontWeight: 'bold',
  },

  expandButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(16),
    paddingTop: verticalScale(14),
    borderTopWidth: 1,
    borderTopColor: '#1A1A20',
  },
  expandButtonText: {
    color: '#FF5100',
    fontSize: scale(12),
    fontWeight: '900',
    marginRight: scale(6),
    letterSpacing: 0.5,
  },

  expandedArea: {
    marginTop: verticalScale(16),
    gap: verticalScale(16),
  },
  detailGroup: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
    gap: scale(6),
  },
  detailLabel: {
    fontSize: scale(11),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textArea: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderRadius: scale(12),
    color: '#FFF',
    fontSize: scale(13),
    padding: scale(12),
    minHeight: verticalScale(70),
  },

  techniqueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
  },
  techPill: {
    backgroundColor: '#121214',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#1E1E24',
  },
  techPillActive: {
    backgroundColor: 'rgba(255, 81, 0, 0.15)',
    borderColor: '#FF5100',
  },
  techPillText: {
    color: '#888',
    fontSize: scale(11),
    fontWeight: '700',
  },
  techPillTextActive: {
    color: '#FF5100',
    fontWeight: '900',
  },
});