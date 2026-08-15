import { z } from 'zod';

import { isValidLocalDateString, isValidTimeString } from '@/domain/datetime';

export const medicationFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do medicamento.').max(80, 'Nome muito longo.'),
  dosage: z.string().trim().max(40, 'Dosagem muito longa.').optional(),
  quantityPerDose: z.string().trim().max(40, 'Quantidade muito longa.').optional(),
  notes: z.string().trim().max(500, 'Observação muito longa.').optional(),
  times: z
    .array(z.string().refine(isValidTimeString, { message: 'Horário inválido.' }))
    .min(1, 'Adicione ao menos um horário.'),
  startDate: z.string().refine(isValidLocalDateString, { message: 'Data inválida.' }),
});

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;
