export interface TeamMember {
  /** Stable URL-safe identifier, independent of the person's display name. */
  id: string;
  name: string;
  role: string;
  portrait: string | null;
  /** CSS object-position, for example "50% 35%". */
  portraitPosition?: string;
  description?: string;
}

// Add only confirmed employee names and their own portraits here.
// Portrait paths are relative to public/, for example /team/maria.webp.
export const teamMembers: TeamMember[] = [
  { id: 'joaquin-laumann', name: 'Joaquín Laumann', role: 'Director general', portrait: null },
  { id: 'santiago-laumann', name: 'Santiago Laumann', role: 'Director creativo', portrait: null },
  { id: 'justina-guinazu', name: 'Justina Guiñazú', role: 'Directora de marketing', portrait: null },
];
