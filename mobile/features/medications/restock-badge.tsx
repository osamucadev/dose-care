import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import type { StockLevel } from '@/domain/stock';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

import { restockBadgeLabel } from './stock-labels';

/**
 * "Estoque baixo" / "Quase acabando" / "Estoque esgotado". Warm and calm
 * on purpose (the same soft fill as dose times, not the danger color):
 * running low is something to plan for. Renders nothing while stock is fine.
 */
export function RestockBadge({ level }: { level: StockLevel }) {
  const warmSoft = useThemeColor({}, 'warmSoft');
  const text = useThemeColor({}, 'text');
  const label = restockBadgeLabel(level);
  if (!label) return null;

  return (
    <View style={[styles.badge, { backgroundColor: warmSoft }]}>
      <Icon name="package" size={14} color={text} />
      <ThemedText variant="label">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
});
