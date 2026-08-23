import { expect, test } from '@playwright/test';

test('una consulta válida se procesa sin abandonar la página y declara el modo demo', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as typeof window & {
      __turnstileResetCount: number;
      turnstile: { reset: () => void };
    };
    state.__turnstileResetCount = 0;
    state.turnstile = { reset: () => { state.__turnstileResetCount += 1; } };
  });
  await page.goto('/#contacto');

  await page.getByLabel('Empresa').fill('Estudio Ejemplo');
  await page.getByLabel('Nombre de contacto').fill('Ana Pérez');
  await page.getByLabel('Email').fill('ana@example.com');
  await page
    .getByLabel('¿Qué problema querés resolver?')
    .fill('Necesitamos ordenar las consultas que llegan desde la web y mejorar su seguimiento.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar consulta' }).click();

  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.getByRole('status')).toContainText(
    'Modo demo: la consulta fue validada, pero el email todavía no fue enviado.',
  );
  await expect(page.getByLabel('Empresa')).toHaveValue('');
  expect(
    await page.evaluate(() => (window as typeof window & { __turnstileResetCount: number }).__turnstileResetCount),
  ).toBe(1);
});
