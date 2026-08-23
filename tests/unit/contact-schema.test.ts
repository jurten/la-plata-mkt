import { describe, expect, it } from 'vitest';
import { validateContactPayload } from '../../src/lib/contact-schema';

const validPayload = {
  company: '  Estudio Ejemplo  ',
  contactName: '  Ana Pérez  ',
  email: '  ana@example.com  ',
  issue: '  Necesitamos ordenar y responder mejor las consultas que llegan desde la web.  ',
  privacyAccepted: true,
  website: '',
};

describe('validateContactPayload', () => {
  it('acepta una consulta válida y normaliza sus campos', () => {
    const result = validateContactPayload(validPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        company: 'Estudio Ejemplo',
        contactName: 'Ana Pérez',
        email: 'ana@example.com',
        issue: 'Necesitamos ordenar y responder mejor las consultas que llegan desde la web.',
        privacyAccepted: true,
        website: '',
      });
    }
  });

  it('rechaza un email inválido', () => {
    const result = validateContactPayload({ ...validPayload, email: 'no-es-un-email' });

    expect(result.success).toBe(false);
  });

  it('rechaza una empresa vacía', () => {
    const result = validateContactPayload({ ...validPayload, company: '   ' });

    expect(result.success).toBe(false);
  });

  it('rechaza una descripción demasiado breve', () => {
    const result = validateContactPayload({ ...validPayload, issue: 'Necesito ayuda' });

    expect(result.success).toBe(false);
  });

  it('rechaza envíos que completan el honeypot', () => {
    const result = validateContactPayload({ ...validPayload, website: 'https://spam.example' });

    expect(result.success).toBe(false);
  });

  it('rechaza un nombre de contacto vacío', () => {
    const result = validateContactPayload({ ...validPayload, contactName: ' ' });

    expect(result.success).toBe(false);
  });

  it('rechaza saltos de línea en empresa y nombre de contacto', () => {
    expect(
      validateContactPayload({ ...validPayload, company: 'Empresa\r\nBcc: victim@example.com' }).success,
    ).toBe(false);
    expect(
      validateContactPayload({ ...validPayload, contactName: 'Ana\nX-Test: injected' }).success,
    ).toBe(false);
  });
});
