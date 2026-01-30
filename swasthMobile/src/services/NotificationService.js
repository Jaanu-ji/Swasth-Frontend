// ✅ Notification Service - Local notifications using Notifee
import notifee, {
  TriggerType,
  TimestampTrigger,
  AndroidImportance,
  AndroidCategory,
  RepeatFrequency,
  AlarmType,
} from '@notifee/react-native';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

class NotificationService {
  constructor() {
    this.channelId = 'swasth-reminders';
    this.alarmChannelId = 'swasth-alarms';
  }

  // Initialize notification channels (call this on app start)
  async initialize() {
    try {
      // Request notification permission (Android 13+)
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('Notification permission:', granted);
      }

      // Request permissions via notifee
      await notifee.requestPermission();

      // Create channels for Android
      if (Platform.OS === 'android') {
        // Regular notification channel
        await notifee.createChannel({
          id: this.channelId,
          name: 'Health Reminders',
          description: 'Notifications for medicine and appointment reminders',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        // Alarm channel with maximum priority
        await notifee.createChannel({
          id: this.alarmChannelId,
          name: 'Medicine Alarms',
          description: 'High priority alarms for medicine reminders',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          bypassDnd: true,
        });
      }

      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  // Check if exact alarm permission is granted (Android 12+)
  async checkExactAlarmPermission() {
    if (Platform.OS !== 'android') return true;

    try {
      const settings = await notifee.getNotificationSettings();
      // On Android 12+, check if we can schedule exact alarms
      if (Platform.Version >= 31) {
        const canScheduleExact = await notifee.canScheduleExactAlarms();
        if (!canScheduleExact) {
          Alert.alert(
            'Alarm Permission Required',
            'Please enable "Alarms & Reminders" permission in settings for medicine reminders to work properly.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => notifee.openAlarmPermissionSettings()
              }
            ]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking alarm permission:', error);
      return true; // Proceed anyway
    }
  }

  // Schedule a reminder notification
  async scheduleReminder(reminder) {
    try {
      const { _id, title, description, time, type, frequency, date } = reminder;

      // Check exact alarm permission first
      const hasPermission = await this.checkExactAlarmPermission();
      if (!hasPermission) {
        console.log('Exact alarm permission not granted, scheduling anyway...');
      }

      // Parse time (format: "HH:mm")
      const [hours, minutes] = time.split(':').map(Number);

      // Calculate trigger date
      let triggerDate = new Date();

      if (type === 'Appointment' && date) {
        // For appointments, use the specific date
        triggerDate = new Date(date);
      }

      triggerDate.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow (for medication)
      if (type === 'Medication' && triggerDate <= new Date()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      // Create trigger based on frequency with exact alarm
      let trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        alarmManager: {
          allowWhileIdle: true, // Fire even in Doze mode
        },
      };

      // For daily reminders, add repeat frequency
      if (type === 'Medication' && frequency === 'Daily') {
        trigger.repeatFrequency = RepeatFrequency.DAILY;
      } else if (type === 'Medication' && frequency === 'Weekly') {
        trigger.repeatFrequency = RepeatFrequency.WEEKLY;
      }

      // Schedule the notification with alarm-like settings
      await notifee.createTriggerNotification(
        {
          id: _id,
          title: type === 'Medication' ? `💊 ${title}` : `📅 ${title}`,
          body: description || (type === 'Medication' ? 'Time to take your medicine' : 'You have an appointment'),
          android: {
            channelId: this.alarmChannelId,
            importance: AndroidImportance.HIGH,
            category: AndroidCategory.ALARM,
            pressAction: {
              id: 'default',
            },
            sound: 'default',
            vibrationPattern: [300, 500, 300, 500],
            smallIcon: 'ic_launcher', // Uses app icon
            ongoing: false,
            autoCancel: true,
            showTimestamp: true,
            timestamp: Date.now(),
            fullScreenAction: {
              id: 'default',
            },
          },
          ios: {
            sound: 'default',
            critical: true,
            categoryId: type === 'Medication' ? 'medication' : 'appointment',
          },
        },
        trigger
      );

      console.log(`Scheduled reminder: ${title} at ${triggerDate.toLocaleString()}`);
      return true;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      return false;
    }
  }

  // Cancel a specific reminder
  async cancelReminder(reminderId) {
    try {
      await notifee.cancelNotification(reminderId);
      console.log(`Cancelled reminder: ${reminderId}`);
      return true;
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
      return false;
    }
  }

  // Cancel all reminders
  async cancelAllReminders() {
    try {
      await notifee.cancelAllNotifications();
      console.log('Cancelled all reminders');
      return true;
    } catch (error) {
      console.error('Failed to cancel all reminders:', error);
      return false;
    }
  }

  // Display an immediate notification (for testing)
  async displayNotification(title, body) {
    try {
      // Ensure channel exists before displaying
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: this.alarmChannelId,
          name: 'Medicine Alarms',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });
      }

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: this.alarmChannelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [300, 500, 300, 500],
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });
      console.log('Notification displayed successfully');
      return true;
    } catch (error) {
      console.error('Failed to display notification:', error);
      Alert.alert('Notification Error', error.message || 'Failed to show notification');
      return false;
    }
  }

  // Test notification - shows immediately with alarm
  async testAlarm() {
    try {
      // Request permission first
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
      await notifee.requestPermission();

      return this.displayNotification(
        '💊 Test Alarm',
        'This is a test medicine reminder!'
      );
    } catch (error) {
      console.error('Test alarm failed:', error);
      Alert.alert('Error', error.message || 'Failed to test alarm');
      return false;
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications = await notifee.getTriggerNotifications();
      return notifications;
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }
}

export default new NotificationService();
