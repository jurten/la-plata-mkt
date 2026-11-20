export const workServices = [
  { id: 'all', label: 'Todos' }, { id: 'content', label: 'Contenido' },
  { id: 'web', label: 'Web' }, { id: 'systems', label: 'Sistemas' },
] as const;
export interface ProjectLink { label: string; url: string }
// Public concepts only. Add an external URL only when a real demo is supplied.
export const projects = [
  { id: 'proyecto-inmobiliario', type: 'real-estate' as const, title: 'Demanda, atención y seguimiento', category: 'Proyecto inmobiliario', summary: 'Una presencia social, un espacio para ordenar oportunidades y automatizaciones pensadas como partes del mismo recorrido de trabajo.', scope: 'Contenido, ingreso de consultas, organización y seguimiento.', url: null as string | null },
  { id: 'proyecto-juridico', type: 'legal' as const, title: 'Credibilidad que convierte', category: 'Proyecto jurídico', summary: 'Un sistema de contenidos y una experiencia web orientados a presentar información con claridad y abrir un camino directo hacia la consulta.', scope: 'Identidad de contenido, jerarquía web y puntos de contacto.', url: null as string | null },
  { id: 'proyecto-sistema', type: 'automation' as const, title: 'Cada consulta, un próximo paso', category: 'Sistema comercial', summary: 'Un ejemplo de cómo conectar el ingreso de consultas, la organización de contactos y el seguimiento en un mismo recorrido.', scope: 'CRM, automatizaciones e integración de canales.', url: null as string | null },
];

export const projectDetails = {
  'real-estate': {
    industry: 'Inmobiliario', services: ['Contenido', 'CRM', 'Automatizaciones'], filters: ['content', 'systems'],
    problem: 'Cómo conectar la presencia social, el ingreso de consultas y el seguimiento de oportunidades en un mismo recorrido.',
    pieces: ['Contenido', 'Ingreso de consultas', 'Organización', 'Seguimiento'], links: [] as ProjectLink[],
  },
  legal: {
    industry: 'Servicios jurídicos', services: ['Contenido', 'Web'], filters: ['content', 'web'],
    problem: 'Cómo presentar la información de un estudio jurídico con claridad y abrir un camino directo hacia la consulta.',
    pieces: ['Identidad de contenido', 'Jerarquía web', 'Puntos de contacto'], links: [] as ProjectLink[],
  },
  automation: {
    industry: 'Gestión comercial', services: ['CRM', 'Automatizaciones', 'Integraciones'], filters: ['systems'],
    problem: 'Cómo conectar el ingreso de consultas, la organización de contactos y el seguimiento en un mismo recorrido.',
    pieces: ['CRM', 'Automatizaciones', 'Integración de canales'], links: [] as ProjectLink[],
  },
} as const;
export type Project = typeof projects[number];
export function projectPath(project: Project, locale: 'es' | 'en') {
  return `${locale === 'en' ? '/en/work' : '/trabajos'}/${project.id}/`;
}
