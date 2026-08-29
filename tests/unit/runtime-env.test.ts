import { afterEach, describe, expect, it } from 'vitest';
import { readRuntimeEnv } from '../../src/lib/runtime-env';

const TEST_KEY = 'LPM_RUNTIME_ENV_TEST';
const originalValue = process.env[TEST_KEY];

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env[TEST_KEY];
  } else {
    process.env[TEST_KEY] = originalValue;
  }
});

describe('readRuntimeEnv', () => {
  it('prefiere el binding disponible en el runtime', () => {
    process.env[TEST_KEY] = 'worker-value';

    expect(readRuntimeEnv(TEST_KEY, 'build-value')).toBe('worker-value');
  });

  it('usa el valor de build cuando el runtime no lo define', () => {
    delete process.env[TEST_KEY];

    expect(readRuntimeEnv(TEST_KEY, 'build-value')).toBe('build-value');
  });

  it('conserva un binding vacío para poder desactivar una integración', () => {
    process.env[TEST_KEY] = '';

    expect(readRuntimeEnv(TEST_KEY, 'build-value')).toBe('');
  });
});
