import * as Notifications from 'expo-notifications';
import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { didReturnToForeground } from '@/domain/clock';
import {
  configureReminders,
  requestReminderPermissionIfUseful,
  syncRemindersInBackground,
} from '@/services/reminder-service';

function profileIdFrom(response: Notifications.NotificationResponse | null): string | null {
  const profileId = response?.notification.request.content.data?.profileId;
  return typeof profileId === 'string' && profileId.length > 0 ? profileId : null;
}

/**
 * Mounted once at the root. Keeps the OS-scheduled reminders fresh
 * (on launch and whenever the app returns to the foreground, which also
 * rolls the reminder window forward day by day) and opens the dose's
 * profile when the user taps a reminder, including when the tap is what
 * launched the app.
 */
export function useDoseReminders(): void {
  const router = useRouter();
  // On a cold start from a notification tap, the response is available
  // before the root navigator has mounted, and navigating then throws.
  // The target is held here until the navigator reports it is ready.
  const navigationReady = Boolean(useRootNavigationState()?.key);
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    configureReminders()
      .then(() => requestReminderPermissionIfUseful())
      .catch((error) => console.warn('DoseCare: could not set up dose reminders.', error))
      .finally(syncRemindersInBackground);

    let appState = AppState.currentState;
    const appStateSubscription = AppState.addEventListener('change', (next) => {
      if (didReturnToForeground(appState, next)) syncRemindersInBackground();
      appState = next;
    });

    function handleResponse(response: Notifications.NotificationResponse | null) {
      const profileId = profileIdFrom(response);
      if (!profileId) return;
      // Consumed once, so a later remount doesn't navigate again.
      Notifications.clearLastNotificationResponse();
      setPendingProfileId(profileId);
    }

    handleResponse(Notifications.getLastNotificationResponse());
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

    return () => {
      appStateSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!navigationReady || !pendingProfileId) return;
    router.push(`/profile/${pendingProfileId}`);
    setPendingProfileId(null);
  }, [navigationReady, pendingProfileId, router]);
}
