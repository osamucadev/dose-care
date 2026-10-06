import { Button } from '@/components/ui/button';
import type { DoseOccurrence } from '@/domain/types';

import { doseTimeLabel } from './dose-time';

interface TakeEarlyButtonProps {
  occurrence: DoseOccurrence;
  onPress: () => void;
}

/**
 * "Tomar agora" for a dose that is not due yet, on medications the user
 * allowed to be taken early. Soft rather than primary: Tomado in Agora
 * stays the main action of the screen. The accessible name says which
 * dose and its time, since several rows can show this button.
 */
export function TakeEarlyButton({ occurrence, onPress }: TakeEarlyButtonProps) {
  const what = occurrence.dosage ? `${occurrence.medicationName} ${occurrence.dosage}` : occurrence.medicationName;
  return (
    <Button
      label="Tomar agora"
      icon="check"
      variant="soft"
      onPress={onPress}
      accessibilityLabel={`Tomar agora: ${what}, previsto para ${doseTimeLabel(occurrence.scheduledAt)}`}
    />
  );
}
