export const themeChoices = [
  { id: 'light', shortLabel: 'L', accessibleLabel: 'Modo claro', title: 'Modo claro' },
  { id: 'auto', shortLabel: 'A', accessibleLabel: 'Usar preferencia del sistema', title: 'Automático' },
  { id: 'dark', shortLabel: 'D', accessibleLabel: 'Modo oscuro', title: 'Modo oscuro' },
] as const;

export const colorThemes = {
  light: {
    bg: '#F3EFE5',
    surface: '#FFFDF7',
    ink: '#111318',
    muted: '#56595F',
    blue: '#1536F1',
    blueText: '#1536F1',
    blueStrong: '#0D2CCF',
    sky: '#B7D7EE',
    signal: '#F4C430',
    pulse: '#F0442D',
    night: '#111318',
    onNight: '#F3EFE5',
    error: '#A62828',
  },
  dark: {
    bg: '#0B1238',
    surface: '#101944',
    ink: '#E9ECE7',
    muted: '#AEB9C9',
    blue: '#254BFF',
    blueText: '#5973FF',
    blueStrong: '#4968FF',
    sky: '#1A285E',
    signal: '#B8F35A',
    pulse: '#FF6A4C',
    night: '#070A17',
    onNight: '#E9ECE7',
    error: '#FF8A82',
  },
} as const;

export type ThemeChoice = (typeof themeChoices)[number]['id'];
