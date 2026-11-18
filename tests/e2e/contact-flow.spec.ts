import { expect, test } from '@playwright/test';

test('WhatsApp abre una conversación sin un mensaje escrito por el sitio', async ({ page }) => {
  await page.goto('/#contacto');
  const contact = page.locator('footer .footer-whatsapp');
  await expect(contact).toHaveAttribute('href', 'https://wa.me/5491158861954');
  await expect(contact).toContainText('+54 9 11 5886-1954');
  await expect(page.locator('footer')).toContainText('La primera reunión es gratuita.');
});

test('el email se puede abrir desde la navegación y copiar desde el footer', async ({ page }) => {
  await page.goto('/#contacto');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Contacto por email' })).toHaveAttribute('href', 'mailto:ceo@laplatamarketing.com');
  await expect(footer.locator('.footer-email')).toHaveAttribute('href', 'mailto:ceo@laplatamarketing.com');
  await expect(footer.locator('.footer-email')).toHaveText('ceo@laplatamarketing.com');
});

test('los enlaces de privacidad vuelven al contacto directo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/privacidad/');
  await page.locator('.legal-back').click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('footer .footer-whatsapp')).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
});
