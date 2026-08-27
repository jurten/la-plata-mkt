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
        phone: '',
        issue: 'Necesitamos ordenar y responder mejor las consultas que llegan desde la web.',
        privacyAccepted: true,
        website: '',
      });
    }
  });

  it('acepta y normaliza un celular opcional', () => {
    const result = validateContactPayload({ ...validPayload, phone: '  +54 9 221 555-1234  ' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe('+54 9 221 555-1234');
    }
  });

  it.each([
    'llamame por WhatsApp',
    '+54 12',
    '1234567890123456',
  ])('rechaza un celular inválido: %s', (phone) => {
    expect(validateContactPayload({ ...validPayload, phone }).success).toBe(false);
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

  it('rechaza saltos de línea en empresa, nombre y celular', () => {
    expect(
      validateContactPayload({ ...validPayload, company: 'Empresa\r\nBcc: victim@example.com' }).success,
    ).toBe(false);
    expect(
      validateContactPayload({ ...validPayload, contactName: 'Ana\nX-Test: injected' }).success,
    ).toBe(false);
    expect(
      validateContactPayload({ ...validPayload, phone: '+54 9 221\r\nBcc: victim@example.com' }).success,
    ).toBe(false);
  });

  it.each([
    ['company', '\rEmpresa'],
    ['company', 'Empresa\n'],
    ['contactName', '\nAna Pérez'],
    ['contactName', 'Ana Pérez\r'],
    ['phone', '\n+54 9 221 555-1234'],
    ['phone', '+54 9 221 555-1234\r'],
  ] as const)('rechaza CR/LF de borde en %s antes de normalizar', (field, value) => {
    expect(validateContactPayload({ ...validPayload, [field]: value }).success).toBe(false);
  });
});
