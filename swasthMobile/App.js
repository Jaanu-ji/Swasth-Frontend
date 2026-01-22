// ✅ App.js - React Native CLI Entry Point
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import crashlytics from '@react-native-firebase/crashlytics';
import { AuthProvider } from './src/hooks/useAuth';
import { MemberProvider } from './src/hooks/useMember';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Enable Crashlytics collection
    crashlytics().setCrashlyticsCollectionEnabled(true);
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <MemberProvider>
          <AppNavigator />
        </MemberProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
