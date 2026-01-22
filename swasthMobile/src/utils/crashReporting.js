// ✅ Crash Reporting Utility - Firebase Crashlytics
import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Log a non-fatal error to Crashlytics
 * Use this for caught exceptions that don't crash the app
 */
export const logError = (error, context = {}) => {
  try {
    if (error instanceof Error) {
      crashlytics().recordError(error);
    } else {
      crashlytics().recordError(new Error(String(error)));
    }

    // Log additional context
    if (context.screen) {
      crashlytics().setAttribute('last_screen', context.screen);
    }
    if (context.action) {
      crashlytics().setAttribute('last_action', context.action);
    }
  } catch (e) {
    console.error('Failed to log error to Crashlytics:', e);
  }
};

/**
 * Log a custom message to Crashlytics
 * Useful for debugging crash reports
 */
export const logMessage = (message) => {
  try {
    crashlytics().log(message);
  } catch (e) {
    console.error('Failed to log message to Crashlytics:', e);
  }
};

/**
 * Set user identifier for crash reports
 * Call this after user logs in
 */
export const setUserId = (userId) => {
  try {
    crashlytics().setUserId(userId);
  } catch (e) {
    console.error('Failed to set user ID in Crashlytics:', e);
  }
};

/**
 * Set custom attributes for crash reports
 */
export const setUserAttributes = (attributes) => {
  try {
    Object.entries(attributes).forEach(([key, value]) => {
      crashlytics().setAttribute(key, String(value));
    });
  } catch (e) {
    console.error('Failed to set attributes in Crashlytics:', e);
  }
};

/**
 * Force a test crash (only use in development)
 */
export const testCrash = () => {
  crashlytics().crash();
};

/**
 * Wrap async functions with error logging
 */
export const withErrorLogging = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  };
};
