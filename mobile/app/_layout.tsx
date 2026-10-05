import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Logo } from '@/components/ui/logo';
import { Colors } from '@/constants/theme';
import { UndoSnackbar } from '@/features/doses/undo-snackbar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDoseReminders } from '@/hooks/use-dose-reminders';
import { PendingDoseActionProvider } from '@/hooks/pending-dose-action-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  useDoseReminders();
  const palette = Colors[colorScheme];

  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <PendingDoseActionProvider>
      <ThemeProvider
        value={{
          ...navigationTheme,
          colors: { ...navigationTheme.colors, background: palette.background, primary: palette.tint },
        }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: palette.background },
            headerTintColor: palette.tint,
            headerTitleStyle: { color: palette.text, fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: palette.background },
          }}>
          <Stack.Screen name="index" options={{ title: 'DoseCare', headerTitle: () => <Logo /> }} />
          <Stack.Screen name="profile/new" options={{ title: 'Novo perfil' }} />
          <Stack.Screen name="profile/[id]/index" options={{ title: 'Perfil' }} />
          <Stack.Screen name="profile/[id]/edit" options={{ title: 'Editar perfil' }} />
          <Stack.Screen name="profile/[id]/history" options={{ title: 'Histórico' }} />
          <Stack.Screen name="medication/new" options={{ title: 'Novo medicamento' }} />
          <Stack.Screen name="medication/[id]/edit" options={{ title: 'Editar medicamento' }} />
          <Stack.Screen name="medication/[id]/stock" options={{ title: 'Estoque' }} />
        </Stack>
        <UndoSnackbar />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PendingDoseActionProvider>
  );
}
