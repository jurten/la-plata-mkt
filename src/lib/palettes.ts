export const paletteOptions = [
  {
    id: 'registro',
    name: 'Registro activo',
    description: 'La identidad nueva: azul institucional, rojo señal y amarillo marcador.',
    colors: {
      ink: '#17292D',
      muted: '#4B5B5E',
      paper: '#F3EEE6',
      surface: '#FFF9F0',
      primary: '#1D62A8',
      primaryStrong: '#154C86',
      highlight: '#F2D31B',
      secondary: '#8EC5E6',
      signal: '#FC4C5A',
      success: '#276749',
      error: '#A62828',
    },
  },
  {
    id: 'manchette',
    name: 'Manchette rojo',
    description: 'El rojo toma el frente con pulso cultural y alta urgencia.',
    colors: {
      ink: '#1B272B',
      muted: '#4B595C',
      paper: '#F1ECE4',
      surface: '#FFF8EE',
      primary: '#B72730',
      primaryStrong: '#8E1C25',
      highlight: '#F3D21A',
      secondary: '#82B9DE',
      signal: '#F36A63',
      success: '#2A674D',
      error: '#981F26',
    },
  },
  {
    id: 'archivo',
    name: 'Archivo tinta',
    description: 'Más sereno y documental, con petróleo profundo y papel de archivo.',
    colors: {
      ink: '#1A2C31',
      muted: '#4A5B5F',
      paper: '#EEE9E1',
      surface: '#FBF7F0',
      primary: '#1F5C5A',
      primaryStrong: '#154746',
      highlight: '#EBCB32',
      secondary: '#A0CDD2',
      signal: '#F16A62',
      success: '#30684F',
      error: '#A32B2B',
    },
  },
  {
    id: 'sobreimpresion',
    name: 'Sobreimpresión',
    description: 'Cruza azul y rojo como tintas superpuestas sobre papel cálido.',
    colors: {
      ink: '#15272C',
      muted: '#46595D',
      paper: '#F4EBDD',
      surface: '#FFF8EC',
      primary: '#284F82',
      primaryStrong: '#193A66',
      highlight: '#EBC823',
      secondary: '#F27A70',
      signal: '#79B5DE',
      success: '#2A684F',
      error: '#A52B2F',
    },
  },
] as const;

export type PaletteId = (typeof paletteOptions)[number]['id'];

const paletteIds = new Set<string>(paletteOptions.map(({ id }) => id));

export function resolvePalette(value: string | null | undefined): PaletteId {
  return value && paletteIds.has(value) ? (value as PaletteId) : 'registro';
}

export function getPalette(id: PaletteId) {
  return paletteOptions.find((palette) => palette.id === id) ?? paletteOptions[0];
}
