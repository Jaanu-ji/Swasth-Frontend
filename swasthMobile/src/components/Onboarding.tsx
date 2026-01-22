import { useState } from 'react';
import { ChevronRight, Heart, Users, Activity, Shield, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingScreens = [
  {
    icon: Heart,
    title: 'Your Health, Our Priority',
    description: 'Track your health vitals, monitor progress, and stay on top of your wellness journey.',
    color: 'bg-rose-500',
  },
  {
    icon: Users,
    title: 'Manage Family Health',
    description: 'Keep track of your entire family\'s health records, vaccinations, and appointments in one place.',
    color: 'bg-blue-500',
  },
  {
    icon: Activity,
    title: 'Fitness & Nutrition',
    description: 'Plan meals, track calories, monitor workouts, and achieve your fitness goals with ease.',
    color: 'bg-green-500',
  },
  {
    icon: Shield,
    title: 'Smart Reminders',
    description: 'Never miss a medication or appointment with intelligent reminders and notifications.',
    color: 'bg-purple-500',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const screen = onboardingScreens[currentScreen];
  const Icon = screen.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <div className="flex justify-end p-6">
        {currentScreen < onboardingScreens.length - 1 && (
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className={`${screen.color} rounded-full p-8 mb-8 shadow-lg`}>
          <Icon className="w-24 h-24 text-white" />
        </div>

        <h1 className="text-center mb-4 text-gray-900">
          {screen.title}
        </h1>

        <p className="text-center text-gray-600 max-w-md mb-12">
          {screen.description}
        </p>

        <div className="flex gap-2 mb-12">
          {onboardingScreens.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentScreen
                  ? 'w-8 bg-blue-500'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleNext}
          className="w-full bg-blue-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg"
        >
          {currentScreen < onboardingScreens.length - 1 ? 'Next' : 'Get Started'}
          {currentScreen < onboardingScreens.length - 1 ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
