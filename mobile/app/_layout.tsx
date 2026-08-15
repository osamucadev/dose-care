import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: { ...navigationTheme.colors, background: palette.background, primary: palette.tint },
      }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.tint,
          headerTitleStyle: { color: palette.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'DoseCare' }} />
        <Stack.Screen name="profile/new" options={{ title: 'Novo perfil' }} />
        <Stack.Screen name="profile/[id]/index" options={{ title: 'Perfil' }} />
        <Stack.Screen name="profile/[id]/edit" options={{ title: 'Editar perfil' }} />
        <Stack.Screen name="profile/[id]/history" options={{ title: 'Histórico' }} />
        <Stack.Screen name="medication/new" options={{ title: 'Novo medicamento' }} />
        <Stack.Screen name="medication/[id]/edit" options={{ title: 'Editar medicamento' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
