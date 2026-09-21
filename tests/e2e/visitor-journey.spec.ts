import { expect, test } from '@playwright/test';

test('ofrece WhatsApp como canal directo sin escribir texto por el usuario', async ({ page }) => {
  await page.goto('/#contacto');

  const accessibleName = 'Escribir a La Plata Marketing por WhatsApp al +54 9 11 5886-1954';
  const channels = page
    .locator('#contacto')
    .getByRole('group', { name: 'Canales de contacto directo' });
  const contactLink = channels.getByRole('link', { name: accessibleName });
  await expect(contactLink).toBeVisible();
  await expect(contactLink).toContainText('+54 9 11 5886-1954');

  const href = await contactLink.getAttribute('href');
  expect(href).not.toBeNull();
  expect(href).toBe('https://wa.me/5491158861954');
  const whatsappUrl = new URL(href!);
  expect(whatsappUrl.origin).toBe('https://wa.me');
  expect(whatsappUrl.pathname).toBe('/5491158861954');
  expect(whatsappUrl.search).toBe('');
  expect(whatsappUrl.searchParams.get('text')).toBeNull();

  const footerLink = page.locator('footer').getByRole('link', { name: accessibleName });
  await expect(footerLink).toHaveAttribute('href', href!);
});

test('una visita reconoce su problema, elige un camino y llega al formulario', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Hacemos que todo trabaje como un sistema.' }),
  ).toBeVisible();
  await expect(page.getByText('LPM / Marketing × Tecnología × Ventas', { exact: true })).toBeVisible();

  const problems = page.locator('#problemas');
  await expect(problems.getByRole('heading', { name: 'Tu negocio funciona. ¿Su sistema digital también?' })).toBeVisible();
  await expect(problems.locator('.problem-item')).toHaveCount(6);

  const solutions = page.locator('#soluciones');
  await expect(solutions.getByRole('heading', { name: 'Empecemos por lo que necesitás lograr.' })).toBeVisible();
  for (const path of ['Verse a la altura.', 'Generar consultas.', 'Ordenar la operación.']) {
    await expect(solutions.getByRole('heading', { name: path, exact: true })).toBeVisible();
  }

  const experience = page.locator('#trabajo');
  await expect(experience.getByText('Mirta Libera Propiedades', { exact: true })).toBeVisible();
  await expect(experience.getByText('María Laumann Asociados', { exact: true })).toBeVisible();
  await expect(experience.getByText('Caso aprobado · mockup conceptual')).toHaveCount(2);

  await page.getByRole('link', { name: 'Contanos tu problema' }).click();
  await expect(page.locator('#contacto')).toBeInViewport();
  await expect(page.getByLabel('Empresa')).toBeVisible();
  await expect(page.getByLabel('Nombre de contacto')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('¿Qué problema querés resolver?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar consulta' })).toBeVisible();
});
