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

test('el éxito live confirma la recepción sin prometer una autorespuesta', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, delivery: 'live' }),
    });
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

  const status = page.getByRole('status');
  await expect(status).toHaveText('¡Listo! Recibimos tu consulta.');
  await expect(status).not.toContainText('te enviamos una confirmación');
});

test('reinicia Turnstile también cuando el servidor rechaza la consulta', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as typeof window & {
      __turnstileResetCount: number;
      turnstile: { reset: () => void };
    };
    state.__turnstileResetCount = 0;
    state.turnstile = { reset: () => { state.__turnstileResetCount += 1; } };
  });
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'delivery' }),
    });
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

  await expect(page.getByRole('status')).toContainText('No pudimos enviar la consulta.');
  expect(
    await page.evaluate(() => (window as typeof window & { __turnstileResetCount: number }).__turnstileResetCount),
  ).toBe(1);
});

test('el navegador aplica los mismos límites básicos que el servidor', async ({ page }) => {
  let requestCount = 0;
  await page.route('**/api/contact', async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, delivery: 'demo' }),
    });
  });
  await page.goto('/#contacto');

  const company = page.getByLabel('Empresa');
  const contactName = page.getByLabel('Nombre de contacto');
  const issue = page.getByLabel('¿Qué problema querés resolver?');
  await expect(company).toHaveAttribute('minlength', '2');
  await expect(company).toHaveAttribute('maxlength', '120');
  await expect(contactName).toHaveAttribute('minlength', '2');
  await expect(contactName).toHaveAttribute('maxlength', '80');
  await expect(issue).toHaveAttribute('minlength', '20');
  await expect(issue).toHaveAttribute('maxlength', '2000');

  await company.fill('Estudio Ejemplo');
  await contactName.fill('Ana Pérez');
  await page.getByLabel('Email').fill('ana@example.com');
  await issue.fill('Muy breve');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar consulta' }).click();

  expect(await issue.evaluate((element) => (element as HTMLTextAreaElement).validity.tooShort)).toBe(true);
  expect(requestCount).toBe(0);
});
