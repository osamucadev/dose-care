import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import type { StockStatus } from '@/domain/stock';
import type { Profile } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { minTouchTarget, spacing } from '@/theme/tokens';

import { RestockBadge } from './restock-badge';
import { stockSummary } from './stock-labels';

export interface RestockRow {
  medicationId: string;
  medicationLabel: string;
  profile: Profile;
  status: StockStatus;
}

interface RestockListProps {
  rows: RestockRow[];
  onSelect: (medicationId: string) => void;
}

/** "Para repor": medications running low, across profiles. Each row opens the stock screen. */
export function RestockList({ rows, onSelect }: RestockListProps) {
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.section}>
      <ThemedText variant="subtitle">Para repor</ThemedText>
      <Card style={styles.card}>
        {rows.map((row, index) => (
          <Pressable
            key={row.medicationId}
            accessibilityRole="button"
            accessibilityLabel={`${row.medicationLabel}, ${row.profile.name}, ${stockSummary(row.status)}. Atualizar estoque`}
            onPress={() => onSelect(row.medicationId)}
            style={({ pressed }) => [
              styles.row,
              index > 0 && { borderTopWidth: 1, borderTopColor: border },
              { opacity: pressed ? 0.85 : 1 },
            ]}>
            <Avatar avatar={row.profile.avatar} skinTone={row.profile.skinTone} tint={getProfileTypeMeta(row.profile.type).tint} size={40} />
            <View style={styles.text}>
              <ThemedText variant="label">{row.profile.name}</ThemedText>
              <ThemedText variant="body">{row.medicationLabel}</ThemedText>
              <ThemedText variant="muted">{stockSummary(row.status)}</ThemedText>
              <RestockBadge level={row.status.level} />
            </View>
            <Icon name="chevron-right" size={20} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  card: { gap: 0, paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: minTouchTarget },
  text: { flex: 1, gap: 2 },
});
