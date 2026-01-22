import { useState } from 'react';
import { Onboarding } from './components/Onboarding';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { HealthTracker } from './components/HealthTracker';
import { AddVitals } from './components/AddVitals';
import { VitalsHistory } from './components/VitalsHistory';
import { FamilyList } from './components/FamilyList';
import { MemberDashboard } from './components/MemberDashboard';
import { Vaccination } from './components/Vaccination';
import { MealPlanner } from './components/MealPlanner';
import { CalorieTracker } from './components/CalorieTracker';
import { WaterTracker } from './components/WaterTracker';
import { Recipes } from './components/Recipes';
import { Workouts } from './components/Workouts';
import { StepCounter } from './components/StepCounter';
import { ExerciseVideos } from './components/ExerciseVideos';
import { HealthAnalytics } from './components/HealthAnalytics';
import { Reminders } from './components/Reminders';
import { EmergencyCard } from './components/EmergencyCard';
import { AISuggestions } from './components/AISuggestions';
import { ReportScanner } from './components/ReportScanner';

export type Screen = 
  | 'onboarding'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'health-tracker'
  | 'add-vitals'
  | 'vitals-history'
  | 'family-list'
  | 'member-dashboard'
  | 'vaccination'
  | 'meal-planner'
  | 'calorie-tracker'
  | 'water-tracker'
  | 'recipes'
  | 'workouts'
  | 'step-counter'
  | 'exercise-videos'
  | 'analytics'
  | 'reminders'
  | 'emergency-card'
  | 'ai-suggestions'
  | 'report-scanner';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleOnboardingComplete = () => {
    setCurrentScreen('login');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    setCurrentScreen('member-dashboard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'login':
        return <Login onLogin={handleLogin} onNavigateToRegister={() => navigateTo('register')} />;
      case 'register':
        return <Register onRegister={handleRegister} onNavigateToLogin={() => navigateTo('login')} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'health-tracker':
        return <HealthTracker onNavigate={navigateTo} onBack={() => navigateTo('dashboard')} />;
      case 'add-vitals':
        return <AddVitals onBack={() => navigateTo('health-tracker')} onSave={() => navigateTo('health-tracker')} />;
      case 'vitals-history':
        return <VitalsHistory onBack={() => navigateTo('health-tracker')} />;
      case 'family-list':
        return <FamilyList onNavigate={navigateTo} onMemberSelect={handleMemberSelect} onBack={() => navigateTo('dashboard')} />;
      case 'member-dashboard':
        return <MemberDashboard memberId={selectedMemberId} onNavigate={navigateTo} onBack={() => navigateTo('family-list')} />;
      case 'vaccination':
        return <Vaccination memberId={selectedMemberId} onBack={() => navigateTo('member-dashboard')} />;
      case 'meal-planner':
        return <MealPlanner onNavigate={navigateTo} onBack={() => navigateTo('dashboard')} />;
      case 'calorie-tracker':
        return <CalorieTracker onBack={() => navigateTo('dashboard')} />;
      case 'water-tracker':
        return <WaterTracker onBack={() => navigateTo('dashboard')} />;
      case 'recipes':
        return <Recipes onBack={() => navigateTo('meal-planner')} />;
      case 'workouts':
        return <Workouts onNavigate={navigateTo} onBack={() => navigateTo('dashboard')} />;
      case 'step-counter':
        return <StepCounter onBack={() => navigateTo('workouts')} />;
      case 'exercise-videos':
        return <ExerciseVideos onBack={() => navigateTo('workouts')} />;
      case 'analytics':
        return <HealthAnalytics onBack={() => navigateTo('dashboard')} />;
      case 'reminders':
        return <Reminders onBack={() => navigateTo('dashboard')} />;
      case 'emergency-card':
        return <EmergencyCard onBack={() => navigateTo('dashboard')} />;
      case 'ai-suggestions':
        return <AISuggestions onBack={() => navigateTo('dashboard')} />;
      case 'report-scanner':
        return <ReportScanner onBack={() => navigateTo('dashboard')} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderScreen()}
    </div>
  );
}
