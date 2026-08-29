import { expect, test } from '@playwright/test';

test('ofrece WhatsApp como canal directo sin escribir texto por el usuario', async ({ page }) => {
  await page.goto('/#contacto');

  const accessibleName = 'Escribir a La Plata Marketing por WhatsApp al +54 9 11 6426-5551';
  const channels = page
    .locator('#contacto')
    .getByRole('group', { name: 'Canales de contacto directo' });
  const contactLink = channels.getByRole('link', { name: accessibleName });
  await expect(contactLink).toBeVisible();
  await expect(contactLink).toContainText('+54 9 11 6426-5551');

  const href = await contactLink.getAttribute('href');
  expect(href).not.toBeNull();
  expect(href).toBe('https://wa.me/5491164265551');
  const whatsappUrl = new URL(href!);
  expect(whatsappUrl.origin).toBe('https://wa.me');
  expect(whatsappUrl.pathname).toBe('/5491164265551');
  expect(whatsappUrl.search).toBe('');
  expect(whatsappUrl.searchParams.get('text')).toBeNull();

  const footerLink = page.locator('footer').getByRole('link', { name: accessibleName });
  await expect(footerLink).toHaveAttribute('href', href!);
});

test('una visita entiende la propuesta, revisa los casos y llega al formulario', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es-AR');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Más consultas. Menos tareas manuales.' }),
  ).toBeVisible();
  await expect(page.getByText('Marketing + tecnología para tu negocio', { exact: true })).toBeVisible();

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
