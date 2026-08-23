import { expect, test } from '@playwright/test';

test('una visita entiende la propuesta, revisa los casos y llega al formulario', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Más consultas. Menos tareas manuales.' }),
  ).toBeVisible();
  await expect(page.getByText('inmobiliarias y estudios jurídicos', { exact: false }).first()).toBeVisible();

  const services = page.locator('#servicios');
  await expect(services.getByRole('heading', { name: 'Cuatro servicios. Un mismo sistema.' })).toBeVisible();
  for (const service of ['Social media', 'Sitios web', 'CRM', 'Automatizaciones']) {
    await expect(services.getByRole('heading', { name: service, exact: true })).toBeVisible();
  }

  const cases = page.locator('#casos');
  await expect(cases.getByText('Mirta Libera Propiedades', { exact: true })).toBeVisible();
  await expect(cases.getByText('María Laumann Asociados', { exact: true })).toBeVisible();
  await expect(cases.getByText('Caso aprobado · mockup conceptual')).toHaveCount(2);

  await page.getByRole('link', { name: 'Contanos tu problema' }).first().click();
  await expect(page.locator('#contacto')).toBeInViewport();
  await expect(page.getByLabel('Empresa')).toBeVisible();
  await expect(page.getByLabel('Nombre de contacto')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('¿Qué problema querés resolver?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar consulta' })).toBeVisible();
});
