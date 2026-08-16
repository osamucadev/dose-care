import { z } from 'zod';

import { isValidLocalDateString, isValidTimeString } from '@/domain/datetime';
import { TREATMENT_END_MODE_VALUES } from '@/domain/types';
import { MAX_TOTAL_SCHEDULED_DOSES } from '@/domain/validation';

export const medicationFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome do medicamento.').max(80, 'Nome muito longo.'),
    dosage: z.string().trim().max(40, 'Dosagem muito longa.').optional(),
    quantityPerDose: z.string().trim().max(40, 'Quantidade muito longa.').optional(),
    notes: z.string().trim().max(500, 'Observação muito longa.').optional(),
    times: z
      .array(z.string().refine(isValidTimeString, { message: 'Horário inválido.' }))
      .min(1, 'Adicione ao menos um horário.'),
    startDate: z.string().refine(isValidLocalDateString, { message: 'Data inválida.' }),
    endMode: z.enum(TREATMENT_END_MODE_VALUES),
    /** Raw "YYYY-MM-DD" text, only required/validated when endMode is `end_date` — see superRefine below. */
    endDate: z.string().optional(),
    /** Raw digits as text (TextInput values are always strings), only required/validated when endMode is `dose_count`. */
    totalScheduledDoses: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endMode === 'end_date') {
      if (!data.endDate || !isValidLocalDateString(data.endDate)) {
        ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Informe uma data final válida.' });
      } else if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: 'A data final não pode ser anterior ao início.',
        });
      }
    }

    if (data.endMode === 'dose_count') {
      const raw = data.totalScheduledDoses?.trim() ?? '';
      const parsed = Number(raw);
      if (raw.length === 0 || !Number.isInteger(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['totalScheduledDoses'],
          message: 'Informe uma quantidade de doses programadas válida.',
        });
      } else if (parsed > MAX_TOTAL_SCHEDULED_DOSES) {
        ctx.addIssue({
          code: 'custom',
          path: ['totalScheduledDoses'],
          message: `O limite é de ${MAX_TOTAL_SCHEDULED_DOSES.toLocaleString('pt-BR')} doses programadas.`,
        });
      }
    }
  });

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;
