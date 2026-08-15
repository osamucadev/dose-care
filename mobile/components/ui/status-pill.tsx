import { StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

import { ThemedText } from './themed-text';

export type StatusKind = 'now' | 'next' | 'ok' | 'taken' | 'skipped' | 'none';

const STATUS_META: Record<StatusKind, { label: string; symbol: string }> = {
  now: { label: 'Agora', symbol: '●' },
  next: { label: 'Próximo', symbol: '○' },
  ok: { label: 'Tudo ok', symbol: '✓' },
  taken: { label: 'Tomado', symbol: '✓' },
  skipped: { label: 'Pulado', symbol: '×' },
  none: { label: 'Nenhum cuidado hoje', symbol: '·' },
};

/** Status is always shown as symbol + text label — never color alone. */
export function StatusPill({ kind }: { kind: StatusKind }) {
  const tint = useThemeColor({}, kind === 'skipped' ? 'danger' : kind === 'taken' || kind === 'ok' ? 'success' : 'tint');
  const meta = STATUS_META[kind];

  return (
    <View style={[styles.pill, { borderColor: tint }]} accessibilityLabel={meta.label}>
      <ThemedText variant="label" style={{ color: tint }}>
        {meta.symbol} {meta.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
