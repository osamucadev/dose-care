import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getRepositories } from '@/database/repositories';
import { addDaysToLocalDateString, toLocalDateString } from '@/domain/datetime';
import { generateOccurrencesForDateRange } from '@/domain/occurrences';
import { planReminders, REMINDER_WINDOW_DAYS } from '@/domain/reminders';

/**
 * Local dose reminders, delivered by the OS even when the app is closed.
 *
 * Nothing here is a source of truth: the scheduled notifications are a
 * disposable copy of the pending occurrences for the next
 * `REMINDER_WINDOW_DAYS`. Every sync cancels them all and schedules the
 * current plan again, so edits, deactivations, soft-deleted profiles
 * and recorded doses are reflected without tracking individual ids.
 *
 * Android delivers them through AlarmManager (exact when the
 * SCHEDULE_EXACT_ALARM permission is available, otherwise a few minutes
 * late at worst) and expo-notifications re-registers them after a
 * reboot or app update.
 */

const CHANNEL_ID = 'dose-reminders';
const SUPPORTED = Platform.OS === 'android' || Platform.OS === 'ios';

let setupPromise: Promise<void> | null = null;

/** Notification handler + Android channel. Safe to call any number of times. */
export function configureReminders(): Promise<void> {
  if (!SUPPORTED) return Promise.resolve();
  if (!setupPromise) {
    setupPromise = (async () => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      // Android 13+ only shows the permission prompt once a channel exists.
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Lembretes de doses',
          description: 'Avisos no horário de cada dose da rotina.',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1F6F72',
        });
      }
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }
  return setupPromise;
}

let askedThisSession = false;

/**
 * Asks for notification permission only when it would be useful (there
 * is at least one active routine medication) and the OS still allows
 * asking. Syncs right away when permission is newly granted.
 */
export async function requestReminderPermissionIfUseful(): Promise<void> {
  if (!SUPPORTED) return;
  await configureReminders();

  // Android reports a never-asked permission as "denied" with
  // canAskAgain=true (iOS says "undetermined"), so canAskAgain is the
  // only reliable signal. The OS itself stops showing the dialog after
  // the user declines (once on iOS, twice on Android); on top of that we
  // ask at most once per app session.
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || !current.canAskAgain || askedThisSession) return;

  const { medications } = await getRepositories();
  const active = await medications.listActiveForAllProfiles();
  if (active.length === 0) return;

  askedThisSession = true;
  const answer = await Notifications.requestPermissionsAsync();
  if (answer.granted) await syncReminders();
}

let running: Promise<void> | null = null;
let rerunRequested = false;

/**
 * Re-plans every scheduled reminder. Calls that arrive while a sync is
 * running are coalesced into one more pass afterwards, so a burst of
 * changes never interleaves cancel/schedule calls.
 */
export function syncReminders(): Promise<void> {
  if (!SUPPORTED) return Promise.resolve();
  if (running) {
    rerunRequested = true;
    return running;
  }
  running = (async () => {
    do {
      rerunRequested = false;
      await syncOnce();
    } while (rerunRequested);
  })().finally(() => {
    running = null;
  });
  return running;
}

/** Fire-and-forget variant for after a write: a reminder failure must never fail the write itself. */
export function syncRemindersInBackground(): void {
  syncReminders().catch((error) => {
    console.warn('DoseCare: could not update dose reminders.', error);
  });
}

async function syncOnce(): Promise<void> {
  await configureReminders();
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  const { medications, doseEvents, profiles } = await getRepositories();
  const now = new Date();
  const todayStr = toLocalDateString(now);
  const lastDayStr = addDaysToLocalDateString(todayStr, REMINDER_WINDOW_DAYS - 1);

  const [meds, activeProfiles, eventsByDay] = await Promise.all([
    medications.listActiveForAllProfiles(),
    profiles.listAll(),
    Promise.all(
      Array.from({ length: REMINDER_WINDOW_DAYS }, (_, offset) =>
        doseEvents.listForDate(addDaysToLocalDateString(todayStr, offset))
      )
    ),
  ]);

  const occurrences = generateOccurrencesForDateRange(meds, todayStr, lastDayStr, eventsByDay.flat());
  const profileNameById = Object.fromEntries(activeProfiles.map((p) => [p.id, p.name]));
  const plan = planReminders(occurrences, profileNameById, now);

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const item of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: {
        title: item.title,
        body: item.body,
        data: { profileId: item.profileId },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.fireAt,
        channelId: CHANNEL_ID,
      },
    });
  }
}
