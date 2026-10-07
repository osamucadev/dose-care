import { z } from 'zod';

import { PROFILE_TYPE_VALUES, SKIN_TONE_VALUES } from '@/domain/types';

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome.').max(60, 'Nome muito longo.'),
  type: z.enum(PROFILE_TYPE_VALUES),
  avatar: z.string().trim().min(1, 'Escolha um avatar.'),
  skinTone: z.enum(SKIN_TONE_VALUES),
  color: z.string().trim().min(1),
  notes: z.string().trim().max(500, 'Observação muito longa.').optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
