export const themeChoices = [
  { id: 'light', icon: 'sun', accessibleLabel: 'Modo claro', title: 'Modo claro' },
  { id: 'dark', icon: 'moon', accessibleLabel: 'Modo oscuro', title: 'Modo oscuro' },
] as const;

export const colorThemes = {
  light: {
    bg: '#EEF2FF',
    surface: '#F8FAFF',
    ink: '#0B1430',
    muted: '#4F5E7D',
    blue: '#1536F1',
    blueText: '#1536F1',
    blueStrong: '#0D2CCF',
    sky: '#B7D7EE',
    signal: '#F4C430',
    pulse: '#F0442D',
    night: '#020307',
    onNight: '#EEF2FF',
    error: '#A62828',
  },
  dark: {
    bg: '#060917',
    surface: '#0C142A',
    ink: '#EDF2FF',
    muted: '#A8B6D0',
    blue: '#254BFF',
    blueText: '#91A5FF',
    blueStrong: '#4563ED',
    sky: '#1A285E',
    signal: '#B8F35A',
    pulse: '#FF6A4C',
    night: '#020307',
    onNight: '#EDF2FF',
    error: '#FF8A82',
  },
} as const;

export type ThemeChoice = (typeof themeChoices)[number]['id'];
