import type { Locale } from './i18n';

export const pages = {
  home: { es: '/', en: '/en/', label: 'Inicio' },
  work: { es: '/trabajos/', en: '/en/work/', label: 'Trabajos' },
  about: { es: '/nosotros/', en: '/en/about/', label: 'Nosotros' },
  contact: { es: '/contacto/', en: '/en/contact/', label: 'Contacto' },
  privacy: { es: '/privacidad/', en: '/en/privacy/', label: 'Privacidad' },
} as const;
export type PageId = keyof typeof pages;
export function pageId(pathname: string): PageId | undefined {
  const normalized = pathname.replace(/\/?$/, '/');
  return (Object.keys(pages) as PageId[]).find(id => pages[id].es === normalized || pages[id].en === normalized);
}
export function pagePath(id: PageId, locale: Locale) { return pages[id][locale]; }
export const contact = {
  whatsappHref: 'https://wa.me/5491158861954',
  whatsappDisplay: '+54 9 11 5886-1954',
  contactEmail: 'ceo@laplatamarketing.com',
};
