// GridPulse Mobile Commander — Design System Colors
export const Colors = {
  // Primary palette
  primary: '#00D4FF',
  primaryDark: '#00A3CC',
  primaryLight: '#4DE3FF',
  accent: '#0EA5E9',
  accentDark: '#0284C7',

  // Status colors
  success: '#22C55E',
  successDark: '#16A34A',
  warning: '#F59E0B',
  warningDark: '#D97706',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  info: '#3B82F6',
  infoDark: '#2563EB',

  // Backgrounds (dark mode)
  background: '#050B18',
  backgroundLight: '#0B1426',
  surface: '#111D35',
  surfaceLight: '#182745',
  surfaceElevated: '#213359',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Borders
  border: '#334155',
  borderLight: '#475569',

  // Gradients (for LinearGradient)
  gradientPrimary: ['#00D4FF', '#0EA5E9'],
  gradientSuccess: ['#22C55E', '#16A34A'],
  gradientDanger: ['#EF4444', '#F59E0B'],
  gradientDark: ['#050B18', '#111D35'],
  gradientCard: ['rgba(17,29,53,0.9)', 'rgba(5,11,24,0.95)'],

  // Severity colors
  severityLow: '#22C55E',
  severityMedium: '#F59E0B',
  severityHigh: '#EF4444',
  severityCritical: '#DC2626',

  // Map specific
  corridorGreen: '#22C55E',
  corridorBlue: '#00D4FF',
  congestionRed: '#EF4444',
  hotspotOrange: '#F59E0B',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.4)',
  glassBg: 'rgba(17,29,53,0.7)',
  glassBorder: 'rgba(0,212,255,0.2)',
};

export const getSeverityColor = (score) => {
  if (score >= 75) return Colors.severityCritical;
  if (score >= 50) return Colors.severityHigh;
  if (score >= 25) return Colors.severityMedium;
  return Colors.severityLow;
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return Colors.danger;
    case 'medium': return Colors.warning;
    case 'low': return Colors.success;
    default: return Colors.textSecondary;
  }
};
