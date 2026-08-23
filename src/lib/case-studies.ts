export interface CaseStudyCopy {
  key: 'real-estate' | 'legal';
  label: string;
  name: string;
  nameLines: [string, string];
  summary: string;
  scope: string;
  mockupBrand: string;
  shortMark: string;
  ariaLabel: string;
}

const approvedCases: CaseStudyCopy[] = [
  {
    key: 'real-estate',
    label: 'Caso aprobado · mockup conceptual',
    name: 'Mirta Libera Propiedades',
    nameLines: ['Mirta Libera', 'Propiedades'],
    summary:
      'Una presencia social, un espacio para ordenar oportunidades y automatizaciones pensadas como partes del mismo recorrido de trabajo.',
    scope: 'Contenido, ingreso de consultas, organización y seguimiento.',
    mockupBrand: 'MIRTA LIBERA PROPIEDADES',
    shortMark: 'MLP',
    ariaLabel:
      'Mockups conceptuales de social media, CRM y automatizaciones para Mirta Libera Propiedades',
  },
  {
    key: 'legal',
    label: 'Caso aprobado · mockup conceptual',
    name: 'María Laumann Asociados',
    nameLines: ['María Laumann', 'Asociados'],
    summary:
      'Un sistema de contenidos y una experiencia web orientados a presentar información con claridad y abrir un camino directo hacia la consulta.',
    scope: 'Identidad de contenido, jerarquía web y puntos de contacto.',
    mockupBrand: 'ML / ASOCIADOS',
    shortMark: 'ML',
    ariaLabel: 'Mockups conceptuales de sitio web y social media para María Laumann Asociados',
  },
];

const reviewCases: CaseStudyCopy[] = [
  {
    key: 'real-estate',
    label: 'Caso en revisión · mockup conceptual',
    name: 'Proyecto inmobiliario',
    nameLines: ['Proyecto', 'Inmobiliario'],
    summary:
      'Borrador de alcance para conectar presencia social, oportunidades y automatizaciones. Pendiente de validación y autorización.',
    scope: 'Alcance a validar: contenido, ingreso de consultas, organización y seguimiento.',
    mockupBrand: 'PROYECTO INMOBILIARIO',
    shortMark: 'PI',
    ariaLabel: 'Mockups conceptuales para un proyecto inmobiliario en revisión',
  },
  {
    key: 'legal',
    label: 'Caso en revisión · mockup conceptual',
    name: 'Proyecto jurídico',
    nameLines: ['Proyecto', 'Jurídico'],
    summary:
      'Borrador de alcance para ordenar contenidos y una experiencia web. Pendiente de validación y autorización.',
    scope: 'Alcance a validar: identidad de contenido, jerarquía web y puntos de contacto.',
    mockupBrand: 'PROYECTO JURÍDICO',
    shortMark: 'PJ',
    ariaLabel: 'Mockups conceptuales para un proyecto jurídico en revisión',
  },
];

export function getCaseStudies(approved: boolean): CaseStudyCopy[] {
  return approved ? approvedCases : reviewCases;
}
