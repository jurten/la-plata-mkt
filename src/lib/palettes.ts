export const paletteOptions = [
  {
    id: 'editorial',
    name: 'Editorial rosa',
    description: 'La identidad actual: directa, cálida y gráfica.',
    colors: {
      ink: '#111111',
      paper: '#FFFDF5',
      paperBright: '#FFFDF5',
      primary: '#B70D8A',
      primaryDark: '#B70D8A',
      accent: '#F4E600',
      sky: '#85D2FF',
      soft: '#FFC7DD',
      green: '#0D6B50',
    },
  },
  {
    id: 'cobalt',
    name: 'Cobalto cinético',
    description: 'Más tecnológico, nítido y orientado a producto.',
    colors: {
      ink: '#0B1020',
      paper: '#FFF9ED',
      paperBright: '#FFFDF7',
      primary: '#2146D0',
      primaryDark: '#16309C',
      accent: '#FFD600',
      sky: '#78D7FF',
      soft: '#F2B7D5',
      green: '#096B57',
    },
  },
  {
    id: 'petrol',
    name: 'Petróleo cítrico',
    description: 'Sobrio, estratégico y con energía digital.',
    colors: {
      ink: '#0A1714',
      paper: '#FFF9EC',
      paperBright: '#FFFDF6',
      primary: '#00685A',
      primaryDark: '#005247',
      accent: '#D8F000',
      sky: '#80D8E8',
      soft: '#D8C5FF',
      green: '#00685A',
    },
  },
  {
    id: 'burgundy',
    name: 'Borgoña botánico',
    description: 'Más institucional, premium y humano.',
    colors: {
      ink: '#18100E',
      paper: '#FFF8EF',
      paperBright: '#FFFDF8',
      primary: '#8C153F',
      primaryDark: '#6D0F30',
      accent: '#E4F04A',
      sky: '#9EE7D8',
      soft: '#F2B8C6',
      green: '#346B52',
    },
  },
] as const;

export type PaletteId = (typeof paletteOptions)[number]['id'];

const paletteIds = new Set<string>(paletteOptions.map(({ id }) => id));

export function resolvePalette(value: string | null | undefined): PaletteId {
  return value && paletteIds.has(value) ? (value as PaletteId) : 'editorial';
}

export function getPalette(id: PaletteId) {
  return paletteOptions.find((palette) => palette.id === id) ?? paletteOptions[0];
}
