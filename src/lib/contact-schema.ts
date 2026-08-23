import { z } from 'zod';

const singleLineText = z.string().trim().regex(/^[^\r\n]*$/);

const contactSchema = z.object({
  company: singleLineText.min(2).max(120),
  contactName: singleLineText.min(2).max(80),
  email: z.string().trim().pipe(z.email()),
  issue: z.string().trim().min(20).max(2000),
  privacyAccepted: z.literal(true),
  website: z.string().trim().max(0).optional().default(''),
});

export type ContactPayload = z.infer<typeof contactSchema>;

export function validateContactPayload(payload: unknown) {
  return contactSchema.safeParse(payload);
}
