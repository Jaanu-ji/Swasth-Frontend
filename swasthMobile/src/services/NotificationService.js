// ✅ Notification Service - Local notifications using Notifee
import notifee, {
  TriggerType,
  TimestampTrigger,
  AndroidImportance,
  AndroidCategory,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.channelId = 'swasth-reminders';
  }

  // Initialize notification channels (call this on app start)
  async initialize() {
    try {
      // Request permissions
      await notifee.requestPermission();

      // Create channel for Android
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: this.channelId,
          name: 'Health Reminders',
          description: 'Notifications for medicine and appointment reminders',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });
      }

      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  // Schedule a reminder notification
  async scheduleReminder(reminder) {
    try {
      const { _id, title, description, time, type, frequency, date } = reminder;

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

      // Create trigger based on frequency
      let trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
      };

      // For daily reminders, add repeat frequency
      if (type === 'Medication' && frequency === 'Daily') {
        trigger.repeatFrequency = RepeatFrequency.DAILY;
      } else if (type === 'Medication' && frequency === 'Weekly') {
        trigger.repeatFrequency = RepeatFrequency.WEEKLY;
      }

      // Schedule the notification
      await notifee.createTriggerNotification(
        {
          id: _id,
          title: type === 'Medication' ? `💊 ${title}` : `📅 ${title}`,
          body: description || (type === 'Medication' ? 'Time to take your medicine' : 'You have an appointment'),
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            category: AndroidCategory.ALARM,
            pressAction: {
              id: 'default',
            },
            sound: 'default',
            vibrationPattern: [300, 500, 300, 500],
            smallIcon: 'ic_notification', // Make sure this exists in android/app/src/main/res
            largeIcon: type === 'Medication' ? 'pill' : 'calendar',
          },
          ios: {
            sound: 'default',
            critical: true,
            categoryId: type === 'Medication' ? 'medication' : 'appointment',
          },
        },
        trigger
      );

      console.log(`Scheduled reminder: ${title} at ${time}`);
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
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [300, 500],
        },
        ios: {
          sound: 'default',
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to display notification:', error);
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
