// ✅ App Navigator - React Navigation Stack
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import HealthTrackerScreen from '../screens/main/HealthTrackerScreen';
import AddVitalsScreen from '../screens/main/AddVitalsScreen';
import VitalsHistoryScreen from '../screens/main/VitalsHistoryScreen';
import ChatScreen from '../screens/main/ChatScreen';
import AIInsightsScreen from '../screens/main/AIInsightsScreen';
import HealthAnalyticsScreen from '../screens/main/HealthAnalyticsScreen';
import WaterTrackerScreen from '../screens/main/WaterTrackerScreen';
import CalorieTrackerScreen from '../screens/main/CalorieTrackerScreen';
import DietScreen from '../screens/main/DietScreen';
import MealPlannerScreen from '../screens/main/MealPlannerScreen';
import AddMealScreen from '../screens/main/AddMealScreen';
import WorkoutsScreen from '../screens/main/WorkoutsScreen';
import HealthHistoryScreen from '../screens/main/HealthHistoryScreen';
import ExerciseVideosScreen from '../screens/main/ExerciseVideosScreen';
import StepCounterScreen from '../screens/main/StepCounterScreen';
import RemindersScreen from '../screens/main/RemindersScreen';
import FamilyScreen from '../screens/main/FamilyScreen';
import MemberDashboardScreen from '../screens/main/MemberDashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EmergencyCardScreen from '../screens/main/EmergencyCardScreen';
import OCRScreen from '../screens/main/OCRScreen';
import ReportScannerScreen from '../screens/main/ReportScannerScreen';
import RecipesScreen from '../screens/main/RecipesScreen';
import VaccinationScreen from '../screens/main/VaccinationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem('swasth_onboarding_seen');
        setHasSeenOnboarding(seen === 'true');
      } catch (e) {
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  if (loading || hasSeenOnboarding === null) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          // Auth Stack - Show Login directly if onboarding was already seen
          hasSeenOnboarding ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          )
        ) : (
          // Main Stack
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="HealthTracker" component={HealthTrackerScreen} />
            <Stack.Screen name="AddVitals" component={AddVitalsScreen} />
            <Stack.Screen name="VitalsHistory" component={VitalsHistoryScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="AIInsights" component={AIInsightsScreen} />
            <Stack.Screen name="HealthAnalytics" component={HealthAnalyticsScreen} />
            <Stack.Screen name="WaterTracker" component={WaterTrackerScreen} />
            <Stack.Screen name="CalorieTracker" component={CalorieTrackerScreen} />
            <Stack.Screen name="Diet" component={DietScreen} />
            <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
            <Stack.Screen name="AddMeal" component={AddMealScreen} />
            <Stack.Screen name="Workouts" component={WorkoutsScreen} />
            <Stack.Screen name="HealthHistory" component={HealthHistoryScreen} />
            <Stack.Screen name="ExerciseVideos" component={ExerciseVideosScreen} />
            <Stack.Screen name="StepCounter" component={StepCounterScreen} />
            <Stack.Screen name="Reminders" component={RemindersScreen} />
            <Stack.Screen name="Family" component={FamilyScreen} />
            <Stack.Screen name="MemberDashboard" component={MemberDashboardScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EmergencyCard" component={EmergencyCardScreen} />
            <Stack.Screen name="OCR" component={OCRScreen} />
            <Stack.Screen name="ReportScanner" component={ReportScannerScreen} />
            <Stack.Screen name="Recipes" component={RecipesScreen} />
            <Stack.Screen name="Vaccination" component={VaccinationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
