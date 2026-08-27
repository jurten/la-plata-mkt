import { z } from 'zod';

const singleLineText = z.string().regex(/^[^\r\n]*$/).trim();
const optionalPhone = singleLineText.max(40).refine((value) => {
  if (value === '') return true;
  if (!/^\+?[\d\s().-]+$/.test(value)) return false;
  const digitCount = value.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 15;
});

const contactSchema = z.object({
  company: singleLineText.min(2).max(120),
  contactName: singleLineText.min(2).max(80),
  email: z.string().trim().pipe(z.email()),
  phone: optionalPhone.optional().default(''),
  issue: z.string().trim().min(20).max(2000),
  privacyAccepted: z.literal(true),
  website: z.string().trim().max(0).optional().default(''),
});

export type ContactPayload = z.infer<typeof contactSchema>;

export function validateContactPayload(payload: unknown) {
  return contactSchema.safeParse(payload);
}
