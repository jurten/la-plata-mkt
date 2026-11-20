import { expect, it } from 'vitest';
import { pages, pageId } from '../../src/lib/navigation';
import { localizedPath } from '../../src/lib/i18n';

it('resuelve todas las rutas, variantes sin barra y parejas de idiomas', () => {
  for (const [id, page] of Object.entries(pages)) {
    for (const route of [page.es, page.en, page.es.replace(/\/$/, ''), page.en.replace(/\/$/, '')]) {
      expect(pageId(route || '/')).toBe(id);
      expect(localizedPath(route || '/', 'es')).toBe(page.es);
      expect(localizedPath(route || '/', 'en')).toBe(page.en);
    }
  }
  expect(pageId('/missing/')).toBeUndefined();
});
