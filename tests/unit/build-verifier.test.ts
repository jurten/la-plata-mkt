import { describe, expect, it } from 'vitest';
import { verifyPrerenderedHtmlPages } from '../../scripts/verify-build.mjs';

function html(head: string): string {
  return `<!DOCTYPE html><html><head><title>La Plata Marketing</title>${head}</head><body>${'contenido '.repeat(
    150,
  )}</body></html>`;
}

const pages = (head: string) => [
  { path: 'index.html', pathname: '/', html: html(head) },
  { path: 'privacidad/index.html', pathname: '/privacidad/', html: html(head) },
];

describe('verificador de HTML prerenderizado', () => {
  it('acepta un único canonical aunque use otro orden, comillas simples y mayúsculas', () => {
    const result = verifyPrerenderedHtmlPages(
      [
        {
          path: 'index.html',
          pathname: '/',
          html: html(`<LINK HREF='https://safe.example/' REL='canonical'><meta name="robots" content="index, follow">`),
        },
        {
          path: 'privacidad/index.html',
          pathname: '/privacidad/',
          html: html(
            `<link href='https://safe.example/privacidad/' rel='CANONICAL'><meta name="robots" content="index, follow">`,
          ),
        },
      ],
      'https://safe.example',
    );

    expect(result).toBe('configured');
  });

  it('rechaza más de un canonical aunque el primero sea seguro', () => {
    expect(() =>
      verifyPrerenderedHtmlPages(
        pages(
          `<link rel="canonical" href="https://safe.example/"><link href='https://evil.example/' rel='canonical'><meta name="robots" content="index, follow">`,
        ),
        'https://safe.example',
      ),
    ).toThrow(/exactamente un canonical/i);
  });

  it('no trata como unconfigured un canonical con orden alternativo', () => {
    expect(() =>
      verifyPrerenderedHtmlPages(
        pages(`<link href='https://evil.example/' rel='canonical'><meta name="robots" content="noindex, nofollow">`),
      ),
    ).toThrow(/noindex/i);
  });

  it('rechaza atributos href duplicados dentro del canonical', () => {
    expect(() =>
      verifyPrerenderedHtmlPages(
        pages(
          `<link rel="canonical" href="https://safe.example/" href="https://evil.example/"><meta name="robots" content="index, follow">`,
        ),
        'https://safe.example',
      ),
    ).toThrow(/atributo href duplicado/i);
  });

  it('ignora canonicals dentro de comentarios HTML', () => {
    expect(
      verifyPrerenderedHtmlPages(
        pages(
          `<!-- <link rel="canonical" href="https://evil.example/"> --><meta name="robots" content="noindex, nofollow">`,
        ),
      ),
    ).toBe('unconfigured');
  });

  it('no acepta noindex que solo exista dentro de un comentario', () => {
    expect(() =>
      verifyPrerenderedHtmlPages(pages(`<!-- <meta name="robots" content="noindex, nofollow"> -->`)),
    ).toThrow(/debe publicar noindex/i);
  });

  it('ignora etiquetas aparentes dentro de script y template', () => {
    const inert = `<script type="application/json">{"tag":"<link rel='canonical' href='https://evil.example/'>"}</script><template><link rel="canonical" href="https://evil.example/"></template><meta name="robots" content="noindex, nofollow">`;
    expect(verifyPrerenderedHtmlPages(pages(inert))).toBe('unconfigured');
  });

  it('decodifica referencias HTML dentro de rel antes de decidir el modo', () => {
    expect(() =>
      verifyPrerenderedHtmlPages(
        pages(
          `<link href="https://evil.example/" rel="can&#111;nical"><meta name="robots" content="noindex, nofollow">`,
        ),
      ),
    ).toThrow(/noindex/i);
  });

  it('no separa tokens rel usando espacios Unicode que HTML no reconoce', () => {
    const nbsp = '\u00a0';
    expect(() =>
      verifyPrerenderedHtmlPages(
        [
          {
            path: 'index.html',
            pathname: '/',
            html: html(
              `<link href="https://safe.example/" rel="x${nbsp}canonical"><meta name="robots" content="index, follow">`,
            ),
          },
          {
            path: 'privacidad/index.html',
            pathname: '/privacidad/',
            html: html(
              `<link href="https://safe.example/privacidad/" rel="x${nbsp}canonical"><meta name="robots" content="index, follow">`,
            ),
          },
        ],
        'https://safe.example',
      ),
    ).toThrow(/canonical ausente/i);
  });

  it('no recorta NBSP alrededor de href como si fuera espacio URL válido', () => {
    const nbsp = '\u00a0';
    expect(() =>
      verifyPrerenderedHtmlPages(
        [
          {
            path: 'index.html',
            pathname: '/',
            html: html(
              `<link href="${nbsp}https://safe.example/${nbsp}" rel="canonical"><meta name="robots" content="index, follow">`,
            ),
          },
          {
            path: 'privacidad/index.html',
            pathname: '/privacidad/',
            html: html(
              `<link href="${nbsp}https://safe.example/privacidad/${nbsp}" rel="canonical"><meta name="robots" content="index, follow">`,
            ),
          },
        ],
        'https://safe.example',
      ),
    ).toThrow(/canonical/i);
  });

  it('no interpreta NBSP como espacio alrededor de la directiva noindex', () => {
    const nbsp = '\u00a0';
    expect(() =>
      verifyPrerenderedHtmlPages(
        pages(`<meta name="robots" content="other,${nbsp}noindex">`),
      ),
    ).toThrow(/debe publicar noindex/i);
  });

  it('no acepta un title que pertenezca al namespace SVG', () => {
    const svgTitle = `<!DOCTYPE html><html><head><svg><title>Falso</title></svg><meta name="robots" content="noindex, nofollow"></head><body>${'contenido '.repeat(
      150,
    )}</body></html>`;
    expect(() =>
      verifyPrerenderedHtmlPages([
        { path: 'index.html', pathname: '/', html: svgTitle },
        { path: 'privacidad/index.html', pathname: '/privacidad/', html: svgTitle },
      ]),
    ).toThrow(/no contiene title/i);
  });

  it('ignora links canonical que pertenezcan al namespace SVG', () => {
    const svgLink = `<!DOCTYPE html><html><head><title>La Plata Marketing</title><meta name="robots" content="noindex, nofollow"></head><body><svg><link rel="canonical" href="https://evil.example/"></link></svg>${'contenido '.repeat(
      150,
    )}</body></html>`;
    expect(
      verifyPrerenderedHtmlPages([
        { path: 'index.html', pathname: '/', html: svgLink },
        { path: 'privacidad/index.html', pathname: '/privacidad/', html: svgLink },
      ]),
    ).toBe('unconfigured');
  });

  it('trata robots none como noindex en páginas configured', () => {
    expect(() =>
      verifyPrerenderedHtmlPages(
        [
          {
            path: 'index.html',
            pathname: '/',
            html: html(
              `<link rel="canonical" href="https://safe.example/"><meta name="robots" content="none">`,
            ),
          },
          {
            path: 'privacidad/index.html',
            pathname: '/privacidad/',
            html: html(
              `<link rel="canonical" href="https://safe.example/privacidad/"><meta name="robots" content="none">`,
            ),
          },
        ],
        'https://safe.example',
      ),
    ).toThrow(/noindex/i);
  });

  it('acepta robots none como protección de páginas unconfigured', () => {
    expect(verifyPrerenderedHtmlPages(pages(`<meta name="robots" content="none">`))).toBe(
      'unconfigured',
    );
  });

  it('acepta páginas unconfigured sin canonical y con noindex', () => {
    expect(
      verifyPrerenderedHtmlPages(pages(`<meta name="robots" content="noindex, nofollow">`)),
    ).toBe('unconfigured');
  });
});
