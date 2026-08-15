import { type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}>;

/** Safe-area aware screen background + padded content, scrollable by default. */
export function ScreenContainer({ children, scroll = true, contentContainerStyle }: ScreenContainerProps) {
  const backgroundColor = useThemeColor({}, 'background');

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor }]} edges={['bottom', 'left', 'right']}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor }]} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
});
