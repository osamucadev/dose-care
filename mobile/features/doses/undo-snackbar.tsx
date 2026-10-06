import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ui/themed-text';
import { parseScheduledLocalDateTime } from '@/domain/datetime';
import { usePendingDoseAction } from '@/hooks/pending-dose-action-provider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { minTouchTarget, radius, shadow, spacing } from '@/theme/tokens';

/**
 * "Losartana 50 mg: dose pulada. Desfazer", shown over every screen while
 * a Tomado/Pular can still be undone. Inverted colors (text color as the
 * fill) so it reads as a temporary message, not as part of the page.
 * Announced to screen readers as it appears.
 */
export function UndoSnackbar() {
  const { pending, undo } = usePendingDoseAction();
  const insets = useSafeAreaInsets();
  const fill = useThemeColor({}, 'text');
  const onFill = useThemeColor({}, 'background');
  const action = useThemeColor({}, 'tintSoft');

  if (!pending) return null;

  const { occurrence, status } = pending;
  const what = occurrence.dosage ? `${occurrence.medicationName} ${occurrence.dosage}` : occurrence.medicationName;
  // Only "Tomar agora" can take a dose before its time (Tomado appears once it is due).
  const early = status === 'taken' && parseScheduledLocalDateTime(occurrence.scheduledAt) > new Date();
  const message = `${what}: ${status === 'taken' ? (early ? 'dose tomada antes do horário' : 'dose tomada') : 'dose pulada'}.`;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: insets.bottom + spacing.lg }]}
      accessibilityLiveRegion="polite">
      <View style={[styles.bar, { backgroundColor: fill }]} accessibilityRole="alert">
        <ThemedText style={[styles.message, { color: onFill }]} numberOfLines={2}>
          {message}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Desfazer: ${message}`}
          onPress={undo}
          hitSlop={8}
          style={({ pressed }) => [styles.undo, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText variant="label" style={[styles.undoLabel, { color: action }]}>
            Desfazer
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    minHeight: 56,
    ...shadow,
  },
  message: { flex: 1, fontSize: 15, lineHeight: 20, paddingVertical: spacing.sm },
  undo: { minHeight: minTouchTarget, minWidth: minTouchTarget, justifyContent: 'center', paddingHorizontal: spacing.md },
  undoLabel: { fontSize: 15 },
});
