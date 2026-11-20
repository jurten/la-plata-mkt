export interface TeamMember {
  /** Stable URL-safe identifier, independent of the person's display name. */
  id: string;
  name: string;
  role: string;
  portrait: string | null;
  /** CSS object-position, for example "50% 35%". */
  portraitPosition?: string;
  /** Optional close-up framing inside the portrait capsule. */
  portraitScale?: number;
  description?: string;
}

// Add only confirmed employee names and their own portraits here.
// Portrait paths are relative to public/, for example /team/maria.webp.
export const teamMembers: TeamMember[] = [
  { id: 'joaquin-laumann', name: 'Joaquín Laumann', role: 'Tecnología', portrait: '/team/joaquin-laumann.webp', portraitScale: 1.55 },
  { id: 'santiago-laumann', name: 'Santiago Laumann', role: 'Creatividad', portrait: '/team/santiago-laumann.webp' },
  { id: 'justina-guinazu', name: 'Justina Guiñazú', role: 'Marketing', portrait: '/team/justina-guinazu.webp' },
];
